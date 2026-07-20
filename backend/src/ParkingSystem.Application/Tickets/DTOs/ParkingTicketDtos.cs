using ParkingSystem.Domain.Enums;

namespace ParkingSystem.Application.Tickets.DTOs;

public class ParkingTicketDto
{
    public Guid Id { get; set; }
    public string TicketCode { get; set; } = string.Empty;
    public Guid VehicleId { get; set; }
    public string VehiclePlate { get; set; } = string.Empty;
    public TicketType Type { get; set; }
    public TicketStatus Status { get; set; }
    public DateTime IssuedAt { get; set; }
    public DateTime? EntryTime { get; set; }
    public DateTime? ExitTime { get; set; }
    public Guid? IssuedByUserId { get; set; }
    public Guid? SessionId { get; set; }

    /// <summary>Computed at check-out; null while ticket is still Issued/Active.</summary>
    public decimal? ComputedAmount { get; set; }
    public DateTime CreatedAt { get; set; }
    public DateTime? UpdatedAt { get; set; }
}

/// <summary>Result of a check-out: ticket + computed fee breakdown.</summary>
public class CheckOutResult
{
    public ParkingTicketDto Ticket { get; set; } = null!;
    public decimal FeeAmount { get; set; }
    public decimal PenaltyFee { get; set; }
    public string PricingRuleDescription { get; set; } = string.Empty;
    public double DurationHours { get; set; }
}

public class IssueTicketRequest
{
    public Guid VehicleId { get; set; }
    public TicketType Type { get; set; } = TicketType.Hourly;
    public Guid? IssuedByUserId { get; set; }
}

public class CheckOutTicketRequest
{
    /// <summary>Override exit time (e.g. for offline / back-dated checkouts). Defaults to UtcNow.</summary>
    public DateTime? ExitTime { get; set; }
    /// <summary>If true, applies the penalty fee from the pricing rule.</summary>
    public bool ApplyPenalty { get; set; }
}

public class CancelTicketRequest
{
    public string? Reason { get; set; }
}