using ParkingSystem.Application.ParkingStructure.DTOs;
using ParkingSystem.Domain.Entities;

namespace ParkingSystem.Application.Common.Mappings;

internal static class ParkingStructureMappings
{
    public static BuildingDto ToDto(this Building b, int floorCount = 0) => new()
    {
        Id = b.Id,
        Name = b.Name,
        Address = b.Address,
        TotalFloors = b.TotalFloors,
        FloorCount = floorCount,
        CreatedAt = b.CreatedAt,
        UpdatedAt = b.UpdatedAt
    };

    public static FloorSummaryDto ToSummaryDto(this Floor f, int zoneCount = 0) => new()
    {
        Id = f.Id,
        BuildingId = f.BuildingId,
        FloorNumber = f.FloorNumber,
        Name = f.Name,
        ZoneCount = zoneCount
    };

    public static FloorDto ToDto(this Floor f, string buildingName, int zoneCount = 0) => new()
    {
        Id = f.Id,
        BuildingId = f.BuildingId,
        BuildingName = buildingName,
        FloorNumber = f.FloorNumber,
        Name = f.Name,
        ZoneCount = zoneCount,
        CreatedAt = f.CreatedAt,
        UpdatedAt = f.UpdatedAt
    };

    public static ParkingZoneDto ToDto(this ParkingZone z, int slotCount = 0, int available = 0) => new()
    {
        Id = z.Id,
        FloorId = z.FloorId,
        FloorName = z.Floor?.Name ?? string.Empty,
        VehicleTypeId = z.VehicleTypeId,
        VehicleTypeName = z.VehicleType?.Name ?? string.Empty,
        Name = z.Name,
        DistanceToExitOrElevator = z.DistanceToExitOrElevator,
        Priority = z.Priority,
        SlotCount = slotCount,
        AvailableSlotCount = available,
        CreatedAt = z.CreatedAt,
        UpdatedAt = z.UpdatedAt
    };

    public static ParkingSlotSummaryDto ToSummaryDto(this ParkingSlot s) => new()
    {
        Id = s.Id,
        SlotCode = s.SlotCode,
        Status = s.Status,
        DistanceToExitOrElevator = s.DistanceToExitOrElevator
    };

    public static ParkingSlotDto ToDto(this ParkingSlot s) => new()
    {
        Id = s.Id,
        ParkingZoneId = s.ParkingZoneId,
        ZoneName = s.ParkingZone?.Name ?? string.Empty,
        SlotCode = s.SlotCode,
        Status = s.Status,
        DistanceToExitOrElevator = s.DistanceToExitOrElevator,
        CreatedAt = s.CreatedAt,
        UpdatedAt = s.UpdatedAt
    };
}
