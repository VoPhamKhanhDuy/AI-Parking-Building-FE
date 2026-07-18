using ParkingSystem.Domain.Common;
using ParkingSystem.Domain.Entities;
using ParkingSystem.Domain.Enums;

namespace ParkingSystem.Application.Reservations.Specifications;

public static class ReservationSpecifications
{
    public sealed class ListFiltered : Specification<Reservation>
    {
        public ListFiltered(string? search, ReservationStatus? status, Guid? vehicleId)
        {
            if (status.HasValue)
            {
                AddCriteria(r => r.Status == status.Value);
            }

            if (vehicleId.HasValue)
            {
                AddCriteria(r => r.VehicleId == vehicleId.Value);
            }

            if (!string.IsNullOrWhiteSpace(search))
            {
                var needle = search.Trim().ToUpperInvariant();
                AddCriteria(r =>
                    r.ReservationCode.ToUpper().Contains(needle) ||
                    (r.Vehicle != null && r.Vehicle.LicensePlate.ToUpper().Contains(needle)));
            }

            ApplyOrderByDescending(r => r.CreatedAt);
            AddInclude(r => r.Vehicle);
            AddInclude(r => r.PreferredSlot);
            AddInclude(r => r.PreferredZone);
            AddInclude(r => r.CreatedByUser);
        }
    }

    public sealed class ByIdWithDetails : Specification<Reservation>
    {
        public ByIdWithDetails(Guid id)
        {
            AddCriteria(r => r.Id == id);
            AddInclude(r => r.Vehicle);
            AddInclude(r => r.PreferredSlot);
            AddInclude(r => r.PreferredZone);
            AddInclude(r => r.CreatedByUser);
        }
    }

    public sealed class ByCode : Specification<Reservation>
    {
        public ByCode(string code)
        {
            AddCriteria(r => r.ReservationCode == code);
            AddInclude(r => r.Vehicle);
            AddInclude(r => r.PreferredSlot);
            AddInclude(r => r.PreferredZone);
        }
    }

    public sealed class ByStatus : Specification<Reservation>
    {
        public ByStatus(ReservationStatus status)
        {
            AddCriteria(r => r.Status == status);
        }
    }

    public sealed class ByVehicle : Specification<Reservation>
    {
        public ByVehicle(Guid vehicleId)
        {
            AddCriteria(r => r.VehicleId == vehicleId);
            AddInclude(r => r.Vehicle);
        }
    }
}
