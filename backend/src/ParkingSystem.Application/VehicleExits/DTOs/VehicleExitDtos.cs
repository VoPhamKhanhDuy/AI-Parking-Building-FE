using ParkingSystem.Domain.Enums;

namespace ParkingSystem.Application.VehicleExits.DTOs;

public class VehicleExitSessionDto
{
    public Guid Id { get; set; }
    public Guid TicketId { get; set; }
    public string TicketCode { get; set; } = string.Empty;
    public Guid VehicleId { get; set; }
    public string LicensePlate { get; set; } = string.Empty;
    public string SlotCode { get; set; } = string.Empty;
    public DateTime EntryTime { get; set; }
    public string Status { get; set; } = string.Empty;
    public string PaymentStatus { get; set; } = string.Empty;
}

public class VehicleExitListResponse
{
    public List<VehicleExitSessionDto> Sessions { get; set; } = new();
    public int TotalCount { get; set; }
}

public class ExitFeeCalculation
{
    public Guid SessionId { get; set; }
    public double DurationHours { get; set; }
    public decimal BaseFee { get; set; }
    public decimal Surcharge { get; set; }
    public decimal TotalFee { get; set; }
    public decimal UnitPricePerHour { get; set; }
    public decimal OvertimeSurchargePerHour { get; set; }
    public string? PricingRuleDescription { get; set; }
    public DateTime CalculatedAt { get; set; }
}

public class CreateExitPaymentRequest
{
    public PaymentMethod Method { get; set; } = PaymentMethod.EWallet;
}

public class ExitPaymentResponse
{
    public Guid PaymentId { get; set; }
    public string TransactionCode { get; set; } = string.Empty;
    public decimal Amount { get; set; }
    public string Status { get; set; } = string.Empty;
    public string Method { get; set; } = string.Empty;
    public DateTime ExpiresAt { get; set; }
}

public class PaymentStatusResponse
{
    public Guid PaymentId { get; set; }
    public string Status { get; set; } = string.Empty;
    public DateTime? PaidAt { get; set; }
}

public class ExitCompleteResponse
{
    public Guid SessionId { get; set; }
    public string TicketCode { get; set; } = string.Empty;
    public DateTime ExitTime { get; set; }
    public string Status { get; set; } = string.Empty;
    public string Message { get; set; } = string.Empty;
}
