using ParkingSystem.Domain.Enums;

namespace ParkingSystem.Application.CheckIn.DTOs;

/// <summary>
/// Single-shot vehicle check-in payload. The orchestrator service performs
/// "find-or-create Vehicle" + "create Ticket" + "create Session" + "claim Slot"
/// + "write AI recommendation log" in one atomic Serializable transaction.
/// </summary>
public class CheckInRequest
{
    public string LicensePlate { get; set; } = string.Empty;

    /// <summary>Optional <see cref="Vehicle"/> identifier. If supplied and the vehicle exists,
    /// it overrides plate lookup. If the vehicle does not exist, a 404 is returned.</summary>
    public Guid? VehicleId { get; set; }

    /// <summary>Vehicle category used to resolve the <see cref="VehicleType"/> when creating a new vehicle.</summary>
    public VehicleTypeCategory? VehicleCategory { get; set; }

    public TicketType TicketType { get; set; } = TicketType.Hourly;

    /// <summary>Slot the staff member committed to (either from AI recommendation or manual selection).</summary>
    public Guid SlotId { get; set; }

    /// <summary>AI recommendation captured for the audit log. All optional.</summary>
    public Guid? RecommendedSlotId { get; set; }
    public decimal? RecommendationScore { get; set; }
    public string? RecommendationExplanation { get; set; }

    public Guid? IssuedByUserId { get; set; }
    public DateTime? EntryTime { get; set; }
}

/// <summary>Result of a successful check-in.</summary>
public class CheckInResultDto
{
    public Guid VehicleId { get; set; }
    public string LicensePlate { get; set; } = string.Empty;
    public Guid TicketId { get; set; }
    public string TicketCode { get; set; } = string.Empty;
    public Guid SessionId { get; set; }
    public DateTime EntryTime { get; set; }
    public Guid SlotId { get; set; }
    public string SlotCode { get; set; } = string.Empty;
    public string ZoneName { get; set; } = string.Empty;
}
