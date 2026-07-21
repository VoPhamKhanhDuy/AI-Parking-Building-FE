using ParkingSystem.Application.VehicleExits.DTOs;
using ParkingSystem.Domain.Enums;

namespace ParkingSystem.Application.VehicleExits.Interfaces;

public interface IVehicleExitService
{
    Task<VehicleExitListResponse> GetActiveSessionsAsync(CancellationToken ct = default);

    Task<VehicleExitSessionDto?> LookupAsync(string query, CancellationToken ct = default);

    Task<ExitFeeCalculation> CalculateFeeAsync(Guid sessionId, CancellationToken ct = default);

    Task<ExitPaymentResponse> CreatePaymentAsync(Guid sessionId, CreateExitPaymentRequest? req, CancellationToken ct = default);

    Task<PaymentStatusResponse> GetPaymentStatusAsync(Guid paymentId, CancellationToken ct = default);

    Task<ExitCompleteResponse> CompleteExitAsync(Guid sessionId, CancellationToken ct = default);
}
