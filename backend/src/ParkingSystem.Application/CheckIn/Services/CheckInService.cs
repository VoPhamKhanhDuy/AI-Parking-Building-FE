using System.Diagnostics;
using Microsoft.Extensions.Logging;
using ParkingSystem.Application.AIRecommendations.Specifications;
using ParkingSystem.Application.CheckIn.DTOs;
using ParkingSystem.Application.CheckIn.Interfaces;
using ParkingSystem.Application.Common.Exceptions;
using ParkingSystem.Application.Common.Interfaces;
using ParkingSystem.Application.ParkingSessions.Specifications;
using ParkingSystem.Application.Tickets.Specifications;
using ParkingSystem.Application.Vehicles.Specifications;
using ParkingSystem.Domain.Entities;
using ParkingSystem.Domain.Enums;

namespace ParkingSystem.Application.CheckIn.Services;
/// <summary>
/// Orchestrator for the full Vehicle Check-in flow as specified in PROMPT 01.
/// One transaction, one outbox for AI audit logs, race-safe over slot + vehicle.
/// </summary>
public class CheckInService : ICheckInService
{
    private readonly IRepository<Vehicle> _vehicles;
    private readonly IRepository<VehicleType> _vehicleTypes;
    private readonly IRepository<ParkingTicket> _tickets;
    private readonly IRepository<ParkingSession> _sessions;
    private readonly IRepository<ParkingSlot> _slots;
    private readonly IRepository<ParkingZone> _zones;
    private readonly IRepository<AIRecommendationLog> _aiLogs;
    private readonly IUnitOfWork _uow;
    private readonly TimeProvider _clock;
    private readonly ILogger<CheckInService> _logger;

    public CheckInService(
        IRepository<Vehicle> vehicles,
        IRepository<VehicleType> vehicleTypes,
        IRepository<ParkingTicket> tickets,
        IRepository<ParkingSession> sessions,
        IRepository<ParkingSlot> slots,
        IRepository<ParkingZone> zones,
        IRepository<AIRecommendationLog> aiLogs,
        IUnitOfWork uow,
        TimeProvider clock,
        ILogger<CheckInService> logger)
    {
        _vehicles = vehicles;
        _vehicleTypes = vehicleTypes;
        _tickets = tickets;
        _sessions = sessions;
        _slots = slots;
        _zones = zones;
        _aiLogs = aiLogs;
        _uow = uow;
        _clock = clock;
        _logger = logger;
    }

    public async Task<CheckInResultDto> CheckInAsync(CheckInRequest req, CancellationToken ct = default)
    {
        var stopwatch = Stopwatch.StartNew();

        // ─── 1. Validate input ────────────────────────────────────────────────────
        if (req is null) throw new ValidationException("Request body is required.");
        if (req.SlotId == Guid.Empty) throw new ValidationException("SlotId is required.");
        if (req.VehicleCategory is null && !req.VehicleId.HasValue)
        {
            throw new ValidationException("Either VehicleId or VehicleCategory is required.");
        }

        var plate = VehicleSpecifications.NormalizePlate(req.LicensePlate);
        if (string.IsNullOrWhiteSpace(plate))
        {
            throw new ValidationException("License plate is required.");
        }

        // ─── 2. Open one Serializable transaction for the whole flow ─────────────
        await using var transaction = await _uow.BeginTransactionAsync(
            System.Data.IsolationLevel.Serializable, ct);

        // ─── 3. Find or create the Vehicle ────────────────────────────────────────
        Vehicle vehicle;
        if (req.VehicleId.HasValue && req.VehicleId.Value != Guid.Empty)
        {
            vehicle = await _vehicles.FirstOrDefaultAsync(
                new VehicleSpecifications.ByIdWithDetails(req.VehicleId.Value), ct)
                ?? throw new NotFoundException(nameof(Vehicle), req.VehicleId.Value);
        }
        else
        {
            vehicle = await _vehicles.FirstOrDefaultAsync(
                new VehicleSpecifications.ByLicensePlate(plate), ct)
                ?? await CreateNewVehicleAsync(plate, req.VehicleCategory!.Value, ct);
        }

        // ─── 4. Block if the Vehicle already has an Active parking session ─────────
        var existingActiveSession = await _sessions.FirstOrDefaultAsync(
            new ParkingSessionSpecifications.ActiveByVehicle(vehicle.Id), ct);
        if (existingActiveSession is not null)
        {
            throw new ConflictException(
                $"Vehicle '{vehicle.LicensePlate}' is already checked in.");
        }

        // ─── 5. Block if there is an Issued/Active ticket still open ──────────────
        var openTicket = await _tickets.FirstOrDefaultAsync(
            new ParkingTicketSpecifications.ActiveByVehicle(vehicle.Id), ct);
        if (openTicket is not null)
        {
            throw new ConflictException(
                $"Vehicle '{vehicle.LicensePlate}' already has an open ticket '{openTicket.TicketCode}'.");
        }

        // ─── 6. Re-validate the Slot is still Available (race-safe via Serializable) ─
        var slot = await _slots.GetByIdAsync(req.SlotId, ct)
            ?? throw new NotFoundException(nameof(ParkingSlot), req.SlotId);

        if (slot.Status == SlotStatus.Maintenance)
        {
            throw new ValidationException($"Slot '{slot.SlotCode}' is under maintenance and cannot be used.");
        }
        if (slot.Status != SlotStatus.Available)
        {
            throw new ConflictException(
                $"Slot '{slot.SlotCode}' is {slot.Status} and cannot be claimed. Please choose another slot.");
        }

        // ─── 7. Validate VehicleType ↔ Zone compatibility ─────────────────────────
        ParkingZone? zone = null;
        if (slot.ParkingZoneId != Guid.Empty)
        {
            zone = await _zones.GetByIdAsync(slot.ParkingZoneId, ct);
        }
        if (zone == null)
        {
            throw new ValidationException($"Slot '{slot.SlotCode}' has no assigned zone.");
        }
        slot.ParkingZone = zone;

        if (zone.VehicleTypeId != Guid.Empty && zone.VehicleType != null
            && vehicle.VehicleType?.Id != zone.VehicleTypeId)
        {
            throw new ValidationException(
                $"Vehicle type '{vehicle.VehicleType?.Name}' is not allowed in zone '{zone.Name}'.");
        }

        // ─── 8. Slot-uniqueness re-check inside the transaction ───────────────────
        var activeOnSlot = await _sessions.FirstOrDefaultAsync(
            new ParkingSessionSpecifications.ActiveBySlot(slot.Id), ct);
        if (activeOnSlot is not null)
        {
            throw new ConflictException(
                $"Slot '{slot.SlotCode}' is already occupied by another active session.");
        }

        // ─── 9. Create Ticket + Session + Claim slot + Write AI log ────────────────
        var nowUtc = req.EntryTime?.ToUniversalTime() ?? _clock.GetUtcNow().UtcDateTime;

        var ticket = new ParkingTicket
        {
            TicketCode = await GenerateUniqueTicketCodeAsync(ct),
            VehicleId = vehicle.Id,
            Type = req.TicketType,
            Status = TicketStatus.Issued,
            IssuedAt = nowUtc,
            IssuedByUserId = req.IssuedByUserId
        };
        await _tickets.AddAsync(ticket, ct);

        var session = new ParkingSession
        {
            TicketId = ticket.Id,
            VehicleId = vehicle.Id,
            SlotId = slot.Id,
            Status = SessionStatus.Active,
            EntryTime = nowUtc
        };

        slot.Status = SlotStatus.Occupied;
        slot.UpdatedAt = nowUtc;
        ticket.Status = TicketStatus.Active;
        ticket.EntryTime = nowUtc;
        ticket.UpdatedAt = nowUtc;

        await _sessions.AddAsync(session, ct);
        _slots.Update(slot);
        _tickets.Update(ticket);

        // Persist the AI audit row along with the rest of the work so that
        // "ticket created but session missing" / "slot claimed but no audit" can no longer happen.
        if (req.RecommendedSlotId.HasValue || req.RecommendationScore.HasValue || req.VehicleCategory.HasValue)
        {
            var aiLog = new AIRecommendationLog
            {
                VehicleId = vehicle.Id,
                RecommendedSlotId = req.RecommendedSlotId,
                VehicleCategory = req.VehicleCategory ?? VehicleTypeCategory.Car,
                TicketType = req.TicketType,
                FinalScore = req.RecommendationScore ?? 0m,
                Explanation = req.RecommendationExplanation ?? string.Empty,
                AlternativeSlotsJson = "[]",
                AiUnavailable = false,
                RecommendationLatencyMs = stopwatch.ElapsedMilliseconds
            };
            await _aiLogs.AddAsync(aiLog, ct);
        }

        await _uow.SaveChangesAsync(ct);
        await _uow.CommitTransactionAsync(ct);

        _logger.LogInformation(
            "Vehicle checked in. VehicleId={VehicleId} Plate={Plate} TicketId={TicketId} TicketCode={TicketCode} SessionId={SessionId} SlotCode={SlotCode} Zone={Zone} EntryTime={EntryTime:o}",
            vehicle.Id, vehicle.LicensePlate, ticket.Id, ticket.TicketCode, session.Id,
            slot.SlotCode, zone?.Name, nowUtc);

        return new CheckInResultDto
        {
            VehicleId = vehicle.Id,
            LicensePlate = vehicle.LicensePlate,
            TicketId = ticket.Id,
            TicketCode = ticket.TicketCode,
            SessionId = session.Id,
            EntryTime = nowUtc,
            SlotId = slot.Id,
            SlotCode = slot.SlotCode,
            ZoneName = zone?.Name ?? string.Empty
        };
    }

    private async Task<Vehicle> CreateNewVehicleAsync(string plate, VehicleTypeCategory category, CancellationToken ct)
    {
        var vehicleType = await _vehicleTypes.FirstOrDefaultAsync(
            new AIRecommendationSpecifications.VehicleTypeByCategory(category), ct)
            ?? throw new NotFoundException(nameof(VehicleType), category.ToString());

        var vehicle = new Vehicle
        {
            LicensePlate = plate,
            VehicleTypeId = vehicleType.Id
        };
        await _vehicles.AddAsync(vehicle, ct);
        await _uow.SaveChangesAsync(ct);
        vehicle.VehicleType = vehicleType;
        return vehicle;
    }

    private async Task<string> GenerateUniqueTicketCodeAsync(CancellationToken ct)
    {
        var date = _clock.GetUtcNow().UtcDateTime.ToString("yyyyMMdd");
        for (var attempt = 0; attempt < 5; attempt++)
        {
            var bytes = new byte[4];
            System.Security.Cryptography.RandomNumberGenerator.Fill(bytes);
            var hex = Convert.ToHexString(bytes);
            var suffix = hex[..6];
            var candidate = $"TKT-{date}-{suffix}";
            var existing = await _tickets.FirstOrDefaultAsync(
                new ParkingTicketSpecifications.ByCode(candidate), ct);
            if (existing is null) return candidate;
        }
        return $"TKT-{date}-{Guid.NewGuid():N}";
    }
}
