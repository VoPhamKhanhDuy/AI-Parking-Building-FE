using ParkingSystem.Application.Common.Specifications;
using ParkingSystem.Domain.Common;
using ParkingSystem.Domain.Entities;
using ParkingSystem.Domain.Enums;

namespace ParkingSystem.Application.ParkingSessions.Specifications;

public static class ParkingSessionSpecifications
{
    public sealed class ByIdWithDetails : Specification<ParkingSession>
    {
        public ByIdWithDetails(Guid id)
        {
            AddCriteria(s => s.Id == id);
            AddInclude(s => s.Ticket);
            AddInclude(s => s.Vehicle);
            AddInclude(s => s.Slot);
            AddInclude(s => s.Payment);
        }
    }

    public sealed class ActiveByTicket : Specification<ParkingSession>
    {
        public ActiveByTicket(Guid ticketId)
        {
            AddCriteria(s => s.TicketId == ticketId && s.Status == SessionStatus.Active);
            AddInclude(s => s.Slot);
        }
    }

    public sealed class ActiveBySlot : Specification<ParkingSession>
    {
        public ActiveBySlot(Guid slotId)
        {
            AddCriteria(s => s.SlotId == slotId && s.Status == SessionStatus.Active);
            AddInclude(s => s.Ticket);
            AddInclude(s => s.Vehicle);
        }
    }

    public sealed class ActiveByVehicle : Specification<ParkingSession>
    {
        public ActiveByVehicle(Guid vehicleId)
        {
            AddCriteria(s => s.VehicleId == vehicleId && s.Status == SessionStatus.Active);
            AddInclude(s => s.Slot);
            AddInclude(s => s.Ticket);
        }
    }

    public sealed class ListFiltered : Specification<ParkingSession>
    {
        public ListFiltered(SessionStatus? status, Guid? vehicleId, Guid? slotId, Guid? ticketId,
            DateTime? fromUtc, DateTime? toUtc)
        {
            if (status.HasValue) AddCriteria(s => s.Status == status.Value);
            if (vehicleId.HasValue) AddCriteria(s => s.VehicleId == vehicleId.Value);
            if (slotId.HasValue) AddCriteria(s => s.SlotId == slotId.Value);
            if (ticketId.HasValue) AddCriteria(s => s.TicketId == ticketId.Value);

            if (fromUtc.HasValue)
            {
                var from = fromUtc.Value;
                AddCriteria(s => s.EntryTime >= from);
            }

            if (toUtc.HasValue)
            {
                var to = toUtc.Value;
                AddCriteria(s => s.EntryTime <= to);
            }

            ApplyOrderByDescending(s => s.EntryTime);
            AddInclude(s => s.Ticket);
            AddInclude(s => s.Vehicle);
            AddInclude(s => s.Slot);
            AddInclude(s => s.Payment);
        }
    }
}