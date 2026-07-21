using ParkingSystem.Application.Payments.DTOs;

namespace ParkingSystem.Application.Payments.Interfaces;

public interface IPaymentService
{
    Task<IReadOnlyList<PaymentDto>> ListAsync(
        Domain.Enums.PaymentStatus? status,
        Guid? sessionId,
        Guid? processedByUserId,
        DateTime? fromUtc,
        DateTime? toUtc,
        CancellationToken ct = default);

    Task<PaymentDto?> GetByIdAsync(Guid id, CancellationToken ct = default);

    /// <summary>Get the payment attached to a given parking session (1-to-1 from the schema).</summary>
    Task<PaymentDto?> GetBySessionAsync(Guid sessionId, CancellationToken ct = default);

    /// <summary>Create a Pending payment (typically right after CheckOut, before cashier collects).</summary>
    Task<PaymentDto> CreateAsync(CreatePaymentRequest req, CancellationToken ct = default);

    /// <summary>Mark a Pending payment as Paid (cashier confirms collection).</summary>
    Task<PaymentDto> MarkPaidAsync(Guid id, MarkPaidRequest req, CancellationToken ct = default);

    /// <summary>Mark a Paid payment as Waived (manager decides comp).</summary>
    Task<PaymentDto> WaiveAsync(Guid id, string? reason, string? waivedByUserId, CancellationToken ct = default);

    /// <summary>Mark a Paid payment as Refunded.</summary>
    Task<PaymentDto> RefundAsync(Guid id, RefundPaymentRequest req, CancellationToken ct = default);

    /// <summary>Cancel a Pending payment (e.g. wrong amount typed).
/// Maps to <see cref="PaymentStatus.Cancelled"/> — the operator abandoned the intent to charge
/// before any money moved. Distinct from <see cref="PaymentStatus.Failed"/> (terminal/infra error).</summary>
    Task<PaymentDto> CancelAsync(Guid id, CancellationToken ct = default);
}