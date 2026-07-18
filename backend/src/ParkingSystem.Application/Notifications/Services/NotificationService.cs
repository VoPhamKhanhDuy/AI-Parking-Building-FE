using ParkingSystem.Application.Common.Exceptions;
using ParkingSystem.Application.Common.Interfaces;
using ParkingSystem.Application.Notifications.DTOs;
using ParkingSystem.Application.Notifications.Interfaces;
using ParkingSystem.Application.Notifications.Specifications;
using ParkingSystem.Domain.Entities;
using ParkingSystem.Domain.Enums;

namespace ParkingSystem.Application.Notifications.Services;

public class NotificationService : INotificationService
{
    private readonly IRepository<Notification> _notifications;
    private readonly IUnitOfWork _uow;
    private readonly TimeProvider _clock;

    public NotificationService(
        IRepository<Notification> notifications,
        IUnitOfWork uow,
        TimeProvider clock)
    {
        _notifications = notifications;
        _uow = uow;
        _clock = clock;
    }

    public async Task<NotificationListResponse> ListAsync(
        string? search,
        NotificationType? type,
        NotificationStatus? status,
        bool unreadOnly,
        int page,
        int pageSize,
        Guid? currentUserId,
        CancellationToken ct = default)
    {
        var skip = (page - 1) * pageSize;
        var spec = new NotificationSpecifications.ListFiltered(
            search, type, status, unreadOnly, currentUserId, skip, pageSize);

        var notifications = await _notifications.ListAsync(spec, ct);
        var totalCount = await _notifications.CountAsync(null, ct);
        var unreadCount = await _notifications.CountAsync(
            new NotificationSpecifications.UnreadForUser(currentUserId), ct);

        return new NotificationListResponse
        {
            Notifications = notifications.Select(MapToDto).ToList(),
            TotalCount = totalCount,
            UnreadCount = unreadCount,
            Page = page,
            PageSize = pageSize
        };
    }

    public async Task<NotificationDto?> GetByIdAsync(Guid id, CancellationToken ct = default)
    {
        var spec = new NotificationSpecifications.ByIdWithDetails(id);
        var notification = await _notifications.FirstOrDefaultAsync(spec, ct);
        return notification == null ? null : MapToDto(notification);
    }

    public async Task<NotificationDto> CreateAsync(
        CreateNotificationRequest req,
        Guid? createdByUserId,
        CancellationToken ct = default)
    {
        if (string.IsNullOrWhiteSpace(req.Title))
        {
            throw new ValidationException("Notification title is required.");
        }

        if (string.IsNullOrWhiteSpace(req.Message))
        {
            throw new ValidationException("Notification message is required.");
        }

        var now = _clock.GetUtcNow().UtcDateTime;
        var notification = new Notification
        {
            Id = Guid.NewGuid(),
            Title = req.Title.Trim(),
            Message = req.Message.Trim(),
            Type = req.Type,
            Priority = req.Priority,
            TargetUserId = req.TargetUserId,
            ReferenceEntity = req.ReferenceEntity,
            ReferenceEntityId = req.ReferenceEntityId,
            ReferenceCode = req.ReferenceCode,
            Status = NotificationStatus.Unread,
            CreatedByUserId = createdByUserId,
            CreatedAt = now,
            UpdatedAt = now
        };

        await _notifications.AddAsync(notification, ct);
        await _uow.SaveChangesAsync(ct);

        return MapToDto(notification);
    }

    public async Task<NotificationDto?> MarkAsReadAsync(Guid id, CancellationToken ct = default)
    {
        var notification = await _notifications.GetByIdAsync(id, ct)
            ?? throw new NotFoundException(nameof(Notification), id);

        if (notification.Status == NotificationStatus.Read)
        {
            return MapToDto(notification); // Idempotent
        }

        var now = _clock.GetUtcNow().UtcDateTime;
        notification.Status = NotificationStatus.Read;
        notification.ReadAt = now;
        notification.UpdatedAt = now;
        _notifications.Update(notification);
        await _uow.SaveChangesAsync(ct);

        return MapToDto(notification);
    }

    public async Task<MarkAllReadResponse> MarkAllAsReadAsync(Guid? currentUserId, CancellationToken ct = default)
    {
        var unreadSpec = new NotificationSpecifications.UnreadForUser(currentUserId);
        var unreadNotifications = await _notifications.ListAsync(unreadSpec, ct);
        var count = unreadNotifications.Count;

        if (count == 0)
        {
            return new MarkAllReadResponse
            {
                MarkedCount = 0,
                Message = "No unread notifications to mark."
            };
        }

        var now = _clock.GetUtcNow().UtcDateTime;
        foreach (var notification in unreadNotifications)
        {
            notification.Status = NotificationStatus.Read;
            notification.ReadAt = now;
            notification.UpdatedAt = now;
            _notifications.Update(notification);
        }

        await _uow.SaveChangesAsync(ct);

        return new MarkAllReadResponse
        {
            MarkedCount = count,
            Message = $"Marked {count} notifications as read."
        };
    }

    public async Task DeleteAsync(Guid id, CancellationToken ct = default)
    {
        var notification = await _notifications.GetByIdAsync(id, ct)
            ?? throw new NotFoundException(nameof(Notification), id);

        _notifications.Remove(notification);
        await _uow.SaveChangesAsync(ct);
    }

    private static NotificationDto MapToDto(Notification n) => new()
    {
        Id = n.Id,
        Title = n.Title,
        Message = n.Message,
        Type = n.Type.ToString(),
        Priority = n.Priority.ToString(),
        TargetUserId = n.TargetUserId,
        TargetUserName = n.TargetUser?.FullName,
        ReferenceEntity = n.ReferenceEntity,
        ReferenceEntityId = n.ReferenceEntityId,
        ReferenceCode = n.ReferenceCode,
        Status = n.Status.ToString(),
        ReadAt = n.ReadAt,
        CreatedByUserName = n.CreatedByUser?.FullName,
        CreatedAt = n.CreatedAt,
        UpdatedAt = n.UpdatedAt
    };
}
