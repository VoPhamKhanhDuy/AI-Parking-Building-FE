using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using ParkingSystem.Application.CheckIn.DTOs;
using ParkingSystem.Application.CheckIn.Interfaces;

namespace ParkingSystem.API.Controllers;

/// <summary>
/// Orchestrates the full Vehicle Check-in flow in a single atomic transaction:
/// Vehicle (find-or-create) → Ticket → Session → Slot claim → AI log entry.
/// See PROMPT 01 for the canonical sequence.
/// </summary>
[ApiController]
[Route("api/check-in")]
public class CheckInController : ControllerBase
{
    private readonly ICheckInService _service;

    public CheckInController(ICheckInService service) => _service = service;

    /// <summary>Run a full check-in: register/find vehicle, issue ticket, claim a slot, persist AI log.</summary>
    [HttpPost]
    [Authorize(Roles = "Admin,Manager,Staff")]
    [ProducesResponseType(typeof(CheckInResultDto), StatusCodes.Status201Created)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    [ProducesResponseType(StatusCodes.Status409Conflict)]
    public async Task<ActionResult<CheckInResultDto>> CheckIn(
        [FromBody] CheckInRequest req, CancellationToken ct)
    {
        var dto = await _service.CheckInAsync(req, ct);
        return CreatedAtAction(nameof(CheckIn), new { id = dto.SessionId }, dto);
    }
}
