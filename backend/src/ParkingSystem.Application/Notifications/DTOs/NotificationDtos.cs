using ParkingSystem.Domain.Enums;

namespace ParkingSystem.Application.Notifications.DTOs;

public class NotificationDto
{
    public Guid Id { get; set; }
    public string Title { get; set; } = string.Empty;
    public string Message { get; set; } = string.Empty;
    public string Type { get; set; } = string.Empty;
    public string Priority { get; set; } = string.Empty;
    public Guid? TargetUserId { get; set; }
    public string? TargetUserName { get; set; }
    public string? ReferenceEntity { get; set; }
    public Guid? ReferenceEntityId { get; set; }
    public string? ReferenceCode { get; set; }
    public string Status { get; set; } = string.Empty;
    public DateTime? ReadAt { get; set; }
    public string? CreatedByUserName { get; set; }
    public DateTime CreatedAt { get; set; }
    public DateTime? UpdatedAt { get; set; }
}

public class NotificationListResponse
{
    public List<NotificationDto> Notifications { get; set; } = new();
    public int TotalCount { get; set; }
    public int UnreadCount { get; set; }
    public int Page { get; set; }
    public int PageSize { get; set; }
}

public class CreateNotificationRequest
{
    public string Title { get; set; } = string.Empty;
    public string Message { get; set; } = string.Empty;
    public NotificationType Type { get; set; } = NotificationType.System;
    public NotificationPriority Priority { get; set; } = NotificationPriority.Normal;
    public Guid? TargetUserId { get; set; }
    public string? ReferenceEntity { get; set; }
    public Guid? ReferenceEntityId { get; set; }
    public string? ReferenceCode { get; set; }
}

public class MarkAllReadResponse
{
    public int MarkedCount { get; set; }
    public string Message { get; set; } = string.Empty;
}
