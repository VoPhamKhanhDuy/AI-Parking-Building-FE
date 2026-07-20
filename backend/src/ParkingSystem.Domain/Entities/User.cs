using ParkingSystem.Domain.Common;
using ParkingSystem.Domain.Enums;

namespace ParkingSystem.Domain.Entities;

public class User : BaseEntity
{
    public string Email { get; set; } = string.Empty;

    public string PasswordHash { get; set; } = string.Empty;

    public string FullName { get; set; } = string.Empty;

    public string? PhoneNumber { get; set; }

    public UserAccountStatus Status { get; set; } = UserAccountStatus.Active;

    public DateTime? LastLoginAt { get; set; }

    public Guid RoleId { get; set; }
    public Role? Role { get; set; }

    // Convenience — kept in sync via DbContext.SaveChanges interceptor later if needed.
    public string? RefreshTokenHash { get; set; }
    public DateTime? RefreshTokenExpiresAt { get; set; }
}