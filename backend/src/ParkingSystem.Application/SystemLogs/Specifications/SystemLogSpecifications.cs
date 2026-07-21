using ParkingSystem.Domain.Common;
using ParkingSystem.Domain.Entities;

namespace ParkingSystem.Application.SystemLogs.Specifications;

public static class SystemLogSpecifications
{
    public sealed class ListFiltered : Specification<SystemLog>
    {
        public ListFiltered(
            string? search,
            string? module,
            DateTime? fromDate,
            DateTime? toDate,
            int skip,
            int take)
        {
            if (!string.IsNullOrWhiteSpace(search))
            {
                var needle = search.Trim().ToLowerInvariant();
                AddCriteria(l =>
                    l.Action.ToLower().Contains(needle) ||
                    (l.Description != null && l.Description.ToLower().Contains(needle)) ||
                    (l.TargetEntity != null && l.TargetEntity.ToLower().Contains(needle)) ||
                    (l.IpAddress != null && l.IpAddress.ToLower().Contains(needle)));
            }

            if (!string.IsNullOrWhiteSpace(module) && module != "All Modules")
            {
                var moduleLower = module.ToLowerInvariant();
                AddCriteria(l => l.Action.ToLower().Contains(moduleLower));
            }

            if (fromDate.HasValue)
            {
                AddCriteria(l => l.CreatedAt >= fromDate.Value);
            }

            if (toDate.HasValue)
            {
                AddCriteria(l => l.CreatedAt <= toDate.Value);
            }

            ApplyOrderByDescending(l => l.CreatedAt);
            ApplyPaging(skip, take);
            AddInclude(l => l.User);
        }
    }

    public sealed class ByIdWithUser : Specification<SystemLog>
    {
        public ByIdWithUser(Guid id)
        {
            AddCriteria(l => l.Id == id);
            AddInclude(l => l.User);
        }
    }
}
