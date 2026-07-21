using ParkingSystem.Domain.Common;
using ParkingSystem.Domain.Enums;

namespace ParkingSystem.Domain.Entities;

public class ParkingTicket : BaseEntity
{
    /// <summary>Short human-readable ticket code, e.g. "TKT-20260711-AB12CD".</summary>
    public string TicketCode { get; set; } = string.Empty;

    public Guid VehicleId { get; set; }
    public Vehicle? Vehicle { get; set; }

    public TicketType Type { get; set; } = TicketType.Hourly;

    public TicketStatus Status { get; set; } = TicketStatus.Issued;

    public DateTime IssuedAt { get; set; } = DateTime.UtcNow;

    public Guid? IssuedByUserId { get; set; }
    public User? IssuedByUser { get; set; }

    /// <summary>Captured at check-in. Null until the vehicle arrives.</summary>
    public DateTime? EntryTime { get; set; }

    public DateTime? ExitTime { get; set; }

    public Guid? SessionId { get; set; }
    public ParkingSession? Session { get; set; }
}