using System.Globalization;
using ParkingSystem.Application.Common.Exceptions;
using ParkingSystem.Application.Common.Interfaces;
using ParkingSystem.Application.LostTickets.DTOs;
using ParkingSystem.Application.LostTickets.Interfaces;
using ParkingSystem.Domain.Common;
using ParkingSystem.Domain.Entities;
using ParkingSystem.Domain.Enums;

namespace ParkingSystem.Application.LostTickets.Services;

public class LostTicketService : ILostTicketService
{
    private readonly IRepository<LostTicketCase> _cases;
    private readonly IRepository<ParkingSession> _sessions;
    private readonly IRepository<ParkingTicket> _tickets;
    private readonly IRepository<Vehicle> _vehicles;
    private readonly IRepository<ParkingSlot> _slots;
    private readonly IRepository<Payment> _payments;
    private readonly IRepository<PricingRule> _pricing;
    private readonly IRepository<User> _users;
    private readonly IUnitOfWork _uow;
    private readonly TimeProvider _clock;

    private const decimal DefaultCarPenalty = 500000m;
    private const decimal DefaultMotorcyclePenalty = 200000m;
    private const decimal DefaultBaseParkingFee = 50000m;

    public LostTicketService(
        IRepository<LostTicketCase> cases,
        IRepository<ParkingSession> sessions,
        IRepository<ParkingTicket> tickets,
        IRepository<Vehicle> vehicles,
        IRepository<ParkingSlot> slots,
        IRepository<Payment> payments,
        IRepository<PricingRule> pricing,
        IRepository<User> users,
        IUnitOfWork uow,
        TimeProvider clock)
    {
        _cases = cases;
        _sessions = sessions;
        _tickets = tickets;
        _vehicles = vehicles;
        _slots = slots;
        _payments = payments;
        _pricing = pricing;
        _users = users;
        _uow = uow;
        _clock = clock;
    }

    public async Task<LostTicketPageDataDto> GetPageDataAsync(CancellationToken ct = default)
    {
        var policy = await GetPolicyAsync(ct);
        var recentCases = await ListRecentCasesAsync(10, ct);
        return new LostTicketPageDataDto
        {
            Policy = policy,
            RecentCases = recentCases
        };
    }

    public async Task<LostTicketPolicyDto> GetPolicyAsync(CancellationToken ct = default)
    {
        var carPenalty = await _pricing.ListAsync(new ActivePenaltySpec(VehicleTypeCategory.Car), ct);
        var motorPenalty = await _pricing.ListAsync(new ActivePenaltySpec(VehicleTypeCategory.Motorbike), ct);

        return new LostTicketPolicyDto
        {
            CarPenalty = carPenalty.FirstOrDefault()?.PenaltyFee ?? DefaultCarPenalty,
            MotorcyclePenalty = motorPenalty.FirstOrDefault()?.PenaltyFee ?? DefaultMotorcyclePenalty,
            BaseParkingFee = DefaultBaseParkingFee
        };
    }

    public async Task<LostTicketSessionDto?> FindSessionByTicketCodeAsync(string ticketCode, CancellationToken ct = default)
    {
        var ticket = await _tickets.FirstOrDefaultAsync(
            new TicketByCodeSpec(ticketCode), ct);

        if (ticket == null) return null;

        var session = await _sessions.FirstOrDefaultAsync(
            new ActiveSessionByTicketSpec(ticket.Id), ct);

        return ToSessionDto(session, ticket);
    }

    public async Task<LostTicketSessionDto?> FindSessionByLicensePlateAsync(string licensePlate, CancellationToken ct = default)
    {
        var vehicle = await _vehicles.FirstOrDefaultAsync(
            new VehicleByPlateSpec(licensePlate), ct);

        if (vehicle == null) return null;

        var session = await _sessions.FirstOrDefaultAsync(
            new ActiveSessionByVehicleSpec(vehicle.Id), ct);

        return ToSessionDto(session, null, vehicle);
    }

    public async Task<CalculateFeeResponse> CalculateFeeAsync(CalculateFeeRequest req, CancellationToken ct = default)
    {
        var session = await _sessions.GetByIdAsync(req.SessionId, ct)
            ?? throw new NotFoundException(nameof(ParkingSession), req.SessionId);

        var vehicle = await _vehicles.GetByIdAsync(session.VehicleId, ct);
        var vehicleCategory = vehicle?.VehicleType?.Category ?? VehicleTypeCategory.Car;

        var isMotor = vehicleCategory == VehicleTypeCategory.Motorbike;
        var policy = await GetPolicyAsync(ct);

        var penalty = isMotor ? policy.MotorcyclePenalty : policy.CarPenalty;
        var total = policy.BaseParkingFee + penalty;

        return new CalculateFeeResponse
        {
            ParkingFee = policy.BaseParkingFee,
            Penalty = penalty,
            Discount = 0,
            Total = total,
            FormattedTotal = FormatVnd(total)
        };
    }

    public async Task<LostTicketCaseDto> CreateCaseAsync(CreateLostTicketCaseRequest req, CancellationToken ct = default)
    {
        var session = await _sessions.GetByIdAsync(req.SessionId, ct)
            ?? throw new NotFoundException(nameof(ParkingSession), req.SessionId);

        if (session.Status != SessionStatus.Active)
        {
            throw new ValidationException("Can only create a lost ticket case for an active session.");
        }

        var vehicle = await _vehicles.GetByIdAsync(session.VehicleId, ct);
        var vehicleCategory = vehicle?.VehicleType?.Category ?? VehicleTypeCategory.Car;
        var isMotor = vehicleCategory == VehicleTypeCategory.Motorbike;
        var policy = await GetPolicyAsync(ct);

        var parkingFee = policy.BaseParkingFee;
        var penalty = isMotor ? policy.MotorcyclePenalty : policy.CarPenalty;
        var total = parkingFee + penalty;

        await _uow.BeginTransactionAsync(System.Data.IsolationLevel.Serializable, ct);

        try
        {
            var @case = new LostTicketCase
            {
                Id = Guid.NewGuid(),
                SessionId = session.Id,
                TicketId = session.TicketId,
                VehicleId = session.VehicleId,
                OwnerName = req.OwnerName,
                Phone = req.Phone,
                ParkingFee = parkingFee,
                Penalty = penalty,
                Discount = 0,
                TotalPaid = total,
                PaymentStatus = PaymentStatus.Pending,
                CaseCode = GenerateCaseCode(),
                Notes = req.Notes ?? string.Empty,
                CreatedAt = _clock.GetUtcNow().DateTime,
                UpdatedAt = _clock.GetUtcNow().DateTime
            };

            await _cases.AddAsync(@case, ct);
            await _uow.CommitTransactionAsync(ct);

            return ToDto(@case, session, vehicle);
        }
        catch
        {
            await _uow.RollbackTransactionAsync(ct);
            throw;
        }
    }

    public async Task<LostTicketCaseDto> ProcessPaymentAsync(Guid caseId, ProcessLostTicketRequest req, CancellationToken ct = default)
    {
        var @case = await _cases.GetByIdAsync(caseId, ct)
            ?? throw new NotFoundException(nameof(LostTicketCase), caseId);

        if (@case.PaymentStatus == PaymentStatus.Paid)
        {
            throw new ConflictException("This lost ticket case has already been paid.");
        }

        var session = await _sessions.GetByIdAsync(@case.SessionId, ct)
            ?? throw new NotFoundException(nameof(ParkingSession), @case.SessionId);

        if (session.Status != SessionStatus.Active)
        {
            throw new ValidationException("The session for this case is no longer active.");
        }

        User? cashier = null;
        if (req.ProcessedByUserId.HasValue)
        {
            cashier = await _users.GetByIdAsync(req.ProcessedByUserId.Value, ct);
        }

        await _uow.BeginTransactionAsync(System.Data.IsolationLevel.Serializable, ct);

        try
        {
            var payment = new Payment
            {
                Id = Guid.NewGuid(),
                SessionId = session.Id,
                Amount = @case.TotalPaid,
                Method = req.PaymentMethod,
                Status = PaymentStatus.Paid,
                PaidAt = _clock.GetUtcNow().DateTime,
                TransactionReference = req.TransactionReference,
                ProcessedByUserId = req.ProcessedByUserId,
                CreatedAt = _clock.GetUtcNow().DateTime
            };

            await _payments.AddAsync(payment, ct);

            session.ExitTime = _clock.GetUtcNow().DateTime;
            session.Status = SessionStatus.Completed;
            _sessions.Update(session);

            @case.PaymentId = payment.Id;
            @case.PaymentStatus = PaymentStatus.Paid;
            @case.PaidAt = _clock.GetUtcNow().DateTime;
            @case.Notes = string.IsNullOrEmpty(@case.Notes)
                ? req.Notes ?? string.Empty
                : $"{@case.Notes}; {req.Notes}";
            @case.UpdatedAt = _clock.GetUtcNow().DateTime;
            _cases.Update(@case);

            await _uow.CommitTransactionAsync(ct);

            var vehicle = await _vehicles.GetByIdAsync(session.VehicleId, ct);
            return ToDto(@case, session, vehicle);
        }
        catch
        {
            await _uow.RollbackTransactionAsync(ct);
            throw;
        }
    }

    public async Task<IReadOnlyList<LostTicketCaseDto>> ListRecentCasesAsync(int count = 10, CancellationToken ct = default)
    {
        var spec = new RecentCasesSpec(count);
        var cases = await _cases.ListAsync(spec, ct);

        var results = new List<LostTicketCaseDto>();
        foreach (var c in cases)
        {
            var session = await _sessions.GetByIdAsync(c.SessionId, ct);
            var vehicle = session != null ? await _vehicles.GetByIdAsync(session.VehicleId, ct) : null;
            results.Add(ToDto(c, session, vehicle));
        }

        return results;
    }

    private static string GenerateCaseCode()
    {
        var date = DateTime.UtcNow.ToString("yyyyMMdd");
        var rand = Guid.NewGuid().ToString("N")[..6].ToUpperInvariant();
        return $"LT-{date}-{rand}";
    }

    private static string FormatVnd(decimal amount)
    {
        return string.Format(new CultureInfo("vi-VN"), "{0:C0}", amount).Replace("₫", " VND");
    }

    private LostTicketSessionDto ToSessionDto(ParkingSession? session, ParkingTicket? ticket, Vehicle? vehicle = null)
    {
        var v = vehicle ?? session?.Vehicle;
        var t = ticket ?? session?.Ticket;
        var s = session;

        return new LostTicketSessionDto
        {
            Id = s?.Id ?? Guid.Empty,
            TicketId = t?.Id ?? Guid.Empty,
            TicketCode = t?.TicketCode,
            VehicleId = v?.Id ?? Guid.Empty,
            LicensePlate = v?.LicensePlate,
            VehicleType = v?.VehicleType?.Name ?? v?.VehicleType?.Category.ToString(),
            SlotId = s?.SlotId ?? Guid.Empty,
            SlotCode = s?.Slot?.SlotCode,
            FloorZone = s?.Slot?.ParkingZone?.Name,
            EntryGate = "—",
            EntryTime = s?.EntryTime ?? DateTime.UtcNow,
            AssignmentMethod = "Manual"
        };
    }

    private LostTicketCaseDto ToDto(LostTicketCase @case, ParkingSession? session, Vehicle? vehicle)
    {
        return new LostTicketCaseDto
        {
            Id = @case.Id,
            CaseCode = @case.CaseCode,
            SessionId = @case.SessionId,
            TicketId = @case.TicketId,
            TicketCode = session?.Ticket?.TicketCode,
            VehicleId = @case.VehicleId,
            LicensePlate = vehicle?.LicensePlate ?? session?.Vehicle?.LicensePlate,
            VehicleType = vehicle?.VehicleType?.Name ?? session?.Vehicle?.VehicleType?.Name,
            OwnerName = @case.OwnerName,
            Phone = @case.Phone,
            ParkingFee = @case.ParkingFee,
            Penalty = @case.Penalty,
            Discount = @case.Discount,
            TotalPaid = @case.TotalPaid,
            PaymentStatus = @case.PaymentStatus,
            PaidAt = @case.PaidAt,
            CreatedAt = @case.CreatedAt,
            UpdatedAt = @case.UpdatedAt,
            Notes = @case.Notes
        };
    }
}

// Specifications
internal sealed class ActivePenaltySpec : Specification<PricingRule>
{
    public ActivePenaltySpec(VehicleTypeCategory category)
    {
        AddCriteria(r => r.VehicleType != null && r.VehicleType.Category == category && r.IsActive);
        ApplyOrderByDescending(r => r.EffectiveFrom);
    }
}

internal sealed class TicketByCodeSpec : Specification<ParkingTicket>
{
    public TicketByCodeSpec(string code)
    {
        AddCriteria(t => t.TicketCode == code);
    }
}

internal sealed class ActiveSessionByTicketSpec : Specification<ParkingSession>
{
    public ActiveSessionByTicketSpec(Guid ticketId)
    {
        AddCriteria(s => s.TicketId == ticketId && s.Status == SessionStatus.Active);
        AddInclude(s => s.Ticket);
        AddInclude(s => s.Vehicle);
        AddInclude(s => s.Slot);
        AddInclude(s => s.Slot!.ParkingZone);
    }
}

internal sealed class ActiveSessionByVehicleSpec : Specification<ParkingSession>
{
    public ActiveSessionByVehicleSpec(Guid vehicleId)
    {
        AddCriteria(s => s.VehicleId == vehicleId && s.Status == SessionStatus.Active);
        AddInclude(s => s.Ticket);
        AddInclude(s => s.Vehicle);
        AddInclude(s => s.Slot);
        AddInclude(s => s.Slot!.ParkingZone);
    }
}

internal sealed class VehicleByPlateSpec : Specification<Vehicle>
{
    public VehicleByPlateSpec(string plate)
    {
        AddCriteria(v => v.LicensePlate == plate);
        AddInclude(v => v.VehicleType);
    }
}

internal sealed class RecentCasesSpec : Specification<LostTicketCase>
{
    public RecentCasesSpec(int count)
    {
        ApplyOrderByDescending(c => c.CreatedAt);
        ApplyTake(count);
    }
}
