using ParkingSystem.Domain.Common;
using ParkingSystem.Domain.Entities;

namespace ParkingSystem.Application.Vehicles.Specifications;

public static class VehicleSpecifications
{
    /// <summary>Find a vehicle by exact (normalized) license plate. Caller is expected
    /// to pass an already-normalized plate (see <see cref="NormalizePlate"/>).</summary>
    public sealed class ByLicensePlate : Specification<Vehicle>
    {
        private readonly string _plate;

        public ByLicensePlate(string normalizedPlate)
        {
            _plate = normalizedPlate;
            AddCriteria(v => v.LicensePlate == _plate);
            AddInclude(v => v.VehicleType);
            AddInclude(v => v.OwnerUser);
        }
    }

    public sealed class ByIdWithDetails : Specification<Vehicle>
    {
        public ByIdWithDetails(Guid id)
        {
            AddCriteria(v => v.Id == id);
            AddInclude(v => v.VehicleType);
            AddInclude(v => v.OwnerUser);
        }
    }

    /// <summary>List with optional filters: vehicleTypeId, ownerUserId, free-text q.</summary>
    public sealed class ListFiltered : Specification<Vehicle>
    {
        public ListFiltered(Guid? vehicleTypeId, Guid? ownerUserId, string? q)
        {
            if (vehicleTypeId.HasValue)
            {
                AddCriteria(v => v.VehicleTypeId == vehicleTypeId.Value);
            }

            if (ownerUserId.HasValue)
            {
                AddCriteria(v => v.OwnerUserId == ownerUserId.Value);
            }

            if (!string.IsNullOrWhiteSpace(q))
            {
                var needle = q.Trim().ToLowerInvariant();
                AddCriteria(v => v.LicensePlate.ToLower().Contains(needle)
                                 || (v.Brand != null && v.Brand.ToLower().Contains(needle))
                                 || (v.Model != null && v.Model.ToLower().Contains(needle)));
            }

            ApplyOrderBy(v => v.LicensePlate);
            AddInclude(v => v.VehicleType);
            AddInclude(v => v.OwnerUser);
        }
    }

    /// <summary>Normalize license plate: trim + uppercase, strip extra spaces.</summary>
    public static string NormalizePlate(string plate) =>
        string.IsNullOrWhiteSpace(plate)
            ? string.Empty
            : string.Join(' ', plate.Trim().ToUpperInvariant().Split(' ', StringSplitOptions.RemoveEmptyEntries));
}