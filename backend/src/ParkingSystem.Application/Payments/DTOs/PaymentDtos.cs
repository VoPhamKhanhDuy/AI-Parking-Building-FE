using ParkingSystem.Domain.Enums;

namespace ParkingSystem.Application.Payments.DTOs;

public class PaymentDto
{
    public Guid Id { get; set; }
    public Guid SessionId { get; set; }
    public decimal Amount { get; set; }
    public PaymentMethod Method { get; set; }
    public PaymentStatus Status { get; set; }
    public DateTime? PaidAt { get; set; }
    public string? TransactionReference { get; set; }
    public Guid? ProcessedByUserId { get; set; }
    public string? ProcessedByUserName { get; set; }
    public DateTime CreatedAt { get; set; }
    public DateTime? UpdatedAt { get; set; }
}

public class CreatePaymentRequest
{
    public Guid SessionId { get; set; }
    public decimal Amount { get; set; }
    public PaymentMethod Method { get; set; } = PaymentMethod.Cash;
    public Guid? ProcessedByUserId { get; set; }
    public string? TransactionReference { get; set; }
}

public class MarkPaidRequest
{
    public PaymentMethod Method { get; set; } = PaymentMethod.Cash;
    public string? TransactionReference { get; set; }
    public Guid? ProcessedByUserId { get; set; }
    public DateTime? PaidAt { get; set; }
}

public class RefundPaymentRequest
{
    public string? Reason { get; set; }
}