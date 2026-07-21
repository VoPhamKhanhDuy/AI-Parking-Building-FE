using ParkingSystem.Domain.Common;
using ParkingSystem.Domain.Enums;

namespace ParkingSystem.Domain.Entities;

public class Notification : BaseEntity
{
    public string Title { get; set; } = string.Empty;
    public string Message { get; set; } = string.Empty;
    public NotificationType Type { get; set; } = NotificationType.System;
    public NotificationPriority Priority { get; set; } = NotificationPriority.Normal;
    public Guid? TargetUserId { get; set; }
    public User? TargetUser { get; set; }
    public string? ReferenceEntity { get; set; }
    public Guid? ReferenceEntityId { get; set; }
    public string? ReferenceCode { get; set; }
    public NotificationStatus Status { get; set; } = NotificationStatus.Unread;
    public DateTime? ReadAt { get; set; }
    public Guid? CreatedByUserId { get; set; }
    public User? CreatedByUser { get; set; }
}
