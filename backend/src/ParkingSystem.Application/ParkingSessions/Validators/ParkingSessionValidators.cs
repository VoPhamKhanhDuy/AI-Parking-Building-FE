using FluentValidation;
using ParkingSystem.Application.ParkingSessions.DTOs;

namespace ParkingSystem.Application.ParkingSessions.Validators;

public class StartSessionRequestValidator : AbstractValidator<StartSessionRequest>
{
    public StartSessionRequestValidator()
    {
        RuleFor(x => x.TicketId).NotEmpty();
        RuleFor(x => x.SlotId).NotEmpty();
    }
}