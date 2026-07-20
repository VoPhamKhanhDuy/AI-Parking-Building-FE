using ParkingSystem.Application.Common.Specifications;
using ParkingSystem.Domain.Common;
using ParkingSystem.Domain.Entities;
using ParkingSystem.Domain.Enums;

namespace ParkingSystem.Application.PricingRules.Specifications;

public static class PricingRuleSpecifications
{
    public sealed class ByIdWithVehicleType : Specification<PricingRule>
    {
        public ByIdWithVehicleType(Guid id)
        {
            AddCriteria(r => r.Id == id);
            AddInclude(r => r.VehicleType);
        }
    }

    /// <summary>Find the rule that should be used to bill right now.
    /// "Active" = IsActive = true AND EffectiveFrom &lt;= atUtc &lt;= EffectiveTo (or EffectiveTo is null).</summary>
    public sealed class ActiveForBilling : Specification<PricingRule>
    {
        public ActiveForBilling(Guid vehicleTypeId, TicketType ticketType, DateTime atUtc)
        {
            AddCriteria(r => r.VehicleTypeId == vehicleTypeId
                             && r.TicketType == ticketType
                             && r.IsActive
                             && r.EffectiveFrom <= atUtc
                             && (r.EffectiveTo == null || r.EffectiveTo >= atUtc));
            AddInclude(r => r.VehicleType);
            // Newest effective-from wins if multiple overlap.
            ApplyOrderByDescending(r => r.EffectiveFrom);
        }
    }

    public sealed class ListFiltered : Specification<PricingRule>
    {
        public ListFiltered(Guid? vehicleTypeId, TicketType? ticketType, bool? isActive)
        {
            if (vehicleTypeId.HasValue)
            {
                AddCriteria(r => r.VehicleTypeId == vehicleTypeId.Value);
            }

            if (ticketType.HasValue)
            {
                AddCriteria(r => r.TicketType == ticketType.Value);
            }

            if (isActive.HasValue)
            {
                AddCriteria(r => r.IsActive == isActive.Value);
            }

            ApplyOrderByDescending(r => r.EffectiveFrom);
            AddInclude(r => r.VehicleType);
        }
    }
}
