using ParkingSystem.Domain.Enums;

namespace ParkingSystem.Application.Vehicles.DTOs;

public class VehicleDto
{
    public Guid Id { get; set; }
    public string LicensePlate { get; set; } = string.Empty;
    public Guid VehicleTypeId { get; set; }
    public string VehicleTypeName { get; set; } = string.Empty;
    public VehicleTypeCategory VehicleTypeCategory { get; set; }
    public decimal DefaultHourlyRate { get; set; }
    public string? Brand { get; set; }
    public string? Model { get; set; }
    public string? Color { get; set; }
    public Guid? OwnerUserId { get; set; }
    public string? OwnerUserEmail { get; set; }
    public DateTime CreatedAt { get; set; }
    public DateTime? UpdatedAt { get; set; }
}

public class CreateVehicleRequest
{
    public string LicensePlate { get; set; } = string.Empty;
    public Guid VehicleTypeId { get; set; }
    public string? Brand { get; set; }
    public string? Model { get; set; }
    public string? Color { get; set; }
    public Guid? OwnerUserId { get; set; }
}

public class UpdateVehicleRequest
{
    public string? LicensePlate { get; set; }
    public Guid? VehicleTypeId { get; set; }
    public string? Brand { get; set; }
    public string? Model { get; set; }
    public string? Color { get; set; }
    public Guid? OwnerUserId { get; set; }
    public bool ClearOwner { get; set; }
}