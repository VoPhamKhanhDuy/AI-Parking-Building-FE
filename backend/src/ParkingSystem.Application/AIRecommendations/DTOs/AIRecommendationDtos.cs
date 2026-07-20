using ParkingSystem.Domain.Enums;

namespace ParkingSystem.Application.AIRecommendations.DTOs;

/// <summary>One fallback / runner-up slot returned alongside the top pick.</summary>
public class AIRecommendationAlternativeDto
{
    public Guid SlotId { get; set; }
    public string SlotCode { get; set; } = string.Empty;
    public string ZoneName { get; set; } = string.Empty;
    public string FloorName { get; set; } = string.Empty;
    public double Score { get; set; }
    public string Reason { get; set; } = string.Empty;
}

/// <summary>Top-level response for POST /api/ai-recommendations/slot.</summary>
public class AIRecommendationListDto
{
    public Guid RecommendedSlotId { get; set; }
    public string RecommendedSlotCode { get; set; } = string.Empty;
    public string RecommendedZoneName { get; set; } = string.Empty;
    public string RecommendedFloorName { get; set; } = string.Empty;
    public decimal Score { get; set; }
    public string Explanation { get; set; } = string.Empty;
    public IReadOnlyList<AIRecommendationAlternativeDto> Alternatives { get; set; } = Array.Empty<AIRecommendationAlternativeDto>();
}

/// <summary>Request body — the only validator target in this module.</summary>
public class RequestRecommendationRequest
{
    public string LicensePlate { get; set; } = string.Empty;
    public VehicleTypeCategory VehicleCategory { get; set; } = VehicleTypeCategory.Car;
    public TicketType TicketType { get; set; } = TicketType.Hourly;
}
