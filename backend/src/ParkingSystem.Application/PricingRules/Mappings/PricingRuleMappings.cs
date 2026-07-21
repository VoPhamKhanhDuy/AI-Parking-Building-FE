using ParkingSystem.Application.Common.Mappings;
using ParkingSystem.Domain.Entities;

namespace ParkingSystem.Application.PricingRules.Mappings;

public static class PricingRuleMappings
{
    public static PricingRules.DTOs.PricingRuleDto ToDto(this PricingRule rule)
    {
        ArgumentNullException.ThrowIfNull(rule);
        return new PricingRules.DTOs.PricingRuleDto
        {
            Id = rule.Id,
            VehicleTypeId = rule.VehicleTypeId,
            VehicleTypeName = rule.VehicleType?.Name ?? string.Empty,
            TicketType = rule.TicketType,
            PricePerHour = rule.PricePerHour,
            PricePerDay = rule.PricePerDay,
            PricePerMonth = rule.PricePerMonth,
            PenaltyFee = rule.PenaltyFee,
            EffectiveFrom = rule.EffectiveFrom,
            EffectiveTo = rule.EffectiveTo,
            IsActive = rule.IsActive,
            CreatedAt = rule.CreatedAt,
            UpdatedAt = rule.UpdatedAt
        };
    }
}
