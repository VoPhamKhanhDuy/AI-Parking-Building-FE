using ParkingSystem.Domain.Common;
using ParkingSystem.Domain.Enums;

namespace ParkingSystem.Domain.Entities;

public class MonthlyPass : BaseEntity
{
    public string PassCode { get; set; } = string.Empty;
    public string LicensePlate { get; set; } = string.Empty;
    public Guid VehicleTypeId { get; set; }
    public VehicleType? VehicleType { get; set; }
    public string DriverName { get; set; } = string.Empty;
    public string? DriverEmail { get; set; }
    public string? DriverPhone { get; set; }
    public DateTime ValidFrom { get; set; }
    public DateTime ValidUntil { get; set; }
    public MonthlyPassStatus Status { get; set; } = MonthlyPassStatus.PendingApproval;
    public string? AssignedLocation { get; set; }
    public Guid? AssignedZoneId { get; set; }
    public ParkingZone? AssignedZone { get; set; }
    public DateTime? LastVerifiedAt { get; set; }
    public string? VerifiedByUserId { get; set; }
    public User? VerifiedByUser { get; set; }

    public bool IsActive => Status == MonthlyPassStatus.Active &&
                           ValidFrom <= DateTime.UtcNow &&
                           ValidUntil >= DateTime.UtcNow;
}
