using System.Linq.Expressions;

namespace ParkingSystem.Domain.Common;

/// <summary>
/// Marker + contract for query specifications. A specification encapsulates a
/// LINQ predicate plus ordering/paging. Application services compose queries
/// using these instead of leaking IQueryable types from Infrastructure.
/// </summary>
/// <typeparam name="T">Entity type this specification targets.</typeparam>
public interface ISpecification<T>
{
    Expression<Func<T, bool>>? Criteria { get; }
    List<Expression<Func<T, object>>> Includes { get; }
    List<string> IncludeStrings { get; }
    Expression<Func<T, object>>? OrderBy { get; }
    Expression<Func<T, object>>? OrderByDescending { get; }
    int? Take { get; }
    int? Skip { get; }
    bool AsNoTracking { get; }
    bool IsPagingEnabled { get; }
}

public abstract class Specification<T> : ISpecification<T>
{
    public Expression<Func<T, bool>>? Criteria { get; private set; }
    public List<Expression<Func<T, object>>> Includes { get; } = new();
    public List<string> IncludeStrings { get; } = new();
    public Expression<Func<T, object>>? OrderBy { get; private set; }
    public Expression<Func<T, object>>? OrderByDescending { get; private set; }
    public int? Take { get; private set; }
    public int? Skip { get; private set; }
    public bool AsNoTracking { get; private set; }
    public bool IsPagingEnabled => Skip.HasValue && Take.HasValue;

    protected void AddCriteria(Expression<Func<T, bool>> criteria) => Criteria = criteria;
    protected void AddInclude(Expression<Func<T, object>> include) => Includes.Add(include);
    protected void AddInclude(string include) => IncludeStrings.Add(include);
    protected void ApplyOrderBy(Expression<Func<T, object>> orderBy) => OrderBy = orderBy;
    protected void ApplyOrderByDescending(Expression<Func<T, object>> orderBy) => OrderByDescending = orderBy;
    protected void ApplyPaging(int skip, int take)
    {
        Skip = skip;
        Take = take;
    }
    protected void ApplyNoTracking() => AsNoTracking = true;
}