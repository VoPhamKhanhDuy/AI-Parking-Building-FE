using ParkingSystem.Domain.Entities;
using ParkingSystem.Domain.Enums;

namespace ParkingSystem.Application.Payments.Mappings;

public static class PaymentMappings
{
    public static Payments.DTOs.PaymentDto ToDto(this Payment payment)
    {
        ArgumentNullException.ThrowIfNull(payment);

        var ticket = payment.Session?.Ticket;
        var vehicle = payment.Session?.Vehicle ?? ticket?.Vehicle;

        var receiptId = string.IsNullOrEmpty(payment.TransactionReference)
            ? $"RCP-{payment.CreatedAt:yyyyMMdd}-{payment.Id.ToString()[..6].ToUpperInvariant()}"
            : payment.TransactionReference;

        var ticketType = ticket?.Type;
        var typeLabel = ticketType.HasValue ? MapTicketType(ticketType.Value) : MapPaymentTypeFromMethod(payment.Method);

        var time = payment.PaidAt ?? payment.CreatedAt;

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
            UpdatedAt = payment.UpdatedAt,

            ReceiptId = receiptId,
            TicketCode = ticket?.TicketCode,
            LicensePlate = vehicle?.LicensePlate,
            VehicleType = vehicle?.VehicleType?.Name,
            Type = typeLabel,
            Time = time,
            Staff = payment.ProcessedByUser?.FullName
        };
    }

    private static string MapTicketType(TicketType type) => type switch
    {
        TicketType.Hourly => "Parking Fee",
        TicketType.Daily => "Daily Pass",
        TicketType.MonthlyPass => "Monthly Pass",
        TicketType.Reservation => "Reservation",
        TicketType.Complimentary => "Complimentary",
        _ => type.ToString()
    };

    private static string MapPaymentTypeFromMethod(PaymentMethod method) => method switch
    {
        PaymentMethod.MonthlyBilling => "Monthly Pass",
        _ => "Parking Fee"
    };
}