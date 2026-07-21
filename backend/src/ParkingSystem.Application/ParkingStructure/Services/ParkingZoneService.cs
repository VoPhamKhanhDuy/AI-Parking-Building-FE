using ParkingSystem.Application.Common.Exceptions;
using ParkingSystem.Application.Common.Interfaces;
using ParkingSystem.Application.Common.Mappings;
using ParkingSystem.Application.ParkingStructure.DTOs;
using ParkingSystem.Application.ParkingStructure.Interfaces;
using ParkingSystem.Application.ParkingStructure.Specifications;
using ParkingSystem.Domain.Entities;
using ParkingSystem.Domain.Enums;

namespace ParkingSystem.Application.ParkingStructure.Services;

public class ParkingZoneService : IParkingZoneService
{
    private readonly IRepository<Floor> _floors;
    private readonly IRepository<VehicleType> _vehicleTypes;
    private readonly IRepository<ParkingZone> _zones;
    private readonly IRepository<ParkingSlot> _slots;
    private readonly IUnitOfWork _uow;

    public ParkingZoneService(
        IRepository<Floor> floors,
        IRepository<VehicleType> vehicleTypes,
        IRepository<ParkingZone> zones,
        IRepository<ParkingSlot> slots,
        IUnitOfWork uow)
    {
        _floors = floors;
        _vehicleTypes = vehicleTypes;
        _zones = zones;
        _slots = slots;
        _uow = uow;
    }

    public async Task<IReadOnlyList<ParkingZoneDto>> ListByFloorAsync(Guid floorId, CancellationToken ct = default)
    {
        var zones = await _zones.ListAsync(new ParkingZoneSpecifications.ByFloor(floorId), ct);
        var results = new List<ParkingZoneDto>(zones.Count);
        foreach (var z in zones)
        {
            var allSlots = await _slots.ListAsync(new ParkingSlotSpecifications.ByZone(z.Id), ct);
            var available = allSlots.Count(s => s.Status == SlotStatus.Available);
            results.Add(z.ToDto(allSlots.Count, available));
        }
        return results;
    }

    public async Task<ParkingZoneDetailDto?> GetByIdAsync(Guid id, CancellationToken ct = default)
    {
        var z = await _zones.FirstOrDefaultAsync(new ParkingZoneSpecifications.ByIdWithDetails(id), ct);
        if (z is null) return null;

        var available = z.Slots.Count(s => s.Status == SlotStatus.Available);

        var slotDtos = z.Slots.OrderBy(s => s.SlotCode).Select(s => s.ToSummaryDto()).ToList();

        return new ParkingZoneDetailDto
        {
            Id = z.Id,
            FloorId = z.FloorId,
            FloorName = z.Floor?.Name ?? string.Empty,
            VehicleTypeId = z.VehicleTypeId,
            VehicleTypeName = z.VehicleType?.Name ?? string.Empty,
            Name = z.Name,
            DistanceToExitOrElevator = z.DistanceToExitOrElevator,
            Priority = z.Priority,
            SlotCount = z.Slots.Count,
            AvailableSlotCount = available,
            CreatedAt = z.CreatedAt,
            UpdatedAt = z.UpdatedAt,
            Slots = slotDtos
        };
    }

    public async Task<ParkingZoneDto> CreateAsync(CreateParkingZoneRequest req, CancellationToken ct = default)
    {
        var floor = await _floors.GetByIdAsync(req.FloorId, ct)
            ?? throw new NotFoundException(nameof(Floor), req.FloorId);

        var vt = await _vehicleTypes.GetByIdAsync(req.VehicleTypeId, ct)
            ?? throw new ValidationException($"Vehicle type '{req.VehicleTypeId}' does not exist.");

        var dup = await _zones.FirstOrDefaultAsync(
            new ParkingZoneSpecifications.ByName(req.FloorId, req.Name), ct);
        if (dup is not null)
        {
            throw new ConflictException($"Zone '{req.Name}' already exists on this floor.");
        }

        var z = new ParkingZone
        {
            FloorId = req.FloorId,
            VehicleTypeId = req.VehicleTypeId,
            Name = req.Name.Trim(),
            DistanceToExitOrElevator = req.DistanceToExitOrElevator,
            Priority = req.Priority,
            Floor = floor,
            VehicleType = vt
        };

        await _zones.AddAsync(z, ct);
        await _uow.SaveChangesAsync(ct);

        return z.ToDto();
    }

    public async Task<ParkingZoneDto> UpdateAsync(Guid id, UpdateParkingZoneRequest req, CancellationToken ct = default)
    {
        var z = await _zones.FirstOrDefaultAsync(new ParkingZoneSpecifications.ByIdWithFloor(id), ct)
            ?? throw new NotFoundException(nameof(ParkingZone), id);

        if (!string.IsNullOrWhiteSpace(req.Name) && req.Name != z.Name)
        {
            var dup = await _zones.FirstOrDefaultAsync(new ParkingZoneSpecifications.ByName(z.FloorId, req.Name), ct);
            if (dup is not null && dup.Id != z.Id)
            {
                throw new ConflictException($"Zone '{req.Name}' already exists on this floor.");
            }
            z.Name = req.Name.Trim();
        }

        if (req.VehicleTypeId.HasValue && req.VehicleTypeId.Value != z.VehicleTypeId)
        {
            var vt = await _vehicleTypes.GetByIdAsync(req.VehicleTypeId.Value, ct)
                ?? throw new ValidationException("Vehicle type does not exist.");
            z.VehicleTypeId = vt.Id;
            z.VehicleType = vt;
        }

        if (req.DistanceToExitOrElevator.HasValue) z.DistanceToExitOrElevator = req.DistanceToExitOrElevator.Value;
        if (req.Priority.HasValue) z.Priority = req.Priority.Value;

        z.UpdatedAt = DateTime.UtcNow;
        _zones.Update(z);
        await _uow.SaveChangesAsync(ct);

        var allSlots = await _slots.ListAsync(new ParkingSlotSpecifications.ByZone(z.Id), ct);
        var available = allSlots.Count(s => s.Status == SlotStatus.Available);
        return z.ToDto(allSlots.Count, available);
    }

    public async Task DeleteAsync(Guid id, CancellationToken ct = default)
    {
        var z = await _zones.GetByIdAsync(id, ct)
            ?? throw new NotFoundException(nameof(ParkingZone), id);

        var slots = await _slots.ListAsync(new ParkingSlotSpecifications.ByZone(id), ct);
        if (slots.Count > 0)
        {
            throw new ConflictException("Cannot delete zone that still has slots. Remove slots first.");
        }

        z.IsDeleted = true;
        z.UpdatedAt = DateTime.UtcNow;
        _zones.Update(z);
        await _uow.SaveChangesAsync(ct);
    }
}
