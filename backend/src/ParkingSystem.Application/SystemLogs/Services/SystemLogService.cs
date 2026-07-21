using Microsoft.Extensions.Logging;
using ParkingSystem.Application.Common.Interfaces;
using ParkingSystem.Application.SystemLogs.Interfaces;
using ParkingSystem.Domain.Entities;

namespace ParkingSystem.Application.SystemLogs.Services;

/// <summary>
/// Default <see cref="ISystemLogService"/> implementation. Writes one
/// row per call via the generic repository, then commits via
/// <see cref="IUnitOfWork"/>. I/O failures are caught and logged so an
/// audit-pipeline outage can never fail the originating API request.
/// </summary>
public class SystemLogService : ISystemLogService
{
    private readonly IRepository<SystemLog> _logs;
    private readonly IUnitOfWork _uow;
    private readonly ILogger<SystemLogService> _logger;

    public SystemLogService(
        IRepository<SystemLog> logs,
        IUnitOfWork uow,
        ILogger<SystemLogService> logger)
    {
        _logs = logs;
        _uow = uow;
        _logger = logger;
    }

    public async Task LogAsync(SystemLog entry, CancellationToken cancellationToken = default)
    {
        if (entry is null) return;

        // Action is required by the schema; never accept an empty audit row.
        if (string.IsNullOrWhiteSpace(entry.Action))
        {
            _logger.LogWarning("SystemLog entry skipped — missing Action.");
            return;
        }

        try
        {
            await _logs.AddAsync(entry, cancellationToken);
            await _uow.SaveChangesAsync(cancellationToken);
        }
        catch (OperationCanceledException)
        {
            // Caller cancelled — propagate.
            throw;
        }
        catch (Exception ex)
        {
            // Audit failures must not break the original request.
            _logger.LogError(ex, "Failed to persist SystemLog entry (Action={Action}).", entry.Action);
        }
    }
}