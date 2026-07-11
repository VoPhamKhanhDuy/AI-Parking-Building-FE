namespace ParkingSystem.Application.Common.Interfaces;

/// <summary>
/// Unit-of-work abstraction over the persistence layer. Repositories share
/// one UoW; <see cref="SaveChangesAsync"/> flushes all pending changes atomically.
/// </summary>
public interface IUnitOfWork
{
    Task<int> SaveChangesAsync(CancellationToken cancellationToken = default);
}