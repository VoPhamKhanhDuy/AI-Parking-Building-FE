using ParkingSystem.Application.Auth.DTOs;
using ParkingSystem.Application.Auth.Interfaces;
using ParkingSystem.Application.Common.Exceptions;
using ParkingSystem.Application.Common.Interfaces;
using ParkingSystem.Application.Common.Mappings;
using ParkingSystem.Application.Common.Specifications;
using ParkingSystem.Application.Settings;
using ParkingSystem.Domain.Entities;
using ParkingSystem.Domain.Enums;

namespace ParkingSystem.Application.Auth.Services;

public class AuthService : IAuthService
{
    private readonly IRepository<User> _users;
    private readonly IUnitOfWork _uow;
    private readonly IPasswordHasher _passwordHasher;
    private readonly IJwtTokenService _jwt;
    private readonly JwtSettings _jwtSettings;

    public AuthService(
        IRepository<User> users,
        IUnitOfWork uow,
        IPasswordHasher passwordHasher,
        IJwtTokenService jwt,
        JwtSettings jwtSettings)
    {
        _users = users;
        _uow = uow;
        _passwordHasher = passwordHasher;
        _jwt = jwt;
        _jwtSettings = jwtSettings;
    }

    public async Task<LoginResponse> LoginAsync(LoginRequest request, CancellationToken cancellationToken = default)
    {
        var spec = new UserSpecifications.ByEmailWithRole(request.Email);
        var user = await _users.FirstOrDefaultAsync(spec, cancellationToken);

        // Always run verify to defend against user-enumeration timing attacks.
        var passwordOk = user != null && _passwordHasher.Verify(request.Password, user.PasswordHash);

        if (user is null || !passwordOk)
        {
            throw new UnauthorizedException("Invalid email or password.");
        }

        if (user.Status == UserAccountStatus.Locked)
        {
            throw new ForbiddenException("Account is locked. Please contact an administrator.");
        }

        if (user.Status == UserAccountStatus.Disabled)
        {
            throw new ForbiddenException("Account is disabled.");
        }

        var (accessToken, _, expiresAt) = _jwt.CreateAccessToken(user);
        var refreshToken = _jwt.GenerateRefreshToken();
        var refreshTokenHash = _jwt.HashRefreshToken(refreshToken);

        user.RefreshTokenHash = refreshTokenHash;
        user.RefreshTokenExpiresAt = DateTime.UtcNow.AddDays(_jwtSettings.RefreshTokenLifetimeDays);
        user.LastLoginAt = DateTime.UtcNow;
        user.UpdatedAt = DateTime.UtcNow;
        _users.Update(user);

        await _uow.SaveChangesAsync(cancellationToken);

        return new LoginResponse
        {
            AccessToken = accessToken,
            RefreshToken = refreshToken,
            ExpiresAtUtc = expiresAt,
            ExpiresInSeconds = (int)(expiresAt - DateTime.UtcNow).TotalSeconds,
            User = user.ToDto()
        };
    }

    public async Task<LoginResponse> RefreshTokenAsync(RefreshTokenRequest request, CancellationToken cancellationToken = default)
    {
        if (string.IsNullOrWhiteSpace(request.RefreshToken))
        {
            throw new UnauthorizedException("Refresh token is required.");
        }

        var tokenHash = _jwt.HashRefreshToken(request.RefreshToken);
        var spec = new UserSpecifications.ByRefreshTokenHash(tokenHash);
        var user = await _users.FirstOrDefaultAsync(spec, cancellationToken);

        if (user is null)
        {
            throw new UnauthorizedException("Invalid or expired refresh token.");
        }

        // Rotate: issue a new access token AND a new refresh token (revoke the old one).
        var (accessToken, _, expiresAt) = _jwt.CreateAccessToken(user);
        var newRefresh = _jwt.GenerateRefreshToken();
        var newRefreshHash = _jwt.HashRefreshToken(newRefresh);

        user.RefreshTokenHash = newRefreshHash;
        user.RefreshTokenExpiresAt = DateTime.UtcNow.AddDays(_jwtSettings.RefreshTokenLifetimeDays);
        user.UpdatedAt = DateTime.UtcNow;
        _users.Update(user);

        await _uow.SaveChangesAsync(cancellationToken);

        return new LoginResponse
        {
            AccessToken = accessToken,
            RefreshToken = newRefresh,
            ExpiresAtUtc = expiresAt,
            ExpiresInSeconds = (int)(expiresAt - DateTime.UtcNow).TotalSeconds,
            User = user.ToDto()
        };
    }

    public async Task LogoutAsync(Guid userId, CancellationToken cancellationToken = default)
    {
        var user = await _users.GetByIdAsync(userId, cancellationToken)
            ?? throw new NotFoundException(nameof(User), userId);

        user.RefreshTokenHash = null;
        user.RefreshTokenExpiresAt = null;
        user.UpdatedAt = DateTime.UtcNow;
        _users.Update(user);

        await _uow.SaveChangesAsync(cancellationToken);
    }

    public async Task<UserDto?> GetCurrentUserAsync(Guid userId, CancellationToken cancellationToken = default)
    {
        var spec = new UserSpecifications.ByIdWithRole(userId);
        var user = await _users.FirstOrDefaultAsync(spec, cancellationToken);
        return user?.ToDto();
    }
}