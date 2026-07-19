using ParkingSystem.Application.Common.Exceptions;
using ParkingSystem.Application.Common.Interfaces;
using ParkingSystem.Application.Common.Mappings;
using ParkingSystem.Application.Vehicles.DTOs;
using ParkingSystem.Application.Vehicles.Interfaces;
using ParkingSystem.Application.Vehicles.Specifications;
using ParkingSystem.Domain.Entities;

namespace ParkingSystem.Application.Vehicles.Services;

public class VehicleService : IVehicleService
{
    private readonly IRepository<Vehicle> _vehicles;
    private readonly IRepository<VehicleType> _vehicleTypes;
    private readonly IRepository<User> _users;
    private readonly IUnitOfWork _uow;

    public VehicleService(
        IRepository<Vehicle> vehicles,
        IRepository<VehicleType> vehicleTypes,
        IRepository<User> users,
        IUnitOfWork uow)
    {
        _vehicles = vehicles;
        _vehicleTypes = vehicleTypes;
        _users = users;
        _uow = uow;
    }

    public async Task<IReadOnlyList<VehicleDto>> ListAsync(
        Guid? vehicleTypeId,
        Guid? ownerUserId,
        string? q,
        CancellationToken ct = default)
    {
        var vehicles = await _vehicles.ListAsync(
            new VehicleSpecifications.ListFiltered(vehicleTypeId, ownerUserId, q), ct);
        return vehicles.Select(v => v.ToDto()).ToList();
    }

    public async Task<VehicleDto?> GetByIdAsync(Guid id, CancellationToken ct = default)
    {
        var v = await _vehicles.FirstOrDefaultAsync(new VehicleSpecifications.ByIdWithDetails(id), ct);
        return v?.ToDto();
    }

    public async Task<VehicleDto?> GetByLicensePlateAsync(string licensePlate, CancellationToken ct = default)
    {
        if (string.IsNullOrWhiteSpace(licensePlate)) return null;
        var normalized = VehicleSpecifications.NormalizePlate(licensePlate);
        if (string.IsNullOrEmpty(normalized)) return null;
        var v = await _vehicles.FirstOrDefaultAsync(
            new VehicleSpecifications.ByLicensePlate(normalized), ct);
        return v?.ToDto();
    }

    public async Task<VehicleDto> CreateAsync(CreateVehicleRequest req, CancellationToken ct = default)
    {
        var plate = VehicleSpecifications.NormalizePlate(req.LicensePlate);

        // Unique check on normalized plate.
        var existing = await _vehicles.FirstOrDefaultAsync(
            new VehicleSpecifications.ByLicensePlate(plate), ct);
        if (existing is not null)
        {
            throw new ConflictException($"A vehicle with license plate '{plate}' already exists.");
        }

        var vehicleType = await _vehicleTypes.GetByIdAsync(req.VehicleTypeId, ct)
            ?? throw new ValidationException($"VehicleType '{req.VehicleTypeId}' does not exist.");

        if (req.OwnerUserId.HasValue)
        {
            var owner = await _users.GetByIdAsync(req.OwnerUserId.Value, ct)
                ?? throw new ValidationException($"Owner user '{req.OwnerUserId}' does not exist.");
            _ = owner; // Suppress unused variable warning
        }

        var vehicle = new Vehicle
        {
            LicensePlate = plate,
            VehicleTypeId = vehicleType.Id,
            Brand = req.Brand?.Trim(),
            Model = req.Model?.Trim(),
            Color = req.Color?.Trim(),
            OwnerUserId = req.OwnerUserId
        };

        await _vehicles.AddAsync(vehicle, ct);
        await _uow.SaveChangesAsync(ct);

        vehicle.VehicleType = vehicleType;
        if (vehicle.OwnerUserId.HasValue)
        {
            vehicle.OwnerUser = await _users.GetByIdAsync(vehicle.OwnerUserId.Value, ct);
        }
        return vehicle.ToDto();
    }

    public async Task<VehicleDto> UpdateAsync(Guid id, UpdateVehicleRequest req, CancellationToken ct = default)
    {
        var vehicle = await _vehicles.FirstOrDefaultAsync(new VehicleSpecifications.ByIdWithDetails(id), ct)
            ?? throw new NotFoundException(nameof(Vehicle), id);

        if (!string.IsNullOrWhiteSpace(req.LicensePlate))
        {
            var newPlate = VehicleSpecifications.NormalizePlate(req.LicensePlate);
            if (!string.Equals(newPlate, vehicle.LicensePlate, StringComparison.Ordinal))
            {
                var dup = await _vehicles.FirstOrDefaultAsync(
                    new VehicleSpecifications.ByLicensePlate(newPlate), ct);
                if (dup is not null && dup.Id != vehicle.Id)
                {
                    throw new ConflictException($"A vehicle with license plate '{newPlate}' already exists.");
                }
                vehicle.LicensePlate = newPlate;
            }
        }

        if (req.VehicleTypeId.HasValue && req.VehicleTypeId.Value != vehicle.VehicleTypeId)
        {
            var vt = await _vehicleTypes.GetByIdAsync(req.VehicleTypeId.Value, ct)
                ?? throw new ValidationException($"VehicleType '{req.VehicleTypeId}' does not exist.");
            vehicle.VehicleTypeId = vt.Id;
            vehicle.VehicleType = vt;
        }

        if (req.Brand is not null)
        {
            vehicle.Brand = string.IsNullOrWhiteSpace(req.Brand) ? null : req.Brand.Trim();
        }

        if (req.Model is not null)
        {
            vehicle.Model = string.IsNullOrWhiteSpace(req.Model) ? null : req.Model.Trim();
        }

        if (req.Color is not null)
        {
            vehicle.Color = string.IsNullOrWhiteSpace(req.Color) ? null : req.Color.Trim();
        }

        if (req.ClearOwner)
        {
            vehicle.OwnerUserId = null;
            vehicle.OwnerUser = null;
        }
        else if (req.OwnerUserId.HasValue && req.OwnerUserId.Value != vehicle.OwnerUserId)
        {
            var owner = await _users.GetByIdAsync(req.OwnerUserId.Value, ct)
                ?? throw new ValidationException($"Owner user '{req.OwnerUserId}' does not exist.");
            vehicle.OwnerUserId = owner.Id;
            vehicle.OwnerUser = owner;
        }

        vehicle.UpdatedAt = DateTime.UtcNow;
        _vehicles.Update(vehicle);
        await _uow.SaveChangesAsync(ct);

        return vehicle.ToDto();
    }

    public async Task DeleteAsync(Guid id, CancellationToken ct = default)
    {
        var vehicle = await _vehicles.GetByIdAsync(id, ct)
            ?? throw new NotFoundException(nameof(Vehicle), id);

        // Soft-delete to preserve FK integrity with Tickets / AI logs.
        vehicle.IsDeleted = true;
        vehicle.UpdatedAt = DateTime.UtcNow;
        _vehicles.Update(vehicle);
        await _uow.SaveChangesAsync(ct);
    }

    public async Task<IReadOnlyList<VehicleTypeDto>> ListTypesAsync(CancellationToken ct = default)
    {
        var types = await _vehicleTypes.ListAllAsync(ct);
        return types
            .Select(t => new VehicleTypeDto
            {
                Id = t.Id,
                Name = t.Name,
                Category = t.Category,
                DefaultHourlyRate = t.DefaultHourlyRate,
            })
            .ToList();
    }
}