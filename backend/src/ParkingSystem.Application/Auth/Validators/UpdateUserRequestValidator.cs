using FluentValidation;
using ParkingSystem.Application.Auth.DTOs;
using ParkingSystem.Domain.Enums;

namespace ParkingSystem.Application.Auth.Validators;

public class UpdateUserRequestValidator : AbstractValidator<UpdateUserRequest>
{
    public UpdateUserRequestValidator()
    {
        RuleFor(x => x.FullName)
            .MaximumLength(150)
            .When(x => x.FullName is not null);

        RuleFor(x => x.PhoneNumber)
            .MaximumLength(30)
            .When(x => x.PhoneNumber is not null);

        RuleFor(x => x.Role)
            .Must(BeAValidRole)
            .When(x => x.Role is not null)
            .WithMessage($"Role must be one of: {SystemRoles.Admin}, {SystemRoles.Manager}, {SystemRoles.Staff}, {SystemRoles.Driver}.");

        RuleFor(x => x.NewPassword)
            .MinimumLength(8)
            .MaximumLength(100)
            .Matches("[A-Z]").WithMessage("Password must contain at least one uppercase letter.")
            .Matches("[a-z]").WithMessage("Password must contain at least one lowercase letter.")
            .Matches("[0-9]").WithMessage("Password must contain at least one digit.")
            .When(x => x.NewPassword is not null);
    }

    private static bool BeAValidRole(string? role) =>
        role == SystemRoles.Admin
        || role == SystemRoles.Manager
        || role == SystemRoles.Staff
        || role == SystemRoles.Driver;
}