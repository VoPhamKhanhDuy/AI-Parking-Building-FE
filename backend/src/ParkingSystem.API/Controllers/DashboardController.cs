using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using ParkingSystem.Domain.Entities;
using ParkingSystem.Domain.Enums;
using ParkingSystem.Infrastructure.Persistence;

namespace ParkingSystem.API.Controllers;

[ApiController]
[Route("api/dashboard")]
[Authorize]
public class DashboardController : ControllerBase
{
    private readonly AppDbContext _db;

    public DashboardController(AppDbContext db) => _db = db;

    [HttpGet]
    public async Task<ActionResult<DashboardResponse>> GetDashboard(CancellationToken ct = default)
    {
        var now = DateTime.UtcNow;
        var todayStart = now.Date;
        var todayEnd = todayStart.AddDays(1);

        var stats = await GetStatsInternalAsync(ct);

        var recentEntries = await _db.ParkingSessions
            .Include(s => s.Vehicle)
            .Include(s => s.Ticket)
            .Include(s => s.Slot)
            .Where(s => s.EntryTime >= todayStart)
            .OrderByDescending(s => s.EntryTime)
            .Take(10)
            .Select(s => new VehicleActivityDto
            {
                Id = s.Id,
                TicketCode = s.Ticket != null ? s.Ticket.TicketCode : "",
                LicensePlate = s.Vehicle != null ? s.Vehicle.LicensePlate : "",
                SlotCode = s.Slot != null ? s.Slot.SlotCode : "",
                Action = "Entry",
                Time = s.EntryTime,
                Status = s.Status.ToString()
            })
            .ToListAsync(ct);

        var recentExits = await _db.ParkingSessions
            .Include(s => s.Vehicle)
            .Include(s => s.Ticket)
            .Include(s => s.Slot)
            .Where(s => s.ExitTime.HasValue && s.ExitTime >= todayStart)
            .OrderByDescending(s => s.ExitTime)
            .Take(10)
            .Select(s => new VehicleActivityDto
            {
                Id = s.Id,
                TicketCode = s.Ticket != null ? s.Ticket.TicketCode : "",
                LicensePlate = s.Vehicle != null ? s.Vehicle.LicensePlate : "",
                SlotCode = s.Slot != null ? s.Slot.SlotCode : "",
                Action = "Exit",
                Time = s.ExitTime!.Value,
                Status = s.Status.ToString()
            })
            .ToListAsync(ct);

        return Ok(new DashboardResponse
        {
            Stats = stats,
            RecentEntries = recentEntries,
            RecentExits = recentExits,
            CurrentTime = now
        });
    }

    [HttpGet("stats")]
    public async Task<ActionResult<DashboardStatsDto>> GetStats(CancellationToken ct = default)
        => Ok(await GetStatsInternalAsync(ct));

    private async Task<DashboardStatsDto> GetStatsInternalAsync(CancellationToken ct)
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

        var pendingReservations = await _db.Reservations
            .CountAsync(r => r.Status == ReservationStatus.Pending, ct);

        var pendingPayments = await _db.Payments
            .CountAsync(p => p.Status == PaymentStatus.Pending, ct);

        return new DashboardStatsDto
        {
            ActiveSessions = activeSessions,
            TodayEntries = todayEntries,
            TodayExits = todayExits,
            TodayRevenue = todayRevenue,
            AvailableSlots = totalSlots - occupiedSlots,
            TotalSlots = totalSlots,
            OccupiedSlots = occupiedSlots,
            OccupancyRate = totalSlots > 0 ? Math.Round((double)occupiedSlots / totalSlots * 100, 1) : 0,
            MonthlyPassesActive = monthlyPassesActive,
            PendingReservations = pendingReservations,
            PendingPayments = pendingPayments
        };
    }

    [HttpGet("occupancy")]
    public async Task<ActionResult<OccupancyResponse>> GetOccupancy(CancellationToken ct = default)
    {
        var buildings = await _db.Buildings
            .Include(b => b.Floors)
            .ThenInclude(f => f.Zones)
            .ThenInclude(z => z.Slots)
            .ToListAsync(ct);

        var occupancy = buildings.Select(b => new BuildingOccupancyDto
        {
            BuildingId = b.Id,
            BuildingName = b.Name,
            Floors = b.Floors.Select(f => new FloorOccupancyDto
            {
                FloorId = f.Id,
                FloorName = f.Name ?? f.FloorNumber.ToString(),
                TotalSlots = f.Zones.SelectMany(z => z.Slots).Count(),
                OccupiedSlots = f.Zones.SelectMany(z => z.Slots).Count(s => s.Status == SlotStatus.Occupied),
                OccupancyRate = f.Zones.SelectMany(z => z.Slots).Count() > 0
                    ? Math.Round((double)f.Zones.SelectMany(z => z.Slots).Count(s => s.Status == SlotStatus.Occupied)
                        / f.Zones.SelectMany(z => z.Slots).Count() * 100, 1)
                    : 0
            }).ToList()
        }).ToList();

        return Ok(new OccupancyResponse { Buildings = occupancy });
    }
}

public class DashboardResponse
{
    public DashboardStatsDto Stats { get; set; } = new();
    public List<VehicleActivityDto> RecentEntries { get; set; } = new();
    public List<VehicleActivityDto> RecentExits { get; set; } = new();
    public DateTime CurrentTime { get; set; }
}

public class DashboardStatsDto
{
    public int ActiveSessions { get; set; }
    public int TodayEntries { get; set; }
    public int TodayExits { get; set; }
    public decimal TodayRevenue { get; set; }
    public int AvailableSlots { get; set; }
    public int TotalSlots { get; set; }
    public int OccupiedSlots { get; set; }
    public double OccupancyRate { get; set; }
    public int MonthlyPassesActive { get; set; }
    public int PendingReservations { get; set; }
    public int PendingPayments { get; set; }
}

public class VehicleActivityDto
{
    public Guid Id { get; set; }
    public string TicketCode { get; set; } = string.Empty;
    public string LicensePlate { get; set; } = string.Empty;
    public string SlotCode { get; set; } = string.Empty;
    public string Action { get; set; } = string.Empty;
    public DateTime Time { get; set; }
    public string Status { get; set; } = string.Empty;
}

public class OccupancyResponse
{
    public List<BuildingOccupancyDto> Buildings { get; set; } = new();
}

public class BuildingOccupancyDto
{
    public Guid BuildingId { get; set; }
    public string BuildingName { get; set; } = string.Empty;
    public List<FloorOccupancyDto> Floors { get; set; } = new();
}

public class FloorOccupancyDto
{
    public Guid FloorId { get; set; }
    public string FloorName { get; set; } = string.Empty;
    public int TotalSlots { get; set; }
    public int OccupiedSlots { get; set; }
    public double OccupancyRate { get; set; }
}
