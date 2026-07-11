using Microsoft.Extensions.Logging.Abstractions;
using ParkingSystem.Application.Common.Interfaces;
using ParkingSystem.Application.SystemLogs.Services;
using ParkingSystem.Domain.Entities;
using ParkingSystem.Tests.Common;

namespace ParkingSystem.Tests.SystemLogs;

/// <summary>
/// Unit tests for <see cref="SystemLogService"/> — covers the happy
/// path, the null-guard, the empty-Action guard, and the "swallow I/O
/// errors so the caller never breaks" guarantee.
/// </summary>
public class SystemLogServiceTests
{
    private static (SystemLogService Svc,
                    InMemoryRepository<SystemLog> Logs,
                    FailingUnitOfWork Uow)
        Build(FailingUnitOfWork? uow = null)
    {
        var logs = new InMemoryRepository<SystemLog>();
        var actualUow = uow ?? new FailingUnitOfWork();
        var svc = new SystemLogService(logs, actualUow, NullLogger<SystemLogService>.Instance);
        return (svc, logs, actualUow);
    }

    [Fact]
    public async Task LogAsync_PersistsRow_AndCommits()
    {
        var (svc, logs, uow) = Build();

        var entry = new SystemLog
        {
            Action = "POST /api/vehicles",
            UserId = Guid.NewGuid(),
            IpAddress = "127.0.0.1",
            Description = "test"
        };

        await svc.LogAsync(entry);

        Assert.Single(logs.All);
        Assert.Equal("POST /api/vehicles", logs.All[0].Action);
        Assert.Equal(1, uow.SaveChangesCallCount);
    }

    [Fact]
    public async Task LogAsync_WithNullEntry_NoOp()
    {
        var (svc, logs, uow) = Build();

        await svc.LogAsync(null!);

        Assert.Empty(logs.All);
        Assert.Equal(0, uow.SaveChangesCallCount);
    }

    [Fact]
    public async Task LogAsync_WithEmptyAction_Skipped()
    {
        var (svc, logs, uow) = Build();

        await svc.LogAsync(new SystemLog { Action = "" });

        Assert.Empty(logs.All);
        Assert.Equal(0, uow.SaveChangesCallCount);
    }

    [Fact]
    public async Task LogAsync_PreservesTargetEntityFields()
    {
        var (svc, logs, _) = Build();
        var userId = Guid.NewGuid();
        var targetId = Guid.NewGuid();

        await svc.LogAsync(new SystemLog
        {
            Action = "DELETE /api/vehicles/{id}",
            UserId = userId,
            TargetEntity = "Vehicle",
            TargetEntityId = targetId,
            IpAddress = "10.0.0.5"
        });

        var row = Assert.Single(logs.All);
        Assert.Equal(userId, row.UserId);
        Assert.Equal("Vehicle", row.TargetEntity);
        Assert.Equal(targetId, row.TargetEntityId);
        Assert.Equal("10.0.0.5", row.IpAddress);
    }

    [Fact]
    public async Task LogAsync_WhenRepositoryThrows_DoesNotPropagate()
    {
        var failingLogs = new ThrowingRepository<SystemLog>();
        var uow = new FailingUnitOfWork();
        var svc = new SystemLogService(failingLogs, uow, NullLogger<SystemLogService>.Instance);

        // Should NOT throw — audit failures must be silent to the caller.
        await svc.LogAsync(new SystemLog { Action = "GET /api/x" });

        Assert.Equal(0, uow.SaveChangesCallCount);
    }

    [Fact]
    public async Task LogAsync_WhenSaveChangesThrows_DoesNotPropagate()
    {
        var logs = new InMemoryRepository<SystemLog>();
        var uow = new FailingUnitOfWork(throwOnSave: true);
        var svc = new SystemLogService(logs, uow, NullLogger<SystemLogService>.Instance);

        await svc.LogAsync(new SystemLog { Action = "GET /api/x" });

        // Row was added to repository, but SaveChanges failed — and that
        // is the contract: we swallow the failure.
        Assert.Single(logs.All);
        Assert.Equal(1, uow.SaveChangesCallCount);
    }

    // ---------- test doubles ----------

    private sealed class FailingUnitOfWork : IUnitOfWork
    {
        private readonly bool _throwOnSave;
        public int SaveChangesCallCount { get; private set; }

        public FailingUnitOfWork(bool throwOnSave = false) { _throwOnSave = throwOnSave; }

        public Task<int> SaveChangesAsync(CancellationToken cancellationToken = default)
        {
            SaveChangesCallCount++;
            if (_throwOnSave) throw new InvalidOperationException("simulated DB outage");
            return Task.FromResult(1);
        }
    }

    private sealed class ThrowingRepository<T> : ParkingSystem.Application.Common.Interfaces.IRepository<T>
        where T : class
    {
        public Task<T?> GetByIdAsync(object id, CancellationToken ct = default) => Task.FromResult<T?>(null);
        public Task<IReadOnlyList<T>> ListAllAsync(CancellationToken ct = default) => Task.FromResult<IReadOnlyList<T>>(new List<T>());
        public Task<IReadOnlyList<T>> ListAsync(ParkingSystem.Domain.Common.ISpecification<T> spec, CancellationToken ct = default)
            => Task.FromResult<IReadOnlyList<T>>(new List<T>());
        public Task<T?> FirstOrDefaultAsync(ParkingSystem.Domain.Common.ISpecification<T> spec, CancellationToken ct = default)
            => Task.FromResult<T?>(null);
        public Task<int> CountAsync(ParkingSystem.Domain.Common.ISpecification<T>? spec = null, CancellationToken ct = default)
            => Task.FromResult(0);

        public Task AddAsync(T entity, CancellationToken ct = default)
            => throw new InvalidOperationException("simulated repo outage");

        public void Update(T entity) { }
        public void Remove(T entity) { }
    }
}