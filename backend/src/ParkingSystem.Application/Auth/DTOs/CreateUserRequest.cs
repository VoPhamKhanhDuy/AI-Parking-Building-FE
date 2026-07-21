using System.ComponentModel.DataAnnotations;
using ParkingSystem.Domain.Enums;

namespace ParkingSystem.Application.Auth.DTOs;

public class CreateUserRequest
{
    [Required, EmailAddress, MaxLength(255)]
    public string Email { get; set; } = string.Empty;

    [Required, MinLength(8), MaxLength(100)]
    public string Password { get; set; } = string.Empty;

    [Required, MaxLength(150)]
    public string FullName { get; set; } = string.Empty;

    [MaxLength(30)]
    public string? PhoneNumber { get; set; }

    /// <summary>Role name; must match one of <see cref="SystemRoles"/>.</summary>
    [Required, MaxLength(50)]
    public string Role { get; set; } = SystemRoles.Driver;

    public UserAccountStatus Status { get; set; } = UserAccountStatus.Active;
}