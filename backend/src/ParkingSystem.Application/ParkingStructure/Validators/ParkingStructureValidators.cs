using FluentValidation;
using ParkingSystem.Application.ParkingStructure.DTOs;

namespace ParkingSystem.Application.ParkingStructure.Validators;

public class CreateBuildingRequestValidator : AbstractValidator<CreateBuildingRequest>
{
    public CreateBuildingRequestValidator()
    {
        RuleFor(x => x.Name)
            .NotEmpty().WithMessage("Building name is required.")
            .MaximumLength(100);

        RuleFor(x => x.Address)
            .MaximumLength(255).When(x => x.Address is not null);

        RuleFor(x => x.TotalFloors)
            .GreaterThanOrEqualTo(1).WithMessage("TotalFloors must be at least 1.")
            .LessThanOrEqualTo(200);
    }
}

public class UpdateBuildingRequestValidator : AbstractValidator<UpdateBuildingRequest>
{
    public UpdateBuildingRequestValidator()
    {
        RuleFor(x => x.Name).MaximumLength(100).When(x => !string.IsNullOrWhiteSpace(x.Name));
        RuleFor(x => x.Address).MaximumLength(255).When(x => x.Address is not null);
        RuleFor(x => x.TotalFloors!.Value)
            .GreaterThanOrEqualTo(1).When(x => x.TotalFloors.HasValue)
            .LessThanOrEqualTo(200);
    }
}

public class CreateFloorRequestValidator : AbstractValidator<CreateFloorRequest>
{
    public CreateFloorRequestValidator()
    {
        RuleFor(x => x.BuildingId).NotEmpty();
        RuleFor(x => x.FloorNumber).InclusiveBetween(-10, 200);
        RuleFor(x => x.Name).MaximumLength(100).When(x => x.Name is not null);
    }
}

public class UpdateFloorRequestValidator : AbstractValidator<UpdateFloorRequest>
{
    public UpdateFloorRequestValidator()
    {
        RuleFor(x => x!.FloorNumber!.Value)
            .InclusiveBetween(-10, 200).When(x => x.FloorNumber.HasValue);
        RuleFor(x => x!.Name).MaximumLength(100).When(x => !string.IsNullOrWhiteSpace(x.Name));
    }
}

public class CreateParkingZoneRequestValidator : AbstractValidator<CreateParkingZoneRequest>
{
    public CreateParkingZoneRequestValidator()
    {
        RuleFor(x => x.FloorId).NotEmpty();
        RuleFor(x => x.VehicleTypeId).NotEmpty();
        RuleFor(x => x.Name).NotEmpty().MaximumLength(100);
        RuleFor(x => x.DistanceToExitOrElevator).GreaterThanOrEqualTo(0);
        RuleFor(x => x.Priority).GreaterThanOrEqualTo(0);
    }
}

public class UpdateParkingZoneRequestValidator : AbstractValidator<UpdateParkingZoneRequest>
{
    public UpdateParkingZoneRequestValidator()
    {
        RuleFor(x => x!.Name).MaximumLength(100).When(x => !string.IsNullOrWhiteSpace(x.Name));
        RuleFor(x => x!.DistanceToExitOrElevator!.Value)
            .GreaterThanOrEqualTo(0).When(x => x.DistanceToExitOrElevator.HasValue);
        RuleFor(x => x!.Priority!.Value)
            .GreaterThanOrEqualTo(0).When(x => x.Priority.HasValue);
    }
}

public class CreateParkingSlotRequestValidator : AbstractValidator<CreateParkingSlotRequest>
{
    public CreateParkingSlotRequestValidator()
    {
        RuleFor(x => x.ParkingZoneId).NotEmpty();
        RuleFor(x => x.SlotCode).NotEmpty().MaximumLength(50);
    }
}

public class CreateParkingSlotsBulkRequestValidator : AbstractValidator<CreateParkingSlotsBulkRequest>
{
    public CreateParkingSlotsBulkRequestValidator()
    {
        RuleFor(x => x.ParkingZoneId).NotEmpty();
        RuleFor(x => x.CodeFormat).NotEmpty().MaximumLength(50)
            .Must(f => f.Contains("{0", StringComparison.Ordinal)).WithMessage("CodeFormat must contain a '{0}' index placeholder.");
        RuleFor(x => x.StartIndex).GreaterThanOrEqualTo(0);
        RuleFor(x => x.Count).InclusiveBetween(1, 1000);
    }
}

public class UpdateParkingSlotRequestValidator : AbstractValidator<UpdateParkingSlotRequest>
{
    public UpdateParkingSlotRequestValidator()
    {
        RuleFor(x => x.SlotCode).MaximumLength(50).When(x => !string.IsNullOrWhiteSpace(x.SlotCode));
        RuleFor(x => x.DistanceToExitOrElevator!.Value)
            .GreaterThanOrEqualTo(0).When(x => x.DistanceToExitOrElevator.HasValue);
    }
}
