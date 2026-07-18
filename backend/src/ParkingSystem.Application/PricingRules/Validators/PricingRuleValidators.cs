using FluentValidation;
using ParkingSystem.Application.PricingRules.DTOs;

namespace ParkingSystem.Application.PricingRules.Validators;

public class PricingRuleValidators : AbstractValidator<CreatePricingRuleRequest>
{
    public PricingRuleValidators()
    {
        RuleFor(x => x.VehicleTypeId).NotEmpty();
        RuleFor(x => x.PricePerHour).GreaterThanOrEqualTo(0);
        RuleFor(x => x.PricePerDay).GreaterThanOrEqualTo(0);
        RuleFor(x => x.PricePerMonth).GreaterThanOrEqualTo(0);
        RuleFor(x => x.PenaltyFee).GreaterThanOrEqualTo(0);

        RuleFor(x => x)
            .Must(x => x.PricePerHour > 0m || x.PricePerDay > 0m || x.PricePerMonth > 0m)
            .WithMessage("At least one of PricePerHour / PricePerDay / PricePerMonth must be greater than zero.");

        When(x => x.EffectiveTo.HasValue, () =>
        {
            RuleFor(x => x).Must(x => x.EffectiveTo!.Value > x.EffectiveFrom)
                .WithMessage("EffectiveTo must be after EffectiveFrom.");
        });
    }
}

public class UpdatePricingRuleRequestValidator : AbstractValidator<UpdatePricingRuleRequest>
{
    public UpdatePricingRuleRequestValidator()
    {
        RuleFor(x => x.PricePerHour!.Value).GreaterThanOrEqualTo(0).When(x => x.PricePerHour.HasValue);
        RuleFor(x => x.PricePerDay!.Value).GreaterThanOrEqualTo(0).When(x => x.PricePerDay.HasValue);
        RuleFor(x => x.PricePerMonth!.Value).GreaterThanOrEqualTo(0).When(x => x.PricePerMonth.HasValue);
        RuleFor(x => x.PenaltyFee!.Value).GreaterThanOrEqualTo(0).When(x => x.PenaltyFee.HasValue);

        When(x => x.EffectiveFrom.HasValue && x.EffectiveTo.HasValue, () =>
        {
            RuleFor(x => x).Must(x => x.EffectiveTo!.Value > x.EffectiveFrom!.Value)
                .WithMessage("EffectiveTo must be after EffectiveFrom.");
        });
    }
}
