namespace ParkingSystem.Domain.Enums;

/// <summary>
/// Coarse-grained type of vehicle that determines which parking zones are eligible.
/// Persisted as string.
/// </summary>
public enum VehicleTypeCategory
{
    Car = 0,
    Motorbike = 1,
    ElectricVehicle = 2,
    Bicycle = 3,
    Other = 99
}