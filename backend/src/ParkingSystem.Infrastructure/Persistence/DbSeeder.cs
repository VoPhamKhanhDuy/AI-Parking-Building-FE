using Microsoft.EntityFrameworkCore;
using ParkingSystem.Domain.Entities;
using ParkingSystem.Domain.Enums;

namespace ParkingSystem.Infrastructure.Persistence;

/// <summary>
/// Seeds the database with reference data required for the app to start:
/// system roles, vehicle types, an admin user, and a sample building skeleton.
/// Idempotent — safe to call on every startup.
/// </summary>
public static class DbSeeder
{
    public const string DefaultAdminEmail = "admin@parking.local";
    public const string DefaultAdminPassword = "Admin@123"; // dev only; rotate via user-secrets in real envs

    public static async Task SeedAsync(AppDbContext context)
    {
        await SeedRolesAsync(context);
        await SeedVehicleTypesAsync(context);
        await SeedAdminUserAsync(context);
        await SeedTestUsersAsync(context);
        await SeedSampleBuildingAsync(context);
        await SeedPricingRulesAsync(context);
        await SeedVehiclesAndActiveSessionsAsync(context);
        await FixSlotCodesAsync(context);
    }

    /// <summary>
    /// Ensures all slots have human-readable SlotCode (e.g. "MB-001", "C-001", "EV-001").
    /// Safe to call on every startup — only updates slots with empty or invalid SlotCode.
    /// </summary>
    public static async Task FixSlotCodesAsync(AppDbContext context)
    {
        var slots = await context.ParkingSlots
            .Include(s => s.ParkingZone)
            .ToListAsync();

        foreach (var slot in slots)
        {
            var zone = slot.ParkingZone;
            if (zone == null) continue;

            // Determine prefix based on zone name
            var prefix = zone.Name?.ToUpperInvariant() switch
            {
                var n when n?.Contains("MOTORBIKE") == true => "MB-",
                var n when n?.Contains("EV") == true => "EV-",
                _ => "C-"
            };

            // Check if SlotCode is missing or looks like a GUID (invalid)
            var isInvalid = string.IsNullOrWhiteSpace(slot.SlotCode)
                || Guid.TryParse(slot.SlotCode, out _)
                || slot.SlotCode.Length > 20;

            if (isInvalid)
            {
                // Find all slots in this zone to assign sequential number
                var zoneSlots = slots
                    .Where(s => s.ParkingZoneId == zone.Id)
                    .OrderBy(s => s.CreatedAt)
                    .ToList();

                var index = zoneSlots.IndexOf(slot) + 1;
                slot.SlotCode = $"{prefix}{index:000}";
                slot.UpdatedAt = DateTime.UtcNow;
                context.ParkingSlots.Update(slot);
            }
        }

        await context.SaveChangesAsync();
    }

    private static async Task SeedRolesAsync(AppDbContext context)
    {
        if (await context.Roles.IgnoreQueryFilters().AnyAsync())
        {
            return;
        }

        var roles = new[]
        {
            new Role { Name = SystemRoles.Admin, Description = "Full access to the system." },
            new Role { Name = SystemRoles.Manager, Description = "Manages buildings, pricing and reports." },
            new Role { Name = SystemRoles.Staff, Description = "Operational staff at entry/exit booths." },
            new Role { Name = SystemRoles.Driver, Description = "End-user who parks their vehicle." }
        };

        await context.Roles.AddRangeAsync(roles);
        await context.SaveChangesAsync();
    }

    private static async Task SeedVehicleTypesAsync(AppDbContext context)
    {
        if (await context.VehicleTypes.IgnoreQueryFilters().AnyAsync())
        {
            return;
        }

        var types = new[]
        {
            new VehicleType { Name = "Car", Category = VehicleTypeCategory.Car, DefaultHourlyRate = 10000m },
            new VehicleType { Name = "Motorbike", Category = VehicleTypeCategory.Motorbike, DefaultHourlyRate = 5000m },
            new VehicleType { Name = "Electric Vehicle", Category = VehicleTypeCategory.ElectricVehicle, DefaultHourlyRate = 12000m }
        };

        await context.VehicleTypes.AddRangeAsync(types);
        await context.SaveChangesAsync();
    }

    private static async Task SeedAdminUserAsync(AppDbContext context)
    {
        if (await context.Users.IgnoreQueryFilters().AnyAsync(u => u.Email == DefaultAdminEmail))
        {
            return;
        }

        var adminRole = await context.Roles.IgnoreQueryFilters()
            .FirstOrDefaultAsync(r => r.Name == SystemRoles.Admin)
            ?? throw new InvalidOperationException("Admin role must be seeded before admin user.");

        var admin = new User
        {
            Email = DefaultAdminEmail,
            FullName = "System Administrator",
            PasswordHash = BCrypt.Net.BCrypt.HashPassword(DefaultAdminPassword),
            Status = UserAccountStatus.Active,
            RoleId = adminRole.Id
        };

        await context.Users.AddAsync(admin);
        await context.SaveChangesAsync();
    }

    private static async Task SeedTestUsersAsync(AppDbContext context)
    {
        if (await context.Users.IgnoreQueryFilters().AnyAsync(u => u.Email == "manager@parking.local"))
        {
            return;
        }

        var managerRole = await context.Roles.IgnoreQueryFilters()
            .FirstOrDefaultAsync(r => r.Name == SystemRoles.Manager);
        var staffRole = await context.Roles.IgnoreQueryFilters()
            .FirstOrDefaultAsync(r => r.Name == SystemRoles.Staff);
        var driverRole = await context.Roles.IgnoreQueryFilters()
            .FirstOrDefaultAsync(r => r.Name == SystemRoles.Driver);

        if (managerRole != null)
        {
            await context.Users.AddAsync(new User
            {
                Email = "manager@parking.local",
                FullName = "Test Manager",
                PasswordHash = BCrypt.Net.BCrypt.HashPassword("Manager@123"),
                Status = UserAccountStatus.Active,
                RoleId = managerRole.Id
            });
        }

        if (staffRole != null)
        {
            await context.Users.AddAsync(new User
            {
                Email = "staff@parking.local",
                FullName = "Test Staff",
                PasswordHash = BCrypt.Net.BCrypt.HashPassword("Staff@123"),
                Status = UserAccountStatus.Active,
                RoleId = staffRole.Id
            });
        }

        if (driverRole != null)
        {
            await context.Users.AddAsync(new User
            {
                Email = "driver@parking.local",
                FullName = "Test Driver",
                PasswordHash = BCrypt.Net.BCrypt.HashPassword("Driver@123"),
                Status = UserAccountStatus.Active,
                RoleId = driverRole.Id
            });
        }

        await context.SaveChangesAsync();
    }

    private static async Task SeedSampleBuildingAsync(AppDbContext context)
    {
        if (await context.Buildings.IgnoreQueryFilters().AnyAsync())
        {
            return;
        }

        var carType = await context.VehicleTypes.IgnoreQueryFilters()
            .FirstAsync(vt => vt.Category == VehicleTypeCategory.Car);
        var motorbikeType = await context.VehicleTypes.IgnoreQueryFilters()
            .FirstAsync(vt => vt.Category == VehicleTypeCategory.Motorbike);
        var evType = await context.VehicleTypes.IgnoreQueryFilters()
            .FirstAsync(vt => vt.Category == VehicleTypeCategory.ElectricVehicle);

        var building = new Building
        {
            Name = "Main Parking Building",
            Address = "123 Nguyen Hue, District 1, HCMC",
            TotalFloors = 3,
            Floors = new List<Floor>
            {
                new()
                {
                    FloorNumber = -1,
                    Name = "B1",
                    Zones = new List<ParkingZone>
                    {
                        CreateZone("B1-Motorbike", motorbikeType, 8.0, 0, "MB-", 20),
                        CreateZone("B1-Car", carType, 12.0, 1, "C-", 30)
                    }
                },
                new()
                {
                    FloorNumber = 1,
                    Name = "L1",
                    Zones = new List<ParkingZone>
                    {
                        CreateZone("L1-EV", evType, 5.0, 2, "EV-", 6),
                        CreateZone("L1-Car", carType, 4.0, 0, "C-", 24)
                    }
                },
                new()
                {
                    FloorNumber = 2,
                    Name = "L2",
                    Zones = new List<ParkingZone>
                    {
                        CreateZone("L2-Car", carType, 15.0, 0, "C-", 24)
                    }
                }
            }
        };

        await context.Buildings.AddAsync(building);
        await context.SaveChangesAsync();
    }

    private static ParkingZone CreateZone(string name, VehicleType vehicleType, double distance, int priority, string slotPrefix, int slotCount)
    {
        var zone = new ParkingZone
        {
            Name = name,
            VehicleTypeId = vehicleType.Id,
            DistanceToExitOrElevator = distance,
            Priority = priority
        };

        var slots = new List<ParkingSlot>(slotCount);
        for (var i = 1; i <= slotCount; i++)
        {
            slots.Add(new ParkingSlot
            {
                ParkingZone = zone,
                SlotCode = $"{slotPrefix}{i:000}",
                Status = SlotStatus.Available
            });
        }
        zone.Slots = slots;
        return zone;
    }

    /// <summary>
    /// Seeds default pricing rules for every (VehicleType, TicketType) combination
    /// if none exist yet.
    /// </summary>
    public static async Task SeedPricingRulesAsync(AppDbContext context)
    {
        if (await context.PricingRules.IgnoreQueryFilters().AnyAsync())
        {
            return;
        }

        var vehicleTypes = await context.VehicleTypes.IgnoreQueryFilters().ToListAsync();
        var rules = new List<PricingRule>();

        foreach (var vt in vehicleTypes)
        {
            var hourlyRate = vt.DefaultHourlyRate;
            rules.AddRange(new[]
            {
                new PricingRule
                {
                    VehicleTypeId = vt.Id,
                    TicketType = TicketType.Hourly,
                    PricePerHour = hourlyRate,
                    PricePerDay = hourlyRate * 8,
                    PricePerMonth = hourlyRate * 8 * 22,
                    PenaltyFee = 50000m,
                    IsActive = true
                },
                new PricingRule
                {
                    VehicleTypeId = vt.Id,
                    TicketType = TicketType.Daily,
                    PricePerHour = hourlyRate * 0.9m,
                    PricePerDay = hourlyRate * 8 * 0.9m,
                    PricePerMonth = hourlyRate * 8 * 22 * 0.9m,
                    PenaltyFee = 50000m,
                    IsActive = true
                },
                new PricingRule
                {
                    VehicleTypeId = vt.Id,
                    TicketType = TicketType.MonthlyPass,
                    PricePerHour = 0,
                    PricePerDay = 0,
                    PricePerMonth = hourlyRate * 8 * 22,
                    PenaltyFee = 100000m,
                    IsActive = true
                }
            });
        }

        await context.PricingRules.AddRangeAsync(rules);
        await context.SaveChangesAsync();
    }

    /// <summary>
    /// Seeds a small fleet of vehicles + an active parking session per vehicle so
    /// the Vehicle Exit screen has live data on a fresh database.
    /// Idempotent — re-runs only when no active sessions exist.
    /// </summary>
    private static async Task SeedVehiclesAndActiveSessionsAsync(AppDbContext context)
    {
        if (await context.ParkingSessions.IgnoreQueryFilters().AnyAsync(s => s.Status == SessionStatus.Active))
        {
            return;
        }

        var carType = await context.VehicleTypes.IgnoreQueryFilters()
            .FirstOrDefaultAsync(vt => vt.Category == VehicleTypeCategory.Car);
        var bikeType = await context.VehicleTypes.IgnoreQueryFilters()
            .FirstOrDefaultAsync(vt => vt.Category == VehicleTypeCategory.Motorbike);
        var evType = await context.VehicleTypes.IgnoreQueryFilters()
            .FirstOrDefaultAsync(vt => vt.Category == VehicleTypeCategory.ElectricVehicle);
        if (carType is null || bikeType is null || evType is null) return;

        var seed = new[]
        {
            (Plate: "51A-12345", Type: carType, Entered: DateTime.UtcNow.AddHours(-3).AddMinutes(-12), Member: false),
            (Plate: "59B-67890", Type: bikeType, Entered: DateTime.UtcNow.AddHours(-2).AddMinutes(-7), Member: false),
            (Plate: "62C-11111", Type: evType, Entered: DateTime.UtcNow.AddHours(-1).AddMinutes(-22), Member: true)
        };

        var allZones = await context.ParkingZones.IgnoreQueryFilters()
            .Include(z => z.Slots)
            .ToListAsync();

        var usedSlotIds = new HashSet<Guid>();
        foreach (var (plate, type, entered, isMonthly) in seed)
        {
            var existingVehicle = await context.Vehicles.IgnoreQueryFilters()
                .FirstOrDefaultAsync(v => v.LicensePlate == plate);
            var vehicle = existingVehicle ?? new Vehicle
            {
                LicensePlate = plate,
                VehicleTypeId = type.Id
            };
            if (existingVehicle is null)
            {
                await context.Vehicles.AddAsync(vehicle);
                await context.SaveChangesAsync();
            }

            var matchingZones = allZones
                .Where(z => z.VehicleTypeId == type.Id)
                .ToList();
            ParkingSlot? slot = null;
            ParkingZone? zone = null;
            foreach (var z in matchingZones)
            {
                slot = z.Slots.FirstOrDefault(s => s.Status == SlotStatus.Available && !usedSlotIds.Contains(s.Id));
                if (slot is not null) { zone = z; break; }
            }
            if (slot is null || zone is null) continue;

            usedSlotIds.Add(slot.Id);
            slot.Status = SlotStatus.Occupied;
            context.ParkingSlots.Update(slot);

            var ticketCode = $"TKT-{DateTime.UtcNow:yyyyMMdd}-{plate.Replace("-", "").Substring(0, 4)}-{Guid.NewGuid().ToString()[..4].ToUpperInvariant()}";
            var ticket = new ParkingTicket
            {
                TicketCode = ticketCode,
                VehicleId = vehicle.Id,
                Type = isMonthly ? TicketType.MonthlyPass : TicketType.Hourly,
                Status = TicketStatus.Active,
                IssuedAt = entered,
                EntryTime = entered
            };
            await context.ParkingTickets.AddAsync(ticket);
            await context.SaveChangesAsync();

            var session = new ParkingSession
            {
                TicketId = ticket.Id,
                VehicleId = vehicle.Id,
                SlotId = slot.Id,
                Status = SessionStatus.Active,
                EntryTime = entered
            };
            await context.ParkingSessions.AddAsync(session);
        }

        await context.SaveChangesAsync();
    }
}