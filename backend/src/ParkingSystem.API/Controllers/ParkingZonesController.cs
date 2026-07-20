using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using ParkingSystem.Application.ParkingStructure.DTOs;
using ParkingSystem.Application.ParkingStructure.Interfaces;

namespace ParkingSystem.API.Controllers;

[ApiController]
[Route("api/zones")]
public class ParkingZonesController : ControllerBase
{
    private readonly IParkingZoneService _service;

    public ParkingZonesController(IParkingZoneService service) => _service = service;

    [HttpGet]
    [Authorize]
    public async Task<ActionResult<IReadOnlyList<ParkingZoneDto>>> List([FromQuery] Guid floorId, CancellationToken ct)
    {
        if (floorId == Guid.Empty) return BadRequest(new { error = "floorId is required." });
        return Ok(await _service.ListByFloorAsync(floorId, ct));
    }

    [HttpGet("{id:guid}")]
    [Authorize]
    public async Task<ActionResult<ParkingZoneDetailDto>> GetById(Guid id, CancellationToken ct)
    {
        var dto = await _service.GetByIdAsync(id, ct);
        return dto is null ? NotFound() : Ok(dto);
    }

    [HttpPost]
    [Authorize(Roles = "Admin,Manager")]
    public async Task<ActionResult<ParkingZoneDto>> Create([FromBody] CreateParkingZoneRequest req, CancellationToken ct)
    {
        var dto = await _service.CreateAsync(req, ct);
        return CreatedAtAction(nameof(GetById), new { id = dto.Id }, dto);
    }

    [HttpPut("{id:guid}")]
    [Authorize(Roles = "Admin,Manager")]
    public async Task<ActionResult<ParkingZoneDto>> Update(Guid id, [FromBody] UpdateParkingZoneRequest req, CancellationToken ct)
        => Ok(await _service.UpdateAsync(id, req, ct));

    [HttpDelete("{id:guid}")]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> Delete(Guid id, CancellationToken ct)
    {
        await _service.DeleteAsync(id, ct);
        return NoContent();
    }
}
