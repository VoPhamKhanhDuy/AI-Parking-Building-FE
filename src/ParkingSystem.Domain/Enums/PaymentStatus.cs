namespace ParkingSystem.Domain.Enums;

public enum PaymentStatus
{
    Pending = 0,
    Paid = 1,
    Failed = 2,
    Refunded = 3,
    Waived = 4,

    /// <summary>Operator actively cancelled a pending payment (e.g. wrong amount typed).
    /// No money moved; the intent to charge was abandoned.</summary>
    Cancelled = 5
}