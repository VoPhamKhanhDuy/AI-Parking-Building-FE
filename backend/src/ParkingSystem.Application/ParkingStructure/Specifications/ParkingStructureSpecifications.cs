using System.Linq.Expressions;
using ParkingSystem.Domain.Common;
using ParkingSystem.Domain.Entities;
using ParkingSystem.Domain.Enums;

namespace ParkingSystem.Application.ParkingStructure.Specifications;

public static class BuildingSpecifications
{
    public sealed class AllOrdered : Specification<Building>
    {
        public AllOrdered(string? q = null)
        {
            if (!string.IsNullOrWhiteSpace(q))
            {
                var needle = q.Trim().ToLowerInvariant();
                AddCriteria(b => b.Name.ToLower().Contains(needle)
                                 || (b.Address != null && b.Address.ToLower().Contains(needle)));
            }
            ApplyOrderBy(b => b.Name);
        }
    }

    public sealed class WithFloors : Specification<Building>
    {
        public WithFloors(Guid id)
        {
            AddCriteria(b => b.Id == id);
            AddInclude(b => b.Floors);
        }
    }
}

public static class FloorSpecifications
{
    public sealed class ByBuilding : Specification<Floor>
    {
        public ByBuilding(Guid buildingId)
        {
            AddCriteria(f => f.BuildingId == buildingId);
            ApplyOrderBy(f => f.FloorNumber);
            AddInclude(f => f.Building);
        }
    }

    public sealed class ByBuildingAndNumber : Specification<Floor>
    {
        public ByBuildingAndNumber(Guid buildingId, int floorNumber)
        {
            AddCriteria(f => f.BuildingId == buildingId && f.FloorNumber == floorNumber);
        }
    }

    public sealed class WithBuilding : Specification<Floor>
    {
        public WithBuilding(Guid id)
        {
            AddCriteria(f => f.Id == id);
            AddInclude(f => f.Building);
        }
    }
}

public static class ParkingZoneSpecifications
{
    public sealed class ByFloor : Specification<ParkingZone>
    {
        public ByFloor(Guid floorId)
        {
            AddCriteria(z => z.FloorId == floorId);
            // Primary: lowest distance (closest to exit). Secondary: highest priority.
            ApplyOrderBy(z => z.DistanceToExitOrElevator);
            ThenByDescending(z => z.Priority);
#pragma warning disable CS8603 // Navigation properties may be null but the include is intentional.
            AddInclude(z => z.Floor);
            AddInclude(z => z.VehicleType);
#pragma warning restore CS8603
        }
    }

    public sealed class ByVehicleType : Specification<ParkingZone>
    {
        public ByVehicleType(Guid vehicleTypeId)
        {
            AddCriteria(z => z.VehicleTypeId == vehicleTypeId);
            AddInclude(z => z.VehicleType);
        }
    }

    public sealed class ByIdWithDetails : Specification<ParkingZone>
    {
        public ByIdWithDetails(Guid id)
        {
            AddCriteria(z => z.Id == id);
            AddInclude(z => z.Floor);
            AddInclude(z => z.VehicleType);
            AddInclude(z => z.Slots);
        }
    }

    public sealed class ByIdWithFloor : Specification<ParkingZone>
    {
        public ByIdWithFloor(Guid id)
        {
            AddCriteria(z => z.Id == id);
            AddInclude(z => z.Floor);
            AddInclude(z => z.VehicleType);
        }
    }

    public sealed class ByName : Specification<ParkingZone>
    {
        public ByName(Guid floorId, string name)
        {
            var n = name.Trim().ToLowerInvariant();
            AddCriteria(z => z.FloorId == floorId && z.Name.ToLower() == n);
        }
    }
}

public static class ParkingSlotSpecifications
{
    public sealed class ByZone : Specification<ParkingSlot>
    {
        public ByZone(Guid zoneId)
        {
            AddCriteria(s => s.ParkingZoneId == zoneId);
            ApplyOrderBy(s => s.SlotCode);
            AddInclude(s => s.ParkingZone);
        }
    }

    public sealed class ByZoneAndStatus : Specification<ParkingSlot>
    {
        public ByZoneAndStatus(Guid zoneId, SlotStatus status)
        {
            AddCriteria(s => s.ParkingZoneId == zoneId && s.Status == status);
            AddInclude(s => s.ParkingZone);
        }
    }

    public sealed class ByCodeInZone : Specification<ParkingSlot>
    {
        public ByCodeInZone(Guid zoneId, string code)
        {
            var c = code.Trim();
            AddCriteria(s => s.ParkingZoneId == zoneId && s.SlotCode == c);
        }
    }

    public sealed class ByIdWithZone : Specification<ParkingSlot>
    {
        public ByIdWithZone(Guid id)
        {
            AddCriteria(s => s.Id == id);
            AddInclude(s => s.ParkingZone);
        }
    }

    /// <summary>Slots available for recommendation; stays in Application layer (EF-independent).</summary>
    public static Expression<Func<ParkingSlot, bool>> AvailableExpr(SlotStatus status = SlotStatus.Available)
        => s => s.Status == status;

    public sealed class OrphanSlots : Specification<ParkingSlot>
    {
        public OrphanSlots()
        {
            AddCriteria(s => s.ParkingZoneId == Guid.Empty);
            AddInclude(s => s.ParkingZone);
        }
    }
}
