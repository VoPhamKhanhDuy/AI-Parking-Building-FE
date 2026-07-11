using ParkingSystem.Domain.Entities;

namespace ParkingSystem.Application.Payments.Mappings;

public static class PaymentMappings
{
    public static Payments.DTOs.PaymentDto ToDto(this Payment payment)
    {
        ArgumentNullException.ThrowIfNull(payment);
        return new Payments.DTOs.PaymentDto
        {
            Id = payment.Id,
            SessionId = payment.SessionId,
            Amount = payment.Amount,
            Method = payment.Method,
            Status = payment.Status,
            PaidAt = payment.PaidAt,
            TransactionReference = payment.TransactionReference,
            ProcessedByUserId = payment.ProcessedByUserId,
            ProcessedByUserName = payment.ProcessedByUser?.FullName,
            CreatedAt = payment.CreatedAt,
            UpdatedAt = payment.UpdatedAt
        };
    }
}