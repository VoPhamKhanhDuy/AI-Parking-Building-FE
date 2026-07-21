using ParkingSystem.Domain.Entities;

namespace ParkingSystem.Application.SystemLogs.Interfaces;

/// <summary>
/// Audit-trail writer used by the API layer's
/// <c>SystemLogActionFilter</c>. Implementations must persist at least
/// one row per invocation; they should never throw to the caller — losing
/// an audit row is preferable to failing the original request.
/// </summary>
public interface ISystemLogService
{
    /// <summary>
    /// Persist a single audit row. Implementations should swallow I/O
    /// errors after logging them so the calling request is never
    /// affected by an audit-pipeline failure.
    /// </summary>
    Task LogAsync(SystemLog entry, CancellationToken cancellationToken = default);
}