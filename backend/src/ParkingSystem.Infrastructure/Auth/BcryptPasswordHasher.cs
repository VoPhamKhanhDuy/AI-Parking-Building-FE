using ParkingSystem.Application.Auth.Interfaces;

namespace ParkingSystem.Infrastructure.Auth;

/// <summary>
/// BCrypt.Net implementation of <see cref="IPasswordHasher"/>.
/// Work factor 12 is a sensible default for production; 11 is fine for dev.
/// </summary>
public class BcryptPasswordHasher : IPasswordHasher
{
    private const int WorkFactor = 12;

    public string Hash(string password)
    {
        if (string.IsNullOrEmpty(password))
        {
            throw new ArgumentException("Password must not be empty.", nameof(password));
        }
        return BCrypt.Net.BCrypt.HashPassword(password, WorkFactor);
    }

    public bool Verify(string password, string hash)
    {
        if (string.IsNullOrEmpty(password) || string.IsNullOrEmpty(hash))
        {
            return false;
        }

        try
        {
            return BCrypt.Net.BCrypt.Verify(password, hash);
        }
        catch (BCrypt.Net.SaltParseException)
        {
            return false;
        }
    }
}