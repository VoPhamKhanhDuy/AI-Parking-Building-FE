namespace ParkingSystem.Domain.Enums;

/// <summary>
/// Status of a parking slot. Persisted as a string column for readability
/// and easy inspection from psql / pgAdmin.
/// </summary>
public enum SlotStatus
{
    Available = 0,
    Occupied = 1,
    Reserved = 2,
    Maintenance = 3
}