using FluentValidation;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.Filters;

namespace ParkingSystem.API.Validation;

/// <summary>
/// Action filter that runs FluentValidation against any incoming request DTO
/// that has a registered <see cref="IValidator{T}"/>. Returns 400 with
/// a structured error envelope when validation fails.
/// </summary>
public class FluentValidationFilter : IAsyncActionFilter
{
    private readonly IServiceProvider _serviceProvider;

    public FluentValidationFilter(IServiceProvider serviceProvider)
    {
        _serviceProvider = serviceProvider;
    }

    public async Task OnActionExecutionAsync(ActionExecutingContext context, ActionExecutionDelegate next)
    {
        foreach (var (_, value) in context.ActionArguments)
        {
            if (value is null) continue;

            var validatorType = typeof(IValidator<>).MakeGenericType(value.GetType());
            var validator = _serviceProvider.GetService(validatorType) as IValidator;
            if (validator is null) continue;

            var validationContext = new ValidationContext<object>(value);
            var result = await validator.ValidateAsync(validationContext, context.HttpContext.RequestAborted);

            if (!result.IsValid)
            {
                var errors = result.Errors
                    .GroupBy(e => e.PropertyName)
                    .ToDictionary(
                        g => string.IsNullOrEmpty(g.Key) ? "_" : g.Key,
                        g => g.Select(e => e.ErrorMessage).ToArray());

                context.Result = new BadRequestObjectResult(new
                {
                    error = new
                    {
                        code = "validation_error",
                        message = "One or more validation errors occurred.",
                        details = errors
                    }
                });
                return;
            }
        }

        await next();
    }
}