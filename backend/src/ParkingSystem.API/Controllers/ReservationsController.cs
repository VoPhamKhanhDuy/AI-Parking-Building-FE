using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using ParkingSystem.Application.Reservations.DTOs;
using ParkingSystem.Application.Reservations.Interfaces;
using ParkingSystem.Domain.Enums;

namespace ParkingSystem.API.Controllers;

[ApiController]
[Route("api/reservations")]
[Authorize]
public class ReservationsController : ControllerBase
{
    private readonly IReservationService _service;

    public ReservationsController(IReservationService service) => _service = service;

    [HttpGet]
    public async Task<ActionResult<ReservationListResponse>> GetAll(
        [FromQuery] string? search,
        [FromQuery] ReservationStatus? status,
        [FromQuery] Guid? vehicleId,
        CancellationToken ct)
        => Ok(await _service.ListAsync(search, status, vehicleId, ct));

    [HttpGet("{id:guid}")]
    public async Task<ActionResult<ReservationDto>> GetById(Guid id, CancellationToken ct)
    {
        var dto = await _service.GetByIdAsync(id, ct);
        return dto == null ? NotFound() : Ok(dto);
    }

    [HttpGet("by-code/{code}")]
    public async Task<ActionResult<ReservationDto>> GetByCode(string code, CancellationToken ct)
    {
        var dto = await _service.GetByCodeAsync(code, ct);
        return dto == null ? NotFound() : Ok(dto);
    }

    [HttpPost]
    [Authorize(Roles = "Admin,Manager,Staff")]
    public async Task<ActionResult<ReservationDto>> Create(
        [FromBody] CreateReservationRequest req,
        CancellationToken ct)
    {
        var dto = await _service.CreateAsync(req, GetCurrentUserId(), ct);
        return CreatedAtAction(nameof(GetById), new { id = dto.Id }, dto);
    }

    [HttpPost("{id:guid}/confirm")]
    [Authorize(Roles = "Admin,Manager")]
    public async Task<ActionResult<ReservationDto>> Confirm(Guid id, CancellationToken ct)
        => Ok(await _service.ConfirmAsync(id, ct));

    [HttpPost("{id:guid}/check-in")]
    public async Task<ActionResult<ReservationDto>> CheckIn(Guid id, CancellationToken ct)
        => Ok(await _service.CheckInAsync(id, ct));

    [HttpPost("{id:guid}/complete")]
    public async Task<ActionResult<ReservationDto>> Complete(Guid id, CancellationToken ct)
        => Ok(await _service.CompleteAsync(id, ct));

    [HttpPost("{id:guid}/cancel")]
    public async Task<ActionResult<ReservationDto>> Cancel(
        Guid id,
        [FromBody] CancelReservationRequest? body,
        CancellationToken ct)
        => Ok(await _service.CancelAsync(id, body, ct));

    private Guid? GetCurrentUserId()
    {
        var sub = User.FindFirst("sub")?.Value ?? User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value;
        return Guid.TryParse(sub, out var id) ? id : null;
    }
}
