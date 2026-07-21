namespace ParkingSystem.Domain.Common;

/// <summary>
/// Base entity with common audit fields. All domain entities inherit from this.
/// Primary keys are <see cref="Guid"/> per the SDD (PostgreSQL uuid column type).
/// </summary>
public abstract class BaseEntity
{
    public Guid Id { get; set; } = Guid.NewGuid();

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    public DateTime? UpdatedAt { get; set; }

    /// <summary>
    /// Soft-delete flag. Infrastructure configures a global query filter
    /// so deleted rows are hidden by default.
    /// </summary>
    public bool IsDeleted { get; set; }
}