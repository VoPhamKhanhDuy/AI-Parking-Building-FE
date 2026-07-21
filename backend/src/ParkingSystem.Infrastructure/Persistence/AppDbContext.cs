using Microsoft.EntityFrameworkCore;
using ParkingSystem.Domain.Common;
using ParkingSystem.Domain.Entities;

namespace ParkingSystem.Infrastructure.Persistence;

/// <summary>
/// EF Core DbContext for the parking system. Infrastructure-internal;
/// Application services do not depend on this type directly — they use
/// <see cref="Application.Common.Interfaces.IRepository{T}"/> +
/// <see cref="Application.Common.Interfaces.IUnitOfWork"/> instead.
/// </summary>
public class AppDbContext : DbContext
{
    public AppDbContext(DbContextOptions<AppDbContext> options) : base(options)
    {
    }

    public DbSet<Role> Roles => Set<Role>();
    public DbSet<User> Users => Set<User>();
    public DbSet<Building> Buildings => Set<Building>();
    public DbSet<Floor> Floors => Set<Floor>();
    public DbSet<ParkingZone> ParkingZones => Set<ParkingZone>();
    public DbSet<ParkingSlot> ParkingSlots => Set<ParkingSlot>();
    public DbSet<VehicleType> VehicleTypes => Set<VehicleType>();
    public DbSet<Vehicle> Vehicles => Set<Vehicle>();
    public DbSet<ParkingTicket> ParkingTickets => Set<ParkingTicket>();
    public DbSet<ParkingSession> ParkingSessions => Set<ParkingSession>();
    public DbSet<PricingRule> PricingRules => Set<PricingRule>();
    public DbSet<Payment> Payments => Set<Payment>();
    public DbSet<AIRecommendationLog> AIRecommendationLogs => Set<AIRecommendationLog>();
    public DbSet<SystemLog> SystemLogs => Set<SystemLog>();
    public DbSet<MonthlyPass> MonthlyPasses => Set<MonthlyPass>();
    public DbSet<Reservation> Reservations => Set<Reservation>();
    public DbSet<Notification> Notifications => Set<Notification>();
    public DbSet<LostTicketCase> LostTicketCases => Set<LostTicketCase>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);

        modelBuilder.ApplyConfigurationsFromAssembly(typeof(AppDbContext).Assembly);

        foreach (var entityType in modelBuilder.Model.GetEntityTypes())
        {
            if (typeof(BaseEntity).IsAssignableFrom(entityType.ClrType))
            {
                var parameter = System.Linq.Expressions.Expression.Parameter(entityType.ClrType, "e");
                var prop = System.Linq.Expressions.Expression.Property(parameter, nameof(BaseEntity.IsDeleted));
                var falseConst = System.Linq.Expressions.Expression.Constant(false);
                var body = System.Linq.Expressions.Expression.Equal(prop, falseConst);
                var lambda = System.Linq.Expressions.Expression.Lambda(body, parameter);
                modelBuilder.Entity(entityType.ClrType).HasQueryFilter(lambda);
            }
        }
    }

    /// <summary>
    /// Internal seeding helper invoked from <c>Program.cs</c> on startup.
    /// </summary>
    public async Task SeedAsync(CancellationToken cancellationToken = default)
    {
        await DbSeeder.SeedAsync(this);
    }
}