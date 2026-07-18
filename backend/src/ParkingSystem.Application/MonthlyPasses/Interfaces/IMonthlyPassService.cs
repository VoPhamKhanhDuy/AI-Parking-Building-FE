using ParkingSystem.Application.MonthlyPasses.DTOs;
using ParkingSystem.Domain.Enums;

namespace ParkingSystem.Application.MonthlyPasses.Interfaces;

public interface IMonthlyPassService
{
    Task<MonthlyPassListResponse> ListAsync(
        string? search,
        MonthlyPassStatus? status,
        Guid? vehicleTypeId,
        CancellationToken ct = default);

    Task<MonthlyPassDto?> GetByIdAsync(Guid id, CancellationToken ct = default);

    Task<MonthlyPassDto> CreateAsync(CreateMonthlyPassRequest req, CancellationToken ct = default);

    Task<MonthlyPassDto> VerifyAsync(Guid id, Guid? verifiedByUserId, CancellationToken ct = default);

    Task<MonthlyPassDto> RenewAsync(Guid id, RenewMonthlyPassRequest? req, CancellationToken ct = default);

    Task<MonthlyPassDto> UpdateVehicleAsync(Guid id, UpdateVehicleRequest req, CancellationToken ct = default);

    Task<SuspensionRequestResponse> RequestSuspensionAsync(Guid id, SuspensionRequestBody? req, CancellationToken ct = default);

    Task<MonthlyPassDto> ApproveAsync(Guid id, CancellationToken ct = default);
}
