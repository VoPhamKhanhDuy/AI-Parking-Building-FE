using ParkingSystem.Application.AIRecommendations.DTOs;

namespace ParkingSystem.Application.AIRecommendations.Interfaces;

public interface IAIRecommendationService
{
    /// <summary>
    /// Recommend the best available slot for a vehicle. If the caller does not
    /// already have a <see cref="Domain.Entities.Vehicle"/> row, one is created
    /// automatically and the request is logged to <c>AIRecommendationLogs</c>.
    /// </summary>
    Task<AIRecommendationListDto> RecommendAsync(RequestRecommendationRequest req, CancellationToken ct = default);
}
