using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using ParkingSystem.Application.Payments.DTOs;
using ParkingSystem.Application.Payments.Interfaces;
using ParkingSystem.Domain.Enums;

namespace ParkingSystem.API.Controllers;

[ApiController]
[Route("api/payments")]
public class PaymentsController : ControllerBase
{
    private readonly IPaymentService _service;

    public PaymentsController(IPaymentService service) => _service = service;

    /// <summary>List payments with optional filters.</summary>
    [HttpGet]
    [Authorize]
    [ProducesResponseType(typeof(IReadOnlyList<PaymentDto>), StatusCodes.Status200OK)]
    public async Task<ActionResult<IReadOnlyList<PaymentDto>>> List(
        [FromQuery] PaymentStatus? status,
        [FromQuery] Guid? sessionId,
        [FromQuery] Guid? processedByUserId,
        [FromQuery] DateTime? fromUtc,
        [FromQuery] DateTime? toUtc,
        CancellationToken ct)
        => Ok(await _service.ListAsync(status, sessionId, processedByUserId, fromUtc, toUtc, ct));

    /// <summary>Get a payment by id.</summary>
    [HttpGet("{id:guid}")]
    [Authorize]
    [ProducesResponseType(typeof(PaymentDto), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<ActionResult<PaymentDto>> GetById(Guid id, CancellationToken ct)
    {
        var dto = await _service.GetByIdAsync(id, ct);
        return dto is null ? NotFound() : Ok(dto);
    }

    /// <summary>Get the payment attached to a parking session.</summary>
    [HttpGet("by-session/{sessionId:guid}")]
    [Authorize]
    [ProducesResponseType(typeof(PaymentDto), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<ActionResult<PaymentDto>> GetBySession(Guid sessionId, CancellationToken ct)
    {
        var dto = await _service.GetBySessionAsync(sessionId, ct);
        return dto is null ? NotFound() : Ok(dto);
    }

    /// <summary>Create a Pending payment for a session (cashier holds the slip until money is collected).</summary>
    [HttpPost]
    [Authorize(Roles = "Admin,Operator,Attendant")]
    [ProducesResponseType(typeof(PaymentDto), StatusCodes.Status201Created)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    [ProducesResponseType(StatusCodes.Status409Conflict)]
    public async Task<ActionResult<PaymentDto>> Create(
        [FromBody] CreatePaymentRequest req, CancellationToken ct)
    {
        var dto = await _service.CreateAsync(req, ct);
        return CreatedAtAction(nameof(GetById), new { id = dto.Id }, dto);
    }

    /// <summary>Mark a Pending payment as Paid (cashier confirms money received).</summary>
    [HttpPost("{id:guid}/mark-paid")]
    [Authorize(Roles = "Admin,Operator,Attendant")]
    [ProducesResponseType(typeof(PaymentDto), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<ActionResult<PaymentDto>> MarkPaid(
        Guid id, [FromBody] MarkPaidRequest req, CancellationToken ct)
        => Ok(await _service.MarkPaidAsync(id, req, ct));

    /// <summary>Waive a payment (manager decides comp). Body: { "reason": "..." }.</summary>
    [HttpPost("{id:guid}/waive")]
    [Authorize(Roles = "Admin,Manager")]
    [ProducesResponseType(typeof(PaymentDto), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<ActionResult<PaymentDto>> Waive(
        Guid id, [FromBody] WaiveBody body, CancellationToken ct)
        => Ok(await _service.WaiveAsync(id, body?.Reason, ct));

    /// <summary>Refund a Paid payment.</summary>
    [HttpPost("{id:guid}/refund")]
    [Authorize(Roles = "Admin,Manager")]
    [ProducesResponseType(typeof(PaymentDto), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<ActionResult<PaymentDto>> Refund(
        Guid id, [FromBody] RefundPaymentRequest req, CancellationToken ct)
        => Ok(await _service.RefundAsync(id, req, ct));

    /// <summary>Cancel a Pending payment (e.g. wrong amount typed in).</summary>
    [HttpPost("{id:guid}/cancel")]
    [Authorize(Roles = "Admin,Operator")]
    [ProducesResponseType(typeof(PaymentDto), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<ActionResult<PaymentDto>> Cancel(Guid id, CancellationToken ct)
        => Ok(await _service.CancelAsync(id, ct));

    public class WaiveBody
    {
        public string? Reason { get; set; }
    }
}