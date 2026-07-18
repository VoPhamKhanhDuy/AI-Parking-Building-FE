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
                        new()
                        {
                            Name = "B1-Motorbike",
                            VehicleTypeId = motorbikeType.Id,
                            DistanceToExitOrElevator = 8.0,
                            Priority = 0,
                            Slots = GenerateSlots("MB-", 20)
                        },
                        new()
                        {
                            Name = "B1-Car",
                            VehicleTypeId = carType.Id,
                            DistanceToExitOrElevator = 12.0,
                            Priority = 1,
                            Slots = GenerateSlots("C-", 30)
                        }
                    }
                },
                new()
                {
                    FloorNumber = 1,
                    Name = "L1",
                    Zones = new List<ParkingZone>
                    {
                        new()
                        {
                            Name = "L1-EV",
                            VehicleTypeId = evType.Id,
                            DistanceToExitOrElevator = 5.0,
                            Priority = 2,
                            Slots = GenerateSlots("EV-", 6, withChargingSpot: true)
                        },
                        new()
                        {
                            Name = "L1-Car",
                            VehicleTypeId = carType.Id,
                            DistanceToExitOrElevator = 4.0,
                            Priority = 0,
                            Slots = GenerateSlots("C-", 24)
                        }
                    }
                },
                new()
                {
                    FloorNumber = 2,
                    Name = "L2",
                    Zones = new List<ParkingZone>
                    {
                        new()
                        {
                            Name = "L2-Car",
                            VehicleTypeId = carType.Id,
                            DistanceToExitOrElevator = 15.0,
                            Priority = 0,
                            Slots = GenerateSlots("C-", 24)
                        }
                    }
                }
            }
        };

        await context.Buildings.AddAsync(building);
        await context.SaveChangesAsync();
    }

    private static List<ParkingSlot> GenerateSlots(string prefix, int count, bool withChargingSpot = false)
    {
        var slots = new List<ParkingSlot>(count);
        for (var i = 1; i <= count; i++)
        {
            slots.Add(new ParkingSlot
            {
                SlotCode = $"{prefix}{i:000}",
                Status = SlotStatus.Available
            });
        }
        return slots;
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
}