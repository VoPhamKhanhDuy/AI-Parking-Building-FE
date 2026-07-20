using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using ParkingSystem.Application.AIRecommendations.DTOs;
using ParkingSystem.Application.AIRecommendations.Interfaces;

namespace ParkingSystem.API.Controllers;

[ApiController]
[Route("api/ai-recommendations")]
public class AIRecommendationsController : ControllerBase
{
    private readonly IAIRecommendationService _service;

    public AIRecommendationsController(IAIRecommendationService service) => _service = service;

    /// <summary>Recommend the best available slot for a vehicle.</summary>
    [HttpPost("slot")]
    [Authorize]
    [ProducesResponseType(typeof(AIRecommendationListDto), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    public async Task<ActionResult<AIRecommendationListDto>> RecommendSlot(
        [FromBody] RequestRecommendationRequest req, CancellationToken ct)
        => Ok(await _service.RecommendAsync(req, ct));
}
