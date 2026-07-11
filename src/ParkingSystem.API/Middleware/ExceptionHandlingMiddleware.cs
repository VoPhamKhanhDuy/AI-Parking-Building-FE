using System.Text.Json;
using ParkingSystem.Application.Common.Exceptions;

namespace ParkingSystem.API.Middleware;

/// <summary>
/// Translates <see cref="AppException"/> into a JSON error response with the
/// correct HTTP status. Validation errors from FluentValidation are caught
/// separately by the framework's auto-400 pipeline, so this middleware only
/// handles application-defined exceptions.
/// </summary>
public class ExceptionHandlingMiddleware
{
    private readonly RequestDelegate _next;
    private readonly ILogger<ExceptionHandlingMiddleware> _logger;

    public ExceptionHandlingMiddleware(RequestDelegate next, ILogger<ExceptionHandlingMiddleware> logger)
    {
        _next = next;
        _logger = logger;
    }

    public async Task InvokeAsync(HttpContext context)
    {
        try
        {
            await _next(context);
        }
        catch (AppException ex)
        {
            _logger.LogWarning(ex, "AppException: {Code} {Message}", ex.Code, ex.Message);
            await WriteErrorAsync(context, ex.StatusCode, ex.Code, ex.Message);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Unhandled exception");
            await WriteErrorAsync(context, 500, "internal_error", "An unexpected error occurred.");
        }
    }

    private static Task WriteErrorAsync(HttpContext context, int status, string code, string message)
    {
        if (context.Response.HasStarted)
        {
            return Task.CompletedTask;
        }

        context.Response.Clear();
        context.Response.StatusCode = status;
        context.Response.ContentType = "application/json; charset=utf-8";

        var payload = new
        {
            error = new
            {
                code,
                message
            }
        };

        return context.Response.WriteAsync(JsonSerializer.Serialize(payload, new JsonSerializerOptions
        {
            PropertyNamingPolicy = JsonNamingPolicy.CamelCase
        }));
    }
}