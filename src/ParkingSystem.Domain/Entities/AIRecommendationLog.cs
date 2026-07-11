using ParkingSystem.Domain.Common;
using ParkingSystem.Domain.Enums;

namespace ParkingSystem.Domain.Entities;

/// <summary>
/// One row per AI recommendation request. <see cref="AlternativeSlotsJson"/>
/// is stored as PostgreSQL <c>jsonb</c> and contains up to 5 fallback slots.
/// </summary>
public class AIRecommendationLog : BaseEntity
{
    public Guid VehicleId { get; set; }
    public Vehicle? Vehicle { get; set; }

    public Guid? RecommendedSlotId { get; set; }
    public ParkingSlot? RecommendedSlot { get; set; }

    public VehicleTypeCategory VehicleCategory { get; set; }

    public TicketType TicketType { get; set; }

    public decimal FinalScore { get; set; }

    public string Explanation { get; set; } = string.Empty;

    /// <summary>
    /// JSON array of alternative slot suggestions, e.g.:
    /// <code>[{"slotId":"...","score":78.4,"reason":"..."}]</code>
    /// Stored as <c>jsonb</c> for indexability and flexibility.
    /// </summary>
    public string AlternativeSlotsJson { get; set; } = "[]";

    /// <summary>True when the AI service failed / timed out and the caller fell back to manual.</summary>
    public bool AiUnavailable { get; set; }

    public long RecommendationLatencyMs { get; set; }
}