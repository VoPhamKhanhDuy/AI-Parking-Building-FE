using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using ParkingSystem.Application.ParkingStructure.DTOs;
using ParkingSystem.Application.ParkingStructure.Interfaces;

namespace ParkingSystem.API.Controllers;

/// <summary>
/// Building management — admin / staff can create and update;
/// any authenticated user can list and view.
/// </summary>
[ApiController]
[Route("api/buildings")]
public class BuildingsController : ControllerBase
{
    private readonly IBuildingService _service;

    public BuildingsController(IBuildingService service) => _service = service;

    [HttpGet]
    [Authorize]
    public async Task<ActionResult<IReadOnlyList<BuildingDto>>> List([FromQuery] string? q, CancellationToken ct)
        => Ok(await _service.ListAsync(q, ct));

    [HttpGet("{id:guid}")]
    [Authorize]
    public async Task<ActionResult<BuildingDetailDto>> GetById(Guid id, CancellationToken ct)
    {
        var dto = await _service.GetByIdAsync(id, ct);
        return dto is null ? NotFound() : Ok(dto);
    }

    [HttpPost]
    [Authorize(Roles = "Admin,Operator")]
    public async Task<ActionResult<BuildingDto>> Create([FromBody] CreateBuildingRequest req, CancellationToken ct)
    {
        var dto = await _service.CreateAsync(req, ct);
        return CreatedAtAction(nameof(GetById), new { id = dto.Id }, dto);
    }

    [HttpPut("{id:guid}")]
    [Authorize(Roles = "Admin,Operator")]
    public async Task<ActionResult<BuildingDto>> Update(Guid id, [FromBody] UpdateBuildingRequest req, CancellationToken ct)
        => Ok(await _service.UpdateAsync(id, req, ct));

    [HttpDelete("{id:guid}")]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> Delete(Guid id, CancellationToken ct)
    {
        await _service.DeleteAsync(id, ct);
        return NoContent();
    }
}
