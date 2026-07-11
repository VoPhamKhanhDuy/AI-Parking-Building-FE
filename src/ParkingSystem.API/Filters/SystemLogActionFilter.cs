using System.Diagnostics;
using System.Reflection;
using System.Security.Claims;
using Microsoft.AspNetCore.Mvc.Filters;
using ParkingSystem.Application.SystemLogs.Interfaces;
using ParkingSystem.Domain.Entities;

namespace ParkingSystem.API.Filters;

/// <summary>
/// Global action filter that writes one <see cref="SystemLog"/> row per
/// processed request. Skips noisy endpoints (Swagger, health probes) and
/// skipped paths are controlled by <see cref="SkipPaths"/>.
///
/// Order of execution: runs AFTER FluentValidationFilter, so requests that
/// fail validation with 400 do NOT generate an audit row (they never reached
/// the action). Runs BEFORE ExceptionHandlingMiddleware, so 4xx/5xx are
/// captured with their exception summary in the description.
///
/// The audit write is fire-and-forget at the API boundary (we await it,
/// but <c>ISystemLogService</c> itself swallows I/O failures) — a logging
/// outage must never fail the original request.
/// </summary>
public class SystemLogActionFilter : IAsyncActionFilter
{
    private readonly ISystemLogService _logs;
    private readonly ILogger<SystemLogActionFilter> _logger;

    /// <summary>
    /// Endpoints that should never produce an audit row. Matched as a
    /// case-insensitive prefix on <see cref="HttpRequest.Path"/>.
    /// </summary>
    public static readonly string[] SkipPaths =
    {
        "/swagger",
        "/favicon.ico"
    };

    public SystemLogActionFilter(ISystemLogService logs, ILogger<SystemLogActionFilter> logger)
    {
        _logs = logs;
        _logger = logger;
    }

    public async Task OnActionExecutionAsync(ActionExecutingContext context, ActionExecutionDelegate next)
    {
        var http = context.HttpContext;
        var path = http.Request.Path.Value ?? string.Empty;

        // Skip non-API paths.
        if (!path.StartsWith("/api", StringComparison.OrdinalIgnoreCase))
            return;
        if (SkipPaths.Any(p => path.StartsWith(p, StringComparison.OrdinalIgnoreCase)))
            return;

        var stopwatch = Stopwatch.StartNew();
        Exception? caught = null;
        try
        {
            var result = await next();
            caught = result.Exception;
        }
        catch (Exception ex)
        {
            caught = ex;
            throw; // Re-throw so ExceptionHandlingMiddleware formats the response.
        }
        finally
        {
            stopwatch.Stop();

            // Only write if the action actually executed (not short-circuited
            // by FluentValidation or an earlier filter producing a 400).
            if (caught is null || caught.GetType() != typeof(OperationCanceledException))
            {
                try
                {
                    var entry = BuildEntry(context, path, http.Response.StatusCode, stopwatch.ElapsedMilliseconds, caught);
                    await _logs.LogAsync(entry, http.RequestAborted);
                }
                catch (Exception ex)
                {
                    // Defensive: LogAsync already swallows I/O errors, but never
                    // let audit logic bubble out of the filter pipeline.
                    _logger.LogError(ex, "SystemLogActionFilter failed to persist audit row.");
                }
            }
        }
    }

    private static SystemLog BuildEntry(
        ActionExecutingContext context,
        string path,
        int statusCode,
        long elapsedMs,
        Exception? ex)
    {
        var http = context.HttpContext;
        var verb = http.Request.Method;
        var actionName = context.ActionDescriptor.DisplayName ?? "Unknown";
        var userId = TryGetUserId(http.User);
        var ip = http.Connection.RemoteIpAddress?.ToString();

        // Format: "VERB /api/foo/{id} 200 12ms"
        var summary = $"{verb} {path} -> {statusCode} ({elapsedMs}ms) [{actionName}]";

        var (targetEntity, targetEntityId) = ExtractTarget(context);

        var entry = new SystemLog
        {
            UserId = userId,
            Action = $"{verb} {NormalizePath(path)}",
            TargetEntity = targetEntity,
            TargetEntityId = targetEntityId,
            IpAddress = ip,
            Description = ex is null
                ? summary
                : $"{summary} | EX={ex.GetType().Name}: {Truncate(ex.Message, 300)}"
        };

        return entry;
    }

    private static Guid? TryGetUserId(ClaimsPrincipal user)
    {
        if (user?.Identity?.IsAuthenticated != true) return null;
        var sub = user.FindFirstValue(ClaimTypes.NameIdentifier)
                  ?? user.FindFirstValue("sub");
        return Guid.TryParse(sub, out var id) ? id : null;
    }

    /// <summary>
    /// Pulls a `{id:guid}` from route values if present. Also derives a
    /// coarse target entity name from the controller (e.g.
    /// <c>VehiclesController</c> -> <c>Vehicle</c>).
    /// </summary>
    private static (string? TargetEntity, Guid? TargetEntityId) ExtractTarget(ActionExecutingContext context)
    {
        Guid? id = null;
        if (context.RouteData.Values.TryGetValue("id", out var raw)
            && raw is not null
            && Guid.TryParse(raw.ToString(), out var parsed))
        {
            id = parsed;
        }

        var controller = context.Controller.GetType().Name;
        var entity = controller.EndsWith("Controller", StringComparison.Ordinal)
            ? controller.Substring(0, controller.Length - "Controller".Length)
            : controller;

        // Singularize naive "Foo" -> "Foo" (we keep plural names verbatim —
        // they match what the API surface reports, which is what audit
        // readers expect).
        return (entity, id);
    }

    private static string NormalizePath(string path)
    {
        // Trim query string if any leaked through.
        var q = path.IndexOf('?');
        return q >= 0 ? path[..q] : path;
    }

    private static string Truncate(string s, int max)
        => string.IsNullOrEmpty(s) || s.Length <= max ? s : s[..max];
}