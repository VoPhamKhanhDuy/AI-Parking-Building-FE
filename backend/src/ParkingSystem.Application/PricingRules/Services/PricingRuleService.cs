using ParkingSystem.Application.Common.Exceptions;
using ParkingSystem.Application.Common.Interfaces;
using ParkingSystem.Application.PricingRules.DTOs;
using ParkingSystem.Application.PricingRules.Interfaces;
using ParkingSystem.Application.PricingRules.Mappings;
using ParkingSystem.Application.PricingRules.Specifications;
using ParkingSystem.Domain.Entities;
using ParkingSystem.Domain.Enums;

namespace ParkingSystem.Application.PricingRules.Services;

public class PricingRuleService : IPricingRuleService
{
    private readonly IRepository<PricingRule> _rules;
    private readonly IRepository<VehicleType> _vehicleTypes;
    private readonly IUnitOfWork _uow;
    private readonly TimeProvider _clock;

    public PricingRuleService(
        IRepository<PricingRule> rules,
        IRepository<VehicleType> vehicleTypes,
        IUnitOfWork uow,
        TimeProvider clock)
    {
        _rules = rules;
        _vehicleTypes = vehicleTypes;
        _uow = uow;
        _clock = clock;
    }

    public async Task<IReadOnlyList<PricingRules.DTOs.PricingRuleDto>> ListAsync(
        Guid? vehicleTypeId,
        TicketType? ticketType,
        bool? isActive,
        CancellationToken ct = default)
    {
        var rows = await _rules.ListAsync(
            new PricingRuleSpecifications.ListFiltered(vehicleTypeId, ticketType, isActive), ct);
        return rows.Select(r => r.ToDto()).ToList();
    }

    public async Task<PricingRules.DTOs.PricingRuleDto?> GetByIdAsync(Guid id, CancellationToken ct = default)
    {
        var r = await _rules.FirstOrDefaultAsync(
            new PricingRuleSpecifications.ByIdWithVehicleType(id), ct);
        return r?.ToDto();
    }

    public async Task<PricingRules.DTOs.PricingRuleDto?> ResolveForBillingAsync(
        Guid vehicleTypeId,
        TicketType ticketType,
        DateTime atUtc,
        CancellationToken ct = default)
    {
        var at = EnsureUtc(atUtc);
        var r = await _rules.FirstOrDefaultAsync(
            new PricingRuleSpecifications.ActiveForBilling(vehicleTypeId, ticketType, at), ct);
        return r?.ToDto();
    }

    public async Task<PricingRules.DTOs.PricingRuleDto> CreateAsync(CreatePricingRuleRequest req, CancellationToken ct = default)
    {
        var vt = await _vehicleTypes.GetByIdAsync(req.VehicleTypeId, ct)
            ?? throw new ValidationException($"VehicleType '{req.VehicleTypeId}' does not exist.");

        var rule = new PricingRule
        {
            VehicleTypeId = vt.Id,
            TicketType = req.TicketType,
            PricePerHour = req.PricePerHour,
            PricePerDay = req.PricePerDay,
            PricePerMonth = req.PricePerMonth,
            PenaltyFee = req.PenaltyFee,
            EffectiveFrom = EnsureUtc(req.EffectiveFrom),
            EffectiveTo = req.EffectiveTo.HasValue ? EnsureUtc(req.EffectiveTo.Value) : null,
            IsActive = req.IsActive
        };

        await _rules.AddAsync(rule, ct);
        await _uow.SaveChangesAsync(ct);

        rule.VehicleType = vt;
        return rule.ToDto();
    }

    public async Task<PricingRules.DTOs.PricingRuleDto> UpdateAsync(Guid id, UpdatePricingRuleRequest req, CancellationToken ct = default)
    {
        var rule = await _rules.FirstOrDefaultAsync(
            new PricingRuleSpecifications.ByIdWithVehicleType(id), ct)
            ?? throw new NotFoundException(nameof(PricingRule), id);

        if (req.PricePerHour.HasValue) rule.PricePerHour = req.PricePerHour.Value;
        if (req.PricePerDay.HasValue) rule.PricePerDay = req.PricePerDay.Value;
        if (req.PricePerMonth.HasValue) rule.PricePerMonth = req.PricePerMonth.Value;
        if (req.PenaltyFee.HasValue) rule.PenaltyFee = req.PenaltyFee.Value;
        if (req.EffectiveFrom.HasValue) rule.EffectiveFrom = EnsureUtc(req.EffectiveFrom.Value);
        if (req.EffectiveTo.HasValue)
        {
            // null sent => clear the end-date (an "open-ended" rule).
            rule.EffectiveTo = req.EffectiveTo.HasValue ? EnsureUtc(req.EffectiveTo.Value) : null;
        }
        if (req.IsActive.HasValue) rule.IsActive = req.IsActive.Value;

        rule.UpdatedAt = _clock.GetUtcNow().UtcDateTime;
        _rules.Update(rule);
        await _uow.SaveChangesAsync(ct);
        return rule.ToDto();
    }

    public async Task<PricingRules.DTOs.PricingRuleDto> SetActiveAsync(Guid id, bool isActive, CancellationToken ct = default)
    {
        var rule = await _rules.FirstOrDefaultAsync(
            new PricingRuleSpecifications.ByIdWithVehicleType(id), ct)
            ?? throw new NotFoundException(nameof(PricingRule), id);

        rule.IsActive = isActive;
        rule.UpdatedAt = _clock.GetUtcNow().UtcDateTime;
        _rules.Update(rule);
        await _uow.SaveChangesAsync(ct);
        return rule.ToDto();
    }

    public async Task DeleteAsync(Guid id, CancellationToken ct = default)
    {
        var rule = await _rules.GetByIdAsync(id, ct)
            ?? throw new NotFoundException(nameof(PricingRule), id);

        // Soft-delete to preserve historical tickets / payments that may reference the rule semantics.
        rule.IsDeleted = true;
        rule.IsActive = false;
        rule.UpdatedAt = _clock.GetUtcNow().UtcDateTime;
        _rules.Update(rule);
        await _uow.SaveChangesAsync(ct);
    }

    private static DateTime EnsureUtc(DateTime value) => value.Kind switch
    {
        DateTimeKind.Utc => value,
        DateTimeKind.Local => value.ToUniversalTime(),
        _ => DateTime.SpecifyKind(value, DateTimeKind.Utc)
    };
}
