using ParkingSystem.Domain.Common;

namespace ParkingSystem.Domain.Entities;

public class Floor : BaseEntity
{
    public Guid BuildingId { get; set; }
    public Building? Building { get; set; }

    /// <summary>Display number — usually matches the real floor number (e.g. -1, 1, 2).</summary>
    public int FloorNumber { get; set; }

    public string? Name { get; set; }

    public ICollection<ParkingZone> Zones { get; set; } = new List<ParkingZone>();
}