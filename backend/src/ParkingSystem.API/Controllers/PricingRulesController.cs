using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using ParkingSystem.Application.PricingRules.DTOs;
using ParkingSystem.Application.PricingRules.Interfaces;
using ParkingSystem.Domain.Enums;

namespace ParkingSystem.API.Controllers;

[ApiController]
[Route("api/pricing-rules")]
public class PricingRulesController : ControllerBase
{
    private readonly IPricingRuleService _service;

    public PricingRulesController(IPricingRuleService service) => _service = service;

    /// <summary>List pricing rules with optional filters.</summary>
    [HttpGet]
    [Authorize]
    [ProducesResponseType(typeof(IReadOnlyList<PricingRuleDto>), StatusCodes.Status200OK)]
    public async Task<ActionResult<IReadOnlyList<PricingRuleDto>>> List(
        [FromQuery] Guid? vehicleTypeId,
        [FromQuery] TicketType? ticketType,
        [FromQuery] bool? isActive,
        CancellationToken ct)
        => Ok(await _service.ListAsync(vehicleTypeId, ticketType, isActive, ct));

    /// <summary>Get a pricing rule by id.</summary>
    [HttpGet("{id:guid}")]
    [Authorize]
    [ProducesResponseType(typeof(PricingRuleDto), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<ActionResult<PricingRuleDto>> GetById(Guid id, CancellationToken ct)
    {
        var dto = await _service.GetByIdAsync(id, ct);
        return dto is null ? NotFound() : Ok(dto);
    }

    /// <summary>Find the rule currently used for billing given vehicle type, ticket kind, and point-in-time.</summary>
    [HttpGet("resolve")]
    [Authorize]
    [ProducesResponseType(typeof(PricingRuleDto), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<ActionResult<PricingRuleDto>> ResolveForBilling(
        [FromQuery] Guid vehicleTypeId,
        [FromQuery] TicketType ticketType,
        [FromQuery] DateTime? atUtc,
        CancellationToken ct)
    {
        var dto = await _service.ResolveForBillingAsync(vehicleTypeId, ticketType, atUtc ?? DateTime.UtcNow, ct);
        return dto is null ? NotFound() : Ok(dto);
    }

    /// <summary>Create a new pricing rule (Admin only — affects all future billing).</summary>
    [HttpPost]
    [Authorize(Roles = "Admin")]
    [ProducesResponseType(typeof(PricingRuleDto), StatusCodes.Status201Created)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    public async Task<ActionResult<PricingRuleDto>> Create(
        [FromBody] CreatePricingRuleRequest req, CancellationToken ct)
    {
        var dto = await _service.CreateAsync(req, ct);
        return CreatedAtAction(nameof(GetById), new { id = dto.Id }, dto);
    }

    /// <summary>Update fields of an existing rule (Admin only).</summary>
    [HttpPatch("{id:guid}")]
    [Authorize(Roles = "Admin")]
    [ProducesResponseType(typeof(PricingRuleDto), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<ActionResult<PricingRuleDto>> Update(
        Guid id, [FromBody] UpdatePricingRuleRequest req, CancellationToken ct)
        => Ok(await _service.UpdateAsync(id, req, ct));

    /// <summary>Enable or disable a pricing rule (Admin only).</summary>
    [HttpPost("{id:guid}/set-active")]
    [Authorize(Roles = "Admin")]
    [ProducesResponseType(typeof(PricingRuleDto), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<ActionResult<PricingRuleDto>> SetActive(
        Guid id, [FromBody] bool isActive, CancellationToken ct)
        => Ok(await _service.SetActiveAsync(id, isActive, ct));

    /// <summary>Soft-delete a pricing rule (Admin only).</summary>
    [HttpDelete("{id:guid}")]
    [Authorize(Roles = "Admin")]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> Delete(Guid id, CancellationToken ct)
    {
        await _service.DeleteAsync(id, ct);
        return NoContent();
    }
}