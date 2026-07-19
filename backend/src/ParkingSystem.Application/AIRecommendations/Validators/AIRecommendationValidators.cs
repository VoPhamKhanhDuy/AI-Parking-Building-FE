using FluentValidation;
using ParkingSystem.Application.AIRecommendations.DTOs;

namespace ParkingSystem.Application.AIRecommendations.Validators;

public class RequestRecommendationRequestValidator : AbstractValidator<RequestRecommendationRequest>
{
    public RequestRecommendationRequestValidator()
    {
        RuleFor(x => x.LicensePlate)
            .NotEmpty().WithMessage("License plate is required.")
            .MaximumLength(20);

        RuleFor(x => x.VehicleCategory).IsInEnum();
        RuleFor(x => x.TicketType).IsInEnum();
    }
}
