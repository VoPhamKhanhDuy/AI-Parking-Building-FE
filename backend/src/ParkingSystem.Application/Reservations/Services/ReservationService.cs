using ParkingSystem.Application.Common.Exceptions;
using ParkingSystem.Application.Common.Extensions;
using ParkingSystem.Application.Common.Interfaces;
using ParkingSystem.Application.Reservations.DTOs;
using ParkingSystem.Application.Reservations.Interfaces;
using ParkingSystem.Application.Reservations.Specifications;
using ParkingSystem.Domain.Entities;
using ParkingSystem.Domain.Enums;

namespace ParkingSystem.Application.Reservations.Services;

public class ReservationService : IReservationService
{
    private readonly IRepository<Reservation> _reservations;
    private readonly IRepository<Vehicle> _vehicles;
    private readonly IRepository<ParkingSlot> _slots;
    private readonly IRepository<ParkingZone> _zones;
    private readonly IUnitOfWork _uow;
    private readonly TimeProvider _clock;

    public ReservationService(
        IRepository<Reservation> reservations,
        IRepository<Vehicle> vehicles,
        IRepository<ParkingSlot> slots,
        IRepository<ParkingZone> zones,
        IUnitOfWork uow,
        TimeProvider clock)
    {
        _reservations = reservations;
        _vehicles = vehicles;
        _slots = slots;
        _zones = zones;
        _uow = uow;
        _clock = clock;
    }

    public async Task<ReservationListResponse> ListAsync(
        string? search,
        ReservationStatus? status,
        Guid? vehicleId,
        CancellationToken ct = default)
    {
        var spec = new ReservationSpecifications.ListFiltered(search, status, vehicleId);
        var reservations = await _reservations.ListAsync(spec, ct);

        var total = await _reservations.CountAsync(null, ct);
        var pending = await _reservations.CountAsync(new ReservationSpecifications.ByStatus(ReservationStatus.Pending), ct);
        var confirmed = await _reservations.CountAsync(new ReservationSpecifications.ByStatus(ReservationStatus.Confirmed), ct);
        var checkedIn = await _reservations.CountAsync(new ReservationSpecifications.ByStatus(ReservationStatus.CheckedIn), ct);
        var completed = await _reservations.CountAsync(new ReservationSpecifications.ByStatus(ReservationStatus.Completed), ct);
        var cancelled = await _reservations.CountAsync(new ReservationSpecifications.ByStatus(ReservationStatus.Cancelled), ct);

        return new ReservationListResponse
        {
            Reservations = reservations.Select(MapToDto).ToList(),
            TotalCount = reservations.Count,
            Stats = new ReservationStatsDto
            {
                Total = total,
                Pending = pending,
                Confirmed = confirmed,
                CheckedIn = checkedIn,
                Completed = completed,
                Cancelled = cancelled
            }
        };
    }

    public async Task<ReservationDto?> GetByIdAsync(Guid id, CancellationToken ct = default)
    {
        var spec = new ReservationSpecifications.ByIdWithDetails(id);
        var reservation = await _reservations.FirstOrDefaultAsync(spec, ct);
        return reservation == null ? null : MapToDto(reservation);
    }

    public async Task<ReservationDto?> GetByCodeAsync(string code, CancellationToken ct = default)
    {
        if (string.IsNullOrWhiteSpace(code))
            return null;

        var spec = new ReservationSpecifications.ByCode(code);
        var reservation = await _reservations.FirstOrDefaultAsync(spec, ct);
        return reservation == null ? null : MapToDto(reservation);
    }

    public async Task<ReservationDto> CreateAsync(
        CreateReservationRequest req,
        Guid? createdByUserId,
        CancellationToken ct = default)
    {
        var vehicle = await _vehicles.GetByIdAsync(req.VehicleId, ct)
            ?? throw new ValidationException($"Vehicle '{req.VehicleId}' does not exist.");

        if (req.PreferredSlotId.HasValue)
        {
            var slot = await _slots.GetByIdAsync(req.PreferredSlotId.Value, ct)
                ?? throw new ValidationException($"Slot '{req.PreferredSlotId}' does not exist.");
            _ = slot; // Slot validation passed
        }

        if (req.PreferredZoneId.HasValue)
        {
            var zone = await _zones.GetByIdAsync(req.PreferredZoneId.Value, ct)
                ?? throw new ValidationException($"Zone '{req.PreferredZoneId}' does not exist.");
            _ = zone; // Zone validation passed
        }

        if (req.ReservedUntil <= req.ReservedFrom)
        {
            throw new ValidationException("ReservedUntil must be after ReservedFrom.");
        }

        var now = _clock.GetUtcNow().UtcDateTime;
        var reservation = new Reservation
        {
            Id = Guid.NewGuid(),
            ReservationCode = GenerateCode(),
            VehicleId = req.VehicleId,
            PreferredSlotId = req.PreferredSlotId,
            PreferredZoneId = req.PreferredZoneId,
            TicketType = req.TicketType,
            Status = ReservationStatus.Pending,
            ReservedFrom = req.ReservedFrom.EnsureUtc(),
            ReservedUntil = req.ReservedUntil.EnsureUtc(),
            CreatedByUserId = createdByUserId,
            CreatedAt = now,
            UpdatedAt = now
        };

        await _reservations.AddAsync(reservation, ct);
        await _uow.SaveChangesAsync(ct);

        reservation.Vehicle = vehicle;
        return MapToDto(reservation);
    }

    public async Task<ReservationDto> ConfirmAsync(Guid id, CancellationToken ct = default)
    {
        var reservation = await _reservations.GetByIdAsync(id, ct)
            ?? throw new NotFoundException(nameof(Reservation), id);

        if (reservation.Status != ReservationStatus.Pending)
        {
            throw new ValidationException("Only pending reservations can be confirmed.");
        }

        reservation.Status = ReservationStatus.Confirmed;
        reservation.UpdatedAt = _clock.GetUtcNow().UtcDateTime;
        _reservations.Update(reservation);
        await _uow.SaveChangesAsync(ct);

        return MapToDto(reservation);
    }

    public async Task<ReservationDto> CheckInAsync(Guid id, CancellationToken ct = default)
    {
        var reservation = await _reservations.GetByIdAsync(id, ct)
            ?? throw new NotFoundException(nameof(Reservation), id);

        if (reservation.Status == ReservationStatus.CheckedIn)
        {
            return MapToDto(reservation); // Idempotent
        }

        if (reservation.Status != ReservationStatus.Pending && reservation.Status != ReservationStatus.Confirmed)
        {
            throw new ValidationException("Cannot check in this reservation.");
        }

        var now = _clock.GetUtcNow().UtcDateTime;
        reservation.Status = ReservationStatus.CheckedIn;
        reservation.CheckedInAt = now;
        reservation.UpdatedAt = now;
        _reservations.Update(reservation);
        await _uow.SaveChangesAsync(ct);

        return MapToDto(reservation);
    }

    public async Task<ReservationDto> CompleteAsync(Guid id, CancellationToken ct = default)
    {
        var reservation = await _reservations.GetByIdAsync(id, ct)
            ?? throw new NotFoundException(nameof(Reservation), id);

        if (reservation.Status != ReservationStatus.CheckedIn)
        {
            throw new ValidationException("Only checked-in reservations can be completed.");
        }

        reservation.Status = ReservationStatus.Completed;
        reservation.UpdatedAt = _clock.GetUtcNow().UtcDateTime;
        _reservations.Update(reservation);
        await _uow.SaveChangesAsync(ct);

        return MapToDto(reservation);
    }

    public async Task<ReservationDto> CancelAsync(
        Guid id,
        CancelReservationRequest? req,
        CancellationToken ct = default)
    {
        var reservation = await _reservations.GetByIdAsync(id, ct)
            ?? throw new NotFoundException(nameof(Reservation), id);

        if (reservation.Status == ReservationStatus.Completed || reservation.Status == ReservationStatus.Cancelled)
        {
            throw new ValidationException("Cannot cancel this reservation.");
        }

        var now = _clock.GetUtcNow().UtcDateTime;
        reservation.Status = ReservationStatus.Cancelled;
        reservation.CancelledAt = now;
        reservation.CancellationReason = req?.Reason;
        reservation.UpdatedAt = now;
        _reservations.Update(reservation);
        await _uow.SaveChangesAsync(ct);

        return MapToDto(reservation);
    }

    private string GenerateCode()
    {
        var date = _clock.GetUtcNow().UtcDateTime.ToString("yyyyMMdd");
        var suffix = Guid.NewGuid().ToString()[..8].ToUpperInvariant();
        return $"RSV-{date}-{suffix}";
    }

    private static ReservationDto MapToDto(Reservation r) => new()
    {
        Id = r.Id,
        ReservationCode = r.ReservationCode,
        VehicleId = r.VehicleId,
        VehiclePlate = r.Vehicle?.LicensePlate ?? "Unknown",
        PreferredSlotId = r.PreferredSlotId,
        PreferredSlotCode = r.PreferredSlot?.SlotCode,
        PreferredZoneId = r.PreferredZoneId,
        PreferredZoneName = r.PreferredZone?.Name,
        TicketType = r.TicketType.ToString(),
        Status = r.Status.ToString(),
        ReservedFrom = r.ReservedFrom,
        ReservedUntil = r.ReservedUntil,
        CheckedInAt = r.CheckedInAt,
        CancelledAt = r.CancelledAt,
        CancellationReason = r.CancellationReason,
        CreatedByUserName = r.CreatedByUser?.FullName,
        CreatedAt = r.CreatedAt,
        UpdatedAt = r.UpdatedAt
    };
}
