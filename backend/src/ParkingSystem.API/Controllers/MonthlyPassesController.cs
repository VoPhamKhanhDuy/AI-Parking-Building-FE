using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using ParkingSystem.Application.MonthlyPasses.DTOs;
using ParkingSystem.Application.MonthlyPasses.Interfaces;
using ParkingSystem.Domain.Enums;

namespace ParkingSystem.API.Controllers;

[ApiController]
[Route("api/monthly-passes")]
[Authorize]
public class MonthlyPassesController : ControllerBase
{
    private readonly IMonthlyPassService _service;

    public MonthlyPassesController(IMonthlyPassService service) => _service = service;

    [HttpGet]
    public async Task<ActionResult<MonthlyPassListResponse>> GetAll(
        [FromQuery] string? search,
        [FromQuery] MonthlyPassStatus? status,
        [FromQuery] Guid? vehicleTypeId,
        CancellationToken ct)
        => Ok(await _service.ListAsync(search, status, vehicleTypeId, ct));

    [HttpGet("{id:guid}")]
    public async Task<ActionResult<MonthlyPassDto>> GetById(Guid id, CancellationToken ct)
    {
        var dto = await _service.GetByIdAsync(id, ct);
        return dto == null ? NotFound() : Ok(dto);
    }

    [HttpPost]
    [Authorize(Roles = "Admin,Operator,Attendant")]
    public async Task<ActionResult<MonthlyPassDto>> Create(
        [FromBody] CreateMonthlyPassRequest req,
        CancellationToken ct)
    {
        var dto = await _service.CreateAsync(req, ct);
        return CreatedAtAction(nameof(GetById), new { id = dto.Id }, dto);
    }

    [HttpPost("{id:guid}/verify")]
    public async Task<ActionResult<MonthlyPassDto>> Verify(Guid id, CancellationToken ct)
        => Ok(await _service.VerifyAsync(id, GetCurrentUserId(), ct));

    [HttpPost("{id:guid}/renew")]
    public async Task<ActionResult<MonthlyPassDto>> Renew(
        Guid id,
        [FromBody] RenewMonthlyPassRequest? req,
        CancellationToken ct)
        => Ok(await _service.RenewAsync(id, req, ct));

    [HttpPatch("{id:guid}/vehicle")]
    public async Task<ActionResult<MonthlyPassDto>> UpdateVehicle(
        Guid id,
        [FromBody] UpdateVehicleRequest req,
        CancellationToken ct)
        => Ok(await _service.UpdateVehicleAsync(id, req, ct));

    [HttpPost("{id:guid}/suspension-requests")]
    [Authorize(Roles = "Admin,Manager")]
    public async Task<ActionResult<SuspensionRequestResponse>> RequestSuspension(
        Guid id,
        [FromBody] SuspensionRequestBody? body,
        CancellationToken ct)
        => Ok(await _service.RequestSuspensionAsync(id, body, ct));

    [HttpPatch("{id:guid}/approve")]
    [Authorize(Roles = "Admin,Manager")]
    public async Task<ActionResult<MonthlyPassDto>> Approve(Guid id, CancellationToken ct)
        => Ok(await _service.ApproveAsync(id, ct));

    private Guid? GetCurrentUserId()
    {
        var sub = User.FindFirst("sub")?.Value ?? User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value;
        return Guid.TryParse(sub, out var id) ? id : null;
    }
}
