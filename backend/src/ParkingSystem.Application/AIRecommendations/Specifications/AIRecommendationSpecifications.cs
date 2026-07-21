using ParkingSystem.Domain.Common;
using ParkingSystem.Domain.Entities;
using ParkingSystem.Domain.Enums;

namespace ParkingSystem.Application.AIRecommendations.Specifications;

/// <summary>
/// Query specs for the AI recommender. Kept in the Application layer so
/// the service stays EF-agnostic; the Infrastructure repo evaluator
/// translates these into SQL.
/// </summary>
public static class AIRecommendationSpecifications
{
    /// <summary>All non-deleted zones, with the VehicleType eagerly loaded so scoring can filter by category.</summary>
    public sealed class AllZonesWithVehicleType : Specification<ParkingZone>
    {
        public AllZonesWithVehicleType()
        {
            AddCriteria(z => !z.IsDeleted);
            AddInclude(z => z.VehicleType);
            AddInclude(z => z.Slots);
            AddInclude(z => z.Floor);
        }
    }

    /// <summary>VehicleTypes used to map a category back to the owning ID.</summary>
    public sealed class VehicleTypeByCategory : Specification<VehicleType>
    {
        public VehicleTypeByCategory(VehicleTypeCategory category)
        {
            AddCriteria(vt => vt.Category == category);
        }
    }

    /// <summary>Lookup by license plate (case-insensitive on PostgreSQL).</summary>
    public sealed class VehicleByLicensePlate : Specification<Vehicle>
    {
        public VehicleByLicensePlate(string licensePlate)
        {
            var plate = licensePlate.Trim().ToUpperInvariant();
            AddCriteria(v => v.LicensePlate == plate);
        }
    }
}
