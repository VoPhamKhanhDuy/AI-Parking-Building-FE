namespace ParkingSystem.Application.ParkingStructure.DTOs;

public class ParkingZoneDto
{
    public Guid Id { get; set; }
    public Guid FloorId { get; set; }
    public string FloorName { get; set; } = string.Empty;
    public Guid VehicleTypeId { get; set; }
    public string VehicleTypeName { get; set; } = string.Empty;
    public string Name { get; set; } = string.Empty;
    public double DistanceToExitOrElevator { get; set; }
    public int Priority { get; set; }
    public int SlotCount { get; set; }
    public int AvailableSlotCount { get; set; }
    public DateTime CreatedAt { get; set; }
    public DateTime? UpdatedAt { get; set; }
}

public class ParkingZoneDetailDto : ParkingZoneDto
{
    public IReadOnlyList<ParkingSlotSummaryDto> Slots { get; set; } = Array.Empty<ParkingSlotSummaryDto>();
}

public class CreateParkingZoneRequest
{
    public Guid FloorId { get; set; }
    public Guid VehicleTypeId { get; set; }
    public string Name { get; set; } = string.Empty;
    public double DistanceToExitOrElevator { get; set; } = 0;
    public int Priority { get; set; } = 0;
}

public class UpdateParkingZoneRequest
{
    public Guid? VehicleTypeId { get; set; }
    public string? Name { get; set; }
    public double? DistanceToExitOrElevator { get; set; }
    public int? Priority { get; set; }
}
