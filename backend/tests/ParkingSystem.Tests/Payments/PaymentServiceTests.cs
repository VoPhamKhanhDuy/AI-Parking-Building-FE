using Microsoft.Extensions.Logging.Abstractions;
using ParkingSystem.Application.Common.Exceptions;
using ParkingSystem.Application.Common.Interfaces;
using ParkingSystem.Application.Payments.DTOs;
using ParkingSystem.Application.Payments.Services;
using ParkingSystem.Application.SystemLogs.Interfaces;
using ParkingSystem.Domain.Entities;
using ParkingSystem.Domain.Enums;
using ParkingSystem.Tests.Common;

namespace ParkingSystem.Tests.Payments;

/// <summary>
/// Unit tests for PaymentService — covers the cashier workflow + status transitions:
/// Create / MarkPaid (idempotent) / Waive (Pending|paid -> Waived) / Refund (Paid only) /
/// Cancel (Pending only, -> Cancelled).
/// </summary>
public class PaymentServiceTests
{
    private static readonly DateTime Now = new(2026, 7, 11, 12, 0, 0, DateTimeKind.Utc);

    private static (
        PaymentService Svc,
        InMemoryRepository<Payment> Payments,
        InMemoryRepository<ParkingSession> Sessions,
        InMemoryRepository<User> Users,
        FakeUnitOfWork Uow)
        Build()
    {
        var payments = new InMemoryRepository<Payment>();
        var sessions = new InMemoryRepository<ParkingSession>();
        var users = new InMemoryRepository<User>();
        var uow = new FakeUnitOfWork();
        var clock = new FixedTimeProvider(Now);
        var audit = new NullSystemLogService();
        var svc = new PaymentService(payments, sessions, users, uow, clock, audit);
        return (svc, payments, sessions, users, uow);
    }

    private static ParkingSession SeedCompletedSession(InMemoryRepository<ParkingSession> sessions)
    {
        var s = new ParkingSession
        {
            Id = Guid.NewGuid(),
            TicketId = Guid.NewGuid(),
            VehicleId = Guid.NewGuid(),
            SlotId = Guid.NewGuid(),
            Status = SessionStatus.Completed,
            EntryTime = Now.AddHours(-2),
            ExitTime = Now
        };
        sessions.AddAsync(s).GetAwaiter().GetResult();
        return s;
    }

    private static User SeedCashier(InMemoryRepository<User> users)
    {
        var u = new User
        {
            Id = Guid.NewGuid(),
            Email = "cashier@lot.io",
            PasswordHash = "x",
            FullName = "Cashier One",
            RoleId = Guid.NewGuid()
        };
        users.AddAsync(u).GetAwaiter().GetResult();
        return u;
    }

    [Fact]
    public async Task CreateAsync_creates_pending_payment()
    {
        var (svc, payments, sessions, _, uow) = Build();
        var session = SeedCompletedSession(sessions);

        var dto = await svc.CreateAsync(new CreatePaymentRequest
        {
            SessionId = session.Id,
            Amount = 5000m,
            Method = PaymentMethod.Cash
        });

        Assert.Equal(PaymentStatus.Pending, dto.Status);
        Assert.Equal(5000m, dto.Amount);
        Assert.Equal(session.Id, dto.SessionId);
        Assert.Equal(1, uow.SaveChangesCallCount);
        Assert.Single(payments.All);
    }

    [Fact]
    public async Task CreateAsync_throws_404_when_session_missing()
    {
        var (svc, _, _, _, _) = Build();

        await Assert.ThrowsAsync<NotFoundException>(() =>
            svc.CreateAsync(new CreatePaymentRequest { SessionId = Guid.NewGuid(), Amount = 1m }));
    }

    [Fact]
    public async Task CreateAsync_rejects_cancelled_session()
    {
        var (svc, _, sessions, _, _) = Build();
        var session = SeedCompletedSession(sessions);
        session.Status = SessionStatus.Cancelled;

        await Assert.ThrowsAsync<ValidationException>(() =>
            svc.CreateAsync(new CreatePaymentRequest { SessionId = session.Id, Amount = 1m }));
    }

    [Fact]
    public async Task CreateAsync_throws_409_when_payment_already_exists()
    {
        var (svc, payments, sessions, _, _) = Build();
        var session = SeedCompletedSession(sessions);
        await payments.AddAsync(new Payment { Id = Guid.NewGuid(), SessionId = session.Id, Status = PaymentStatus.Pending, Amount = 1m });

        await Assert.ThrowsAsync<ConflictException>(() =>
            svc.CreateAsync(new CreatePaymentRequest { SessionId = session.Id, Amount = 1m }));
    }

    [Theory]
    [InlineData(PaymentStatus.Pending)]
    [InlineData(PaymentStatus.Paid)]
    [InlineData(PaymentStatus.Refunded)]
    [InlineData(PaymentStatus.Waived)]
    public async Task CreateAsync_throws_409_for_non_retryable_existing_payments(PaymentStatus existingStatus)
    {
        var (svc, payments, sessions, _, _) = Build();
        var session = SeedCompletedSession(sessions);
        await payments.AddAsync(new Payment
        {
            Id = Guid.NewGuid(),
            SessionId = session.Id,
            Status = existingStatus,
            Amount = 1m
        });

        await Assert.ThrowsAsync<ConflictException>(() =>
            svc.CreateAsync(new CreatePaymentRequest { SessionId = session.Id, Amount = 1m }));
    }

    [Theory]
    [InlineData(PaymentStatus.Failed)]
    [InlineData(PaymentStatus.Cancelled)]
    public async Task CreateAsync_allows_retry_when_existing_payment_is_failed_or_cancelled(PaymentStatus existingStatus)
    {
        var (svc, payments, sessions, _, uow) = Build();
        var session = SeedCompletedSession(sessions);
        await payments.AddAsync(new Payment
        {
            Id = Guid.NewGuid(),
            SessionId = session.Id,
            Status = existingStatus,
            Amount = 1m
        });

        var dto = await svc.CreateAsync(new CreatePaymentRequest
        {
            SessionId = session.Id,
            Amount = 5000m,
            Method = PaymentMethod.Cash
        });

        Assert.Equal(PaymentStatus.Pending, dto.Status);
        Assert.Equal(5000m, dto.Amount);
        Assert.Equal(session.Id, dto.SessionId);
        Assert.Equal(2, payments.All.Count); // previous Failed/Cancelled is kept + new Pending
        Assert.Equal(1, uow.SaveChangesCallCount);
    }

    [Fact]
    public async Task MarkPaidAsync_transitions_pending_to_paid_and_records_cashier()
    {
        var (svc, payments, sessions, users, _) = Build();
        var session = SeedCompletedSession(sessions);
        var cashier = SeedCashier(users);
        var p = new Payment
        {
            Id = Guid.NewGuid(),
            SessionId = session.Id,
            Amount = 5000m,
            Method = PaymentMethod.Cash,
            Status = PaymentStatus.Pending
        };
        await payments.AddAsync(p);

        var dto = await svc.MarkPaidAsync(p.Id, new MarkPaidRequest
        {
            Method = PaymentMethod.Cash,
            ProcessedByUserId = cashier.Id,
            PaidAt = Now
        });

        Assert.Equal(PaymentStatus.Paid, dto.Status);
        Assert.Equal(cashier.Id, dto.ProcessedByUserId);
        Assert.NotNull(dto.PaidAt);
        Assert.Equal(PaymentMethod.Cash, dto.Method);
    }

    [Fact]
    public async Task MarkPaidAsync_is_idempotent_on_already_paid()
    {
        var (svc, payments, sessions, _, _) = Build();
        var session = SeedCompletedSession(sessions);
        var p = new Payment
        {
            Id = Guid.NewGuid(),
            SessionId = session.Id,
            Amount = 5000m,
            Method = PaymentMethod.Cash,
            Status = PaymentStatus.Paid,
            PaidAt = Now
        };
        await payments.AddAsync(p);

        var dto = await svc.MarkPaidAsync(p.Id, new MarkPaidRequest { Method = PaymentMethod.Cash });

        Assert.Equal(PaymentStatus.Paid, dto.Status);
        Assert.Equal(Now, dto.PaidAt); // unchanged
    }

    [Fact]
    public async Task MarkPaidAsync_rejects_terminal_status()
    {
        var (svc, payments, sessions, _, _) = Build();
        var session = SeedCompletedSession(sessions);
        var p = new Payment
        {
            Id = Guid.NewGuid(),
            SessionId = session.Id,
            Amount = 5000m,
            Method = PaymentMethod.Cash,
            Status = PaymentStatus.Refunded
        };
        await payments.AddAsync(p);

        await Assert.ThrowsAsync<ValidationException>(() =>
            svc.MarkPaidAsync(p.Id, new MarkPaidRequest()));
    }

    [Fact]
    public async Task WaiveAsync_pending_payment_becomes_waived_with_reason()
    {
        var (svc, payments, sessions, _, _) = Build();
        var session = SeedCompletedSession(sessions);
        var p = new Payment
        {
            Id = Guid.NewGuid(),
            SessionId = session.Id,
            Amount = 5000m,
            Method = PaymentMethod.Cash,
            Status = PaymentStatus.Pending
        };
        await payments.AddAsync(p);

        var dto = await svc.WaiveAsync(p.Id, "VIP guest", null);

        Assert.Equal(PaymentStatus.Waived, dto.Status);
        Assert.Contains("WAIVED", dto.TransactionReference);
        Assert.Contains("VIP guest", dto.TransactionReference);
    }

    [Fact]
    public async Task WaiveAsync_paid_payment_appends_reason_to_existing_reference()
    {
        var (svc, payments, sessions, _, _) = Build();
        var session = SeedCompletedSession(sessions);
        var p = new Payment
        {
            Id = Guid.NewGuid(),
            SessionId = session.Id,
            Amount = 5000m,
            Method = PaymentMethod.Card,
            Status = PaymentStatus.Paid,
            TransactionReference = "TX-001"
        };
        await payments.AddAsync(p);

        var dto = await svc.WaiveAsync(p.Id, "goodwill", null);

        Assert.Equal(PaymentStatus.Waived, dto.Status);
        Assert.StartsWith("TX-001", dto.TransactionReference);
        Assert.Contains("WAIVED: goodwill", dto.TransactionReference);
    }

    [Fact]
    public async Task WaiveAsync_rejects_refunded_payment()
    {
        var (svc, payments, sessions, _, _) = Build();
        var session = SeedCompletedSession(sessions);
        var p = new Payment
        {
            Id = Guid.NewGuid(),
            SessionId = session.Id,
            Amount = 5000m,
            Status = PaymentStatus.Refunded
        };
        await payments.AddAsync(p);

        await Assert.ThrowsAsync<ValidationException>(() => svc.WaiveAsync(p.Id, null, null));
    }

    [Fact]
    public async Task RefundAsync_paid_payment_becomes_refunded_with_reason()
    {
        var (svc, payments, sessions, _, _) = Build();
        var session = SeedCompletedSession(sessions);
        var p = new Payment
        {
            Id = Guid.NewGuid(),
            SessionId = session.Id,
            Amount = 5000m,
            Method = PaymentMethod.Card,
            Status = PaymentStatus.Paid,
            TransactionReference = "TX-001",
            PaidAt = Now
        };
        await payments.AddAsync(p);

        var dto = await svc.RefundAsync(p.Id, new RefundPaymentRequest { Reason = "customer dispute" });

        Assert.Equal(PaymentStatus.Refunded, dto.Status);
        Assert.Contains("REFUND", dto.TransactionReference);
        Assert.Contains("customer dispute", dto.TransactionReference);
    }

    [Fact]
    public async Task RefundAsync_rejects_pending_payment()
    {
        var (svc, payments, sessions, _, _) = Build();
        var session = SeedCompletedSession(sessions);
        var p = new Payment
        {
            Id = Guid.NewGuid(),
            SessionId = session.Id,
            Amount = 5000m,
            Status = PaymentStatus.Pending
        };
        await payments.AddAsync(p);

        await Assert.ThrowsAsync<ValidationException>(() =>
            svc.RefundAsync(p.Id, new RefundPaymentRequest()));
    }

    [Fact]
    public async Task CancelAsync_pending_payment_becomes_cancelled()
    {
        var (svc, payments, sessions, _, _) = Build();
        var session = SeedCompletedSession(sessions);
        var p = new Payment
        {
            Id = Guid.NewGuid(),
            SessionId = session.Id,
            Amount = 5000m,
            Status = PaymentStatus.Pending
        };
        await payments.AddAsync(p);

        var dto = await svc.CancelAsync(p.Id);

        Assert.Equal(PaymentStatus.Cancelled, dto.Status);
    }

    [Fact]
    public async Task CancelAsync_rejects_paid_payment()
    {
        // Only Pending -> Cancelled. A paid payment must be refunded, not cancelled.
        var (svc, payments, sessions, _, _) = Build();
        var session = SeedCompletedSession(sessions);
        var p = new Payment
        {
            Id = Guid.NewGuid(),
            SessionId = session.Id,
            Amount = 5000m,
            Status = PaymentStatus.Paid,
            PaidAt = Now
        };
        await payments.AddAsync(p);

        await Assert.ThrowsAsync<ValidationException>(() => svc.CancelAsync(p.Id));
    }
}