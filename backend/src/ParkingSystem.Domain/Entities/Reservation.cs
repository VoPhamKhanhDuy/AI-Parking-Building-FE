using ParkingSystem.Domain.Common;
using ParkingSystem.Domain.Enums;

namespace ParkingSystem.Domain.Entities;

public class Reservation : BaseEntity
{
    public string ReservationCode { get; set; } = string.Empty;
    public Guid VehicleId { get; set; }
    public Vehicle? Vehicle { get; set; }
    public Guid? PreferredSlotId { get; set; }
    public ParkingSlot? PreferredSlot { get; set; }
    public Guid? PreferredZoneId { get; set; }
    public ParkingZone? PreferredZone { get; set; }
    public TicketType TicketType { get; set; } = TicketType.Hourly;
    public ReservationStatus Status { get; set; } = ReservationStatus.Pending;
    public DateTime ReservedFrom { get; set; }
    public DateTime ReservedUntil { get; set; }
    public DateTime? CheckedInAt { get; set; }
    public DateTime? CancelledAt { get; set; }
    public string? CancellationReason { get; set; }
    public Guid? CreatedByUserId { get; set; }
    public User? CreatedByUser { get; set; }

    public bool IsExpired => Status == ReservationStatus.Pending && ReservedUntil < DateTime.UtcNow;
}
