namespace ParkingSystem.Application.ParkingStructure.DTOs;

public class FloorSummaryDto
{
    public Guid Id { get; set; }
    public Guid BuildingId { get; set; }
    public int FloorNumber { get; set; }
    public string? Name { get; set; }
    public int ZoneCount { get; set; }
}

public class FloorDto
{
    public Guid Id { get; set; }
    public Guid BuildingId { get; set; }
    public string BuildingName { get; set; } = string.Empty;
    public int FloorNumber { get; set; }
    public string? Name { get; set; }
    public int ZoneCount { get; set; }
    public DateTime CreatedAt { get; set; }
    public DateTime? UpdatedAt { get; set; }
}

public class CreateFloorRequest
{
    public Guid BuildingId { get; set; }
    public int FloorNumber { get; set; }
    public string? Name { get; set; }
}

public class UpdateFloorRequest
{
    public int? FloorNumber { get; set; }
    public string? Name { get; set; }
}
