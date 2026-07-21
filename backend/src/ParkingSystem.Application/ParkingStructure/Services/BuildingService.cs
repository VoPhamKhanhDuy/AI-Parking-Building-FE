using ParkingSystem.Application.Common.Exceptions;
using ParkingSystem.Application.Common.Interfaces;
using ParkingSystem.Application.Common.Mappings;
using ParkingSystem.Application.ParkingStructure.DTOs;
using ParkingSystem.Application.ParkingStructure.Interfaces;
using ParkingSystem.Application.ParkingStructure.Specifications;
using ParkingSystem.Domain.Entities;

namespace ParkingSystem.Application.ParkingStructure.Services;

public class BuildingService : IBuildingService
{
    private readonly IRepository<Building> _buildings;
    private readonly IRepository<Floor> _floors;
    private readonly IUnitOfWork _uow;

    public BuildingService(IRepository<Building> buildings, IRepository<Floor> floors, IUnitOfWork uow)
    {
        _buildings = buildings;
        _floors = floors;
        _uow = uow;
    }

    public async Task<IReadOnlyList<BuildingDto>> ListAsync(string? q, CancellationToken ct = default)
    {
        var items = await _buildings.ListAsync(new BuildingSpecifications.AllOrdered(q), ct);
        var withCounts = new List<BuildingDto>(items.Count);
        foreach (var b in items)
        {
            var floorList = await _floors.ListAsync(new FloorSpecifications.ByBuilding(b.Id), ct);
            withCounts.Add(b.ToDto(floorList.Count));
        }
        return withCounts;
    }

    public async Task<BuildingDetailDto?> GetByIdAsync(Guid id, CancellationToken ct = default)
    {
        var b = await _buildings.FirstOrDefaultAsync(new BuildingSpecifications.WithFloors(id), ct);
        if (b is null) return null;

        var floorDtos = b.Floors
            .OrderBy(f => f.FloorNumber)
            .Select(f => f.ToSummaryDto(f.Zones?.Count ?? 0))
            .ToList();

        return new BuildingDetailDto
        {
            Id = b.Id,
            Name = b.Name,
            Address = b.Address,
            TotalFloors = b.TotalFloors,
            FloorCount = b.Floors.Count,
            CreatedAt = b.CreatedAt,
            UpdatedAt = b.UpdatedAt,
            Floors = floorDtos
        };
    }

    public async Task<BuildingDto> CreateAsync(CreateBuildingRequest req, CancellationToken ct = default)
    {
        var b = new Building
        {
            Name = req.Name.Trim(),
            Address = req.Address?.Trim(),
            TotalFloors = req.TotalFloors
        };
        await _buildings.AddAsync(b, ct);
        await _uow.SaveChangesAsync(ct);
        return b.ToDto();
    }

    public async Task<BuildingDto> UpdateAsync(Guid id, UpdateBuildingRequest req, CancellationToken ct = default)
    {
        var b = await _buildings.GetByIdAsync(id, ct)
            ?? throw new NotFoundException(nameof(Building), id);

        if (!string.IsNullOrWhiteSpace(req.Name)) b.Name = req.Name.Trim();
        if (req.Address is not null) b.Address = string.IsNullOrWhiteSpace(req.Address) ? null : req.Address.Trim();
        if (req.TotalFloors.HasValue) b.TotalFloors = req.TotalFloors.Value;

        b.UpdatedAt = DateTime.UtcNow;
        _buildings.Update(b);
        await _uow.SaveChangesAsync(ct);

        var floorList = await _floors.ListAsync(new FloorSpecifications.ByBuilding(b.Id), ct);
        return b.ToDto(floorList.Count);
    }

    public async Task DeleteAsync(Guid id, CancellationToken ct = default)
    {
        var b = await _buildings.GetByIdAsync(id, ct)
            ?? throw new NotFoundException(nameof(Building), id);

        var floorList = await _floors.ListAsync(new FloorSpecifications.ByBuilding(id), ct);
        if (floorList.Count > 0)
        {
            throw new ConflictException("Cannot delete building that still has floors. Remove floors first.");
        }

        b.IsDeleted = true;
        b.UpdatedAt = DateTime.UtcNow;
        _buildings.Update(b);
        await _uow.SaveChangesAsync(ct);
    }
}
