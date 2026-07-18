using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using ParkingSystem.Application.Notifications.DTOs;
using ParkingSystem.Application.Notifications.Interfaces;
using ParkingSystem.Domain.Enums;

namespace ParkingSystem.API.Controllers;

[ApiController]
[Route("api/notifications")]
[Authorize]
public class NotificationsController : ControllerBase
{
    private readonly INotificationService _service;

    public NotificationsController(INotificationService service) => _service = service;

    [HttpGet]
    public async Task<ActionResult<NotificationListResponse>> GetAll(
        [FromQuery] string? search,
        [FromQuery] NotificationType? type,
        [FromQuery] NotificationStatus? status,
        [FromQuery] bool unreadOnly = false,
        [FromQuery] int page = 1,
        [FromQuery] int pageSize = 20,
        CancellationToken ct = default)
        => Ok(await _service.ListAsync(search, type, status, unreadOnly, page, pageSize, GetCurrentUserId(), ct));

    [HttpGet("{id:guid}")]
    public async Task<ActionResult<NotificationDto>> GetById(Guid id, CancellationToken ct)
    {
        var dto = await _service.GetByIdAsync(id, ct);
        return dto == null ? NotFound() : Ok(dto);
    }

    [HttpPost]
    public async Task<ActionResult<NotificationDto>> Create(
        [FromBody] CreateNotificationRequest req,
        CancellationToken ct)
    {
        var dto = await _service.CreateAsync(req, GetCurrentUserId(), ct);
        return CreatedAtAction(nameof(GetById), new { id = dto.Id }, dto);
    }

    [HttpPost("{id:guid}/read")]
    public async Task<ActionResult<NotificationDto>> MarkAsRead(Guid id, CancellationToken ct)
    {
        var dto = await _service.MarkAsReadAsync(id, ct);
        return dto == null ? NotFound() : Ok(dto);
    }

    [HttpPost("read-all")]
    public async Task<ActionResult<MarkAllReadResponse>> MarkAllAsRead(CancellationToken ct)
        => Ok(await _service.MarkAllAsReadAsync(GetCurrentUserId(), ct));

    [HttpDelete("{id:guid}")]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> Delete(Guid id, CancellationToken ct)
    {
        await _service.DeleteAsync(id, ct);
        return NoContent();
    }

    private Guid? GetCurrentUserId()
    {
        var sub = User.FindFirst("sub")?.Value ?? User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value;
        return Guid.TryParse(sub, out var id) ? id : null;
    }
}
