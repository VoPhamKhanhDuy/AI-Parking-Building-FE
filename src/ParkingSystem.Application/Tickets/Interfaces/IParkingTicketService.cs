using ParkingSystem.Application.Tickets.DTOs;

namespace ParkingSystem.Application.Tickets.Interfaces;

public interface IParkingTicketService
{
    Task<IReadOnlyList<ParkingTicketDto>> ListAsync(
        Domain.Enums.TicketStatus? status,
        Guid? vehicleId,
        DateTime? fromUtc,
        DateTime? toUtc,
        CancellationToken ct = default);

    Task<ParkingTicketDto?> GetByIdAsync(Guid id, CancellationToken ct = default);

    Task<ParkingTicketDto?> GetByCodeAsync(string code, CancellationToken ct = default);

    Task<ParkingTicketDto?> GetActiveByVehicleAsync(Guid vehicleId, CancellationToken ct = default);

    /// <summary>Issue a new ticket (status = Issued). Vehicle may not already have an active ticket.</summary>
    Task<ParkingTicketDto> IssueAsync(IssueTicketRequest req, CancellationToken ct = default);

    /// <summary>Mark the ticket as entered (Issued -> Active) and stamp EntryTime = UtcNow.</summary>
    Task<ParkingTicketDto> CheckInAsync(Guid id, DateTime? entryTime, CancellationToken ct = default);

    /// <summary>Close the ticket (Active -> Completed), stamp ExitTime, and compute the fee.</summary>
    Task<CheckOutResult> CheckOutAsync(Guid id, CheckOutTicketRequest req, CancellationToken ct = default);

    /// <summary>Cancel a still-open ticket.</summary>
    Task<ParkingTicketDto> CancelAsync(Guid id, CancelTicketRequest req, CancellationToken ct = default);
}