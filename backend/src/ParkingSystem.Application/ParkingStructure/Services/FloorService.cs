using ParkingSystem.Application.Common.Exceptions;
using ParkingSystem.Application.Common.Interfaces;
using ParkingSystem.Application.Common.Mappings;
using ParkingSystem.Application.ParkingStructure.DTOs;
using ParkingSystem.Application.ParkingStructure.Interfaces;
using ParkingSystem.Application.ParkingStructure.Specifications;
using ParkingSystem.Domain.Entities;

namespace ParkingSystem.Application.ParkingStructure.Services;

public class FloorService : IFloorService
{
    private readonly IRepository<Building> _buildings;
    private readonly IRepository<Floor> _floors;
    private readonly IRepository<ParkingZone> _zones;
    private readonly IUnitOfWork _uow;

    public FloorService(
        IRepository<Building> buildings,
        IRepository<Floor> floors,
        IRepository<ParkingZone> zones,
        IUnitOfWork uow)
    {
        _buildings = buildings;
        _floors = floors;
        _zones = zones;
        _uow = uow;
    }

    public async Task<IReadOnlyList<FloorDto>> ListByBuildingAsync(Guid buildingId, CancellationToken ct = default)
    {
        var floors = await _floors.ListAsync(new FloorSpecifications.ByBuilding(buildingId), ct);
        var results = new List<FloorDto>(floors.Count);
        foreach (var f in floors)
        {
            var zones = await _zones.ListAsync(new ParkingZoneSpecifications.ByFloor(f.Id), ct);
            results.Add(f.ToDto(f.Building?.Name ?? string.Empty, zones.Count));
        }
        return results;
    }

    public async Task<FloorDto?> GetByIdAsync(Guid id, CancellationToken ct = default)
    {
        var f = await _floors.FirstOrDefaultAsync(new FloorSpecifications.WithBuilding(id), ct);
        if (f is null) return null;

        var zones = await _zones.ListAsync(new ParkingZoneSpecifications.ByFloor(f.Id), ct);
        return f.ToDto(f.Building?.Name ?? string.Empty, zones.Count);
    }

    public async Task<FloorDto> CreateAsync(CreateFloorRequest req, CancellationToken ct = default)
    {
        var building = await _buildings.GetByIdAsync(req.BuildingId, ct)
            ?? throw new NotFoundException(nameof(Building), req.BuildingId);

        var existing = await _floors.FirstOrDefaultAsync(
            new FloorSpecifications.ByBuildingAndNumber(req.BuildingId, req.FloorNumber), ct);
        if (existing is not null)
        {
            throw new ConflictException($"Floor #{req.FloorNumber} already exists in this building.");
        }

        var f = new Floor
        {
            BuildingId = req.BuildingId,
            FloorNumber = req.FloorNumber,
            Name = req.Name?.Trim()
        };

        await _floors.AddAsync(f, ct);
        await _uow.SaveChangesAsync(ct);

        return f.ToDto(building.Name);
    }

    public async Task<FloorDto> UpdateAsync(Guid id, UpdateFloorRequest req, CancellationToken ct = default)
    {
        var f = await _floors.FirstOrDefaultAsync(new FloorSpecifications.WithBuilding(id), ct)
            ?? throw new NotFoundException(nameof(Floor), id);

        if (req.FloorNumber.HasValue && req.FloorNumber.Value != f.FloorNumber)
        {
            var dup = await _floors.FirstOrDefaultAsync(
                new FloorSpecifications.ByBuildingAndNumber(f.BuildingId, req.FloorNumber.Value), ct);
            if (dup is not null && dup.Id != f.Id)
            {
                throw new ConflictException($"Floor #{req.FloorNumber.Value} already exists in this building.");
            }
            f.FloorNumber = req.FloorNumber.Value;
        }

        if (req.Name is not null) f.Name = string.IsNullOrWhiteSpace(req.Name) ? null : req.Name.Trim();

        f.UpdatedAt = DateTime.UtcNow;
        _floors.Update(f);
        await _uow.SaveChangesAsync(ct);

        var zones = await _zones.ListAsync(new ParkingZoneSpecifications.ByFloor(f.Id), ct);
        return f.ToDto(f.Building?.Name ?? string.Empty, zones.Count);
    }

    public async Task DeleteAsync(Guid id, CancellationToken ct = default)
    {
        var f = await _floors.GetByIdAsync(id, ct)
            ?? throw new NotFoundException(nameof(Floor), id);

        var zones = await _zones.ListAsync(new ParkingZoneSpecifications.ByFloor(id), ct);
        if (zones.Count > 0)
        {
            throw new ConflictException("Cannot delete floor that still has zones. Remove zones first.");
        }

        f.IsDeleted = true;
        f.UpdatedAt = DateTime.UtcNow;
        _floors.Update(f);
        await _uow.SaveChangesAsync(ct);
    }
}
