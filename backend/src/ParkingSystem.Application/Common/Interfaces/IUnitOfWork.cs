namespace ParkingSystem.Application.Common.Interfaces;

/// <summary>
/// Unit-of-work abstraction over the persistence layer. Repositories share
/// one UoW; <see cref="SaveChangesAsync"/> flushes all pending changes atomically.
/// </summary>
public interface IUnitOfWork
{
    /// <summary>
    /// Saves all pending changes atomically within the current implicit transaction.
    /// </summary>
    Task<int> SaveChangesAsync(CancellationToken cancellationToken = default);

    /// <summary>
    /// Begins an explicit database transaction with the specified isolation level.
    /// Use <see cref="BeginTransactionAsync"/> before a series of operations that must be atomic.
    /// </summary>
    /// <param name="isolationLevel">SQL isolation level. Defaults to Serializable for critical operations.</param>
    Task<IAsyncDisposable> BeginTransactionAsync(
        System.Data.IsolationLevel isolationLevel = System.Data.IsolationLevel.Serializable,
        CancellationToken cancellationToken = default);

    /// <summary>
    /// Commits the current transaction. Must be called after <see cref="BeginTransactionAsync"/>.
    /// </summary>
    Task CommitTransactionAsync(CancellationToken cancellationToken = default);

    /// <summary>
    /// Rolls back the current transaction. Must be called after <see cref="BeginTransactionAsync"/>.
    /// </summary>
    Task RollbackTransactionAsync(CancellationToken cancellationToken = default);
}