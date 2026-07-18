namespace ParkingSystem.Application.ParkingStructure.DTOs;

public class BuildingDto
{
    public Guid Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public string? Address { get; set; }
    public int TotalFloors { get; set; }
    public int FloorCount { get; set; }
    public DateTime CreatedAt { get; set; }
    public DateTime? UpdatedAt { get; set; }
}

public class BuildingDetailDto : BuildingDto
{
    public IReadOnlyList<FloorSummaryDto> Floors { get; set; } = Array.Empty<FloorSummaryDto>();
}

public class CreateBuildingRequest
{
    public string Name { get; set; } = string.Empty;
    public string? Address { get; set; }
    public int TotalFloors { get; set; } = 1;
}

public class UpdateBuildingRequest
{
    public string? Name { get; set; }
    public string? Address { get; set; }
    public int? TotalFloors { get; set; }
}
