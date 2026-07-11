namespace ParkingSystem.Application.Settings;

/// <summary>
/// Strongly-typed binding for the <c>JwtSettings</c> section in
/// <c>appsettings.json</c>. Bound at startup via <c>services.Configure&lt;JwtSettings&gt;(...)</c>.
/// </summary>
public class JwtSettings
{
    public string Issuer { get; set; } = string.Empty;
    public string Audience { get; set; } = string.Empty;

    /// <summary>HMAC-SHA256 signing key. MUST be at least 32 chars (256 bits) in production.</summary>
    public string Secret { get; set; } = string.Empty;

    public int AccessTokenLifetimeMinutes { get; set; } = 60;
    public int RefreshTokenLifetimeDays { get; set; } = 7;
}