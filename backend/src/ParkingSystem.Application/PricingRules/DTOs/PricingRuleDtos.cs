using ParkingSystem.Domain.Enums;

namespace ParkingSystem.Application.PricingRules.DTOs;

public class PricingRuleDto
{
    public Guid Id { get; set; }
    public Guid VehicleTypeId { get; set; }
    public string VehicleTypeName { get; set; } = string.Empty;
    public TicketType TicketType { get; set; }
    public decimal PricePerHour { get; set; }
    public decimal PricePerDay { get; set; }
    public decimal PricePerMonth { get; set; }
    public decimal PenaltyFee { get; set; }
    public DateTime EffectiveFrom { get; set; }
    public DateTime? EffectiveTo { get; set; }
    public bool IsActive { get; set; }
    public DateTime CreatedAt { get; set; }
    public DateTime? UpdatedAt { get; set; }
}

public class CreatePricingRuleRequest
{
    public Guid VehicleTypeId { get; set; }
    public TicketType TicketType { get; set; } = TicketType.Hourly;
    public decimal PricePerHour { get; set; }
    public decimal PricePerDay { get; set; }
    public decimal PricePerMonth { get; set; }
    public decimal PenaltyFee { get; set; }
    public DateTime EffectiveFrom { get; set; } = DateTime.UtcNow;
    public DateTime? EffectiveTo { get; set; }
    public bool IsActive { get; set; } = true;
}

public class UpdatePricingRuleRequest
{
    public decimal? PricePerHour { get; set; }
    public decimal? PricePerDay { get; set; }
    public decimal? PricePerMonth { get; set; }
    public decimal? PenaltyFee { get; set; }
    public DateTime? EffectiveFrom { get; set; }
    public DateTime? EffectiveTo { get; set; }
    public bool? IsActive { get; set; }
}
