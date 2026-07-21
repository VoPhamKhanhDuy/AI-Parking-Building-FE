using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using ParkingSystem.Application.Auth.DTOs;
using ParkingSystem.Application.Auth.Interfaces;
using ParkingSystem.Domain.Enums;

namespace ParkingSystem.API.Controllers;

[ApiController]
[Route("api/users")]
[Authorize(Roles = SystemRoles.Admin)]
public class UsersController : ControllerBase
{
    private readonly IUserService _users;

    public UsersController(IUserService users)
    {
        _users = users;
    }

    /// <summary>List all users (Admin only).</summary>
    [HttpGet]
    [ProducesResponseType(typeof(IReadOnlyList<UserDto>), StatusCodes.Status200OK)]
    public async Task<IActionResult> List(CancellationToken cancellationToken)
    {
        var users = await _users.ListAsync(cancellationToken);
        return Ok(users);
    }

    /// <summary>Get a user by id (Admin only).</summary>
    [HttpGet("{id:guid}")]
    [ProducesResponseType(typeof(UserDto), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> GetById(Guid id, CancellationToken cancellationToken)
    {
        var user = await _users.GetByIdAsync(id, cancellationToken);
        return user is null ? NotFound() : Ok(user);
    }

    /// <summary>Create a new user (Admin only).</summary>
    [HttpPost]
    [ProducesResponseType(typeof(UserDto), StatusCodes.Status201Created)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status409Conflict)]
    public async Task<IActionResult> Create([FromBody] CreateUserRequest request, CancellationToken cancellationToken)
    {
        var created = await _users.CreateAsync(request, cancellationToken);
        return CreatedAtAction(nameof(GetById), new { id = created.Id }, created);
    }

    /// <summary>Update a user's profile and optionally their password (Admin only).</summary>
    [HttpPut("{id:guid}")]
    [ProducesResponseType(typeof(UserDto), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> Update(Guid id, [FromBody] UpdateUserRequest request, CancellationToken cancellationToken)
    {
        var updated = await _users.UpdateAsync(id, request, cancellationToken);
        return Ok(updated);
    }

    /// <summary>Lock / disable / re-enable a user account (Admin only).</summary>
    [HttpPatch("{id:guid}/status")]
    [ProducesResponseType(typeof(UserDto), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> SetStatus(Guid id, [FromBody] SetStatusRequest body, CancellationToken cancellationToken)
    {
        var updated = await _users.SetStatusAsync(id, body.Status, cancellationToken);
        return Ok(updated);
    }

    public class SetStatusRequest
    {
        public UserAccountStatus Status { get; set; }
    }
}