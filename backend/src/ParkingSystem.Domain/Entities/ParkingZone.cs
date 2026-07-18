using ParkingSystem.Domain.Common;

namespace ParkingSystem.Domain.Entities;

public class ParkingZone : BaseEntity
{
    public Guid FloorId { get; set; }
    public Floor? Floor { get; set; }

    public Guid VehicleTypeId { get; set; }
    public VehicleType? VehicleType { get; set; }

    public string Name { get; set; } = string.Empty;

    /// <summary>Distance to the nearest exit/elevator, in metres. Used by the AI scoring formula.</summary>
    public double DistanceToExitOrElevator { get; set; }

    /// <summary>Higher = preferred. Defaults to 0.</summary>
    public int Priority { get; set; }

    public ICollection<ParkingSlot> Slots { get; set; } = new List<ParkingSlot>();
}