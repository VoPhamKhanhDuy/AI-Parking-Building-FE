using ParkingSystem.Domain.Enums;

namespace ParkingSystem.Application.ParkingSessions.DTOs;

public class ParkingSessionDto
{
    public Guid Id { get; set; }
    public Guid TicketId { get; set; }
    public string TicketCode { get; set; } = string.Empty;
    public Guid VehicleId { get; set; }
    public string VehiclePlate { get; set; } = string.Empty;
    public Guid SlotId { get; set; }
    public string SlotCode { get; set; } = string.Empty;
    public SessionStatus Status { get; set; }
    public DateTime EntryTime { get; set; }
    public DateTime? ExitTime { get; set; }
    public double DurationHours => ExitTime.HasValue
        ? Math.Round((ExitTime.Value - EntryTime).TotalHours, 2)
        : Math.Round((DateTime.UtcNow - EntryTime).TotalHours, 2);
    public Guid? PaymentId { get; set; }
    public DateTime CreatedAt { get; set; }
    public DateTime? UpdatedAt { get; set; }
}

public class StartSessionRequest
{
    public Guid TicketId { get; set; }
    public Guid SlotId { get; set; }
    public DateTime? EntryTime { get; set; }
}

public class EndSessionRequest
{
    public DateTime? ExitTime { get; set; }
}

public class ReassignSessionRequest
{
    public Guid NewSlotId { get; set; }
}