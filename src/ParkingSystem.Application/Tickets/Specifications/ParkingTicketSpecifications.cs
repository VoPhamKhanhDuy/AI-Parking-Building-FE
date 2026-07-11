using ParkingSystem.Domain.Common;
using ParkingSystem.Domain.Entities;
using ParkingSystem.Domain.Enums;

namespace ParkingSystem.Application.Tickets.Specifications;

public static class ParkingTicketSpecifications
{
    public sealed class ByIdWithDetails : Specification<ParkingTicket>
    {
        public ByIdWithDetails(Guid id)
        {
            AddCriteria(t => t.Id == id);
            AddInclude(t => t.Vehicle!);
        }
    }

    public sealed class ByCode : Specification<ParkingTicket>
    {
        private readonly string _code;

        public ByCode(string code)
        {
            _code = code.Trim();
            AddCriteria(t => t.TicketCode == _code);
            AddInclude(t => t.Vehicle!);
        }
    }

    /// <summary>Find the currently open ticket (Issued or Active) for a vehicle, if any.</summary>
    public sealed class ActiveByVehicle : Specification<ParkingTicket>
    {
        public ActiveByVehicle(Guid vehicleId)
        {
            AddCriteria(t => t.VehicleId == vehicleId
                             && (t.Status == TicketStatus.Issued || t.Status == TicketStatus.Active));
            AddInclude(t => t.Vehicle!);
        }
    }

    public sealed class ListFiltered : Specification<ParkingTicket>
    {
        public ListFiltered(TicketStatus? status, Guid? vehicleId, DateTime? fromUtc, DateTime? toUtc)
        {
            if (status.HasValue) AddCriteria(t => t.Status == status.Value);
            if (vehicleId.HasValue) AddCriteria(t => t.VehicleId == vehicleId.Value);
            if (fromUtc.HasValue) AddCriteria(t => t.IssuedAt >= fromUtc.Value);
            if (toUtc.HasValue) AddCriteria(t => t.IssuedAt <= toUtc.Value);

            ApplyOrderByDescending(t => t.IssuedAt);
            AddInclude(t => t.Vehicle!);
        }
    }
}

public static class PricingRuleSpecifications
{
    /// <summary>Find an active pricing rule for the given vehicle type + ticket type at the moment of billing.</summary>
    public sealed class ActiveForBilling : Specification<PricingRule>
    {
        public ActiveForBilling(Guid vehicleTypeId, TicketType ticketType, DateTime atUtc)
        {
            AddCriteria(p => p.VehicleTypeId == vehicleTypeId
                             && p.TicketType == ticketType
                             && p.IsActive
                             && p.EffectiveFrom <= atUtc
                             && (p.EffectiveTo == null || p.EffectiveTo >= atUtc));
            ApplyOrderByDescending(p => p.EffectiveFrom);
        }
    }
}