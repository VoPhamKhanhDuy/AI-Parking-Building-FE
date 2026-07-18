using ParkingSystem.Domain.Common;
using ParkingSystem.Domain.Enums;

namespace ParkingSystem.Domain.Entities;

public class ParkingSlot : BaseEntity
{
    public Guid ParkingZoneId { get; set; }
    public ParkingZone? ParkingZone { get; set; }

    /// <summary>Business identifier printed on the floor, e.g. "B1-A-012". Unique within a zone.</summary>
    public string SlotCode { get; set; } = string.Empty;

    public SlotStatus Status { get; set; } = SlotStatus.Available;

    /// <summary>
    /// Specific override for "distance to exit/elevator" at the slot level.
    /// Falls back to the parent zone's value when null.
    /// </summary>
    public double? DistanceToExitOrElevator { get; set; }

    public ICollection<ParkingSession> Sessions { get; set; } = new List<ParkingSession>();
    public ICollection<AIRecommendationLog> AIRecommendations { get; set; } = new List<AIRecommendationLog>();
}