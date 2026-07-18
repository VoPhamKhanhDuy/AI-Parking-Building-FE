using Microsoft.EntityFrameworkCore;
using ParkingSystem.Application.Common.Interfaces;
using ParkingSystem.Domain.Common;

namespace ParkingSystem.Infrastructure.Persistence;

/// <summary>
/// EF Core-backed implementation of <see cref="IRepository{T}"/>.
/// All query composition is delegated to <see cref="SpecificationEvaluator{T}"/>.
/// </summary>
public class Repository<T> : IRepository<T> where T : class
{
    private readonly AppDbContext _db;
    private readonly DbSet<T> _dbSet;

    public Repository(AppDbContext db)
    {
        _db = db;
        _dbSet = db.Set<T>();
    }

    public async Task<T?> GetByIdAsync(object id, CancellationToken cancellationToken = default)
    {
        return await _dbSet.FindAsync(new[] { id }, cancellationToken);
    }

    public async Task<IReadOnlyList<T>> ListAllAsync(CancellationToken cancellationToken = default)
    {
        return await _dbSet.ToListAsync(cancellationToken);
    }

    public async Task<IReadOnlyList<T>> ListAsync(ISpecification<T> specification, CancellationToken cancellationToken = default)
    {
        var query = SpecificationEvaluator<T>.GetQuery(_dbSet.AsQueryable(), specification);
        return await query.ToListAsync(cancellationToken);
    }

    public async Task<T?> FirstOrDefaultAsync(ISpecification<T> specification, CancellationToken cancellationToken = default)
    {
        var query = SpecificationEvaluator<T>.GetQuery(_dbSet.AsQueryable(), specification);
        return await query.FirstOrDefaultAsync(cancellationToken);
    }

    public async Task<int> CountAsync(ISpecification<T>? specification = null, CancellationToken cancellationToken = default)
    {
        if (specification is null)
        {
            return await _dbSet.CountAsync(cancellationToken);
        }

        var query = SpecificationEvaluator<T>.GetQuery(_dbSet.AsQueryable(), specification);
        return await query.CountAsync(cancellationToken);
    }

    public async Task AddAsync(T entity, CancellationToken cancellationToken = default)
    {
        await _dbSet.AddAsync(entity, cancellationToken);
    }

    public void Update(T entity)
    {
        _dbSet.Update(entity);
    }

    public void Remove(T entity)
    {
        _dbSet.Remove(entity);
    }
}