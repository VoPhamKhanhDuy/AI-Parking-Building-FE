using ParkingSystem.Application.Auth.DTOs;
using ParkingSystem.Application.Auth.Interfaces;
using ParkingSystem.Application.Common.Exceptions;
using ParkingSystem.Application.Common.Interfaces;
using ParkingSystem.Application.Common.Mappings;
using ParkingSystem.Application.Common.Specifications;
using ParkingSystem.Domain.Entities;
using ParkingSystem.Domain.Enums;

namespace ParkingSystem.Application.Auth.Services;

public class UserService : IUserService
{
    private readonly IRepository<User> _users;
    private readonly IRepository<Role> _roles;
    private readonly IUnitOfWork _uow;
    private readonly IPasswordHasher _passwordHasher;

    public UserService(
        IRepository<User> users,
        IRepository<Role> roles,
        IUnitOfWork uow,
        IPasswordHasher passwordHasher)
    {
        _users = users;
        _roles = roles;
        _uow = uow;
        _passwordHasher = passwordHasher;
    }

    public async Task<UserDto> CreateAsync(CreateUserRequest request, CancellationToken cancellationToken = default)
    {
        var email = request.Email.Trim().ToLowerInvariant();

        var existing = await _users.FirstOrDefaultAsync(new UserSpecifications.ByEmailAny(email), cancellationToken);
        if (existing is not null)
        {
            throw new ConflictException($"A user with email '{email}' already exists.");
        }

        var role = await _roles.FirstOrDefaultAsync(new RoleSpecifications.ByName(request.Role), cancellationToken)
            ?? throw new ValidationException($"Role '{request.Role}' does not exist.");

        var user = new User
        {
            Email = email,
            FullName = request.FullName.Trim(),
            PhoneNumber = request.PhoneNumber,
            PasswordHash = _passwordHasher.Hash(request.Password),
            RoleId = role.Id,
            Status = request.Status
        };

        await _users.AddAsync(user, cancellationToken);
        await _uow.SaveChangesAsync(cancellationToken);

        user.Role = role;
        return user.ToDto();
    }

    public async Task<UserDto> UpdateAsync(Guid userId, UpdateUserRequest request, CancellationToken cancellationToken = default)
    {
        var user = await _users.FirstOrDefaultAsync(new UserSpecifications.ByIdWithRole(userId), cancellationToken)
            ?? throw new NotFoundException(nameof(User), userId);

        if (!string.IsNullOrWhiteSpace(request.FullName))
        {
            user.FullName = request.FullName.Trim();
        }

        if (request.PhoneNumber is not null)
        {
            user.PhoneNumber = string.IsNullOrWhiteSpace(request.PhoneNumber) ? null : request.PhoneNumber.Trim();
        }

        if (!string.IsNullOrWhiteSpace(request.Role))
        {
            var role = await _roles.FirstOrDefaultAsync(new RoleSpecifications.ByName(request.Role), cancellationToken)
                ?? throw new ValidationException($"Role '{request.Role}' does not exist.");
            user.RoleId = role.Id;
            user.Role = role;
        }

        if (request.Status.HasValue)
        {
            user.Status = request.Status.Value;
        }

        if (!string.IsNullOrWhiteSpace(request.NewPassword))
        {
            user.PasswordHash = _passwordHasher.Hash(request.NewPassword);
            // Force refresh-token invalidation on password change.
            user.RefreshTokenHash = null;
            user.RefreshTokenExpiresAt = null;
        }

        user.UpdatedAt = DateTime.UtcNow;
        _users.Update(user);
        await _uow.SaveChangesAsync(cancellationToken);

        return user.ToDto();
    }

    public async Task<UserDto> SetStatusAsync(Guid userId, UserAccountStatus status, CancellationToken cancellationToken = default)
    {
        var user = await _users.FirstOrDefaultAsync(new UserSpecifications.ByIdWithRole(userId), cancellationToken)
            ?? throw new NotFoundException(nameof(User), userId);

        user.Status = status;
        if (status == UserAccountStatus.Locked || status == UserAccountStatus.Disabled)
        {
            user.RefreshTokenHash = null;
            user.RefreshTokenExpiresAt = null;
        }
        user.UpdatedAt = DateTime.UtcNow;
        _users.Update(user);

        await _uow.SaveChangesAsync(cancellationToken);
        return user.ToDto();
    }

    public async Task<UserDto?> GetByIdAsync(Guid userId, CancellationToken cancellationToken = default)
    {
        var user = await _users.FirstOrDefaultAsync(new UserSpecifications.ByIdWithRole(userId), cancellationToken);
        return user?.ToDto();
    }

    public async Task<IReadOnlyList<UserDto>> ListAsync(CancellationToken cancellationToken = default)
    {
        var users = await _users.ListAsync(new UserSpecifications.AllOrdered(), cancellationToken);
        return users.Select(u => u.ToDto()).ToList();
    }
}