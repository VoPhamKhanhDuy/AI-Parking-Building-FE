using System.Text.RegularExpressions;
using ParkingSystem.Application.Common.Interfaces;
using ParkingSystem.Application.SystemLogs.DTOs;
using ParkingSystem.Application.SystemLogs.Interfaces;
using ParkingSystem.Application.SystemLogs.Specifications;
using ParkingSystem.Domain.Entities;

namespace ParkingSystem.Application.SystemLogs.Services;

public class SystemLogQueryService : ISystemLogQueryService
{
    private readonly IRepository<SystemLog> _logs;

    public SystemLogQueryService(IRepository<SystemLog> logs)
    {
        _logs = logs;
    }

    public async Task<SystemLogListResponse> ListAsync(
        string? search,
        string? module,
        DateTime? fromDate,
        DateTime? toDate,
        int page,
        int pageSize,
        CancellationToken ct = default)
    {
        var skip = (page - 1) * pageSize;
        var spec = new SystemLogSpecifications.ListFiltered(
            search, module, fromDate, toDate, skip, pageSize);

        var logs = await _logs.ListAsync(spec, ct);
        var totalCount = await _logs.CountAsync(null, ct);

        // Extract modules from log actions
        var modules = ExtractModules(logs);

        return new SystemLogListResponse
        {
            Logs = logs.Select(MapToDto).ToList(),
            TotalCount = totalCount,
            Modules = modules,
            Page = page,
            PageSize = pageSize
        };
    }

    public async Task<SystemLogDto?> GetByIdAsync(Guid id, CancellationToken ct = default)
    {
        var spec = new SystemLogSpecifications.ByIdWithUser(id);
        var log = await _logs.FirstOrDefaultAsync(spec, ct);
        return log == null ? null : MapToDto(log);
    }

    private static List<string> ExtractModules(IEnumerable<SystemLog> logs)
    {
        var modules = new HashSet<string>();
        var pattern = new Regex(@"^(\w+)[\s/]");

        foreach (var log in logs)
        {
            var match = pattern.Match(log.Action);
            if (match.Success)
            {
                modules.Add(match.Groups[1].Value);
            }
        }

        return modules.OrderBy(m => m).ToList();
    }

    private static SystemLogDto MapToDto(SystemLog log) => new()
    {
        Id = log.Id,
        UserId = log.UserId,
        UserName = log.User?.FullName,
        Action = log.Action,
        TargetEntity = log.TargetEntity,
        TargetEntityId = log.TargetEntityId,
        Description = log.Description,
        IpAddress = log.IpAddress,
        CreatedAt = log.CreatedAt
    };
}
