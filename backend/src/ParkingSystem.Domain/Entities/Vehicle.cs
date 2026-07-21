using ParkingSystem.Domain.Common;

namespace ParkingSystem.Domain.Entities;

public class Vehicle : BaseEntity
{
    public string LicensePlate { get; set; } = string.Empty;

    public Guid VehicleTypeId { get; set; }
    public VehicleType? VehicleType { get; set; }

    public string? Brand { get; set; }
    public string? Model { get; set; }
    public string? Color { get; set; }

    /// <summary>Optional link to a registered driver user account.</summary>
    public Guid? OwnerUserId { get; set; }
    public User? OwnerUser { get; set; }

    public ICollection<ParkingTicket> Tickets { get; set; } = new List<ParkingTicket>();
    public ICollection<AIRecommendationLog> AIRecommendations { get; set; } = new List<AIRecommendationLog>();
}