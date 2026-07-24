using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using ParkingSystem.Domain.Enums;

namespace ParkingSystem.API.Controllers;

[ApiController]
[Route("api/roles")]
[Authorize(Roles = SystemRoles.Admin)]
public class RolesController : ControllerBase
{
    private static readonly List<RoleDto> MockRoles = new()
    {
        new RoleDto
        {
            Id = "role-admin",
            Name = "System Admin",
            Description = "Full access to system settings, user directory, audit logs, and control panels.",
            AllowedPermissions = "System Settings, User Directory (Full Access), Audit Logs, Control Panels",
            LimitedPermissions = "None",
            DeniedPermissions = "None"
        },
        new RoleDto
        {
            Id = "role-manager",
            Name = "Facility Manager",
            Description = "Access to floor status, entry/exit logs, and pricing rules edit.",
            AllowedPermissions = "Floor Status, Entry/Exit Logs, Pricing Rules Edit",
            LimitedPermissions = "User Directory (Edit), Reports (Export)",
            DeniedPermissions = "System Control Settings"
        },
        new RoleDto
        {
            Id = "role-staff",
            Name = "Parking Staff",
            Description = "Basic access to entry/exit vehicle logs and basic reports.",
            AllowedPermissions = "Entry/Exit Logs, Basic Reports",
            LimitedPermissions = "User Directory (View Only)",
            DeniedPermissions = "System Settings, Audit Logs"
        },
        new RoleDto
        {
            Id = "role-support",
            Name = "Field Support",
            Description = "Access to basic maintenance panel and floor status view.",
            AllowedPermissions = "Basic Maintenance Panel, Floor Status View",
            LimitedPermissions = "Incident Log Reporting",
            DeniedPermissions = "System Settings, User Directory, Payments"
        },
        new RoleDto
        {
            Id = "role-operator",
            Name = "Operator",
            Description = "Control room operation and camera monitoring access.",
            AllowedPermissions = "Camera Monitoring, Gate Manual Controls, Session Logs",
            LimitedPermissions = "Staff Directory View",
            DeniedPermissions = "System Settings, User Creation"
        }
    };

    /// <summary>Get all system roles and their permission assignments (Admin only).</summary>
    [HttpGet]
    [ProducesResponseType(typeof(IEnumerable<RoleDto>), StatusCodes.Status200OK)]
    public IActionResult GetRoles()
    {
        return Ok(MockRoles);
    }

    /// <summary>Update permissions for a specific role (Admin only).</summary>
    [HttpPut("{id}/permissions")]
    [ProducesResponseType(typeof(RoleDto), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public IActionResult UpdatePermissions(string id, [FromBody] UpdateRolePermissionsRequest request)
    {
        var role = MockRoles.FirstOrDefault(r => r.Id.Equals(id, StringComparison.OrdinalIgnoreCase) || r.Name.Equals(id, StringComparison.OrdinalIgnoreCase));
        if (role == null)
        {
            return NotFound(new { message = $"Role '{id}' not found." });
        }

        if (!string.IsNullOrWhiteSpace(request.AllowedPermissions)) role.AllowedPermissions = request.AllowedPermissions;
        if (!string.IsNullOrWhiteSpace(request.LimitedPermissions)) role.LimitedPermissions = request.LimitedPermissions;
        if (!string.IsNullOrWhiteSpace(request.DeniedPermissions)) role.DeniedPermissions = request.DeniedPermissions;

        return Ok(role);
    }
}

public class RoleDto
{
    public string Id { get; set; } = string.Empty;
    public string Name { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public string AllowedPermissions { get; set; } = string.Empty;
    public string LimitedPermissions { get; set; } = string.Empty;
    public string DeniedPermissions { get; set; } = string.Empty;
}

public class UpdateRolePermissionsRequest
{
    public string? AllowedPermissions { get; set; }
    public string? LimitedPermissions { get; set; }
    public string? DeniedPermissions { get; set; }
}
