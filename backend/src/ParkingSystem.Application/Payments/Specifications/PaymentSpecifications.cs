using ParkingSystem.Application.Common.Specifications;
using ParkingSystem.Domain.Common;
using ParkingSystem.Domain.Entities;
using ParkingSystem.Domain.Enums;

namespace ParkingSystem.Application.Payments.Specifications;

public static class PaymentSpecifications
{
    public sealed class ByIdWithDetails : Specification<Payment>
    {
        public ByIdWithDetails(Guid id)
        {
            AddCriteria(p => p.Id == id);
            AddInclude("Session.Ticket.Vehicle.VehicleType");
            AddInclude("Session.Vehicle.VehicleType");
            AddInclude("ProcessedByUser");
        }
    }

    public sealed class BySession : Specification<Payment>
    {
        public BySession(Guid sessionId)
        {
            AddCriteria(p => p.SessionId == sessionId);
            AddInclude("Session.Ticket.Vehicle.VehicleType");
            AddInclude("Session.Vehicle.VehicleType");
            AddInclude("ProcessedByUser");
        }
    }

    public sealed class ListFiltered : Specification<Payment>
    {
        public ListFiltered(PaymentStatus? status, Guid? sessionId, Guid? processedByUserId,
            DateTime? fromUtc, DateTime? toUtc)
        {
            if (status.HasValue) AddCriteria(p => p.Status == status.Value);
            if (sessionId.HasValue) AddCriteria(p => p.SessionId == sessionId.Value);
            if (processedByUserId.HasValue) AddCriteria(p => p.ProcessedByUserId == processedByUserId.Value);

            if (fromUtc.HasValue)
            {
                var from = fromUtc.Value;
                AddCriteria(p => p.CreatedAt >= from);
            }

            if (toUtc.HasValue)
            {
                var to = toUtc.Value;
                AddCriteria(p => p.CreatedAt <= to);
            }

            ApplyOrderByDescending(p => p.CreatedAt);
            AddInclude("Session.Ticket.Vehicle.VehicleType");
            AddInclude("Session.Vehicle.VehicleType");
            AddInclude("ProcessedByUser");
        }
    }
}