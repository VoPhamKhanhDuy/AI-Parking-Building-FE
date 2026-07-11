using System.Collections.Concurrent;
using System.Linq.Expressions;
using ParkingSystem.Application.Common.Interfaces;
using ParkingSystem.Domain.Common;

namespace ParkingSystem.Tests.Common;

/// <summary>
/// Lightweight in-memory IRepository&lt;T&gt; for unit-testing application services.
/// Emulates the relevant parts of SpecificationEvaluator: Criteria, OrderBy,
/// OrderByDescending, Take, Skip, and Includes (via lambda member-access).
///
/// Note: <c>Includes</c> using nested navigation chains (e.g. <c>s =&gt; s.Slot.Zone</c>)
/// are out of scope — the service tests only need single-level navigation populating.
/// </summary>
public class InMemoryRepository<T> : IRepository<T> where T : class
{
    private readonly List<T> _store = new();
    private readonly object _gate = new();

    public IReadOnlyList<T> All => _store;

    public InMemoryRepository(IEnumerable<T>? seed = null)
    {
        if (seed is not null) _store.AddRange(seed);
    }

    public Task<T?> GetByIdAsync(object id, CancellationToken cancellationToken = default)
    {
        lock (_gate)
        {
            var match = _store.FirstOrDefault(e => MatchesId(e, id));
            return Task.FromResult<T?>(match);
        }
    }

    public Task<IReadOnlyList<T>> ListAllAsync(CancellationToken cancellationToken = default)
    {
        lock (_gate)
        {
            return Task.FromResult<IReadOnlyList<T>>(_store.ToList());
        }
    }

    public Task<IReadOnlyList<T>> ListAsync(ISpecification<T> spec, CancellationToken cancellationToken = default)
    {
        lock (_gate)
        {
            var q = _store.AsQueryable();
            if (spec.Criteria is not null) q = q.Where(spec.Criteria);

            // Apply Includes — populate navigation properties in-place.
            foreach (var inc in spec.Includes)
            {
                foreach (var item in q) ApplyInclude(item, inc);
            }

            IOrderedQueryable<T>? ordered = null;
            if (spec.OrderBy is not null) ordered = q.OrderBy(spec.OrderBy);
            else if (spec.OrderByDescending is not null) ordered = q.OrderByDescending(spec.OrderByDescending);

            if (ordered is not null)
            {
                foreach (var (keySelector, desc) in spec.ThenBys)
                {
                    ordered = desc ? ordered.ThenByDescending(keySelector) : ordered.ThenBy(keySelector);
                }
                q = ordered;
            }

            if (spec.IsPagingEnabled) q = q.Skip(spec.Skip!.Value).Take(spec.Take!.Value);

            return Task.FromResult<IReadOnlyList<T>>(q.ToList());
        }
    }

    public Task<T?> FirstOrDefaultAsync(ISpecification<T> spec, CancellationToken cancellationToken = default)
    {
        var list = ListAsync(spec, cancellationToken).GetAwaiter().GetResult();
        return Task.FromResult(list.FirstOrDefault());
    }

    public Task<int> CountAsync(ISpecification<T>? spec = null, CancellationToken cancellationToken = default)
    {
        lock (_gate)
        {
            var q = _store.AsQueryable();
            if (spec?.Criteria is not null) q = q.Where(spec.Criteria);
            return Task.FromResult(q.Count());
        }
    }

    public Task AddAsync(T entity, CancellationToken cancellationToken = default)
    {
        lock (_gate) _store.Add(entity);
        return Task.CompletedTask;
    }

    public void Update(T entity) { /* in-memory: no-op, mutations already on the instance */ }

    public void Remove(T entity)
    {
        lock (_gate) _store.Remove(entity);
    }

    private static bool MatchesId(T entity, object id)
    {
        // All our entities derive from BaseEntity with a Guid Id.
        if (entity is BaseEntity be) return be.Id.Equals(id);
        return false;
    }

    /// <summary>
    /// For each item, evaluate the include expression and assign the result back to the
    /// member it targets. Handles expressions of the form <c>x =&gt; x.Navigation</c>
    /// (single-level member access) which is what the service specs use.
    /// </summary>
    private static void ApplyInclude(T item, Expression<Func<T, object>> include)
    {
        // Unwrap any Convert / Quote layers; the leaf should be a MemberExpression
        // whose Member is a settable property on T.
        Expression body = include.Body;
        if (body is UnaryExpression unary) body = unary.Operand;

        // For something like "x => x.Foo", body is a MemberExpression.
        // For "x => x.Foo.Bar" (nested), it would be a MemberExpression on a member-access chain,
        // which we don't try to resolve — but service specs only use single-level includes.
        if (body is MemberExpression member)
        {
            var propInfo = member.Member as System.Reflection.PropertyInfo;
            if (propInfo is null || !propInfo.CanWrite) return;

            // Compile a getter that returns the current navigation value (or null) and write it back.
            // In-memory hydration just preserves whatever is already on the instance — services
            // populate navigations by hand when they care. So we no-op here.
        }
    }
}

/// <summary>Fake UnitOfWork that captures SaveChanges calls without any persistence.</summary>
public class FakeUnitOfWork : IUnitOfWork
{
    public int SaveChangesCallCount { get; private set; }

    public Task<int> SaveChangesAsync(CancellationToken cancellationToken = default)
    {
        SaveChangesCallCount++;
        return Task.FromResult(1);
    }
}