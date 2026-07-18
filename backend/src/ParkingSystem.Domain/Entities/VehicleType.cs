using ParkingSystem.Domain.Common;
using ParkingSystem.Domain.Enums;

namespace ParkingSystem.Domain.Entities;

/// <summary>
/// Catalog row describing a kind of vehicle the building accepts
/// (Car / Motorbike / ElectricVehicle / etc.). Used by <see cref="ParkingZone"/>
/// to restrict which vehicles may park there.
/// </summary>
public class VehicleType : BaseEntity
{
    public string Name { get; set; } = string.Empty;

    public VehicleTypeCategory Category { get; set; }

    /// <summary>Default pricing for hourly tickets, kept here for reference.</summary>
    public decimal DefaultHourlyRate { get; set; }

    public ICollection<ParkingZone> Zones { get; set; } = new List<ParkingZone>();
    public ICollection<PricingRule> PricingRules { get; set; } = new List<PricingRule>();
    public ICollection<Vehicle> Vehicles { get; set; } = new List<Vehicle>();
}