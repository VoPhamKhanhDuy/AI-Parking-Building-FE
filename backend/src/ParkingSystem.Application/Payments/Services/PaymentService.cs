using ParkingSystem.Application.Common.Exceptions;
using ParkingSystem.Application.Common.Extensions;
using ParkingSystem.Application.Common.Interfaces;
using ParkingSystem.Application.Payments.DTOs;
using ParkingSystem.Application.Payments.Interfaces;
using ParkingSystem.Application.Payments.Mappings;
using ParkingSystem.Application.Payments.Specifications;
using ParkingSystem.Application.SystemLogs.Interfaces;
using ParkingSystem.Domain.Entities;
using ParkingSystem.Domain.Enums;

namespace ParkingSystem.Application.Payments.Services;

public class PaymentService : IPaymentService
{
    private readonly IRepository<Payment> _payments;
    private readonly IRepository<ParkingSession> _sessions;
    private readonly IRepository<User> _users;
    private readonly IUnitOfWork _uow;
    private readonly TimeProvider _clock;
    private readonly ISystemLogService _audit;

    public PaymentService(
        IRepository<Payment> payments,
        IRepository<ParkingSession> sessions,
        IRepository<User> users,
        IUnitOfWork uow,
        TimeProvider clock,
        ISystemLogService audit)
    {
        _payments = payments;
        _sessions = sessions;
        _users = users;
        _uow = uow;
        _clock = clock;
        _audit = audit;
    }

    public async Task<IReadOnlyList<PaymentDto>> ListAsync(
        PaymentStatus? status,
        Guid? sessionId,
        Guid? processedByUserId,
        DateTime? fromUtc,
        DateTime? toUtc,
        CancellationToken ct = default)
    {
        var rows = await _payments.ListAsync(
            new PaymentSpecifications.ListFiltered(status, sessionId, processedByUserId, fromUtc, toUtc), ct);
        return rows.Select(p => p.ToDto()).ToList();
    }

    public async Task<PaymentDto?> GetByIdAsync(Guid id, CancellationToken ct = default)
    {
        var p = await _payments.FirstOrDefaultAsync(
            new PaymentSpecifications.ByIdWithDetails(id), ct);
        return p?.ToDto();
    }

    public async Task<PaymentDto?> GetBySessionAsync(Guid sessionId, CancellationToken ct = default)
    {
        var p = await _payments.FirstOrDefaultAsync(
            new PaymentSpecifications.BySession(sessionId), ct);
        return p?.ToDto();
    }

    public async Task<PaymentDto> CreateAsync(CreatePaymentRequest req, CancellationToken ct = default)
    {
        if (req.Amount <= 0)
        {
            throw new ValidationException("Payment amount must be greater than zero.");
        }

        var session = await _sessions.GetByIdAsync(req.SessionId, ct)
            ?? throw new NotFoundException(nameof(ParkingSession), req.SessionId);

        if (session.Status == SessionStatus.Cancelled)
        {
            throw new ValidationException(
                $"Cannot create a payment for a cancelled session '{session.Id}'.");
        }

        var existing = await _payments.FirstOrDefaultAsync(
            new PaymentSpecifications.BySession(session.Id), ct);
        if (existing is not null)
        {
            throw new ConflictException(
                $"A payment already exists for session '{session.Id}'.");
        }

        User? cashier = null;
        if (req.ProcessedByUserId.HasValue)
        {
            cashier = await _users.GetByIdAsync(req.ProcessedByUserId.Value, ct)
                ?? throw new ValidationException($"Cashier user '{req.ProcessedByUserId}' does not exist.");
        }

        var payment = new Payment
        {
            SessionId = session.Id,
            Amount = req.Amount,
            Method = req.Method,
            Status = PaymentStatus.Pending,
            TransactionReference = req.TransactionReference?.Trim(),
            ProcessedByUserId = req.ProcessedByUserId
        };

        await _payments.AddAsync(payment, ct);
        await _uow.SaveChangesAsync(ct);

        payment.Session = session;
        payment.ProcessedByUser = cashier;
        return payment.ToDto();
    }

    public async Task<PaymentDto> MarkPaidAsync(Guid id, MarkPaidRequest req, CancellationToken ct = default)
    {
        var payment = await _payments.FirstOrDefaultAsync(
            new PaymentSpecifications.ByIdWithDetails(id), ct)
            ?? throw new NotFoundException(nameof(Payment), id);

        if (payment.Status == PaymentStatus.Paid)
        {
            // Idempotent: re-marking paid just returns the same DTO.
            return payment.ToDto();
        }

        if (payment.Status != PaymentStatus.Pending)
        {
            throw new ValidationException(
                $"Cannot mark as paid a payment with status '{payment.Status}'.");
        }

        if (req.ProcessedByUserId.HasValue)
        {
            var cashier = await _users.GetByIdAsync(req.ProcessedByUserId.Value, ct)
                ?? throw new ValidationException($"Cashier user '{req.ProcessedByUserId}' does not exist.");
            payment.ProcessedByUserId = cashier.Id;
            payment.ProcessedByUser = cashier;
        }

        payment.Method = req.Method;
        if (!string.IsNullOrWhiteSpace(req.TransactionReference))
        {
            payment.TransactionReference = req.TransactionReference.Trim();
        }
        payment.Status = PaymentStatus.Paid;
        payment.PaidAt = req.PaidAt.EnsureUtc() ?? _clock.GetUtcNow().UtcDateTime;
        payment.UpdatedAt = _clock.GetUtcNow().UtcDateTime;

        _payments.Update(payment);
        await _uow.SaveChangesAsync(ct);
        return payment.ToDto();
    }

    public async Task<PaymentDto> WaiveAsync(Guid id, string? reason, string? waivedByUserId, CancellationToken ct = default)
    {
        var payment = await _payments.FirstOrDefaultAsync(
            new PaymentSpecifications.ByIdWithDetails(id), ct)
            ?? throw new NotFoundException(nameof(Payment), id);

        if (payment.Status is PaymentStatus.Paid or PaymentStatus.Pending)
        {
            var previousAmount = payment.Amount;
            payment.Status = PaymentStatus.Waived;
            payment.PaidAt = payment.PaidAt ?? _clock.GetUtcNow().UtcDateTime;
            if (!string.IsNullOrWhiteSpace(reason))
            {
                payment.TransactionReference = string.IsNullOrEmpty(payment.TransactionReference)
                    ? $"WAIVED: {reason.Trim()}"
                    : $"{payment.TransactionReference} | WAIVED: {reason.Trim()}";
            }
            payment.UpdatedAt = _clock.GetUtcNow().UtcDateTime;
            _payments.Update(payment);
            await _uow.SaveChangesAsync(ct);

            // Audit log for waiver action
            try
            {
                await _audit.LogAsync(new SystemLog
                {
                    UserId = !string.IsNullOrEmpty(waivedByUserId) && Guid.TryParse(waivedByUserId, out var uid) ? uid : null,
                    Action = "PaymentWaived",
                    TargetEntity = nameof(Payment),
                    TargetEntityId = payment.Id,
                    Description = $"Payment of {previousAmount:C} was waived. Reason: {reason ?? "Not specified"}."
                }, ct);
            }
            catch
            {
                // Audit failures should not affect the main operation
            }

            return payment.ToDto();
        }

        throw new ValidationException($"Cannot waive a payment with status '{payment.Status}'.");
    }

    public async Task<PaymentDto> RefundAsync(Guid id, RefundPaymentRequest req, CancellationToken ct = default)
    {
        var payment = await _payments.FirstOrDefaultAsync(
            new PaymentSpecifications.ByIdWithDetails(id), ct)
            ?? throw new NotFoundException(nameof(Payment), id);

        if (payment.Status != PaymentStatus.Paid)
        {
            throw new ValidationException(
                $"Only Paid payments can be refunded (current status: '{payment.Status}').");
        }

        payment.Status = PaymentStatus.Refunded;
        if (!string.IsNullOrWhiteSpace(req.Reason))
        {
            payment.TransactionReference = string.IsNullOrEmpty(payment.TransactionReference)
                ? $"REFUND: {req.Reason.Trim()}"
                : $"{payment.TransactionReference} | REFUND: {req.Reason.Trim()}";
        }
        payment.UpdatedAt = _clock.GetUtcNow().UtcDateTime;
        _payments.Update(payment);
        await _uow.SaveChangesAsync(ct);
        return payment.ToDto();
    }

    public async Task<PaymentDto> CancelAsync(Guid id, CancellationToken ct = default)
    {
        var payment = await _payments.FirstOrDefaultAsync(
            new PaymentSpecifications.ByIdWithDetails(id), ct)
            ?? throw new NotFoundException(nameof(Payment), id);

        if (payment.Status != PaymentStatus.Pending)
        {
            throw new ValidationException(
                $"Only Pending payments can be cancelled (current status: '{payment.Status}').");
        }

        payment.Status = PaymentStatus.Cancelled;
        payment.UpdatedAt = _clock.GetUtcNow().UtcDateTime;
        _payments.Update(payment);
        await _uow.SaveChangesAsync(ct);
        return payment.ToDto();
    }
}