using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using ParkingSystem.Application.LostTickets.DTOs;
using ParkingSystem.Application.LostTickets.Interfaces;

namespace ParkingSystem.API.Controllers;

[ApiController]
[Route("api/lost-tickets")]
[Authorize(Roles = "Admin,Staff")]
public class LostTicketsController : ControllerBase
{
    private readonly ILostTicketService _svc;

    public LostTicketsController(ILostTicketService svc) => _svc = svc;

    [HttpGet("page-data")]
    [ProducesResponseType(typeof(LostTicketPageDataDto), StatusCodes.Status200OK)]
    public async Task<ActionResult<LostTicketPageDataDto>> GetPageData(CancellationToken ct)
    {
        var data = await _svc.GetPageDataAsync(ct);
        return Ok(data);
    }

    [HttpGet("policy")]
    [ProducesResponseType(typeof(LostTicketPolicyDto), StatusCodes.Status200OK)]
    public async Task<ActionResult<LostTicketPolicyDto>> GetPolicy(CancellationToken ct)
    {
        var policy = await _svc.GetPolicyAsync(ct);
        return Ok(policy);
    }

    [HttpGet("recent-cases")]
    [ProducesResponseType(typeof(IReadOnlyList<LostTicketCaseDto>), StatusCodes.Status200OK)]
    public async Task<ActionResult<IReadOnlyList<LostTicketCaseDto>>> GetRecentCases(
        [FromQuery] int count = 10, CancellationToken ct = default)
    {
        var cases = await _svc.ListRecentCasesAsync(count, ct);
        return Ok(cases);
    }

    [HttpGet("find-by-ticket/{ticketCode}")]
    [ProducesResponseType(typeof(LostTicketSessionDto), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<ActionResult<LostTicketSessionDto>> FindByTicketCode(string ticketCode, CancellationToken ct)
    {
        var result = await _svc.FindSessionByTicketCodeAsync(ticketCode, ct);
        if (result == null) return NotFound(new { message = "No active session found for this ticket code." });
        return Ok(result);
    }

    [HttpGet("find-by-plate/{licensePlate}")]
    [ProducesResponseType(typeof(LostTicketSessionDto), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<ActionResult<LostTicketSessionDto>> FindByLicensePlate(string licensePlate, CancellationToken ct)
    {
        var result = await _svc.FindSessionByLicensePlateAsync(licensePlate, ct);
        if (result == null) return NotFound(new { message = "No active session found for this license plate." });
        return Ok(result);
    }

    [HttpPost("calculate-fee")]
    [ProducesResponseType(typeof(CalculateFeeResponse), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<ActionResult<CalculateFeeResponse>> CalculateFee(
        [FromBody] CalculateFeeRequest req, CancellationToken ct)
    {
        var fee = await _svc.CalculateFeeAsync(req, ct);
        return Ok(fee);
    }

    [HttpPost]
    [ProducesResponseType(typeof(LostTicketCaseDto), StatusCodes.Status201Created)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<ActionResult<LostTicketCaseDto>> CreateCase(
        [FromBody] CreateLostTicketCaseRequest req, CancellationToken ct)
    {
        var @case = await _svc.CreateCaseAsync(req, ct);
        return CreatedAtAction(nameof(GetCase), new { id = @case.Id }, @case);
    }

    [HttpGet("{id:guid}")]
    [ProducesResponseType(typeof(LostTicketCaseDto), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<ActionResult<LostTicketCaseDto>> GetCase(Guid id, CancellationToken ct)
    {
        var cases = await _svc.ListRecentCasesAsync(1000, ct);
        var @case = cases.FirstOrDefault(c => c.Id == id);
        if (@case == null) return NotFound(new { message = "Case not found." });
        return Ok(@case);
    }

    [HttpPost("{id:guid}/process-payment")]
    [ProducesResponseType(typeof(LostTicketCaseDto), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    [ProducesResponseType(StatusCodes.Status409Conflict)]
    public async Task<ActionResult<LostTicketCaseDto>> ProcessPayment(
        Guid id, [FromBody] ProcessLostTicketRequest req, CancellationToken ct)
    {
        var @case = await _svc.ProcessPaymentAsync(id, req, ct);
        return Ok(@case);
    }
}
