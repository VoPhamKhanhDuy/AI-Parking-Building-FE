using ParkingSystem.Domain.Common;
using ParkingSystem.Domain.Enums;

namespace ParkingSystem.Domain.Entities;

public class PricingRule : BaseEntity
{
    public Guid VehicleTypeId { get; set; }
    public VehicleType? VehicleType { get; set; }

    public TicketType TicketType { get; set; }

    public decimal PricePerHour { get; set; }

    public decimal PricePerDay { get; set; }

    public decimal PricePerMonth { get; set; }

    public decimal PenaltyFee { get; set; }

    public DateTime EffectiveFrom { get; set; } = DateTime.UtcNow;

    public DateTime? EffectiveTo { get; set; }

    public bool IsActive { get; set; } = true;
}