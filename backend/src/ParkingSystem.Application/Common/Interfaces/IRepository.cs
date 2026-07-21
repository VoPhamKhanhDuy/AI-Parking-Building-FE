using ParkingSystem.Domain.Common;

namespace ParkingSystem.Application.Common.Interfaces;

/// <summary>
/// Generic repository exposing only Application-defined abstractions.
/// Implementation lives in Infrastructure (EF Core). Application does not
/// depend on EF Core, Npgsql, or any persistence technology.
/// </summary>
public interface IRepository<T> where T : class
{
    Task<T?> GetByIdAsync(object id, CancellationToken cancellationToken = default);
    Task<IReadOnlyList<T>> ListAllAsync(CancellationToken cancellationToken = default);
    Task<IReadOnlyList<T>> ListAsync(ISpecification<T> specification, CancellationToken cancellationToken = default);
    Task<T?> FirstOrDefaultAsync(ISpecification<T> specification, CancellationToken cancellationToken = default);
    Task<int> CountAsync(ISpecification<T>? specification = null, CancellationToken cancellationToken = default);

    Task AddAsync(T entity, CancellationToken cancellationToken = default);
    void Update(T entity);
    void Remove(T entity);
}