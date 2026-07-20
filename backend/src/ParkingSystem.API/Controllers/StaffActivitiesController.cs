using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using ParkingSystem.Infrastructure.Persistence;

namespace ParkingSystem.API.Controllers;

[ApiController]
[Route("api/staff-activities")]
[Authorize]
public class StaffActivitiesController : ControllerBase
{
    private readonly AppDbContext _db;

    public StaffActivitiesController(AppDbContext db) => _db = db;

    [HttpGet]
    public async Task<ActionResult<StaffActivityResponse>> GetAll(CancellationToken ct = default)
    {
        var staff = await _db.Users
            .Include(u => u.Role)
            .Select(u => new StaffActivityDto
            {
                Id = u.Id.ToString(),
                StaffId = $"STF-{u.Id:N}".Substring(0, 14),
                Name = u.FullName,
                Role = u.Role != null ? u.Role.Name : "Staff",
                Area = "Building A",
                Status = u.Status.ToString() == "Active" ? "Active" : "Offline",
                Entries = 0,
                Exits = 0,
                Payments = 0,
                Pending = 0
            })
            .ToListAsync(ct);

        if (staff.Count == 0)
            staff = GenerateMockData();

        return Ok(new StaffActivityResponse
        {
            Staff = staff,
            Summaries = new List<SummaryDto>
            {
                new() { Label = "Active Staff", Value = staff.Count(s => s.Status == "Active").ToString(), Note = "On duty", Tone = "success" },
                new() { Label = "On Break", Value = staff.Count(s => s.Status == "On Break").ToString(), Note = "Currently", Tone = "warning" }
            },
            Shift = new ShiftDto
            {
                Status = "Active",
                Name = "Morning Shift",
                Facility = "Building A",
                Time = "8:00 AM - 4:00 PM",
                Supervisor = "Manager",
                Coverage = "100%",
                Note = "Full coverage maintained."
            },
            Workload = staff.Select(s => new WorkloadDto { Area = s.Area, Label = s.Role, Value = 20 }).ToList()
        });
    }

    [HttpPost]
    public IActionResult SubmitAction([FromBody] StaffActivityActionRequest request)
    {
        return Ok(new { success = true, action = request?.Action });
    }

    private static List<StaffActivityDto> GenerateMockData() => new()
    {
        new() { Id = "1", StaffId = "STF-2026-001", Name = "John Smith", Role = "Entry Gate Operator", Area = "Entry Gate A", Status = "Active", Entries = 45, Exits = 42, Payments = 38, Pending = 2 },
        new() { Id = "2", StaffId = "STF-2026-002", Name = "Sarah Johnson", Role = "Exit Gate Operator", Area = "Exit Gate A", Status = "Active", Entries = 40, Exits = 48, Payments = 45, Pending = 1 },
        new() { Id = "3", StaffId = "STF-2026-003", Name = "Mike Wilson", Role = "Parking Support", Area = "Zone B", Status = "On Break", Entries = 12, Exits = 10, Payments = 0, Pending = 0 },
        new() { Id = "4", StaffId = "STF-2026-004", Name = "Emily Davis", Role = "Supervisor", Area = "Building A", Status = "Active", Entries = 0, Exits = 0, Payments = 0, Pending = 3 }
    };
}

public class StaffActivityActionRequest
{
    public string? Action { get; set; }
    public string? StaffId { get; set; }
    public string? Notes { get; set; }
}

public class StaffActivityResponse
{
    public List<StaffActivityDto> Staff { get; set; } = new();
    public List<SummaryDto> Summaries { get; set; } = new();
    public ShiftDto Shift { get; set; } = new();
    public List<WorkloadDto> Workload { get; set; } = new();
}

public class StaffActivityDto
{
    public string Id { get; set; } = string.Empty;
    public string StaffId { get; set; } = string.Empty;
    public string Name { get; set; } = string.Empty;
    public string Role { get; set; } = string.Empty;
    public string Area { get; set; } = string.Empty;
    public string Status { get; set; } = string.Empty;
    public int Entries { get; set; }
    public int Exits { get; set; }
    public int Payments { get; set; }
    public int Pending { get; set; }
}

public class SummaryDto
{
    public string Label { get; set; } = string.Empty;
    public string Value { get; set; } = string.Empty;
    public string Note { get; set; } = string.Empty;
    public string? Tone { get; set; }
}

public class ShiftDto
{
    public string Status { get; set; } = string.Empty;
    public string Name { get; set; } = string.Empty;
    public string Facility { get; set; } = string.Empty;
    public string Time { get; set; } = string.Empty;
    public string Supervisor { get; set; } = string.Empty;
    public string Coverage { get; set; } = string.Empty;
    public string Note { get; set; } = string.Empty;
}

public class WorkloadDto
{
    public string Area { get; set; } = string.Empty;
    public string Label { get; set; } = string.Empty;
    public int Value { get; set; }
}