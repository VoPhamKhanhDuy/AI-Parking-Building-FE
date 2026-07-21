using ParkingSystem.Application.Common.Exceptions;
using ParkingSystem.Application.Common.Interfaces;
using ParkingSystem.Application.ParkingSessions.DTOs;
using ParkingSystem.Application.ParkingSessions.Interfaces;
using ParkingSystem.Application.Payments.DTOs;
using ParkingSystem.Application.Payments.Interfaces;
using ParkingSystem.Application.PricingRules.Interfaces;
using ParkingSystem.Application.VehicleExits.DTOs;
using ParkingSystem.Application.VehicleExits.Interfaces;
using ParkingSystem.Application.Vehicles.DTOs;
using ParkingSystem.Application.Vehicles.Interfaces;
using ParkingSystem.Domain.Entities;
using ParkingSystem.Domain.Enums;

namespace ParkingSystem.Application.VehicleExits.Services;

public class VehicleExitService : IVehicleExitService
{
    private readonly IParkingSessionService _sessions;
    private readonly IPaymentService _payments;
    private readonly IVehicleService _vehicles;
    private readonly IPricingRuleService _pricingRules;
    private readonly TimeProvider _clock;

    public VehicleExitService(
        IParkingSessionService sessions,
        IPaymentService payments,
        IVehicleService vehicles,
        IPricingRuleService pricingRules,
        TimeProvider clock)
    {
        _sessions = sessions;
        _payments = payments;
        _vehicles = vehicles;
        _pricingRules = pricingRules;
        _clock = clock;
    }

    public async Task<VehicleExitListResponse> GetActiveSessionsAsync(CancellationToken ct = default)
    {
        var activeSessions = await _sessions.ListAsync(
            SessionStatus.Active, null, null, null, null, null, ct);

        var responses = activeSessions.Select(s => new VehicleExitSessionDto
        {
            Id = s.Id,
            TicketId = s.TicketId,
            TicketCode = s.TicketCode,
            VehicleId = s.VehicleId,
            LicensePlate = s.VehiclePlate,
            SlotCode = s.SlotCode,
            EntryTime = s.EntryTime,
            Status = s.Status.ToString(),
            PaymentStatus = s.PaymentId.HasValue ? "Pending" : "NotRequired"
        }).ToList();

        return new VehicleExitListResponse
        {
            Sessions = responses,
            TotalCount = responses.Count
        };
    }

    public async Task<VehicleExitSessionDto?> LookupAsync(string query, CancellationToken ct = default)
    {
        if (string.IsNullOrWhiteSpace(query))
            return null;

        var allSessions = await _sessions.ListAsync(
            SessionStatus.Active, null, null, null, null, null, ct);

        var normalizedQuery = query.Trim().ToUpperInvariant();
        var session = allSessions.FirstOrDefault(s =>
            s.TicketCode.ToUpperInvariant() == normalizedQuery ||
            s.VehiclePlate.ToUpperInvariant() == normalizedQuery);

        if (session == null)
            return null;

        return new VehicleExitSessionDto
        {
            Id = session.Id,
            TicketId = session.TicketId,
            TicketCode = session.TicketCode,
            VehicleId = session.VehicleId,
            LicensePlate = session.VehiclePlate,
            SlotCode = session.SlotCode,
            EntryTime = session.EntryTime,
            Status = session.Status.ToString()
        };
    }

    public async Task<ExitFeeCalculation> CalculateFeeAsync(Guid sessionId, CancellationToken ct = default)
    {
        var session = await _sessions.GetByIdAsync(sessionId, ct)
            ?? throw new NotFoundException(nameof(ParkingSession), sessionId);

        if (session.Status != SessionStatus.Active)
        {
            throw new ValidationException($"Session '{sessionId}' is not active.");
        }

        var vehicle = await _vehicles.GetByIdAsync(session.VehicleId, ct)
            ?? throw new NotFoundException(nameof(Vehicle), session.VehicleId);

        var nowUtc = _clock.GetUtcNow().UtcDateTime;
        var durationHours = Math.Round((nowUtc - session.EntryTime).TotalHours, 2);
        var hours = Math.Max(1d, Math.Ceiling(durationHours));

        // Try to resolve pricing rule
        var pricingRule = await _pricingRules.ResolveForBillingAsync(
            vehicle.VehicleTypeId,
            TicketType.Hourly,
            nowUtc,
            ct);

        decimal baseFee;
        decimal surchargePerHour;
        const double overtimeThresholdHours = 24;
        string pricingDescription;

        if (pricingRule != null)
        {
            baseFee = pricingRule.PricePerHour * (decimal)hours;
            surchargePerHour = pricingRule.PenaltyFee > 0 ? pricingRule.PenaltyFee : 0;
            pricingDescription = $"Hourly: {pricingRule.PricePerHour:0.00} x {hours:0} hour(s)";
        }
        else
        {
            // Fallback: use vehicle type's default hourly rate
            var defaultRate = vehicle.DefaultHourlyRate > 0 ? vehicle.DefaultHourlyRate : 10000m;
            baseFee = defaultRate * (decimal)hours;
            surchargePerHour = 5000m; // Default overtime surcharge
            pricingDescription = $"Fallback: {defaultRate:0.00} x {hours:0} hour(s) (no active pricing rule)";
        }

        var overtimeHours = Math.Max(0, durationHours - overtimeThresholdHours);
        var surcharge = overtimeHours > 0 ? surchargePerHour * (decimal)overtimeHours : 0;
        var totalFee = Math.Round(baseFee + surcharge, 2, MidpointRounding.AwayFromZero);

        return new ExitFeeCalculation
        {
            SessionId = sessionId,
            DurationHours = durationHours,
            BaseFee = Math.Round(baseFee, 2, MidpointRounding.AwayFromZero),
            Surcharge = Math.Round(surcharge, 2, MidpointRounding.AwayFromZero),
            TotalFee = totalFee,
            UnitPricePerHour = pricingRule?.PricePerHour ?? (baseFee > 0 ? baseFee / (decimal)hours : 0),
            OvertimeSurchargePerHour = surchargePerHour,
            PricingRuleDescription = pricingDescription,
            CalculatedAt = nowUtc
        };
    }

    public async Task<ExitPaymentResponse> CreatePaymentAsync(Guid sessionId, CreateExitPaymentRequest? req, CancellationToken ct = default)
    {
        var session = await _sessions.GetByIdAsync(sessionId, ct)
            ?? throw new NotFoundException(nameof(ParkingSession), sessionId);

        if (session.Status != SessionStatus.Active)
        {
            throw new ValidationException($"Session '{sessionId}' is not active.");
        }

        var feeCalculation = await CalculateFeeAsync(sessionId, ct);

        var paymentReq = new CreatePaymentRequest
        {
            SessionId = sessionId,
            Amount = feeCalculation.TotalFee,
            Method = req?.Method ?? PaymentMethod.EWallet
        };

        var payment = await _payments.CreateAsync(paymentReq, ct);

        return new ExitPaymentResponse
        {
            PaymentId = payment.Id,
            TransactionCode = $"PKEXIT{sessionId}{_clock.GetUtcNow().UtcDateTime:yyyyMMddHHmmss}",
            Amount = feeCalculation.TotalFee,
            Status = payment.Status.ToString().ToUpperInvariant(),
            Method = payment.Method.ToString(),
            ExpiresAt = _clock.GetUtcNow().UtcDateTime.AddMinutes(15)
        };
    }

    public async Task<PaymentStatusResponse> GetPaymentStatusAsync(Guid paymentId, CancellationToken ct = default)
    {
        var payment = await _payments.GetByIdAsync(paymentId, ct)
            ?? throw new NotFoundException(nameof(Payment), paymentId);

        return new PaymentStatusResponse
        {
            PaymentId = paymentId,
            Status = payment.Status.ToString().ToUpperInvariant(),
            PaidAt = payment.PaidAt
        };
    }

    public async Task<ExitCompleteResponse> CompleteExitAsync(Guid sessionId, CancellationToken ct = default)
    {
        var session = await _sessions.GetByIdAsync(sessionId, ct)
            ?? throw new NotFoundException(nameof(ParkingSession), sessionId);

        if (session.Status != SessionStatus.Active)
        {
            throw new ValidationException($"Session '{sessionId}' is not active.");
        }

        // Check and auto-complete pending payment if exists
        var payment = await _payments.GetBySessionAsync(sessionId, ct);
        if (payment != null && payment.Status == PaymentStatus.Pending)
        {
            await _payments.MarkPaidAsync(payment.Id,
                new MarkPaidRequest { Method = payment.Method }, ct);
        }

        var endReq = new EndSessionRequest { ExitTime = _clock.GetUtcNow().UtcDateTime };
        var updated = await _sessions.EndAsync(sessionId, endReq, ct);

        return new ExitCompleteResponse
        {
            SessionId = sessionId,
            TicketCode = updated.TicketCode,
            ExitTime = updated.ExitTime ?? _clock.GetUtcNow().UtcDateTime,
            Status = "Completed",
            Message = "Vehicle exited successfully."
        };
    }
}
