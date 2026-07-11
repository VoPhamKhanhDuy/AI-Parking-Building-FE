namespace ParkingSystem.Tests.Common;

/// <summary>Deterministic TimeProvider for tests; pin GetUtcNow to a fixed instant.</summary>
public sealed class FixedTimeProvider : TimeProvider
{
    private readonly DateTimeOffset _now;
    public FixedTimeProvider(DateTime utc) { _now = new DateTimeOffset(utc, TimeSpan.Zero); }
    public override DateTimeOffset GetUtcNow() => _now;
}