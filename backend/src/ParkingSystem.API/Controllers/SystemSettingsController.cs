using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using ParkingSystem.Domain.Enums;

namespace ParkingSystem.API.Controllers;

[ApiController]
[Route("api/system-settings")]
[Authorize(Roles = SystemRoles.Admin)]
public class SystemSettingsController : ControllerBase
{
    private static SystemSettingsDto CurrentSettings = new()
    {
        FacilityName = "AI Parking Building A",
        OperatingMode = "Normal",
        TotalCapacityLimit = 450,
        PasswordExpirationDays = 90,
        FailedLockoutThreshold = 5,
        SessionTimeoutMinutes = 30,
        AiConfidenceThreshold = 88,
        AutoCheckInApproval = true,
        LogRetentionDays = 365,
        ExportFormat = "CSV"
    };

    /// <summary>Get current system configurations (Admin only).</summary>
    [HttpGet]
    [ProducesResponseType(typeof(SystemSettingsDto), StatusCodes.Status200OK)]
    public IActionResult GetSettings()
    {
        return Ok(CurrentSettings);
    }

    /// <summary>Update system configuration parameters (Admin only).</summary>
    [HttpPut]
    [ProducesResponseType(typeof(SystemSettingsDto), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    public IActionResult UpdateSettings([FromBody] SystemSettingsDto request)
    {
        if (request == null)
        {
            return BadRequest(new { message = "Invalid configuration data." });
        }

        if (!string.IsNullOrWhiteSpace(request.FacilityName)) CurrentSettings.FacilityName = request.FacilityName;
        if (!string.IsNullOrWhiteSpace(request.OperatingMode)) CurrentSettings.OperatingMode = request.OperatingMode;
        if (request.TotalCapacityLimit > 0) CurrentSettings.TotalCapacityLimit = request.TotalCapacityLimit;
        if (request.PasswordExpirationDays > 0) CurrentSettings.PasswordExpirationDays = request.PasswordExpirationDays;
        if (request.FailedLockoutThreshold > 0) CurrentSettings.FailedLockoutThreshold = request.FailedLockoutThreshold;
        if (request.SessionTimeoutMinutes > 0) CurrentSettings.SessionTimeoutMinutes = request.SessionTimeoutMinutes;
        if (request.AiConfidenceThreshold > 0) CurrentSettings.AiConfidenceThreshold = request.AiConfidenceThreshold;
        CurrentSettings.AutoCheckInApproval = request.AutoCheckInApproval;
        if (request.LogRetentionDays > 0) CurrentSettings.LogRetentionDays = request.LogRetentionDays;
        if (!string.IsNullOrWhiteSpace(request.ExportFormat)) CurrentSettings.ExportFormat = request.ExportFormat;

        return Ok(CurrentSettings);
    }
}

public class SystemSettingsDto
{
    public string FacilityName { get; set; } = string.Empty;
    public string OperatingMode { get; set; } = string.Empty;
    public int TotalCapacityLimit { get; set; }
    public int PasswordExpirationDays { get; set; }
    public int FailedLockoutThreshold { get; set; }
    public int SessionTimeoutMinutes { get; set; }
    public int AiConfidenceThreshold { get; set; }
    public bool AutoCheckInApproval { get; set; }
    public int LogRetentionDays { get; set; }
    public string ExportFormat { get; set; } = string.Empty;
}
