using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using ParkingSystem.Application.SystemLogs.DTOs;
using ParkingSystem.Application.SystemLogs.Interfaces;

namespace ParkingSystem.API.Controllers;

[ApiController]
[Route("api/system-logs")]
[Authorize]
public class SystemLogsController : ControllerBase
{
    private readonly ISystemLogQueryService _service;

    public SystemLogsController(ISystemLogQueryService service) => _service = service;

    [HttpGet]
    public async Task<ActionResult<SystemLogListResponse>> GetAll(
        [FromQuery] string? search,
        [FromQuery] string? module,
        [FromQuery] string? status,
        [FromQuery] DateTime? fromDate,
        [FromQuery] DateTime? toDate,
        [FromQuery] int page = 1,
        [FromQuery] int pageSize = 50,
        CancellationToken ct = default)
        => Ok(await _service.ListAsync(search, module, fromDate, toDate, page, pageSize, ct));

    [HttpGet("{id:guid}")]
    public async Task<ActionResult<SystemLogDto>> GetById(Guid id, CancellationToken ct)
    {
        var dto = await _service.GetByIdAsync(id, ct);
        return dto == null ? NotFound() : Ok(dto);
    }
}
