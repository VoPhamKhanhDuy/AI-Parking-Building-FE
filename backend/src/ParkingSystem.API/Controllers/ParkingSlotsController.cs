using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using ParkingSystem.Application.ParkingStructure.DTOs;
using ParkingSystem.Application.ParkingStructure.Interfaces;
using ParkingSystem.Domain.Enums;

namespace ParkingSystem.API.Controllers;

[ApiController]
[Route("api/slots")]
public class ParkingSlotsController : ControllerBase
{
    private readonly IParkingSlotService _service;

    public ParkingSlotsController(IParkingSlotService service) => _service = service;

    [HttpGet]
    [Authorize]
    public async Task<ActionResult<IReadOnlyList<ParkingSlotDto>>> List(
        [FromQuery] Guid zoneId,
        [FromQuery] SlotStatus? status,
        CancellationToken ct)
    {
        if (zoneId == Guid.Empty) return BadRequest(new { error = "zoneId is required." });
        return Ok(await _service.ListAsync(zoneId, status, ct));
    }

    [HttpGet("{id:guid}")]
    [Authorize]
    public async Task<ActionResult<ParkingSlotDto>> GetById(Guid id, CancellationToken ct)
    {
        var dto = await _service.GetByIdAsync(id, ct);
        return dto is null ? NotFound() : Ok(dto);
    }

    [HttpPost]
    [Authorize(Roles = "Admin,Manager")]
    public async Task<ActionResult<ParkingSlotDto>> Create([FromBody] CreateParkingSlotRequest req, CancellationToken ct)
    {
        var dto = await _service.CreateAsync(req, ct);
        return CreatedAtAction(nameof(GetById), new { id = dto.Id }, dto);
    }

    [HttpPost("bulk")]
    [Authorize(Roles = "Admin,Manager")]
    public async Task<ActionResult<IReadOnlyList<ParkingSlotDto>>> CreateBulk(
        [FromBody] CreateParkingSlotsBulkRequest req, CancellationToken ct)
        => Ok(await _service.CreateBulkAsync(req, ct));

    [HttpPut("{id:guid}")]
    [Authorize(Roles = "Admin,Manager,Staff")]
    public async Task<ActionResult<ParkingSlotDto>> Update(Guid id, [FromBody] UpdateParkingSlotRequest req, CancellationToken ct)
        => Ok(await _service.UpdateAsync(id, req, ct));

    [HttpDelete("{id:guid}")]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> Delete(Guid id, CancellationToken ct)
    {
        await _service.DeleteAsync(id, ct);
        return NoContent();
    }
}
