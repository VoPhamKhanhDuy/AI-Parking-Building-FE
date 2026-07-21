using ParkingSystem.Application.PricingRules.DTOs;

namespace ParkingSystem.Application.PricingRules.Interfaces;

public interface IPricingRuleService
{
    Task<IReadOnlyList<PricingRuleDto>> ListAsync(
        Guid? vehicleTypeId,
        Domain.Enums.TicketType? ticketType,
        bool? isActive,
        CancellationToken ct = default);

    Task<PricingRuleDto?> GetByIdAsync(Guid id, CancellationToken ct = default);

    /// <summary>Find the active rule used for billing right now for a given vehicle type and ticket kind.</summary>
    Task<PricingRuleDto?> ResolveForBillingAsync(
        Guid vehicleTypeId,
        Domain.Enums.TicketType ticketType,
        DateTime atUtc,
        CancellationToken ct = default);

    Task<PricingRuleDto> CreateAsync(CreatePricingRuleRequest req, CancellationToken ct = default);
    Task<PricingRuleDto> UpdateAsync(Guid id, UpdatePricingRuleRequest req, CancellationToken ct = default);
    Task<PricingRuleDto> SetActiveAsync(Guid id, bool isActive, CancellationToken ct = default);
    Task DeleteAsync(Guid id, CancellationToken ct = default);
}
