using ParkingSystem.Application.Vehicles.DTOs;
using ParkingSystem.Domain.Entities;

namespace ParkingSystem.Application.Common.Mappings;

internal static class VehicleMappings
{
    public static VehicleDto ToDto(this Vehicle v) => new()
    {
        Id = v.Id,
        LicensePlate = v.LicensePlate,
        VehicleTypeId = v.VehicleTypeId,
        VehicleTypeName = v.VehicleType?.Name ?? string.Empty,
        VehicleTypeCategory = v.VehicleType?.Category ?? Domain.Enums.VehicleTypeCategory.Other,
        Brand = v.Brand,
        Model = v.Model,
        Color = v.Color,
        OwnerUserId = v.OwnerUserId,
        OwnerUserEmail = v.OwnerUser?.Email,
        CreatedAt = v.CreatedAt,
        UpdatedAt = v.UpdatedAt
    };
}