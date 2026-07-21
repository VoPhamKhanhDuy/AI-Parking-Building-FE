using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using ParkingSystem.Application.Tickets.DTOs;
using ParkingSystem.Application.Tickets.Interfaces;
using ParkingSystem.Domain.Enums;

namespace ParkingSystem.API.Controllers;

[ApiController]
[Route("api/tickets")]
public class ParkingTicketsController : ControllerBase
{
    private readonly IParkingTicketService _service;

    public ParkingTicketsController(IParkingTicketService service) => _service = service;

    /// <summary>List tickets with optional filters.</summary>
    [HttpGet]
    [Authorize]
    [ProducesResponseType(typeof(IReadOnlyList<ParkingTicketDto>), StatusCodes.Status200OK)]
    public async Task<ActionResult<IReadOnlyList<ParkingTicketDto>>> List(
        [FromQuery] TicketStatus? status,
        [FromQuery] Guid? vehicleId,
        [FromQuery] DateTime? fromUtc,
        [FromQuery] DateTime? toUtc,
        CancellationToken ct)
        => Ok(await _service.ListAsync(status, vehicleId, fromUtc, toUtc, ct));

    /// <summary>Get ticket by id.</summary>
    [HttpGet("{id:guid}")]
    [Authorize]
    [ProducesResponseType(typeof(ParkingTicketDto), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<ActionResult<ParkingTicketDto>> GetById(Guid id, CancellationToken ct)
    {
        var dto = await _service.GetByIdAsync(id, ct);
        return dto is null ? NotFound() : Ok(dto);
    }

    /// <summary>Lookup a ticket by its human-readable code (e.g. printed on the slip).</summary>
    [HttpGet("by-code/{code}")]
    [Authorize]
    [ProducesResponseType(typeof(ParkingTicketDto), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<ActionResult<ParkingTicketDto>> GetByCode(string code, CancellationToken ct)
    {
        var dto = await _service.GetByCodeAsync(code, ct);
        return dto is null ? NotFound() : Ok(dto);
    }

    /// <summary>Get the currently open ticket for a vehicle, if any.</summary>
    [HttpGet("active-by-vehicle/{vehicleId:guid}")]
    [Authorize]
    [ProducesResponseType(typeof(ParkingTicketDto), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<ActionResult<ParkingTicketDto>> GetActiveByVehicle(Guid vehicleId, CancellationToken ct)
    {
        var dto = await _service.GetActiveByVehicleAsync(vehicleId, ct);
        return dto is null ? NotFound() : Ok(dto);
    }

    /// <summary>Issue a new ticket (vehicle not yet arrived).</summary>
    [HttpPost]
    [Authorize(Roles = "Admin,Manager,Staff")]
    [ProducesResponseType(typeof(ParkingTicketDto), StatusCodes.Status201Created)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status409Conflict)]
    public async Task<ActionResult<ParkingTicketDto>> Issue(
        [FromBody] IssueTicketRequest req, CancellationToken ct)
    {
        var dto = await _service.IssueAsync(req, ct);
        return CreatedAtAction(nameof(GetById), new { id = dto.Id }, dto);
    }

    /// <summary>Mark the ticket as entered (Issued -> Active).</summary>
    [HttpPost("{id:guid}/check-in")]
    [Authorize(Roles = "Admin,Manager,Staff")]
    [ProducesResponseType(typeof(ParkingTicketDto), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<ActionResult<ParkingTicketDto>> CheckIn(
        Guid id,
        [FromBody] CheckInRequest? body,
        CancellationToken ct)
        => Ok(await _service.CheckInAsync(id, body?.EntryTime, ct));

    /// <summary>Close the ticket and compute the fee.</summary>
    [HttpPost("{id:guid}/check-out")]
    [Authorize(Roles = "Admin,Manager,Staff")]
    [ProducesResponseType(typeof(CheckOutResult), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<ActionResult<CheckOutResult>> CheckOut(
        Guid id,
        [FromBody] CheckOutTicketRequest? body,
        CancellationToken ct)
        => Ok(await _service.CheckOutAsync(id, body ?? new CheckOutTicketRequest(), ct));

    /// <summary>Cancel a still-open ticket.</summary>
    [HttpPost("{id:guid}/cancel")]
    [Authorize(Roles = "Admin,Manager")]
    [ProducesResponseType(typeof(ParkingTicketDto), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<ActionResult<ParkingTicketDto>> Cancel(
        Guid id,
        [FromBody] CancelTicketRequest? body,
        CancellationToken ct)
        => Ok(await _service.CancelAsync(id, body ?? new CancelTicketRequest(), ct));

    public class CheckInRequest
    {
        public DateTime? EntryTime { get; set; }
    }
}