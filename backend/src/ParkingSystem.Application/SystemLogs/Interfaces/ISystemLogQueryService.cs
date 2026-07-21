using ParkingSystem.Application.SystemLogs.DTOs;

namespace ParkingSystem.Application.SystemLogs.Interfaces;

public interface ISystemLogQueryService
{
    Task<SystemLogListResponse> ListAsync(
        string? search,
        string? module,
        DateTime? fromDate,
        DateTime? toDate,
        int page,
        int pageSize,
        CancellationToken ct = default);

    Task<SystemLogDto?> GetByIdAsync(Guid id, CancellationToken ct = default);
}
