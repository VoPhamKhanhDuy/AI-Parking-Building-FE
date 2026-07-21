using ParkingSystem.Application.Common.Exceptions;
using ParkingSystem.Application.Common.Interfaces;
using ParkingSystem.Application.Common.Mappings;
using ParkingSystem.Application.ParkingStructure.DTOs;
using ParkingSystem.Application.ParkingStructure.Interfaces;
using ParkingSystem.Application.ParkingStructure.Specifications;
using ParkingSystem.Domain.Entities;

namespace ParkingSystem.Application.ParkingStructure.Services;

public class ParkingSlotService : IParkingSlotService
{
    private readonly IRepository<ParkingZone> _zones;
    private readonly IRepository<ParkingSlot> _slots;
    private readonly IUnitOfWork _uow;

    public ParkingSlotService(
        IRepository<ParkingZone> zones,
        IRepository<ParkingSlot> slots,
        IUnitOfWork uow)
    {
        _zones = zones;
        _slots = slots;
        _uow = uow;
    }

    public async Task<IReadOnlyList<ParkingSlotDto>> ListAsync(Guid zoneId, Domain.Enums.SlotStatus? status, CancellationToken ct = default)
    {
        var zoneExists = await _zones.GetByIdAsync(zoneId, ct);
        if (zoneExists is null) throw new NotFoundException(nameof(ParkingZone), zoneId);

        var slots = status.HasValue
            ? await _slots.ListAsync(new ParkingSlotSpecifications.ByZoneAndStatus(zoneId, status.Value), ct)
            : await _slots.ListAsync(new ParkingSlotSpecifications.ByZone(zoneId), ct);

        return slots.Select(s => s.ToDto()).ToList();
    }

    public async Task<ParkingSlotDto?> GetByIdAsync(Guid id, CancellationToken ct = default)
    {
        var s = await _slots.FirstOrDefaultAsync(new ParkingSlotSpecifications.ByIdWithZone(id), ct);
        return s?.ToDto();
    }

    public async Task<ParkingSlotDto> CreateAsync(CreateParkingSlotRequest req, CancellationToken ct = default)
    {
        var zone = await _zones.GetByIdAsync(req.ParkingZoneId, ct)
            ?? throw new NotFoundException(nameof(ParkingZone), req.ParkingZoneId);

        var dup = await _slots.FirstOrDefaultAsync(
            new ParkingSlotSpecifications.ByCodeInZone(req.ParkingZoneId, req.SlotCode), ct);
        if (dup is not null)
        {
            throw new ConflictException($"Slot '{req.SlotCode}' already exists in this zone.");
        }

        var s = new ParkingSlot
        {
            ParkingZoneId = req.ParkingZoneId,
            SlotCode = req.SlotCode.Trim(),
            Status = req.Status,
            DistanceToExitOrElevator = req.DistanceToExitOrElevator
        };

        await _slots.AddAsync(s, ct);
        await _uow.SaveChangesAsync(ct);

        s.ParkingZone = zone;
        return s.ToDto();
    }

    public async Task<IReadOnlyList<ParkingSlotDto>> CreateBulkAsync(CreateParkingSlotsBulkRequest req, CancellationToken ct = default)
    {
        var zone = await _zones.GetByIdAsync(req.ParkingZoneId, ct)
            ?? throw new NotFoundException(nameof(ParkingZone), req.ParkingZoneId);

        var created = new List<ParkingSlot>();
        for (var i = 0; i < req.Count; i++)
        {
            var index = req.StartIndex + i;
            var code = string.Format(req.CodeFormat, index);
            var dup = await _slots.FirstOrDefaultAsync(
                new ParkingSlotSpecifications.ByCodeInZone(req.ParkingZoneId, code), ct);
            if (dup is not null) continue; // skip existing to keep the operation idempotent

            var slot = new ParkingSlot
            {
                ParkingZoneId = req.ParkingZoneId,
                SlotCode = code,
                Status = req.Status,
                DistanceToExitOrElevator = null
            };
            await _slots.AddAsync(slot, ct);
            created.Add(slot);
        }

        await _uow.SaveChangesAsync(ct);
        foreach (var s in created) s.ParkingZone = zone;
        return created.Select(s => s.ToDto()).ToList();
    }

    public async Task<ParkingSlotDto> UpdateAsync(Guid id, UpdateParkingSlotRequest req, CancellationToken ct = default)
    {
        var s = await _slots.FirstOrDefaultAsync(new ParkingSlotSpecifications.ByIdWithZone(id), ct)
            ?? throw new NotFoundException(nameof(ParkingSlot), id);

        if (!string.IsNullOrWhiteSpace(req.SlotCode) && req.SlotCode != s.SlotCode)
        {
            var dup = await _slots.FirstOrDefaultAsync(
                new ParkingSlotSpecifications.ByCodeInZone(s.ParkingZoneId, req.SlotCode), ct);
            if (dup is not null && dup.Id != s.Id)
            {
                throw new ConflictException($"Slot '{req.SlotCode}' already exists in this zone.");
            }
            s.SlotCode = req.SlotCode.Trim();
        }

        if (req.Status.HasValue) s.Status = req.Status.Value;
        if (req.DistanceToExitOrElevator.HasValue) s.DistanceToExitOrElevator = req.DistanceToExitOrElevator;

        s.UpdatedAt = DateTime.UtcNow;
        _slots.Update(s);
        await _uow.SaveChangesAsync(ct);

        return s.ToDto();
    }

    public async Task DeleteAsync(Guid id, CancellationToken ct = default)
    {
        var s = await _slots.GetByIdAsync(id, ct)
            ?? throw new NotFoundException(nameof(ParkingSlot), id);

        s.IsDeleted = true;
        s.UpdatedAt = DateTime.UtcNow;
        _slots.Update(s);
        await _uow.SaveChangesAsync(ct);
    }
}
