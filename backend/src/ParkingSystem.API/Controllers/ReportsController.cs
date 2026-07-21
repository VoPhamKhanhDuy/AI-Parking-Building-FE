using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using ParkingSystem.Domain.Entities;
using ParkingSystem.Domain.Enums;
using ParkingSystem.Infrastructure.Persistence;

namespace ParkingSystem.API.Controllers;

[ApiController]
[Route("api/reports")]
[Authorize]
public class ReportsController : ControllerBase
{
    private readonly AppDbContext _db;

    public ReportsController(AppDbContext db) => _db = db;

    [HttpGet]
    public async Task<ActionResult<ReportListResponse>> GetAll(
        [FromQuery] string? search,
        [FromQuery] string? type,
        [FromQuery] DateTime? fromDate,
        [FromQuery] DateTime? toDate,
        CancellationToken ct = default)
    {
        var query = _db.Payments
            .Include(p => p.Session)
            .ThenInclude(s => s != null ? s.Ticket : null)
            .Include(p => p.Session)
            .ThenInclude(s => s != null ? s.Vehicle : null)
            .Include(p => p.ProcessedByUser)
            .AsQueryable();

        if (!string.IsNullOrWhiteSpace(search))
        {
            var normalizedSearch = search.Trim().ToUpperInvariant();
            query = query.Where(p =>
                (p.Session != null && p.Session.Ticket != null && p.Session.Ticket.TicketCode.ToUpper().Contains(normalizedSearch)) ||
                (p.Session != null && p.Session.Vehicle != null && p.Session.Vehicle.LicensePlate.ToUpper().Contains(normalizedSearch)) ||
                (p.TransactionReference != null && p.TransactionReference.ToUpper().Contains(normalizedSearch)));
        }

        if (fromDate.HasValue)
            query = query.Where(p => p.CreatedAt >= fromDate.Value);

        if (toDate.HasValue)
            query = query.Where(p => p.CreatedAt <= toDate.Value);

        var payments = await query
            .OrderByDescending(p => p.CreatedAt)
            .ToListAsync(ct);

        var transactions = payments.Select(p => new TransactionDto
        {
            Id = p.Id,
            TicketCode = p.Session?.Ticket?.TicketCode ?? "N/A",
            LicensePlate = p.Session?.Vehicle?.LicensePlate ?? "N/A",
            Amount = p.Amount,
            Method = p.Method.ToString(),
            Status = p.Status.ToString(),
            PaidAt = p.PaidAt,
            ProcessedBy = p.ProcessedByUser?.FullName,
            CreatedAt = p.CreatedAt
        }).ToList();

        var totalRevenue = payments.Where(p => p.Status == PaymentStatus.Paid).Sum(p => p.Amount);
        var pendingRevenue = payments.Where(p => p.Status == PaymentStatus.Pending).Sum(p => p.Amount);

        return Ok(new ReportListResponse
        {
            Transactions = transactions,
            Stats = new ReportStatsDto
            {
                TotalTransactions = payments.Count,
                TotalRevenue = totalRevenue,
                PendingRevenue = pendingRevenue,
                PaidCount = payments.Count(p => p.Status == PaymentStatus.Paid),
                PendingCount = payments.Count(p => p.Status == PaymentStatus.Pending),
                RefundedCount = payments.Count(p => p.Status == PaymentStatus.Refunded)
            }
        });
    }

    [HttpGet("daily-operations")]
    public async Task<ActionResult<DailyOperationsReportResponse>> GetDailyOperations(
        [FromQuery] DateTime? date,
        CancellationToken ct = default)
    {
        var targetDate = date?.Date ?? DateTime.UtcNow.Date;

        var dayStart = targetDate;
        var dayEnd = targetDate.AddDays(1);

        var tickets = await _db.ParkingTickets
            .Where(t => t.CreatedAt >= dayStart && t.CreatedAt < dayEnd)
            .ToListAsync(ct);

        var payments = await _db.Payments
            .Where(p => p.CreatedAt >= dayStart && p.CreatedAt < dayEnd)
            .ToListAsync(ct);

        var sessions = await _db.ParkingSessions
            .Where(s => s.EntryTime >= dayStart && s.EntryTime < dayEnd)
            .ToListAsync(ct);

        var exits = await _db.ParkingSessions
            .Where(s => s.ExitTime.HasValue && s.ExitTime >= dayStart && s.ExitTime < dayEnd)
            .ToListAsync(ct);

        var revenue = payments.Where(p => p.Status == PaymentStatus.Paid).Sum(p => p.Amount);

        return Ok(new DailyOperationsReportResponse
        {
            Date = targetDate,
            TotalTicketsIssued = tickets.Count,
            TotalVehiclesEntered = sessions.Count,
            TotalVehiclesExited = exits.Count,
            TotalRevenue = revenue,
            TicketsByType = tickets.GroupBy(t => t.Type)
                .ToDictionary(g => g.Key.ToString(), g => g.Count()),
            RevenueByMethod = payments
                .Where(p => p.Status == PaymentStatus.Paid)
                .GroupBy(p => p.Method)
                .ToDictionary(g => g.Key.ToString(), g => g.Sum(p => p.Amount))
        });
    }

    [HttpGet("stats")]
    public async Task<ActionResult<DashboardStatsResponse>> GetStats(CancellationToken ct = default)
    {
        var now = DateTime.UtcNow;
        var todayStart = now.Date;
        var todayEnd = todayStart.AddDays(1);

        var activeSessions = await _db.ParkingSessions
            .CountAsync(s => s.Status == SessionStatus.Active, ct);

        var todayEntries = await _db.ParkingSessions
            .CountAsync(s => s.EntryTime >= todayStart && s.EntryTime < todayEnd, ct);

        var todayExits = await _db.ParkingSessions
            .CountAsync(s => s.ExitTime.HasValue && s.ExitTime >= todayStart && s.ExitTime < todayEnd, ct);

        var todayRevenue = await _db.Payments
            .Where(p => p.Status == PaymentStatus.Paid && p.PaidAt >= todayStart && p.PaidAt < todayEnd)
            .SumAsync(p => p.Amount, ct);

        var totalSlots = await _db.ParkingSlots.CountAsync(ct);
        var occupiedSlots = await _db.ParkingSlots
            .CountAsync(s => s.Status == SlotStatus.Occupied, ct);

        var monthlyPassesActive = await _db.MonthlyPasses
            .CountAsync(m => m.Status == MonthlyPassStatus.Active, ct);

        return Ok(new DashboardStatsResponse
        {
            ActiveSessions = activeSessions,
            TodayEntries = todayEntries,
            TodayExits = todayExits,
            TodayRevenue = todayRevenue,
            AvailableSlots = totalSlots - occupiedSlots,
            TotalSlots = totalSlots,
            OccupiedSlots = occupiedSlots,
            MonthlyPassesActive = monthlyPassesActive,
            OccupancyRate = totalSlots > 0 ? Math.Round((double)occupiedSlots / totalSlots * 100, 1) : 0
        });
    }

    /// <summary>Export report (placeholder - to be implemented).</summary>
    [HttpGet("export")]
    [Obsolete("Export functionality not yet implemented")]
    public async Task<IActionResult> ExportReport(
        [FromQuery] string type,
        [FromQuery] string format,
        [FromQuery] DateTime? fromDate,
        [FromQuery] DateTime? toDate,
        CancellationToken ct = default)
    {
        return Ok(new
        {
            success = true,
            message = $"Export request received for {type} report in {format} format.",
            fromDate,
            toDate,
            exportedAt = DateTime.UtcNow
        });
    }
}

public class ReportListResponse
{
    public List<TransactionDto> Transactions { get; set; } = new();
    public ReportStatsDto Stats { get; set; } = new();
}

public class TransactionDto
{
    public Guid Id { get; set; }
    public string TicketCode { get; set; } = string.Empty;
    public string LicensePlate { get; set; } = string.Empty;
    public decimal Amount { get; set; }
    public string Method { get; set; } = string.Empty;
    public string Status { get; set; } = string.Empty;
    public DateTime? PaidAt { get; set; }
    public string? ProcessedBy { get; set; }
    public DateTime CreatedAt { get; set; }
}

public class ReportStatsDto
{
    public int TotalTransactions { get; set; }
    public decimal TotalRevenue { get; set; }
    public decimal PendingRevenue { get; set; }
    public int PaidCount { get; set; }
    public int PendingCount { get; set; }
    public int RefundedCount { get; set; }
}

public class DailyOperationsReportResponse
{
    public DateTime Date { get; set; }
    public int TotalTicketsIssued { get; set; }
    public int TotalVehiclesEntered { get; set; }
    public int TotalVehiclesExited { get; set; }
    public decimal TotalRevenue { get; set; }
    public Dictionary<string, int> TicketsByType { get; set; } = new();
    public Dictionary<string, decimal> RevenueByMethod { get; set; } = new();
}

public class DashboardStatsResponse
{
    public int ActiveSessions { get; set; }
    public int TodayEntries { get; set; }
    public int TodayExits { get; set; }
    public decimal TodayRevenue { get; set; }
    public int AvailableSlots { get; set; }
    public int TotalSlots { get; set; }
    public int OccupiedSlots { get; set; }
    public int MonthlyPassesActive { get; set; }
    public double OccupancyRate { get; set; }
}
