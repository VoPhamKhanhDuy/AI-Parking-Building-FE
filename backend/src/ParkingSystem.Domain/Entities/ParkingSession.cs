using ParkingSystem.Domain.Common;
using ParkingSystem.Domain.Enums;

namespace ParkingSystem.Domain.Entities;

public class ParkingSession : BaseEntity
{
    public Guid TicketId { get; set; }
    public ParkingTicket? Ticket { get; set; }

    public Guid VehicleId { get; set; }
    public Vehicle? Vehicle { get; set; }

    public Guid SlotId { get; set; }
    public ParkingSlot? Slot { get; set; }

    public SessionStatus Status { get; set; } = SessionStatus.Active;

    public DateTime EntryTime { get; set; } = DateTime.UtcNow;

    public DateTime? ExitTime { get; set; }

    public Payment? Payment { get; set; }
}