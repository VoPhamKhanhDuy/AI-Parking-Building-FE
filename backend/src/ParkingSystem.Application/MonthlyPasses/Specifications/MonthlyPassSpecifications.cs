using ParkingSystem.Domain.Common;
using ParkingSystem.Domain.Entities;
using ParkingSystem.Domain.Enums;

namespace ParkingSystem.Application.MonthlyPasses.Specifications;

public static class MonthlyPassSpecifications
{
    public sealed class ListFiltered : Specification<MonthlyPass>
    {
        public ListFiltered(string? search, MonthlyPassStatus? status, Guid? vehicleTypeId)
        {
            if (status.HasValue)
            {
                AddCriteria(m => m.Status == status.Value);
            }

            if (vehicleTypeId.HasValue)
            {
                AddCriteria(m => m.VehicleTypeId == vehicleTypeId.Value);
            }

            if (!string.IsNullOrWhiteSpace(search))
            {
                var needle = search.Trim().ToUpperInvariant();
                AddCriteria(m =>
                    m.PassCode.ToUpper().Contains(needle) ||
                    m.LicensePlate.ToUpper().Contains(needle) ||
                    m.DriverName.ToUpper().Contains(needle));
            }

            ApplyOrderByDescending(m => m.CreatedAt);
            AddInclude(m => m.VehicleType);
        }
    }

    public sealed class ByIdWithDetails : Specification<MonthlyPass>
    {
        public ByIdWithDetails(Guid id)
        {
            AddCriteria(m => m.Id == id);
            AddInclude(m => m.VehicleType);
            AddInclude(m => m.AssignedZone);
            AddInclude(m => m.VerifiedByUser);
        }
    }

    public sealed class ByStatus : Specification<MonthlyPass>
    {
        public ByStatus(MonthlyPassStatus status)
        {
            AddCriteria(m => m.Status == status);
        }
    }

    public sealed class ByLicensePlate : Specification<MonthlyPass>
    {
        public ByLicensePlate(string licensePlate)
        {
            AddCriteria(m => m.LicensePlate == licensePlate);
        }
    }
}
