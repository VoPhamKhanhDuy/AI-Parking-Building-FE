using ParkingSystem.Domain.Common;

namespace ParkingSystem.Domain.Entities;

public class Role : BaseEntity
{
    /// <summary>Stable machine-friendly name used by [Authorize(Roles = "...")].</summary>
    public string Name { get; set; } = string.Empty;

    public string? Description { get; set; }

    public ICollection<User> Users { get; set; } = new List<User>();
}