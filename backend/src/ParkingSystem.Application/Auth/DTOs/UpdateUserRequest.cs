using System.ComponentModel.DataAnnotations;
using ParkingSystem.Domain.Enums;

namespace ParkingSystem.Application.Auth.DTOs;

public class UpdateUserRequest
{
    [MaxLength(150)]
    public string? FullName { get; set; }

    [MaxLength(30)]
    public string? PhoneNumber { get; set; }

    [MaxLength(50)]
    public string? Role { get; set; }

    public UserAccountStatus? Status { get; set; }

    /// <summary>Optional new password. Minimum 8 chars when supplied.</summary>
    [MinLength(8), MaxLength(100)]
    public string? NewPassword { get; set; }
}