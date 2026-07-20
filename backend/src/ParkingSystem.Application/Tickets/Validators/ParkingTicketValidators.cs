using FluentValidation;
using ParkingSystem.Application.Tickets.DTOs;

namespace ParkingSystem.Application.Tickets.Validators;

public class IssueTicketRequestValidator : AbstractValidator<IssueTicketRequest>
{
    public IssueTicketRequestValidator()
    {
        RuleFor(x => x.VehicleId).NotEmpty();
    }
}

public class CheckOutTicketRequestValidator : AbstractValidator<CheckOutTicketRequest>
{
    public CheckOutTicketRequestValidator()
    {
        RuleFor(x => x.ExitTime!.Value)
            .Must(d => d.Kind == DateTimeKind.Utc)
            .When(x => x.ExitTime.HasValue && x.ExitTime.Value.Kind != DateTimeKind.Utc)
            .WithMessage("ExitTime must be in UTC if provided.");
    }
}