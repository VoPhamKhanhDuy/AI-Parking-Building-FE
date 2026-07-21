using System.Security.Cryptography;
using ParkingSystem.Application.Common.Exceptions;
using ParkingSystem.Application.Common.Extensions;
using ParkingSystem.Application.Common.Interfaces;
using ParkingSystem.Application.Common.Mappings;
using ParkingSystem.Application.ParkingSessions.Specifications;
using ParkingSystem.Application.PricingRules.Specifications;
using ParkingSystem.Application.Tickets.DTOs;
using ParkingSystem.Application.Tickets.Interfaces;
using ParkingSystem.Application.Tickets.Specifications;
using ParkingSystem.Application.Vehicles.Specifications;
using ParkingSystem.Domain.Entities;
using ParkingSystem.Domain.Enums;

namespace ParkingSystem.Application.Tickets.Services;

public class ParkingTicketService : IParkingTicketService
{
    private const int MaxTicketCodeRetries = 5;
    private const int RandomSuffixLength = 6;

    private readonly IRepository<ParkingTicket> _tickets;
    private readonly IRepository<Vehicle> _vehicles;
    private readonly IRepository<PricingRule> _pricingRules;
    private readonly IRepository<ParkingSession> _sessions;
    private readonly IRepository<ParkingSlot> _slots;
    private readonly IUnitOfWork _uow;
    private readonly TimeProvider _clock;

    public ParkingTicketService(
        IRepository<ParkingTicket> tickets,
        IRepository<Vehicle> vehicles,
        IRepository<PricingRule> pricingRules,
        IRepository<ParkingSession> sessions,
        IRepository<ParkingSlot> slots,
        IUnitOfWork uow,
        TimeProvider clock)
    {
        _tickets = tickets;
        _vehicles = vehicles;
        _pricingRules = pricingRules;
        _sessions = sessions;
        _slots = slots;
        _uow = uow;
        _clock = clock;
    }

    public async Task<IReadOnlyList<ParkingTicketDto>> ListAsync(
        TicketStatus? status,
        Guid? vehicleId,
        DateTime? fromUtc,
        DateTime? toUtc,
        CancellationToken ct = default)
    {
        var tickets = await _tickets.ListAsync(
            new ParkingTicketSpecifications.ListFiltered(status, vehicleId, fromUtc, toUtc), ct);
        return tickets.Select(t => t.ToDto()).ToList();
    }

    public async Task<ParkingTicketDto?> GetByIdAsync(Guid id, CancellationToken ct = default)
    {
        var t = await _tickets.FirstOrDefaultAsync(new ParkingTicketSpecifications.ByIdWithDetails(id), ct);
        return t?.ToDto();
    }

    public async Task<ParkingTicketDto?> GetByCodeAsync(string code, CancellationToken ct = default)
    {
        if (string.IsNullOrWhiteSpace(code)) return null;
        var t = await _tickets.FirstOrDefaultAsync(new ParkingTicketSpecifications.ByCode(code), ct);
        return t?.ToDto();
    }

    public async Task<ParkingTicketDto?> GetActiveByVehicleAsync(Guid vehicleId, CancellationToken ct = default)
    {
        var t = await _tickets.FirstOrDefaultAsync(
            new ParkingTicketSpecifications.ActiveByVehicle(vehicleId), ct);
        return t?.ToDto();
    }

    public async Task<ParkingTicketDto> IssueAsync(IssueTicketRequest req, CancellationToken ct = default)
    {
        var vehicle = await _vehicles.FirstOrDefaultAsync(
            new VehicleSpecifications.ByIdWithDetails(req.VehicleId), ct)
            ?? throw new ValidationException($"Vehicle '{req.VehicleId}' does not exist.");

        var openTicket = await _tickets.FirstOrDefaultAsync(
            new ParkingTicketSpecifications.ActiveByVehicle(req.VehicleId), ct);
        if (openTicket is not null)
        {
            throw new ConflictException(
                $"Vehicle '{vehicle.LicensePlate}' already has an open ticket '{openTicket.TicketCode}'.");
        }

        var ticket = new ParkingTicket
        {
            TicketCode = await GenerateUniqueTicketCodeAsync(ct),
            VehicleId = vehicle.Id,
            Type = req.Type,
            Status = TicketStatus.Issued,
            IssuedAt = _clock.GetUtcNow().UtcDateTime,
            IssuedByUserId = req.IssuedByUserId
        };

        await _tickets.AddAsync(ticket, ct);
        await _uow.SaveChangesAsync(ct);

        ticket.Vehicle = vehicle;
        return ticket.ToDto();
    }

    public async Task<ParkingTicketDto> CheckInAsync(Guid id, DateTime? entryTime, CancellationToken ct = default)
    {
        var ticket = await _tickets.FirstOrDefaultAsync(
            new ParkingTicketSpecifications.ByIdWithDetails(id), ct)
            ?? throw new NotFoundException(nameof(ParkingTicket), id);

        if (ticket.Status == TicketStatus.Completed)
        {
            throw new ValidationException("Cannot check in a completed ticket.");
        }
        if (ticket.Status == TicketStatus.Cancelled)
        {
            throw new ValidationException("Cannot check in a cancelled ticket.");
        }
        if (ticket.Status == TicketStatus.Active && ticket.EntryTime.HasValue)
        {
            // Idempotent: re-check-in just returns the same ticket.
            return ticket.ToDto();
        }

        ticket.Status = TicketStatus.Active;
        ticket.EntryTime = entryTime.EnsureUtc() ?? _clock.GetUtcNow().UtcDateTime;
        ticket.UpdatedAt = _clock.GetUtcNow().UtcDateTime;
        _tickets.Update(ticket);
        await _uow.SaveChangesAsync(ct);
        return ticket.ToDto();
    }

    public async Task<CheckOutResult> CheckOutAsync(Guid id, CheckOutTicketRequest req, CancellationToken ct = default)
    {
        var ticket = await _tickets.FirstOrDefaultAsync(
            new ParkingTicketSpecifications.ByIdWithDetails(id), ct)
            ?? throw new NotFoundException(nameof(ParkingTicket), id);

        if (ticket.Status == TicketStatus.Completed)
        {
            throw new ValidationException("Ticket is already completed.");
        }
        if (ticket.Status == TicketStatus.Cancelled)
        {
            throw new ValidationException("Cannot check out a cancelled ticket.");
        }
        if (!ticket.EntryTime.HasValue)
        {
            // Implicit check-in so attendants don't have to call both endpoints.
            ticket.EntryTime = _clock.GetUtcNow().UtcDateTime;
            ticket.Status = TicketStatus.Active;
        }

        var nowUtc = req.ExitTime.EnsureUtc() ?? _clock.GetUtcNow().UtcDateTime;
        if (nowUtc < ticket.EntryTime.Value)
        {
            throw new ValidationException("ExitTime must be greater than or equal to EntryTime.");
        }

        ticket.ExitTime = nowUtc;
        ticket.Status = TicketStatus.Completed;
        ticket.UpdatedAt = nowUtc;

        var vehicle = ticket.Vehicle ?? await _vehicles.FirstOrDefaultAsync(
            new VehicleSpecifications.ByIdWithDetails(ticket.VehicleId), ct);
        if (vehicle is null)
        {
            throw new NotFoundException(nameof(Vehicle), ticket.VehicleId);
        }

        var billing = await ComputeFeeAsync(vehicle, ticket, nowUtc, req.ApplyPenalty, ct);

        _tickets.Update(ticket);
        await _uow.SaveChangesAsync(ct);

        var dto = ticket.ToDto();
        dto.ComputedAmount = billing.FeeAmount + billing.PenaltyFee;
        return new CheckOutResult
        {
            Ticket = dto,
            FeeAmount = billing.FeeAmount,
            PenaltyFee = billing.PenaltyFee,
            PricingRuleDescription = billing.Description,
            DurationHours = billing.DurationHours
        };
    }

    public async Task<ParkingTicketDto> CancelAsync(Guid id, CancelTicketRequest req, CancellationToken ct = default)
    {
        var ticket = await _tickets.FirstOrDefaultAsync(
            new ParkingTicketSpecifications.ByIdWithDetails(id), ct)
            ?? throw new NotFoundException(nameof(ParkingTicket), id);

        if (ticket.Status == TicketStatus.Completed)
        {
            throw new ValidationException("Cannot cancel a completed ticket.");
        }
        if (ticket.Status == TicketStatus.Cancelled)
        {
            return ticket.ToDto();
        }

        ticket.Status = TicketStatus.Cancelled;
        ticket.ExitTime = ticket.ExitTime ?? _clock.GetUtcNow().UtcDateTime;
        ticket.UpdatedAt = _clock.GetUtcNow().UtcDateTime;
        _tickets.Update(ticket);

        // If there's an active session for this ticket, cancel it and free the slot
        var activeSession = await _sessions.FirstOrDefaultAsync(
            new ParkingSessionSpecifications.ActiveByTicket(id), ct);
        if (activeSession != null)
        {
            activeSession.Status = Domain.Enums.SessionStatus.Cancelled;
            activeSession.ExitTime = activeSession.ExitTime ?? _clock.GetUtcNow().UtcDateTime;
            activeSession.UpdatedAt = _clock.GetUtcNow().UtcDateTime;
            _sessions.Update(activeSession);

            // Free the parking slot
            var slot = await _slots.GetByIdAsync(activeSession.SlotId, ct);
            if (slot != null)
            {
                slot.Status = Domain.Enums.SlotStatus.Available;
                slot.UpdatedAt = _clock.GetUtcNow().UtcDateTime;
                _slots.Update(slot);
            }
        }

        await _uow.SaveChangesAsync(ct);
        return ticket.ToDto();
    }

    private async Task<string> GenerateUniqueTicketCodeAsync(CancellationToken ct)
    {
        var date = _clock.GetUtcNow().UtcDateTime.ToString("yyyyMMdd");
        for (var attempt = 0; attempt < MaxTicketCodeRetries; attempt++)
        {
            var randomBytes = new byte[4];
            RandomNumberGenerator.Fill(randomBytes);
            var hex = Convert.ToHexString(randomBytes); // 8 hex chars
            var suffix = hex[..RandomSuffixLength];
            var candidate = $"TKT-{date}-{suffix}";
            var existing = await _tickets.FirstOrDefaultAsync(
                new ParkingTicketSpecifications.ByCode(candidate), ct);
            if (existing is null)
            {
                return candidate;
            }
        }
        // Extremely unlikely to collide 5x with 6 hex chars (16^6 = 16.7M possibilities),
        // but use a full GUID to guarantee uniqueness as fallback.
        return $"TKT-{date}-{Guid.NewGuid():N}";
    }

    private async Task<(decimal FeeAmount, decimal PenaltyFee, string Description, double DurationHours)>
        ComputeFeeAsync(Vehicle vehicle, ParkingTicket ticket, DateTime exitUtc, bool applyPenalty, CancellationToken ct)
    {
        var entryUtc = ticket.EntryTime ?? ticket.IssuedAt;
        var duration = exitUtc - entryUtc;
        if (duration < TimeSpan.Zero) duration = TimeSpan.Zero;
        var hours = Math.Max(1d, Math.Ceiling(duration.TotalHours)); // bill in whole-hour increments, min 1h
        var days = Math.Max(1d, Math.Ceiling(duration.TotalDays));

        var rule = await _pricingRules.FirstOrDefaultAsync(
            new PricingRuleSpecifications.ActiveForBilling(vehicle.VehicleTypeId, ticket.Type, exitUtc), ct);

        if (rule is null)
        {
            // No active rule: charge a flat minimum based on vehicle type's default rate.
            var fallback = vehicle.VehicleType?.DefaultHourlyRate ?? 0m;
            return (
                FeeAmount: Math.Round(fallback * (decimal)hours, 2, MidpointRounding.AwayFromZero),
                PenaltyFee: 0m,
                Description: $"Fallback: {fallback:0.00} x {hours:0} hour(s) (no active pricing rule).",
                DurationHours: duration.TotalHours);
        }

        decimal fee;
        string description;
        switch (ticket.Type)
        {
            case TicketType.Daily:
                fee = rule.PricePerDay * (decimal)days;
                description = $"Daily: {rule.PricePerDay:0.00} x {days:0} day(s).";
                break;
            case TicketType.MonthlyPass:
                fee = rule.PricePerMonth;
                description = $"Monthly pass flat: {rule.PricePerMonth:0.00}.";
                break;
            case TicketType.Complimentary:
                fee = 0m;
                description = "Complimentary ticket: no fee.";
                break;
            default:
                fee = rule.PricePerHour * (decimal)hours;
                description = $"Hourly: {rule.PricePerHour:0.00} x {hours:0} hour(s).";
                break;
        }

        var penalty = applyPenalty ? rule.PenaltyFee : 0m;
        return (
            FeeAmount: Math.Round(fee, 2, MidpointRounding.AwayFromZero),
            PenaltyFee: Math.Round(penalty, 2, MidpointRounding.AwayFromZero),
            Description: description,
            DurationHours: duration.TotalHours);
    }
}