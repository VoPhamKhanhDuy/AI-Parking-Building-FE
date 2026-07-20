using FluentValidation;
using ParkingSystem.Application.Payments.DTOs;
using ParkingSystem.Domain.Enums;

namespace ParkingSystem.Application.Payments.Validators;

public class CreatePaymentRequestValidator : AbstractValidator<CreatePaymentRequest>
{
    public CreatePaymentRequestValidator()
    {
        RuleFor(x => x.SessionId).NotEmpty();
        RuleFor(x => x.Amount).GreaterThanOrEqualTo(0);
    }
}

public class MarkPaidRequestValidator : AbstractValidator<MarkPaidRequest>
{
    public MarkPaidRequestValidator()
    {
        // For card / bank / e-wallet we expect a transaction reference.
        When(x => x.Method is PaymentMethod.Card or PaymentMethod.BankTransfer or PaymentMethod.EWallet, () =>
        {
            RuleFor(x => x.TransactionReference)
                .NotEmpty()
                .WithMessage("TransactionReference is required for non-cash payment methods.");
        });
    }
}