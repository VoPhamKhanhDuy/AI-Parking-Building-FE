namespace ParkingSystem.Domain.Enums;

public enum TicketStatus
{
    /// <summary>Ticket has been created but the vehicle has not yet arrived.</summary>
    Issued = 0,

    /// <summary>Vehicle is currently parked.</summary>
    Active = 1,

    /// <summary>Vehicle has left and the ticket is closed.</summary>
    Completed = 2,

    /// <summary>Ticket was cancelled before completion.</summary>
    Cancelled = 3
}