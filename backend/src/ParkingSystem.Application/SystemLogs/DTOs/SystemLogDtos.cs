namespace ParkingSystem.Application.SystemLogs.DTOs;

public class SystemLogDto
{
    public Guid Id { get; set; }
    public Guid? UserId { get; set; }
    public string? UserName { get; set; }
    public string Action { get; set; } = string.Empty;
    public string? TargetEntity { get; set; }
    public Guid? TargetEntityId { get; set; }
    public string? Description { get; set; }
    public string? IpAddress { get; set; }
    public DateTime CreatedAt { get; set; }
}

public class SystemLogListResponse
{
    public List<SystemLogDto> Logs { get; set; } = new();
    public int TotalCount { get; set; }
    public List<string> Modules { get; set; } = new();
    public int Page { get; set; }
    public int PageSize { get; set; }
}
