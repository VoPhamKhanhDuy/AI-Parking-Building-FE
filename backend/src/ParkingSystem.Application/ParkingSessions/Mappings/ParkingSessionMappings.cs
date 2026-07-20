using ParkingSystem.Domain.Entities;

namespace ParkingSystem.Application.ParkingSessions.Mappings;

public static class ParkingSessionMappings
{
    public static ParkingSessions.DTOs.ParkingSessionDto ToDto(this ParkingSession session)
    {
        ArgumentNullException.ThrowIfNull(session);
        return new ParkingSessions.DTOs.ParkingSessionDto
        {
            Id = session.Id,
            TicketId = session.TicketId,
            TicketCode = session.Ticket?.TicketCode ?? string.Empty,
            VehicleId = session.VehicleId,
            VehiclePlate = session.Vehicle?.LicensePlate ?? string.Empty,
            SlotId = session.SlotId,
            SlotCode = session.Slot?.SlotCode ?? string.Empty,
            Status = session.Status,
            EntryTime = session.EntryTime,
            ExitTime = session.ExitTime,
            PaymentId = session.Payment?.Id,
            CreatedAt = session.CreatedAt,
            UpdatedAt = session.UpdatedAt
        };
    }
}