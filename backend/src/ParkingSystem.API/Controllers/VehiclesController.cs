using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using ParkingSystem.Application.Vehicles.DTOs;
using ParkingSystem.Application.Vehicles.Interfaces;

namespace ParkingSystem.API.Controllers;

[ApiController]
[Route("api/vehicles")]
public class VehiclesController : ControllerBase
{
    private readonly IVehicleService _service;

    public VehiclesController(IVehicleService service) => _service = service;

    /// <summary>List vehicles, with optional filters.</summary>
    [HttpGet]
    [Authorize]
    [ProducesResponseType(typeof(IReadOnlyList<VehicleDto>), StatusCodes.Status200OK)]
    public async Task<ActionResult<IReadOnlyList<VehicleDto>>> List(
        [FromQuery] Guid? vehicleTypeId,
        [FromQuery] Guid? ownerUserId,
        [FromQuery] string? q,
        CancellationToken ct)
        => Ok(await _service.ListAsync(vehicleTypeId, ownerUserId, q, ct));

    /// <summary>Get a vehicle by id.</summary>
    [HttpGet("{id:guid}")]
    [Authorize]
    [ProducesResponseType(typeof(VehicleDto), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<ActionResult<VehicleDto>> GetById(Guid id, CancellationToken ct)
    {
        var dto = await _service.GetByIdAsync(id, ct);
        return dto is null ? NotFound() : Ok(dto);
    }

    /// <summary>Lookup a vehicle by license plate (handy for entry gates).</summary>
    [HttpGet("by-plate/{plate}")]
    [Authorize]
    [ProducesResponseType(typeof(VehicleDto), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<ActionResult<VehicleDto>> GetByPlate(string plate, CancellationToken ct)
    {
        var dto = await _service.GetByLicensePlateAsync(plate, ct);
        return dto is null ? NotFound() : Ok(dto);
    }

    /// <summary>Register a new vehicle.</summary>
    [HttpPost]
    [Authorize(Roles = "Admin,Operator,Attendant")]
    [ProducesResponseType(typeof(VehicleDto), StatusCodes.Status201Created)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status409Conflict)]
    public async Task<ActionResult<VehicleDto>> Create(
        [FromBody] CreateVehicleRequest req, CancellationToken ct)
    {
        var dto = await _service.CreateAsync(req, ct);
        return CreatedAtAction(nameof(GetById), new { id = dto.Id }, dto);
    }

    /// <summary>Update vehicle attributes.</summary>
    [HttpPut("{id:guid}")]
    [Authorize(Roles = "Admin,Operator,Attendant")]
    [ProducesResponseType(typeof(VehicleDto), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<ActionResult<VehicleDto>> Update(
        Guid id, [FromBody] Application.Vehicles.DTOs.UpdateVehicleRequest req, CancellationToken ct)
        => Ok(await _service.UpdateAsync(id, req, ct));

    /// <summary>Soft-delete a vehicle.</summary>
    [HttpDelete("{id:guid}")]
    [Authorize(Roles = "Admin")]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> Delete(Guid id, CancellationToken ct)
    {
        await _service.DeleteAsync(id, ct);
        return NoContent();
    }

    /// <summary>List all known vehicle types (used by entry gates to map a category to a vehicleTypeId).</summary>
    [HttpGet("types")]
    [Authorize]
    [ProducesResponseType(typeof(IReadOnlyList<VehicleTypeDto>), StatusCodes.Status200OK)]
    public async Task<ActionResult<IReadOnlyList<VehicleTypeDto>>> ListTypes(CancellationToken ct)
        => Ok(await _service.ListTypesAsync(ct));
}