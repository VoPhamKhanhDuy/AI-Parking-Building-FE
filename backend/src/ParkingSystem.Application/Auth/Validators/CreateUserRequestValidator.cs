using FluentValidation;
using ParkingSystem.Application.Auth.DTOs;
using ParkingSystem.Domain.Enums;

namespace ParkingSystem.Application.Auth.Validators;

public class CreateUserRequestValidator : AbstractValidator<CreateUserRequest>
{
    public CreateUserRequestValidator()
    {
        RuleFor(x => x.Email)
            .NotEmpty()
            .EmailAddress()
            .MaximumLength(255);

        RuleFor(x => x.Password)
            .NotEmpty()
            .MinimumLength(8)
            .MaximumLength(100)
            .Matches("[A-Z]").WithMessage("Password must contain at least one uppercase letter.")
            .Matches("[a-z]").WithMessage("Password must contain at least one lowercase letter.")
            .Matches("[0-9]").WithMessage("Password must contain at least one digit.");

        RuleFor(x => x.FullName)
            .NotEmpty()
            .MaximumLength(150);

        RuleFor(x => x.PhoneNumber)
            .MaximumLength(30)
            .When(x => !string.IsNullOrEmpty(x.PhoneNumber));

        RuleFor(x => x.Role)
            .NotEmpty()
            .Must(BeAValidRole)
            .WithMessage($"Role must be one of: {SystemRoles.Admin}, {SystemRoles.Manager}, {SystemRoles.Staff}, {SystemRoles.Driver}.");
    }

    private static bool BeAValidRole(string role) =>
        role == SystemRoles.Admin
        || role == SystemRoles.Manager
        || role == SystemRoles.Staff
        || role == SystemRoles.Driver;
}