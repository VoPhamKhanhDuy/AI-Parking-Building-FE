using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using ParkingSystem.Application.ParkingSessions.DTOs;
using ParkingSystem.Application.ParkingSessions.Interfaces;
using ParkingSystem.Domain.Enums;

namespace ParkingSystem.API.Controllers;

[ApiController]
[Route("api/parking-sessions")]
public class ParkingSessionsController : ControllerBase
{
    private readonly IParkingSessionService _service;

    public ParkingSessionsController(IParkingSessionService service) => _service = service;

    /// <summary>List parking sessions with optional filters.</summary>
    [HttpGet]
    [Authorize]
    [ProducesResponseType(typeof(IReadOnlyList<ParkingSessionDto>), StatusCodes.Status200OK)]
    public async Task<ActionResult<IReadOnlyList<ParkingSessionDto>>> List(
        [FromQuery] SessionStatus? status,
        [FromQuery] Guid? vehicleId,
        [FromQuery] Guid? slotId,
        [FromQuery] Guid? ticketId,
        [FromQuery] DateTime? fromUtc,
        [FromQuery] DateTime? toUtc,
        CancellationToken ct)
        => Ok(await _service.ListAsync(status, vehicleId, slotId, ticketId, fromUtc, toUtc, ct));

    /// <summary>Get a parking session by id.</summary>
    [HttpGet("{id:guid}")]
    [Authorize]
    [ProducesResponseType(typeof(ParkingSessionDto), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<ActionResult<ParkingSessionDto>> GetById(Guid id, CancellationToken ct)
    {
        var dto = await _service.GetByIdAsync(id, ct);
        return dto is null ? NotFound() : Ok(dto);
    }

    /// <summary>Get the active session attached to a ticket (1-to-1).</summary>
    [HttpGet("active-by-ticket/{ticketId:guid}")]
    [Authorize]
    [ProducesResponseType(typeof(ParkingSessionDto), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<ActionResult<ParkingSessionDto>> GetActiveByTicket(Guid ticketId, CancellationToken ct)
    {
        var dto = await _service.GetActiveByTicketAsync(ticketId, ct);
        return dto is null ? NotFound() : Ok(dto);
    }

    /// <summary>Get the active session occupying a given slot.</summary>
    [HttpGet("active-by-slot/{slotId:guid}")]
    [Authorize]
    [ProducesResponseType(typeof(ParkingSessionDto), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<ActionResult<ParkingSessionDto>> GetActiveBySlot(Guid slotId, CancellationToken ct)
    {
        var dto = await _service.GetActiveBySlotAsync(slotId, ct);
        return dto is null ? NotFound() : Ok(dto);
    }

    /// <summary>Get the active session for a given vehicle.</summary>
    [HttpGet("active-by-vehicle/{vehicleId:guid}")]
    [Authorize]
    [ProducesResponseType(typeof(ParkingSessionDto), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<ActionResult<ParkingSessionDto>> GetActiveByVehicle(Guid vehicleId, CancellationToken ct)
    {
        var dto = await _service.GetActiveByVehicleAsync(vehicleId, ct);
        return dto is null ? NotFound() : Ok(dto);
    }

    /// <summary>Start a new parking session — claims the slot and activates the ticket.</summary>
    [HttpPost]
    [Authorize(Roles = "Admin,Operator,Attendant")]
    [ProducesResponseType(typeof(ParkingSessionDto), StatusCodes.Status201Created)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    [ProducesResponseType(StatusCodes.Status409Conflict)]
    public async Task<ActionResult<ParkingSessionDto>> Start(
        [FromBody] StartSessionRequest req, CancellationToken ct)
    {
        var dto = await _service.StartAsync(req, ct);
        return CreatedAtAction(nameof(GetById), new { id = dto.Id }, dto);
    }

    /// <summary>End an active session — frees the slot and marks the ticket Completed.</summary>
    [HttpPost("{id:guid}/end")]
    [Authorize(Roles = "Admin,Operator,Attendant")]
    [ProducesResponseType(typeof(ParkingSessionDto), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    [ProducesResponseType(StatusCodes.Status409Conflict)]
    public async Task<ActionResult<ParkingSessionDto>> End(
        Guid id, [FromBody] EndSessionRequest? body, CancellationToken ct)
        => Ok(await _service.EndAsync(id, body ?? new EndSessionRequest(), ct));

    /// <summary>Cancel a still-active session (releases the slot without creating a billable exit).</summary>
    [HttpPost("{id:guid}/cancel")]
    [Authorize(Roles = "Admin,Operator")]
    [ProducesResponseType(typeof(ParkingSessionDto), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<ActionResult<ParkingSessionDto>> Cancel(Guid id, CancellationToken ct)
        => Ok(await _service.CancelAsync(id, ct));
}