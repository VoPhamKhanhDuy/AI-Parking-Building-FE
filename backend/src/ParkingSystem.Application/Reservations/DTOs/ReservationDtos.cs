using ParkingSystem.Domain.Enums;

namespace ParkingSystem.Application.Reservations.DTOs;

public class ReservationDto
{
    public Guid Id { get; set; }
    public string ReservationCode { get; set; } = string.Empty;
    public Guid VehicleId { get; set; }
    public string VehiclePlate { get; set; } = string.Empty;
    public Guid? PreferredSlotId { get; set; }
    public string? PreferredSlotCode { get; set; }
    public Guid? PreferredZoneId { get; set; }
    public string? PreferredZoneName { get; set; }
    public string TicketType { get; set; } = string.Empty;
    public string Status { get; set; } = string.Empty;
    public DateTime ReservedFrom { get; set; }
    public DateTime ReservedUntil { get; set; }
    public DateTime? CheckedInAt { get; set; }
    public DateTime? CancelledAt { get; set; }
    public string? CancellationReason { get; set; }
    public string? CreatedByUserName { get; set; }
    public DateTime CreatedAt { get; set; }
    public DateTime? UpdatedAt { get; set; }
}

public class ReservationListResponse
{
    public List<ReservationDto> Reservations { get; set; } = new();
    public int TotalCount { get; set; }
    public ReservationStatsDto Stats { get; set; } = new();
}

public class ReservationStatsDto
{
    public int Total { get; set; }
    public int Pending { get; set; }
    public int Confirmed { get; set; }
    public int CheckedIn { get; set; }
    public int Completed { get; set; }
    public int Cancelled { get; set; }
}

public class CreateReservationRequest
{
    public Guid VehicleId { get; set; }
    public Guid? PreferredSlotId { get; set; }
    public Guid? PreferredZoneId { get; set; }
    public TicketType TicketType { get; set; } = TicketType.Hourly;
    public DateTime ReservedFrom { get; set; }
    public DateTime ReservedUntil { get; set; }
}

public class CancelReservationRequest
{
    public string? Reason { get; set; }
}
