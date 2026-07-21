using ParkingSystem.Application.Auth.DTOs;
using ParkingSystem.Domain.Entities;

namespace ParkingSystem.Application.Auth.Interfaces;

/// <summary>
/// BCrypt-backed password hashing contract.
/// Implementation lives in Infrastructure so Application stays storage-agnostic.
/// </summary>
public interface IPasswordHasher
{
    string Hash(string password);
    bool Verify(string password, string hash);
}

/// <summary>
/// Issues JWT access tokens and opaque refresh tokens.
/// </summary>
public interface IJwtTokenService
{
    /// <summary>Returns (token, jti, expiresAtUtc).</summary>
    (string Token, string Jti, DateTime ExpiresAtUtc) CreateAccessToken(User user);

    /// <summary>Generates a cryptographically random refresh token (base64url).</summary>
    string GenerateRefreshToken();

    /// <summary>Returns SHA-256 hash of the supplied refresh token, used for storage.</summary>
    string HashRefreshToken(string refreshToken);
}

/// <summary>
/// Login / refresh / logout / me. Implemented in <c>AuthService</c>.
/// </summary>
public interface IAuthService
{
    Task<LoginResponse> LoginAsync(LoginRequest request, CancellationToken cancellationToken = default);
    Task<LoginResponse> RefreshTokenAsync(RefreshTokenRequest request, CancellationToken cancellationToken = default);
    Task LogoutAsync(Guid userId, CancellationToken cancellationToken = default);
    Task<UserDto?> GetCurrentUserAsync(Guid userId, CancellationToken cancellationToken = default);
}

/// <summary>
/// User management operations (Admin only at the controller layer).
/// </summary>
public interface IUserService
{
    Task<UserDto> CreateAsync(CreateUserRequest request, CancellationToken cancellationToken = default);
    Task<UserDto> UpdateAsync(Guid userId, UpdateUserRequest request, CancellationToken cancellationToken = default);
    Task<UserDto> SetStatusAsync(Guid userId, Domain.Enums.UserAccountStatus status, CancellationToken cancellationToken = default);
    Task<UserDto?> GetByIdAsync(Guid userId, CancellationToken cancellationToken = default);
    Task<IReadOnlyList<UserDto>> ListAsync(CancellationToken cancellationToken = default);
}