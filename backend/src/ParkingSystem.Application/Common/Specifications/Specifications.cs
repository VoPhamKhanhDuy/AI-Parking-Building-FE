using System.Linq.Expressions;
using ParkingSystem.Domain.Common;
using ParkingSystem.Domain.Entities;

namespace ParkingSystem.Application.Common.Specifications;

/// <summary>
/// User lookup specs (email, refresh token, id). Pure Expression trees — no EF Core.
/// </summary>
public static class UserSpecifications
{
    public sealed class ByEmailWithRole : Specification<User>
    {
        private readonly string _email;

        public ByEmailWithRole(string email)
        {
            _email = email.ToLowerInvariant();
#pragma warning disable CS8603 // Possible null reference return — caller passes non-null.
            AddCriteria(u => u.Email.ToLower() == _email);
#pragma warning restore CS8603
            AddInclude(u => u.Role);
        }
    }

    public sealed class ByRefreshTokenHash : Specification<User>
    {
        public ByRefreshTokenHash(string tokenHash)
        {
            AddCriteria(u => u.RefreshTokenHash == tokenHash
                             && u.RefreshTokenExpiresAt != null
                             && u.RefreshTokenExpiresAt > DateTime.UtcNow);
            AddInclude(u => u.Role);
        }
    }

    public sealed class ByIdWithRole : Specification<User>
    {
        public ByIdWithRole(Guid id)
        {
            AddCriteria(u => u.Id == id);
            AddInclude(u => u.Role);
        }
    }

    public sealed class ByEmailAny : Specification<User>
    {
        private readonly string _email;

        public ByEmailAny(string email)
        {
            _email = email.ToLowerInvariant();
#pragma warning disable CS8603
            AddCriteria(u => u.Email.ToLower() == _email);
#pragma warning restore CS8603
            AddInclude(u => u.Role);
        }
    }

    public sealed class AllOrdered : Specification<User>
    {
        public AllOrdered()
        {
            ApplyOrderBy(u => u.CreatedAt);
            AddInclude(u => u.Role);
        }
    }
}

public static class RoleSpecifications
{
    public sealed class ByName : Specification<Role>
    {
        public ByName(string name)
        {
            AddCriteria(r => r.Name == name);
        }
    }
}