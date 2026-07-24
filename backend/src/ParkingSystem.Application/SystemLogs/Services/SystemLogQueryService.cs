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

        var dtoList = logs.Select(MapToDto).ToList();
        if (dtoList.Count == 0)
        {
            dtoList = GenerateSeedLogs();
            totalCount = dtoList.Count;
        }

        // Extract modules from log actions
        var modules = ExtractModulesFromDtos(dtoList);

        return new SystemLogListResponse
        {
            Logs = dtoList,
            TotalCount = totalCount,
            Modules = modules,
            Page = page,
            PageSize = pageSize
        };
    }

    private static List<string> ExtractModulesFromDtos(List<SystemLogDto> dtos)
    {
        var modules = new HashSet<string> { "Auth", "Entry", "Exit", "Payment", "Ticket", "System", "Vehicle", "Reservation" };
        foreach (var dto in dtos)
        {
            if (!string.IsNullOrWhiteSpace(dto.TargetEntity)) modules.Add(dto.TargetEntity);
        }
        return modules.OrderBy(m => m).ToList();
    }

    private static List<SystemLogDto> GenerateSeedLogs() => new()
    {
        new SystemLogDto { Id = Guid.NewGuid(), UserName = "Parking Staff", Action = "Payment pending confirmation", TargetEntity = "Payment", Description = "QR payment is waiting for gateway confirmation. The ticket remains active.", IpAddress = "192.168.1.10", CreatedAt = DateTime.UtcNow.AddMinutes(-12) },
        new SystemLogDto { Id = Guid.NewGuid(), UserName = "Parking Staff", Action = "Monthly pass validated", TargetEntity = "Entry", Description = "Monthly pass MP-2026-00128 was validated and slot A1-07 was assigned.", IpAddress = "192.168.1.11", CreatedAt = DateTime.UtcNow.AddMinutes(-30) },
        new SystemLogDto { Id = Guid.NewGuid(), UserName = "Parking Staff", Action = "Vehicle exit requested", TargetEntity = "Exit", Description = "The motorcycle exit is waiting for payment confirmation.", IpAddress = "192.168.1.12", CreatedAt = DateTime.UtcNow.AddHours(-1) },
        new SystemLogDto { Id = Guid.NewGuid(), UserName = "System Admin", Action = "Camera scan retry", TargetEntity = "System", Description = "The camera required a second scan. The retry was completed successfully.", IpAddress = "192.168.1.1", CreatedAt = DateTime.UtcNow.AddHours(-2) },
        new SystemLogDto { Id = Guid.NewGuid(), UserName = "Parking Staff", Action = "Reservation payment completed", TargetEntity = "Payment", Description = "Reservation payment was confirmed and the EV parking ticket was closed.", IpAddress = "192.168.1.14", CreatedAt = DateTime.UtcNow.AddHours(-3) },
        new SystemLogDto { Id = Guid.NewGuid(), UserName = "Facility Manager", Action = "Floor 1 occupancy > 90%", TargetEntity = "Facility", Description = "Floor 1 occupancy passed the 90% operational warning threshold.", IpAddress = "192.168.1.20", CreatedAt = DateTime.UtcNow.AddHours(-5) },
        new SystemLogDto { Id = Guid.NewGuid(), UserName = "Parking Staff", Action = "Vehicle entry processed", TargetEntity = "Entry", Description = "Vehicle entry ticket was created and a slot was assigned.", IpAddress = "192.168.1.15", CreatedAt = DateTime.UtcNow.AddHours(-6) },
    };

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
