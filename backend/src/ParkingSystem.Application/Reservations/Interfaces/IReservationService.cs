using ParkingSystem.Application.Reservations.DTOs;
using ParkingSystem.Domain.Enums;

namespace ParkingSystem.Application.Reservations.Interfaces;

public interface IReservationService
{
    Task<ReservationListResponse> ListAsync(
        string? search,
        ReservationStatus? status,
        Guid? vehicleId,
        CancellationToken ct = default);

    Task<ReservationDto?> GetByIdAsync(Guid id, CancellationToken ct = default);

    Task<ReservationDto?> GetByCodeAsync(string code, CancellationToken ct = default);

    Task<ReservationDto> CreateAsync(CreateReservationRequest req, Guid? createdByUserId, CancellationToken ct = default);

    Task<ReservationDto> ConfirmAsync(Guid id, CancellationToken ct = default);

    Task<ReservationDto> CheckInAsync(Guid id, CancellationToken ct = default);

    Task<ReservationDto> CompleteAsync(Guid id, CancellationToken ct = default);

    Task<ReservationDto> CancelAsync(Guid id, CancelReservationRequest? req, CancellationToken ct = default);
}
