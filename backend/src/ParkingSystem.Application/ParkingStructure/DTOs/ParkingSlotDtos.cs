using ParkingSystem.Domain.Enums;

namespace ParkingSystem.Application.ParkingStructure.DTOs;

public class ParkingSlotSummaryDto
{
    public Guid Id { get; set; }
    public string SlotCode { get; set; } = string.Empty;
    public SlotStatus Status { get; set; }
    public double? DistanceToExitOrElevator { get; set; }
}

public class ParkingSlotDto
{
    public Guid Id { get; set; }
    public Guid ParkingZoneId { get; set; }
    public string ZoneName { get; set; } = string.Empty;
    public string SlotCode { get; set; } = string.Empty;
    public SlotStatus Status { get; set; }
    public double? DistanceToExitOrElevator { get; set; }
    public DateTime CreatedAt { get; set; }
    public DateTime? UpdatedAt { get; set; }
}

public class CreateParkingSlotRequest
{
    public Guid ParkingZoneId { get; set; }
    public string SlotCode { get; set; } = string.Empty;
    public SlotStatus Status { get; set; } = SlotStatus.Available;
    public double? DistanceToExitOrElevator { get; set; }
}

/// <summary>
/// Bulk-create slots under one zone — common when deploying a new floor.
/// </summary>
public class CreateParkingSlotsBulkRequest
{
    public Guid ParkingZoneId { get; set; }
    /// <summary>e.g. "A-{0:000}" → A-001..A-050.</summary>
    public string CodeFormat { get; set; } = "A-{0:000}";
    public int StartIndex { get; set; } = 1;
    public int Count { get; set; } = 10;
    public SlotStatus Status { get; set; } = SlotStatus.Available;
}

public class UpdateParkingSlotRequest
{
    public string? SlotCode { get; set; }
    public SlotStatus? Status { get; set; }
    public double? DistanceToExitOrElevator { get; set; }
}
