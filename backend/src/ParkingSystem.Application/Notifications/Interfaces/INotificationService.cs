using ParkingSystem.Application.Notifications.DTOs;
using ParkingSystem.Domain.Enums;

namespace ParkingSystem.Application.Notifications.Interfaces;

public interface INotificationService
{
    Task<NotificationListResponse> ListAsync(
        string? search,
        NotificationType? type,
        NotificationStatus? status,
        bool unreadOnly,
        int page,
        int pageSize,
        Guid? currentUserId,
        CancellationToken ct = default);

    Task<NotificationDto?> GetByIdAsync(Guid id, CancellationToken ct = default);

    Task<NotificationDto> CreateAsync(CreateNotificationRequest req, Guid? createdByUserId, CancellationToken ct = default);

    Task<NotificationDto?> MarkAsReadAsync(Guid id, CancellationToken ct = default);

    Task<MarkAllReadResponse> MarkAllAsReadAsync(Guid? currentUserId, CancellationToken ct = default);

    Task DeleteAsync(Guid id, CancellationToken ct = default);
}
