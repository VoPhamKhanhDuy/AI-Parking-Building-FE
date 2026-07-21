using ParkingSystem.Domain.Common;
using ParkingSystem.Domain.Entities;
using ParkingSystem.Domain.Enums;

namespace ParkingSystem.Application.Notifications.Specifications;

public static class NotificationSpecifications
{
    public sealed class ListFiltered : Specification<Notification>
    {
        public ListFiltered(
            string? search,
            NotificationType? type,
            NotificationStatus? status,
            bool unreadOnly,
            Guid? currentUserId,
            int skip,
            int take)
        {
            if (type.HasValue)
            {
                AddCriteria(n => n.Type == type.Value);
            }

            if (unreadOnly)
            {
                AddCriteria(n => n.Status == NotificationStatus.Unread);
            }
            else if (status.HasValue)
            {
                AddCriteria(n => n.Status == status.Value);
            }

            if (currentUserId.HasValue)
            {
                AddCriteria(n => n.TargetUserId == null || n.TargetUserId == currentUserId.Value);
            }

            if (!string.IsNullOrWhiteSpace(search))
            {
                var needle = search.Trim().ToLowerInvariant();
                AddCriteria(n =>
                    n.Title.ToLower().Contains(needle) ||
                    n.Message.ToLower().Contains(needle) ||
                    (n.ReferenceCode != null && n.ReferenceCode.ToLower().Contains(needle)));
            }

            ApplyOrderByDescending(n => n.CreatedAt);
            ApplyPaging(skip, take);
            AddInclude(n => n.TargetUser);
            AddInclude(n => n.CreatedByUser);
        }
    }

    public sealed class ByIdWithDetails : Specification<Notification>
    {
        public ByIdWithDetails(Guid id)
        {
            AddCriteria(n => n.Id == id);
            AddInclude(n => n.TargetUser);
            AddInclude(n => n.CreatedByUser);
        }
    }

    public sealed class ByStatus : Specification<Notification>
    {
        public ByStatus(NotificationStatus status)
        {
            AddCriteria(n => n.Status == status);
        }
    }

    public sealed class UnreadForUser : Specification<Notification>
    {
        public UnreadForUser(Guid? userId)
        {
            AddCriteria(n => n.Status == NotificationStatus.Unread);
            if (userId.HasValue)
            {
                AddCriteria(n => n.TargetUserId == null || n.TargetUserId == userId.Value);
            }
        }
    }
}
