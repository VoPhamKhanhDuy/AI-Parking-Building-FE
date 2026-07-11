namespace ParkingSystem.Domain.Enums;

/// <summary>
/// Built-in role identifiers. Seeded by EF Core on initial migration.
/// Names are intentionally short ASCII so they can be referenced from
/// <c>[Authorize(Roles = "Admin")]</c> attributes.
/// </summary>
public static class SystemRoles
{
    public const string Admin = "Admin";
    public const string Manager = "Manager";
    public const string Staff = "Staff";
    public const string Driver = "Driver";
}