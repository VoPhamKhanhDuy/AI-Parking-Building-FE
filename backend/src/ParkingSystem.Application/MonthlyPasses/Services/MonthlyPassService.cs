using ParkingSystem.Application.Common.Exceptions;
using ParkingSystem.Application.Common.Extensions;
using ParkingSystem.Application.Common.Interfaces;
using ParkingSystem.Application.MonthlyPasses.DTOs;
using ParkingSystem.Application.MonthlyPasses.Interfaces;
using ParkingSystem.Application.MonthlyPasses.Specifications;
using ParkingSystem.Domain.Entities;
using ParkingSystem.Domain.Enums;

namespace ParkingSystem.Application.MonthlyPasses.Services;

public class MonthlyPassService : IMonthlyPassService
{
    private readonly IRepository<MonthlyPass> _passes;
    private readonly IRepository<VehicleType> _vehicleTypes;
    private readonly IUnitOfWork _uow;
    private readonly TimeProvider _clock;

    public MonthlyPassService(
        IRepository<MonthlyPass> passes,
        IRepository<VehicleType> vehicleTypes,
        IUnitOfWork uow,
        TimeProvider clock)
    {
        _passes = passes;
        _vehicleTypes = vehicleTypes;
        _uow = uow;
        _clock = clock;
    }

    public async Task<MonthlyPassListResponse> ListAsync(
        string? search,
        MonthlyPassStatus? status,
        Guid? vehicleTypeId,
        CancellationToken ct = default)
    {
        var passes = await _passes.ListAsync(
            new MonthlyPassSpecifications.ListFiltered(search, status, vehicleTypeId), ct);

        var total = await _passes.CountAsync(null, ct);
        var active = await _passes.CountAsync(
            new MonthlyPassSpecifications.ByStatus(MonthlyPassStatus.Active), ct);
        var pending = await _passes.CountAsync(
            new MonthlyPassSpecifications.ByStatus(MonthlyPassStatus.PendingApproval), ct);
        var expired = await _passes.CountAsync(
            new MonthlyPassSpecifications.ByStatus(MonthlyPassStatus.Expired), ct);

        return new MonthlyPassListResponse
        {
            Passes = passes.Select(MapToDto).ToList(),
            Stats = new MonthlyPassStatsDto
            {
                Total = total,
                Active = active,
                Pending = pending,
                Expired = expired
            }
        };
    }

    public async Task<MonthlyPassDto?> GetByIdAsync(Guid id, CancellationToken ct = default)
    {
        var spec = new MonthlyPassSpecifications.ByIdWithDetails(id);
        var pass = await _passes.FirstOrDefaultAsync(spec, ct);
        return pass == null ? null : MapToDto(pass);
    }

    public async Task<MonthlyPassDto> CreateAsync(CreateMonthlyPassRequest req, CancellationToken ct = default)
    {
        var vehicleType = await _vehicleTypes.GetByIdAsync(req.VehicleTypeId, ct)
            ?? throw new ValidationException($"VehicleType '{req.VehicleTypeId}' does not exist.");

        if (string.IsNullOrWhiteSpace(req.LicensePlate))
        {
            throw new ValidationException("License plate is required.");
        }

        if (string.IsNullOrWhiteSpace(req.DriverName))
        {
            throw new ValidationException("Driver name is required.");
        }

        if (req.ValidUntil <= req.ValidFrom)
        {
            throw new ValidationException("ValidUntil must be after ValidFrom.");
        }

        var now = _clock.GetUtcNow().UtcDateTime;
        var normalizedPlate = req.LicensePlate.Trim().ToUpperInvariant();

        var pass = new MonthlyPass
        {
            Id = Guid.NewGuid(),
            PassCode = GenerateCode(),
            LicensePlate = normalizedPlate,
            VehicleTypeId = vehicleType.Id,
            DriverName = req.DriverName.Trim(),
            DriverEmail = req.DriverEmail?.Trim(),
            DriverPhone = req.DriverPhone?.Trim(),
            ValidFrom = req.ValidFrom.EnsureUtc(),
            ValidUntil = req.ValidUntil.EnsureUtc(),
            Status = MonthlyPassStatus.PendingApproval,
            CreatedAt = now,
            UpdatedAt = now
        };

        await _passes.AddAsync(pass, ct);
        await _uow.SaveChangesAsync(ct);

        pass.VehicleType = vehicleType;
        return MapToDto(pass);
    }

    public async Task<MonthlyPassDto> VerifyAsync(Guid id, Guid? verifiedByUserId, CancellationToken ct = default)
    {
        var pass = await _passes.GetByIdAsync(id, ct)
            ?? throw new NotFoundException(nameof(MonthlyPass), id);

        if (pass.Status == MonthlyPassStatus.Expired)
        {
            throw new ValidationException("Expired passes must be renewed before verification.");
        }

        if (pass.Status == MonthlyPassStatus.PendingApproval)
        {
            throw new ValidationException("Pending passes require manager approval before verification.");
        }

        var now = _clock.GetUtcNow().UtcDateTime;
        pass.LastVerifiedAt = now;
        pass.VerifiedByUserId = verifiedByUserId?.ToString();
        pass.UpdatedAt = now;
        _passes.Update(pass);
        await _uow.SaveChangesAsync(ct);

        return MapToDto(pass);
    }

    public async Task<MonthlyPassDto> RenewAsync(Guid id, RenewMonthlyPassRequest? req, CancellationToken ct = default)
    {
        var pass = await _passes.GetByIdAsync(id, ct)
            ?? throw new NotFoundException(nameof(MonthlyPass), id);

        var now = _clock.GetUtcNow().UtcDateTime;
        pass.ValidFrom = req?.NewValidFrom ?? now;
        pass.ValidUntil = req?.NewValidUntil ?? now.AddMonths(1);
        pass.Status = MonthlyPassStatus.Active;
        pass.UpdatedAt = now;
        _passes.Update(pass);
        await _uow.SaveChangesAsync(ct);

        return MapToDto(pass);
    }

    public async Task<MonthlyPassDto> UpdateVehicleAsync(Guid id, UpdateVehicleRequest req, CancellationToken ct = default)
    {
        var pass = await _passes.GetByIdAsync(id, ct)
            ?? throw new NotFoundException(nameof(MonthlyPass), id);

        if (string.IsNullOrWhiteSpace(req.LicensePlate))
        {
            throw new ValidationException("License plate is required.");
        }

        var vehicleType = await _vehicleTypes.GetByIdAsync(req.VehicleTypeId, ct)
            ?? throw new ValidationException($"VehicleType '{req.VehicleTypeId}' does not exist.");

        pass.LicensePlate = req.LicensePlate.Trim().ToUpperInvariant();
        pass.VehicleTypeId = vehicleType.Id;
        pass.UpdatedAt = _clock.GetUtcNow().UtcDateTime;
        _passes.Update(pass);
        await _uow.SaveChangesAsync(ct);

        pass.VehicleType = vehicleType;
        return MapToDto(pass);
    }

    public async Task<SuspensionRequestResponse> RequestSuspensionAsync(
        Guid id,
        SuspensionRequestBody? req,
        CancellationToken ct = default)
    {
        var pass = await _passes.GetByIdAsync(id, ct)
            ?? throw new NotFoundException(nameof(MonthlyPass), id);

        pass.Status = MonthlyPassStatus.Suspended;
        pass.UpdatedAt = _clock.GetUtcNow().UtcDateTime;
        _passes.Update(pass);
        await _uow.SaveChangesAsync(ct);

        return new SuspensionRequestResponse
        {
            RequestId = $"MPR-{pass.Id.ToString()[..8]}",
            PassId = pass.Id,
            Status = "Pending Manager Approval",
            Message = "Pass suspended pending manager review."
        };
    }

    public async Task<MonthlyPassDto> ApproveAsync(Guid id, CancellationToken ct = default)
    {
        var pass = await _passes.GetByIdAsync(id, ct)
            ?? throw new NotFoundException(nameof(MonthlyPass), id);

        if (pass.Status != MonthlyPassStatus.PendingApproval)
        {
            throw new ValidationException("Only pending passes can be approved.");
        }

        pass.Status = MonthlyPassStatus.Active;
        pass.UpdatedAt = _clock.GetUtcNow().UtcDateTime;
        _passes.Update(pass);
        await _uow.SaveChangesAsync(ct);

        return MapToDto(pass);
    }

    private string GenerateCode()
    {
        var date = _clock.GetUtcNow().UtcDateTime.ToString("yyyyMMdd");
        var suffix = Guid.NewGuid().ToString()[..8].ToUpperInvariant();
        return $"MP-{date}-{suffix}";
    }

    private static MonthlyPassDto MapToDto(MonthlyPass pass) => new()
    {
        Id = pass.Id,
        PassCode = pass.PassCode,
        LicensePlate = pass.LicensePlate,
        VehicleTypeId = pass.VehicleTypeId,
        VehicleTypeName = pass.VehicleType?.Name ?? "Unknown",
        DriverName = pass.DriverName,
        DriverEmail = pass.DriverEmail,
        DriverPhone = pass.DriverPhone,
        ValidFrom = pass.ValidFrom,
        ValidUntil = pass.ValidUntil,
        Status = pass.Status.ToString(),
        AssignedLocation = pass.AssignedLocation ?? "Unassigned",
        LastVerifiedAt = pass.LastVerifiedAt,
        CreatedAt = pass.CreatedAt,
        UpdatedAt = pass.UpdatedAt
    };
}
