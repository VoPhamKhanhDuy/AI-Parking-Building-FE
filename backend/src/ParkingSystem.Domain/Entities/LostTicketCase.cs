using ParkingSystem.Domain.Common;
using ParkingSystem.Domain.Enums;

namespace ParkingSystem.Domain.Entities;

public class LostTicketCase : BaseEntity
{
    public Guid SessionId { get; set; }
    public ParkingSession? Session { get; set; }

    public Guid TicketId { get; set; }
    public ParkingTicket? Ticket { get; set; }

    public Guid VehicleId { get; set; }
    public Vehicle? Vehicle { get; set; }

    public string OwnerName { get; set; } = string.Empty;

    public string? Phone { get; set; }

    public decimal ParkingFee { get; set; }

    public decimal Penalty { get; set; }

    public decimal Discount { get; set; }

    public decimal TotalPaid { get; set; }

    public PaymentStatus PaymentStatus { get; set; } = PaymentStatus.Pending;

    public DateTime? PaidAt { get; set; }

    public Guid? PaymentId { get; set; }
    public Payment? Payment { get; set; }

    public string CaseCode { get; set; } = string.Empty;

    public string Notes { get; set; } = string.Empty;
}
