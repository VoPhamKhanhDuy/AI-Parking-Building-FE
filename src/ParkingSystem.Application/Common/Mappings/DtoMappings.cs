using ParkingSystem.Application.Auth.DTOs;
using ParkingSystem.Domain.Entities;
using ParkingSystem.Domain.Enums;

namespace ParkingSystem.Application.Common.Mappings;

/// <summary>
/// Pure mapping helpers between Domain entities and DTOs.
/// Lives in Application (no AutoMapper dependency) for clarity and ease of testing.
/// </summary>
public static class DtoMappings
{
    public static UserDto ToDto(this User user)
    {
        ArgumentNullException.ThrowIfNull(user);
        return new UserDto
        {
            Id = user.Id,
            Email = user.Email,
            FullName = user.FullName,
            PhoneNumber = user.PhoneNumber,
            Role = user.Role?.Name ?? string.Empty,
            Status = user.Status,
            CreatedAt = user.CreatedAt,
            LastLoginAt = user.LastLoginAt
        };
    }
}