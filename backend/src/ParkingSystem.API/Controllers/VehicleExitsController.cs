using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using ParkingSystem.Application.VehicleExits.DTOs;
using ParkingSystem.Application.VehicleExits.Interfaces;

namespace ParkingSystem.API.Controllers;

[ApiController]
[Route("api/vehicle-exits")]
[Authorize]
public class VehicleExitsController : ControllerBase
{
    private readonly IVehicleExitService _service;

    public VehicleExitsController(IVehicleExitService service) => _service = service;

    /// <summary>Get all active parking sessions (vehicles currently parked).</summary>
    [HttpGet("active")]
    public async Task<ActionResult<VehicleExitListResponse>> GetActiveSessions(CancellationToken ct)
        => Ok(await _service.GetActiveSessionsAsync(ct));

    /// <summary>Lookup a vehicle session by ticket code or license plate.</summary>
    [HttpGet("lookup")]
    public async Task<ActionResult<VehicleExitSessionDto>> Lookup([FromQuery] string query, CancellationToken ct)
    {
        if (string.IsNullOrWhiteSpace(query))
            return BadRequest(new { error = "Query is required." });

        var session = await _service.LookupAsync(query, ct);
        return session == null
            ? NotFound(new { error = "No active session found." })
            : Ok(session);
    }

    /// <summary>Calculate exit fee for a session using pricing rules.</summary>
    [HttpPost("{id:guid}/calculate-fee")]
    public async Task<ActionResult<ExitFeeCalculation>> CalculateFee(Guid id, CancellationToken ct)
        => Ok(await _service.CalculateFeeAsync(id, ct));

    /// <summary>Create payment for exit.</summary>
    [HttpPost("{id:guid}/payments")]
    public async Task<ActionResult<ExitPaymentResponse>> CreatePayment(
        Guid id,
        [FromBody] CreateExitPaymentRequest? req,
        CancellationToken ct)
        => Ok(await _service.CreatePaymentAsync(id, req, ct));

    /// <summary>Check payment status.</summary>
    [HttpGet("payments/{paymentId:guid}/status")]
    public async Task<ActionResult<PaymentStatusResponse>> GetPaymentStatus(Guid paymentId, CancellationToken ct)
        => Ok(await _service.GetPaymentStatusAsync(paymentId, ct));

    /// <summary>Complete vehicle exit.</summary>
    [HttpPost("{id:guid}/complete")]
    public async Task<ActionResult<ExitCompleteResponse>> CompleteExit(Guid id, CancellationToken ct)
        => Ok(await _service.CompleteExitAsync(id, ct));
}
