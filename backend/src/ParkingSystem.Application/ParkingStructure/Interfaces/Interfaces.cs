using ParkingSystem.Application.ParkingStructure.DTOs;

namespace ParkingSystem.Application.ParkingStructure.Interfaces;

public interface IBuildingService
{
    Task<IReadOnlyList<BuildingDto>> ListAsync(string? q, CancellationToken ct = default);
    Task<BuildingDetailDto?> GetByIdAsync(Guid id, CancellationToken ct = default);
    Task<BuildingDto> CreateAsync(CreateBuildingRequest req, CancellationToken ct = default);
    Task<BuildingDto> UpdateAsync(Guid id, UpdateBuildingRequest req, CancellationToken ct = default);
    Task DeleteAsync(Guid id, CancellationToken ct = default);
}

public interface IFloorService
{
    Task<IReadOnlyList<FloorDto>> ListByBuildingAsync(Guid buildingId, CancellationToken ct = default);
    Task<FloorDto?> GetByIdAsync(Guid id, CancellationToken ct = default);
    Task<FloorDto> CreateAsync(CreateFloorRequest req, CancellationToken ct = default);
    Task<FloorDto> UpdateAsync(Guid id, UpdateFloorRequest req, CancellationToken ct = default);
    Task DeleteAsync(Guid id, CancellationToken ct = default);
}

public interface IParkingZoneService
{
    Task<IReadOnlyList<ParkingZoneDto>> ListByFloorAsync(Guid floorId, CancellationToken ct = default);
    Task<ParkingZoneDetailDto?> GetByIdAsync(Guid id, CancellationToken ct = default);
    Task<ParkingZoneDto> CreateAsync(CreateParkingZoneRequest req, CancellationToken ct = default);
    Task<ParkingZoneDto> UpdateAsync(Guid id, UpdateParkingZoneRequest req, CancellationToken ct = default);
    Task DeleteAsync(Guid id, CancellationToken ct = default);
}

public interface IParkingSlotService
{
    Task<IReadOnlyList<ParkingSlotDto>> ListAsync(Guid zoneId, Domain.Enums.SlotStatus? status, CancellationToken ct = default);
    Task<ParkingSlotDto?> GetByIdAsync(Guid id, CancellationToken ct = default);
    Task<ParkingSlotDto> CreateAsync(CreateParkingSlotRequest req, CancellationToken ct = default);
    Task<IReadOnlyList<ParkingSlotDto>> CreateBulkAsync(CreateParkingSlotsBulkRequest req, CancellationToken ct = default);
    Task<ParkingSlotDto> UpdateAsync(Guid id, UpdateParkingSlotRequest req, CancellationToken ct = default);
    Task DeleteAsync(Guid id, CancellationToken ct = default);
    Task<int> CleanupOrphanSlotsAsync(CancellationToken ct = default);
}
