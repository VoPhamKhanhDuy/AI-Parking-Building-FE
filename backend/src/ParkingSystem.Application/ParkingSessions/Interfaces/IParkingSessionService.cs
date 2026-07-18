using ParkingSystem.Application.ParkingSessions.DTOs;

namespace ParkingSystem.Application.ParkingSessions.Interfaces;

public interface IParkingSessionService
{
    Task<IReadOnlyList<ParkingSessionDto>> ListAsync(
        Domain.Enums.SessionStatus? status,
        Guid? vehicleId,
        Guid? slotId,
        Guid? ticketId,
        DateTime? fromUtc,
        DateTime? toUtc,
        CancellationToken ct = default);

    Task<ParkingSessionDto?> GetByIdAsync(Guid id, CancellationToken ct = default);

    Task<ParkingSessionDto?> GetActiveByTicketAsync(Guid ticketId, CancellationToken ct = default);
    Task<ParkingSessionDto?> GetActiveBySlotAsync(Guid slotId, CancellationToken ct = default);
    Task<ParkingSessionDto?> GetActiveByVehicleAsync(Guid vehicleId, CancellationToken ct = default);

    Task<ParkingSessionDto> StartAsync(StartSessionRequest req, CancellationToken ct = default);
    Task<ParkingSessionDto> EndAsync(Guid id, EndSessionRequest req, CancellationToken ct = default);
    Task<ParkingSessionDto> CancelAsync(Guid id, CancellationToken ct = default);
}