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

    // ---- Enriched fields (joined from Session -> Ticket -> Vehicle) ----
    /// <summary>Short human-readable receipt id, e.g. "RCP-20260719-AB12CD".</summary>
    public string? ReceiptId { get; set; }

    /// <summary>Ticket code from the related parking ticket.</summary>
    public string? TicketCode { get; set; }

    /// <summary>Vehicle license plate.</summary>
    public string? LicensePlate { get; set; }

    /// <summary>Vehicle type name (e.g. "Car", "Motorbike").</summary>
    public string? VehicleType { get; set; }

    /// <summary>Ticket/payment type label (e.g. "Hourly", "Monthly Pass").</summary>
    public string? Type { get; set; }

    /// <summary>Convenience timestamp (paid time if set, otherwise created time).</summary>
    public DateTime Time { get; set; }

    /// <summary>Cashier / staff display name (alias of ProcessedByUserName, kept for FE clarity).</summary>
    public string? Staff { get; set; }
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