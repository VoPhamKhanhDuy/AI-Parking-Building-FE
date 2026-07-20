using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using ParkingSystem.Infrastructure.Persistence;

namespace ParkingSystem.API.Controllers;

[ApiController]
[Route("api/parking-structure")]
[Authorize]
public class ParkingStructureController : ControllerBase
{
    private readonly AppDbContext _db;

    public ParkingStructureController(AppDbContext db) => _db = db;

    [HttpGet]
    public async Task<ActionResult<ParkingStructureResponse>> GetStructure(CancellationToken ct)
    {
        var buildings = await _db.Buildings
            .Include(b => b.Floors.OrderBy(f => f.FloorNumber))
                .ThenInclude(f => f.Zones)
                    .ThenInclude(z => z.Slots)
            .ToListAsync(ct);

        var response = new ParkingStructureResponse
        {
            buildings = buildings.Select(b => new BuildingDto
            {
                id = b.Id,
                name = b.Name,
                floors = b.Floors.Select(f => f.Name ?? $"Floor {f.FloorNumber}").ToList()
            }).ToList()
        };

        // Build zones list for frontend
        var zones = new List<ZoneDto>();
        foreach (var building in buildings)
        {
            foreach (var floor in building.Floors)
            {
                foreach (var zone in floor.Zones)
                {
                    var occupied = zone.Slots.Count(s => s.Status == Domain.Enums.SlotStatus.Occupied);
                    var available = zone.Slots.Count(s => s.Status == Domain.Enums.SlotStatus.Available);
                    var maintenance = zone.Slots.Count(s => s.Status == Domain.Enums.SlotStatus.Maintenance);
                    
                    zones.Add(new ZoneDto
                    {
                        id = zone.Id,
                        location = floor.Name ?? $"Floor {floor.FloorNumber}",
                        zone = zone.Name,
                        type = "Standard",
                        capacity = zone.Slots.Count,
                        occupied = occupied,
                        available = available,
                        status = maintenance > 0 ? "Maintenance" : occupied == zone.Slots.Count ? "Full" : "Available",
                        reserved = 0,
                        maintenance = maintenance
                    });
                }
            }
        }

        // KPIs
        var totalSlots = zones.Sum(z => z.capacity);
        var totalOccupied = zones.Sum(z => z.occupied);
        var totalAvailable = zones.Sum(z => z.available);
        response.kpis = new List<KpiDto>
        {
            new() { label = "Total Slots", value = totalSlots.ToString(), note = "Across all zones" },
            new() { label = "Occupied", value = totalOccupied.ToString(), note = "Currently parked", tone = "warning" },
            new() { label = "Available", value = totalAvailable.ToString(), note = "Ready to use", tone = "success" },
            new() { label = "Utilization", value = totalSlots > 0 ? $"{Math.Round(totalOccupied * 100.0 / totalSlots)}%" : "0%", note = "Current rate" }
        };

        // Zone list
        response.zones = zones;

        // Slot types
        response.slotTypes = new List<SlotTypeDto>
        {
            new() { type = "Standard", total = zones.Sum(z => z.capacity), available = zones.Sum(z => z.available) }
        };

        // Recent updates (placeholder)
        response.recentUpdates = new List<RecentUpdateDto>();

        return Ok(response);
    }
}

public class ParkingStructureResponse
{
    public List<BuildingDto> buildings { get; set; } = new();
    public List<ZoneDto> zones { get; set; } = new();
    public List<KpiDto> kpis { get; set; } = new();
    public List<SlotTypeDto> slotTypes { get; set; } = new();
    public List<RecentUpdateDto> recentUpdates { get; set; } = new();
}

public class BuildingDto
{
    public Guid id { get; set; }
    public string name { get; set; } = string.Empty;
    public List<string> floors { get; set; } = new();
}

public class ZoneDto
{
    public Guid id { get; set; }
    public string location { get; set; } = string.Empty;
    public string zone { get; set; } = string.Empty;
    public string type { get; set; } = string.Empty;
    public int capacity { get; set; }
    public int occupied { get; set; }
    public int available { get; set; }
    public string status { get; set; } = string.Empty;
    public int reserved { get; set; }
    public int maintenance { get; set; }
}

public class KpiDto
{
    public string label { get; set; } = string.Empty;
    public string value { get; set; } = string.Empty;
    public string note { get; set; } = string.Empty;
    public string? tone { get; set; }
}

public class SlotTypeDto
{
    public string type { get; set; } = string.Empty;
    public int total { get; set; }
    public int available { get; set; }
}

public class RecentUpdateDto
{
    public string time { get; set; } = string.Empty;
    public string update { get; set; } = string.Empty;
    public string area { get; set; } = string.Empty;
    public string staff { get; set; } = string.Empty;
    public string status { get; set; } = string.Empty;
}
