using ParkingSystem.Domain.Enums;

namespace ParkingSystem.Application.LostTickets.DTOs;

public class LostTicketCaseDto
{
    public Guid Id { get; set; }
    public string CaseCode { get; set; } = string.Empty;
    public Guid SessionId { get; set; }
    public Guid TicketId { get; set; }
    public string? TicketCode { get; set; }
    public Guid VehicleId { get; set; }
    public string? LicensePlate { get; set; }
    public string? VehicleType { get; set; }
    public string OwnerName { get; set; } = string.Empty;
    public string? Phone { get; set; }
    public decimal ParkingFee { get; set; }
    public decimal Penalty { get; set; }
    public decimal Discount { get; set; }
    public decimal TotalPaid { get; set; }
    public PaymentStatus PaymentStatus { get; set; }
    public DateTime? PaidAt { get; set; }
    public DateTime CreatedAt { get; set; }
    public DateTime? UpdatedAt { get; set; }
    public string Notes { get; set; } = string.Empty;
}

public class LostTicketSessionDto
{
    public Guid Id { get; set; }
    public Guid TicketId { get; set; }
    public string? TicketCode { get; set; }
    public Guid VehicleId { get; set; }
    public string? LicensePlate { get; set; }
    public string? VehicleType { get; set; }
    public Guid SlotId { get; set; }
    public string? SlotCode { get; set; }
    public string? FloorZone { get; set; }
    public string? EntryGate { get; set; }
    public DateTime EntryTime { get; set; }
    public string AssignmentMethod { get; set; } = "Manual";
}

public class LostTicketPolicyDto
{
    public decimal CarPenalty { get; set; }
    public decimal MotorcyclePenalty { get; set; }
    public decimal BaseParkingFee { get; set; }
}

public class LostTicketPageDataDto
{
    public LostTicketPolicyDto Policy { get; set; } = new();
    public IReadOnlyList<LostTicketCaseDto> RecentCases { get; set; } = Array.Empty<LostTicketCaseDto>();
}

public class CalculateFeeRequest
{
    public Guid SessionId { get; set; }
    public string? VehicleType { get; set; }
}

public class CalculateFeeResponse
{
    public decimal ParkingFee { get; set; }
    public decimal Penalty { get; set; }
    public decimal Discount { get; set; }
    public decimal Total { get; set; }
    public string FormattedTotal { get; set; } = string.Empty;
}

public class CreateLostTicketCaseRequest
{
    public Guid SessionId { get; set; }
    public string OwnerName { get; set; } = string.Empty;
    public string? Phone { get; set; }
    public string? Notes { get; set; }
}

public class ProcessLostTicketRequest
{
    public string OwnerName { get; set; } = string.Empty;
    public string? Phone { get; set; }
    public PaymentMethod PaymentMethod { get; set; } = PaymentMethod.Cash;
    public string? TransactionReference { get; set; }
    public Guid? ProcessedByUserId { get; set; }
    public string? Notes { get; set; }
}
