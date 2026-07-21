using ParkingSystem.Application.Tickets.DTOs;
using ParkingSystem.Domain.Entities;

namespace ParkingSystem.Application.Common.Mappings;

internal static class ParkingTicketMappings
{
    public static ParkingTicketDto ToDto(this ParkingTicket t) => new()
    {
        Id = t.Id,
        TicketCode = t.TicketCode,
        VehicleId = t.VehicleId,
        VehiclePlate = t.Vehicle?.LicensePlate ?? string.Empty,
        Type = t.Type,
        Status = t.Status,
        IssuedAt = t.IssuedAt,
        EntryTime = t.EntryTime,
        ExitTime = t.ExitTime,
        IssuedByUserId = t.IssuedByUserId,
        SessionId = t.SessionId,
        CreatedAt = t.CreatedAt,
        UpdatedAt = t.UpdatedAt
    };
}