using ParkingSystem.Domain.Entities;

namespace ParkingSystem.Application.AIRecommendations.Services;

/// <summary>
/// Deterministic scorer used as the on-device fallback when the external AI
/// service is unavailable. Pure functions on top of already-loaded entities —
/// no EF Core or any persistence concern.
/// </summary>
public static class SlotScorer
{
    private const double CategoryMatchScore = 70.0;
    private const double MaxPriorityScore = 20.0;
    private const double MaxDistanceScore = 10.0;

    public static double Score(ParkingSlot slot, ParkingZone zone, double distance)
    {
        var priorityScore = Math.Min(MaxPriorityScore, zone.Priority * 2.0);
        var distanceScore = Math.Max(0.0, MaxDistanceScore - (distance * 0.5));
        return CategoryMatchScore + priorityScore + distanceScore;
    }

    public static double ResolveDistance(ParkingSlot slot, ParkingZone zone)
        => slot.DistanceToExitOrElevator ?? zone.DistanceToExitOrElevator;

    public static string ExplainDistance(double distance)
    {
        if (distance <= 5) return "Very close to exit/elevator";
        if (distance <= 10) return "Close to exit/elevator";
        return $"~{Math.Round(distance)}m to exit/elevator";
    }
}
