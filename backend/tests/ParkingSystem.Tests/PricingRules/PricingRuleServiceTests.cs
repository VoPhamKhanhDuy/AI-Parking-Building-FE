using ParkingSystem.Application.Common.Exceptions;
using ParkingSystem.Application.PricingRules.DTOs;
using ParkingSystem.Application.PricingRules.Services;
using ParkingSystem.Domain.Entities;
using ParkingSystem.Domain.Enums;
using ParkingSystem.Tests.Common;

namespace ParkingSystem.Tests.PricingRules;

/// <summary>
/// Unit tests for PricingRuleService — focuses on lifecycle (create/update/delete)
/// and ResolveForBilling (the active-window selector that is the only way the rest of
/// the system knows which price to charge).
/// </summary>
public class PricingRuleServiceTests
{
    private static readonly DateTime Now = new(2026, 7, 1, 0, 0, 0, DateTimeKind.Utc);
    private static readonly DateTime Earlier = Now.AddMonths(-6);
    private static readonly DateTime Later = Now.AddMonths(6);

    private static (PricingRuleService svc,
                    InMemoryRepository<PricingRule> rules,
                    InMemoryRepository<VehicleType> vehicleTypes,
                    FakeUnitOfWork uow)
        Build(DateTime? nowUtc = null)
    {
        var rules = new InMemoryRepository<PricingRule>();
        var vehicleTypes = new InMemoryRepository<VehicleType>();
        var uow = new FakeUnitOfWork();
        var clock = new FixedTimeProvider(nowUtc ?? Now);
        var svc = new PricingRuleService(rules, vehicleTypes, uow, clock);
        return (svc, rules, vehicleTypes, uow);
    }

    private static VehicleType SeedCar(InMemoryRepository<VehicleType> vehicleTypes)
    {
        var vt = new VehicleType
        {
            Id = Guid.NewGuid(),
            Name = "Car",
            Category = VehicleTypeCategory.Car,
            DefaultHourlyRate = 10000m
        };
        vehicleTypes.AddAsync(vt).GetAwaiter().GetResult();
        return vt;
    }

    [Fact]
    public async Task CreateAsync_persists_rule_with_normalized_utc()
    {
        var (svc, rules, vehicleTypes, uow) = Build();
        var vt = new VehicleType { Id = Guid.NewGuid(), Name = "Car", Category = VehicleTypeCategory.Car, DefaultHourlyRate = 10000m };
        await vehicleTypes.AddAsync(vt);

        var req = new CreatePricingRuleRequest
        {
            VehicleTypeId = vt.Id,
            TicketType = TicketType.Hourly,
            PricePerHour = 5000m,
            PricePerDay = 30000m,
            PricePerMonth = 500000m,
            PenaltyFee = 100000m,
            EffectiveFrom = DateTime.SpecifyKind(new DateTime(2026, 1, 1), DateTimeKind.Utc),
            EffectiveTo = null,
            IsActive = true
        };

        var dto = await svc.CreateAsync(req);

        Assert.NotEqual(Guid.Empty, dto.Id);
        Assert.Equal(vt.Id, dto.VehicleTypeId);
        Assert.Equal(TicketType.Hourly, dto.TicketType);
        Assert.Equal(5000m, dto.PricePerHour);
        Assert.Equal(DateTimeKind.Utc, dto.EffectiveFrom.Kind);
        Assert.Equal(1, uow.SaveChangesCallCount);
        Assert.Single(rules.All);
    }

    [Fact]
    public async Task CreateAsync_throws_when_vehicle_type_missing()
    {
        var (svc, _, _, _) = Build();
        var req = new CreatePricingRuleRequest
        {
            VehicleTypeId = Guid.NewGuid(),
            PricePerHour = 100m,
            EffectiveFrom = Now
        };

        await Assert.ThrowsAsync<ValidationException>(() => svc.CreateAsync(req));
    }

    [Fact]
    public async Task DeleteAsync_soft_deletes_and_disables()
    {
        var (svc, rules, vehicleTypes, _) = Build();
        var vt = new VehicleType { Id = Guid.NewGuid(), Name = "Car" };
        await vehicleTypes.AddAsync(vt);
        var rule = new PricingRule { Id = Guid.NewGuid(), VehicleTypeId = vt.Id, TicketType = TicketType.Hourly, PricePerHour = 5000m, IsActive = true };
        await rules.AddAsync(rule);

        await svc.DeleteAsync(rule.Id);

        Assert.True(rule.IsDeleted);
        Assert.False(rule.IsActive);
    }

    [Fact]
    public async Task DeleteAsync_throws_when_not_found()
    {
        var (svc, _, _, _) = Build();
        await Assert.ThrowsAsync<NotFoundException>(() => svc.DeleteAsync(Guid.NewGuid()));
    }

    [Fact]
    public async Task ResolveForBilling_returns_newest_active_rule_in_window()
    {
        var (svc, rules, vehicleTypes, _) = Build();
        var vt = new VehicleType { Id = Guid.NewGuid(), Name = "Car" };
        await vehicleTypes.AddAsync(vt);

        // Older active rule covering now.
        await rules.AddAsync(new PricingRule
        {
            Id = Guid.NewGuid(), VehicleTypeId = vt.Id, TicketType = TicketType.Hourly,
            PricePerHour = 5000m, EffectiveFrom = Earlier, EffectiveTo = null, IsActive = true
        });
        // Newer active rule covering now — should win.
        await rules.AddAsync(new PricingRule
        {
            Id = Guid.NewGuid(), VehicleTypeId = vt.Id, TicketType = TicketType.Hourly,
            PricePerHour = 7000m, EffectiveFrom = Earlier.AddDays(30), EffectiveTo = null, IsActive = true
        });
        // Inactive rule — must NOT win.
        await rules.AddAsync(new PricingRule
        {
            Id = Guid.NewGuid(), VehicleTypeId = vt.Id, TicketType = TicketType.Hourly,
            PricePerHour = 9999m, EffectiveFrom = Earlier, EffectiveTo = null, IsActive = false
        });
        // Future rule — must NOT win.
        await rules.AddAsync(new PricingRule
        {
            Id = Guid.NewGuid(), VehicleTypeId = vt.Id, TicketType = TicketType.Hourly,
            PricePerHour = 8888m, EffectiveFrom = Later, EffectiveTo = null, IsActive = true
        });
        // Expired rule — must NOT win.
        await rules.AddAsync(new PricingRule
        {
            Id = Guid.NewGuid(), VehicleTypeId = vt.Id, TicketType = TicketType.Hourly,
            PricePerHour = 7777m, EffectiveFrom = Earlier.AddYears(-2), EffectiveTo = Earlier.AddYears(-1), IsActive = true
        });
        // Different ticket type — must NOT win.
        await rules.AddAsync(new PricingRule
        {
            Id = Guid.NewGuid(), VehicleTypeId = vt.Id, TicketType = TicketType.Daily,
            PricePerHour = 6666m, EffectiveFrom = Earlier, EffectiveTo = null, IsActive = true
        });

        var resolved = await svc.ResolveForBillingAsync(vt.Id, TicketType.Hourly, Now);

        Assert.NotNull(resolved);
        Assert.Equal(7000m, resolved!.PricePerHour);
    }

    [Fact]
    public async Task ResolveForBilling_returns_null_when_no_active_rule()
    {
        var (svc, rules, vehicleTypes, _) = Build();
        var vt = new VehicleType { Id = Guid.NewGuid(), Name = "Car" };
        await vehicleTypes.AddAsync(vt);

        // Inactive rule only.
        await rules.AddAsync(new PricingRule
        {
            Id = Guid.NewGuid(), VehicleTypeId = vt.Id, TicketType = TicketType.Hourly,
            PricePerHour = 5000m, EffectiveFrom = Earlier, EffectiveTo = null, IsActive = false
        });

        var resolved = await svc.ResolveForBillingAsync(vt.Id, TicketType.Hourly, Now);
        Assert.Null(resolved);
    }

    [Fact]
    public async Task SetActiveAsync_toggles_flag()
    {
        var (svc, rules, vehicleTypes, _) = Build();
        var vt = new VehicleType { Id = Guid.NewGuid(), Name = "Car" };
        await vehicleTypes.AddAsync(vt);
        var rule = new PricingRule { Id = Guid.NewGuid(), VehicleTypeId = vt.Id, IsActive = true };
        await rules.AddAsync(rule);

        var dto = await svc.SetActiveAsync(rule.Id, false);

        Assert.False(dto.IsActive);
        Assert.False(rule.IsActive);
    }

    [Fact]
    public async Task SetActiveAsync_throws_when_not_found()
    {
        var (svc, _, _, _) = Build();
        await Assert.ThrowsAsync<NotFoundException>(() => svc.SetActiveAsync(Guid.NewGuid(), true));
    }

    }