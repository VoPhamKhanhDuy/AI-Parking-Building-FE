using ParkingSystem.Domain.Common;
using ParkingSystem.Domain.Enums;

namespace ParkingSystem.Domain.Entities;

public class Payment : BaseEntity
{
    public Guid SessionId { get; set; }
    public ParkingSession? Session { get; set; }

    public decimal Amount { get; set; }

    public PaymentMethod Method { get; set; }

    public PaymentStatus Status { get; set; } = PaymentStatus.Pending;

    public DateTime? PaidAt { get; set; }

    public string? TransactionReference { get; set; }

    public Guid? ProcessedByUserId { get; set; }
    public User? ProcessedByUser { get; set; }
}