namespace ParkingSystem.Application.Common.Exceptions;

/// <summary>
/// Base class for application-level business rule violations.
/// Controllers translate this to a 400 / 401 / 403 / 404 / 409 response.
/// </summary>
public abstract class AppException : Exception
{
    public abstract int StatusCode { get; }
    public string Code { get; }

    protected AppException(string code, string message) : base(message)
    {
        Code = code;
    }
}

public sealed class ValidationException : AppException
{
    public override int StatusCode => 400;
    public ValidationException(string message) : base("validation_error", message) { }
}

public sealed class UnauthorizedException : AppException
{
    public override int StatusCode => 401;
    public UnauthorizedException(string message = "Invalid credentials.") : base("unauthorized", message) { }
}

public sealed class ForbiddenException : AppException
{
    public override int StatusCode => 403;
    public ForbiddenException(string message) : base("forbidden", message) { }
}

public sealed class NotFoundException : AppException
{
    public override int StatusCode => 404;
    public NotFoundException(string entity, object key) : base("not_found", $"{entity} '{key}' was not found.") { }
}

public sealed class ConflictException : AppException
{
    public override int StatusCode => 409;
    public ConflictException(string message) : base("conflict", message) { }
}