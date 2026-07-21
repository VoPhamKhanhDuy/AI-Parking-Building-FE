using ParkingSystem.Domain.Enums;

namespace ParkingSystem.Application.MonthlyPasses.DTOs;

public class MonthlyPassDto
{
    public Guid Id { get; set; }
    public string PassCode { get; set; } = string.Empty;
    public string LicensePlate { get; set; } = string.Empty;
    public Guid VehicleTypeId { get; set; }
    public string VehicleTypeName { get; set; } = string.Empty;
    public string DriverName { get; set; } = string.Empty;
    public string? DriverEmail { get; set; }
    public string? DriverPhone { get; set; }
    public DateTime ValidFrom { get; set; }
    public DateTime ValidUntil { get; set; }
    public string Status { get; set; } = string.Empty;
    public string? AssignedLocation { get; set; }
    public DateTime? LastVerifiedAt { get; set; }
    public DateTime CreatedAt { get; set; }
    public DateTime? UpdatedAt { get; set; }
}

public class MonthlyPassListResponse
{
    public List<MonthlyPassDto> Passes { get; set; } = new();
    public MonthlyPassStatsDto Stats { get; set; } = new();
}

public class MonthlyPassStatsDto
{
    public int Total { get; set; }
    public int Active { get; set; }
    public int Pending { get; set; }
    public int Expired { get; set; }
}

public class CreateMonthlyPassRequest
{
    public string LicensePlate { get; set; } = string.Empty;
    public Guid VehicleTypeId { get; set; }
    public string DriverName { get; set; } = string.Empty;
    public string? DriverEmail { get; set; }
    public string? DriverPhone { get; set; }
    public DateTime ValidFrom { get; set; }
    public DateTime ValidUntil { get; set; }
}

public class RenewMonthlyPassRequest
{
    public DateTime? NewValidFrom { get; set; }
    public DateTime? NewValidUntil { get; set; }
}

public class UpdateVehicleRequest
{
    public string LicensePlate { get; set; } = string.Empty;
    public Guid VehicleTypeId { get; set; }
}

public class SuspensionRequestBody
{
    public string? Reason { get; set; }
}

public class SuspensionRequestResponse
{
    public string RequestId { get; set; } = string.Empty;
    public Guid PassId { get; set; }
    public string Status { get; set; } = string.Empty;
    public string Message { get; set; } = string.Empty;
}
