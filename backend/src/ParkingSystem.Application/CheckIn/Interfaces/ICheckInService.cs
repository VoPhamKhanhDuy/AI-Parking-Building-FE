using ParkingSystem.Application.CheckIn.DTOs;

namespace ParkingSystem.Application.CheckIn.Interfaces;

public interface ICheckInService
{
    /// <summary>
    /// Atomically perform a full vehicle check-in:
    /// <list type="bullet">
    /// <item>Find or create the vehicle by license plate.</item>
    /// <item>Reject if the vehicle already has an active parking session.</item>
    /// <item>Validate the slot is still Available and belongs to a compatible zone.</item>
    /// <item>Create the parking ticket, parking session, claim the slot, and persist the AI log.</item>
    /// </list>
    /// </summary>
    Task<CheckInResultDto> CheckInAsync(CheckInRequest req, CancellationToken ct = default);
}
