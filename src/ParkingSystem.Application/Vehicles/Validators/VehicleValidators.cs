using FluentValidation;
using ParkingSystem.Application.Vehicles.DTOs;

namespace ParkingSystem.Application.Vehicles.Validators;

public class CreateVehicleRequestValidator : AbstractValidator<CreateVehicleRequest>
{
    public CreateVehicleRequestValidator()
    {
        RuleFor(x => x.LicensePlate)
            .NotEmpty().WithMessage("License plate is required.")
            .MaximumLength(20);

        RuleFor(x => x.VehicleTypeId)
            .NotEmpty().WithMessage("VehicleTypeId is required.");

        RuleFor(x => x.Brand).MaximumLength(50).When(x => x.Brand is not null);
        RuleFor(x => x.Model).MaximumLength(50).When(x => x.Model is not null);
        RuleFor(x => x.Color).MaximumLength(30).When(x => x.Color is not null);
    }
}

public class UpdateVehicleRequestValidator : AbstractValidator<UpdateVehicleRequest>
{
    public UpdateVehicleRequestValidator()
    {
        RuleFor(x => x.LicensePlate!)
            .MaximumLength(20).When(x => !string.IsNullOrWhiteSpace(x.LicensePlate));

        RuleFor(x => x.Brand).MaximumLength(50).When(x => x.Brand is not null);
        RuleFor(x => x.Model).MaximumLength(50).When(x => x.Model is not null);
        RuleFor(x => x.Color).MaximumLength(30).When(x => x.Color is not null);
    }
}