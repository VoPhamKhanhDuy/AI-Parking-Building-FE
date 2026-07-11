using System.Text.Json;
using Microsoft.EntityFrameworkCore;
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
        catch (DbUpdateException ex) when (IsUniqueViolation(ex))
        {
            // Map DB unique-constraint failures to 409 Conflict so callers get a clean
            // domain-level error instead of a 500 stack trace. Avoids a direct Npgsql
            // dependency in the API project; Postgres error 23505 = unique_violation.
            _logger.LogWarning(ex, "Unique constraint violation");
            await WriteErrorAsync(context, 409, "conflict", ExtractUniqueMessage(ex));
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

    /// <summary>
    /// Detects Postgres unique_violation (SQLSTATE 23505) via reflection on the inner
    /// exception, without taking a direct dependency on Npgsql in this layer.
    /// </summary>
    private static bool IsUniqueViolation(DbUpdateException ex)
    {
        for (var inner = ex.InnerException; inner is not null; inner = inner.InnerException)
        {
            var type = inner.GetType();
            var sqlState = type.GetProperty("SqlState")?.GetValue(inner) as string;
            if (sqlState == "23505") return true;
        }
        return false;
    }

    private static string ExtractUniqueMessage(DbUpdateException ex)
    {
        var msg = ex.InnerException?.Message ?? "A unique constraint was violated.";
        // Trim noisy stack lines if present.
        var firstLine = msg.Split('\n', 2)[0].Trim();
        return string.IsNullOrEmpty(firstLine) ? "A unique constraint was violated." : firstLine;
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