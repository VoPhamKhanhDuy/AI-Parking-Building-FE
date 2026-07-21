using ParkingSystem.Application.Vehicles.DTOs;

namespace ParkingSystem.Application.Vehicles.Interfaces;

public interface IVehicleService
{
    Task<IReadOnlyList<VehicleDto>> ListAsync(
        Guid? vehicleTypeId,
        Guid? ownerUserId,
        string? q,
        CancellationToken ct = default);

    Task<VehicleDto?> GetByIdAsync(Guid id, CancellationToken ct = default);

    Task<VehicleDto?> GetByLicensePlateAsync(string licensePlate, CancellationToken ct = default);

    Task<VehicleDto> CreateAsync(CreateVehicleRequest req, CancellationToken ct = default);

    Task<VehicleDto> UpdateAsync(Guid id, UpdateVehicleRequest req, CancellationToken ct = default);

    Task DeleteAsync(Guid id, CancellationToken ct = default);

    Task<IReadOnlyList<VehicleTypeDto>> ListTypesAsync(CancellationToken ct = default);
}