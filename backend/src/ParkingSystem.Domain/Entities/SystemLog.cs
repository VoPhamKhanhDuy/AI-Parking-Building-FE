using ParkingSystem.Domain.Common;

namespace ParkingSystem.Domain.Entities;

/// <summary>
/// Audit trail row written by <c>SystemLogActionFilter</c> at the API layer.
/// </summary>
public class SystemLog : BaseEntity
{
    public Guid? UserId { get; set; }
    public User? User { get; set; }

    public string Action { get; set; } = string.Empty;

    public string? TargetEntity { get; set; }

    public Guid? TargetEntityId { get; set; }

    public string? Description { get; set; }

    public string? IpAddress { get; set; }
}