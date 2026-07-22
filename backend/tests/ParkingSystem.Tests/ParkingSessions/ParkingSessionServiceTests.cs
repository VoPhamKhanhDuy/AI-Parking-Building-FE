using Microsoft.Extensions.Logging.Abstractions;
using ParkingSystem.Application.Common.Exceptions;
using ParkingSystem.Application.ParkingSessions.DTOs;
using ParkingSystem.Application.ParkingSessions.Services;
using ParkingSystem.Domain.Entities;
using ParkingSystem.Domain.Enums;
using ParkingSystem.Tests.Common;

namespace ParkingSystem.Tests.ParkingSessions;

/// <summary>
/// Unit tests for ParkingSessionService — covers the four key invariants caught during review:
/// 1. start requires no existing active session for the ticket OR slot (double-booking guard)
/// 2. start requires slot not under Maintenance
/// 3. end refuses to run while a Pending payment exists
/// 4. end / cancel always free the slot, even when session.Slot navigation is null
/// 5. cancel mirrors status onto the ticket so it doesn't stay Active forever
/// </summary>
public class ParkingSessionServiceTests
{
    private static readonly DateTime Now = new(2026, 7, 11, 10, 0, 0, DateTimeKind.Utc);
    private static readonly DateTime Earlier = Now.AddHours(-2);

    private static (
        ParkingSessionService Svc,
        InMemoryRepository<ParkingSession> Sessions,
        InMemoryRepository<ParkingTicket> Tickets,
        InMemoryRepository<ParkingSlot> Slots,
        InMemoryRepository<ParkingZone> Zones,
        InMemoryRepository<Vehicle> Vehicles,
        FakeUnitOfWork Uow)
        Build()
    {
        var sessions = new InMemoryRepository<ParkingSession>();
        var tickets = new InMemoryRepository<ParkingTicket>();
        var slots = new InMemoryRepository<ParkingSlot>();
        var zones = new InMemoryRepository<ParkingZone>();
        var vehicles = new InMemoryRepository<Vehicle>();
        var aiLogs = new InMemoryRepository<AIRecommendationLog>();
        var uow = new FakeUnitOfWork();
        var clock = new FixedTimeProvider(Now);
        var logger = NullLogger<ParkingSessionService>.Instance;
        var svc = new ParkingSessionService(sessions, tickets, slots, zones, vehicles, aiLogs, uow, clock, logger);
        return (svc, sessions, tickets, slots, zones, vehicles, uow);
    }

    private static (ParkingTicket ticket, ParkingSlot slot, Vehicle vehicle)
        SeedAvailableTicket(
            InMemoryRepository<ParkingTicket> tickets,
            InMemoryRepository<ParkingSlot> slots,
            InMemoryRepository<Vehicle> vehicles,
            InMemoryRepository<ParkingZone> zones)
    {
        var vehicleTypeId = Guid.NewGuid();
        var vehicle = new Vehicle
        {
            Id = Guid.NewGuid(),
            LicensePlate = "59A-123.45",
            VehicleTypeId = vehicleTypeId
        };
        var zone = new ParkingZone
        {
            Id = Guid.NewGuid(),
            Name = "Zone A",
            VehicleTypeId = vehicleTypeId
        };
        var slot = new ParkingSlot
        {
            Id = Guid.NewGuid(),
            SlotCode = "B1-A-001",
            Status = SlotStatus.Available,
            ParkingZoneId = zone.Id,
            ParkingZone = zone
        };
        var ticket = new ParkingTicket
        {
            Id = Guid.NewGuid(),
            TicketCode = "TKT-20260711-TEST01",
            VehicleId = vehicle.Id,
            Type = TicketType.Hourly,
            Status = TicketStatus.Issued
        };
        vehicles.AddAsync(vehicle).GetAwaiter().GetResult();
        slots.AddAsync(slot).GetAwaiter().GetResult();
        tickets.AddAsync(ticket).GetAwaiter().GetResult();
        zones.AddAsync(zone).GetAwaiter().GetResult();
        return (ticket, slot, vehicle);
    }

    [Fact]
    public async Task StartAsync_creates_session_claims_slot_and_activates_ticket()
    {
        var (svc, sessions, tickets, slots, zones, _, uow) = Build();
        var (ticket, slot, _) = SeedAvailableTicket(tickets, slots, new InMemoryRepository<Vehicle>(), zones);

        var dto = await svc.StartAsync(new StartSessionRequest { TicketId = ticket.Id, SlotId = slot.Id });

        Assert.Equal(SessionStatus.Active, dto.Status);
        Assert.Equal(slot.Id, dto.SlotId);
        Assert.Equal(ticket.Id, dto.TicketId);
        Assert.Single(sessions.All);
        Assert.Equal(SlotStatus.Occupied, slot.Status);
        Assert.Equal(TicketStatus.Active, ticket.Status);
        Assert.Equal(1, uow.SaveChangesCallCount);
    }

    [Fact]
    public async Task StartAsync_throws_404_when_ticket_missing()
    {
        var (svc, _, _, slots, zones, _, _) = Build();
        var slot = new ParkingSlot { Id = Guid.NewGuid(), SlotCode = "X", Status = SlotStatus.Available };
        await slots.AddAsync(slot);

        await Assert.ThrowsAsync<NotFoundException>(() =>
            svc.StartAsync(new StartSessionRequest { TicketId = Guid.NewGuid(), SlotId = slot.Id }));
    }

    [Fact]
    public async Task StartAsync_throws_404_when_slot_missing()
    {
        var (svc, _, tickets, _, zones, _, _) = Build();
        var ticket = new ParkingTicket { Id = Guid.NewGuid(), TicketCode = "T", VehicleId = Guid.NewGuid(), Status = TicketStatus.Issued };
        await tickets.AddAsync(ticket);

        await Assert.ThrowsAsync<NotFoundException>(() =>
            svc.StartAsync(new StartSessionRequest { TicketId = ticket.Id, SlotId = Guid.NewGuid() }));
    }

    [Theory]
    [InlineData(TicketStatus.Cancelled)]
    [InlineData(TicketStatus.Completed)]
    public async Task StartAsync_rejects_terminal_ticket_status(TicketStatus status)
    {
        var (svc, _, tickets, slots, zones, _, _) = Build();
        var vehicles = new InMemoryRepository<Vehicle>();
        var (ticket, slot, _) = SeedAvailableTicket(tickets, slots, vehicles, zones);
        ticket.Status = status;

        await Assert.ThrowsAsync<ValidationException>(() =>
            svc.StartAsync(new StartSessionRequest { TicketId = ticket.Id, SlotId = slot.Id }));
    }

    [Fact]
    public async Task StartAsync_throws_409_when_ticket_already_has_active_session()
    {
        var (svc, sessions, tickets, slots, zones, _, _) = Build();
        var vehicles = new InMemoryRepository<Vehicle>();
        var (ticket, slot1, _) = SeedAvailableTicket(tickets, slots, vehicles, zones);
        var slot2 = new ParkingSlot { Id = Guid.NewGuid(), SlotCode = "B1-A-002", Status = SlotStatus.Available };
        await slots.AddAsync(slot2);

        var existing = new ParkingSession
        {
            Id = Guid.NewGuid(),
            TicketId = ticket.Id,
            VehicleId = ticket.VehicleId,
            SlotId = slot1.Id,
            Status = SessionStatus.Active,
            EntryTime = Earlier
        };
        await sessions.AddAsync(existing);

        await Assert.ThrowsAsync<ConflictException>(() =>
            svc.StartAsync(new StartSessionRequest { TicketId = ticket.Id, SlotId = slot2.Id }));
    }

    [Fact]
    public async Task StartAsync_throws_409_when_slot_already_has_active_session_even_if_reserved()
    {
        // Regression: a Reserved slot must not be double-booked by another start call.
        var (svc, sessions, tickets, slots, zones, _, _) = Build();
        var vehicles = new InMemoryRepository<Vehicle>();
        var (ticket1, slot, _) = SeedAvailableTicket(tickets, slots, vehicles, zones);
        var ticket2 = new ParkingTicket
        {
            Id = Guid.NewGuid(),
            TicketCode = "TKT-OTHER",
            VehicleId = Guid.NewGuid(),
            Status = TicketStatus.Issued
        };
        await tickets.AddAsync(ticket2);

        // Make the slot look "Reserved" but still has an active session in our store.
        slot.Status = SlotStatus.Reserved;
        await sessions.AddAsync(new ParkingSession
        {
            Id = Guid.NewGuid(),
            TicketId = ticket1.Id,
            VehicleId = ticket1.VehicleId,
            SlotId = slot.Id,
            Status = SessionStatus.Active,
            EntryTime = Earlier
        });

        await Assert.ThrowsAsync<ConflictException>(() =>
            svc.StartAsync(new StartSessionRequest { TicketId = ticket2.Id, SlotId = slot.Id }));
    }

    [Fact]
    public async Task StartAsync_throws_400_when_slot_under_maintenance()
    {
        var (svc, _, tickets, slots, zones, _, _) = Build();
        var vehicles = new InMemoryRepository<Vehicle>();
        var (ticket, slot, _) = SeedAvailableTicket(tickets, slots, vehicles, zones);
        slot.Status = SlotStatus.Maintenance;

        await Assert.ThrowsAsync<ValidationException>(() =>
            svc.StartAsync(new StartSessionRequest { TicketId = ticket.Id, SlotId = slot.Id }));
    }

    [Fact]
    public async Task EndAsync_frees_slot_and_completes_ticket()
    {
        var (svc, sessions, tickets, slots, zones, _, uow) = Build();
        var vehicles = new InMemoryRepository<Vehicle>();
        var (ticket, slot, _) = SeedAvailableTicket(tickets, slots, vehicles, zones);
        var session = new ParkingSession
        {
            Id = Guid.NewGuid(),
            TicketId = ticket.Id,
            VehicleId = ticket.VehicleId,
            SlotId = slot.Id,
            Status = SessionStatus.Active,
            EntryTime = Earlier
        };
        ticket.Status = TicketStatus.Active;
        slot.Status = SlotStatus.Occupied;
        await sessions.AddAsync(session);

        var exit = Now.AddHours(2);
        var dto = await svc.EndAsync(session.Id, new EndSessionRequest { ExitTime = exit });

        Assert.Equal(SessionStatus.Completed, dto.Status);
        Assert.Equal(exit, dto.ExitTime);
        Assert.Equal(SlotStatus.Available, slot.Status);
        Assert.Equal(TicketStatus.Completed, ticket.Status);
        Assert.Equal(exit, ticket.ExitTime);
        Assert.Equal(1, uow.SaveChangesCallCount);
    }

    [Fact]
    public async Task EndAsync_throws_when_session_not_active()
    {
        var (svc, sessions, tickets, slots, zones, _, _) = Build();
        var vehicles = new InMemoryRepository<Vehicle>();
        var (ticket, slot, _) = SeedAvailableTicket(tickets, slots, vehicles, zones);
        var session = new ParkingSession
        {
            Id = Guid.NewGuid(),
            TicketId = ticket.Id,
            VehicleId = ticket.VehicleId,
            SlotId = slot.Id,
            Status = SessionStatus.Completed,
            EntryTime = Earlier
        };
        await sessions.AddAsync(session);

        await Assert.ThrowsAsync<ValidationException>(() =>
            svc.EndAsync(session.Id, new EndSessionRequest()));
    }

    [Fact]
    public async Task EndAsync_throws_400_when_exit_before_entry()
    {
        var (svc, sessions, tickets, slots, zones, _, _) = Build();
        var vehicles = new InMemoryRepository<Vehicle>();
        var (ticket, slot, _) = SeedAvailableTicket(tickets, slots, vehicles, zones);
        var session = new ParkingSession
        {
            Id = Guid.NewGuid(),
            TicketId = ticket.Id,
            VehicleId = ticket.VehicleId,
            SlotId = slot.Id,
            Status = SessionStatus.Active,
            EntryTime = Now
        };
        await sessions.AddAsync(session);

        await Assert.ThrowsAsync<ValidationException>(() =>
            svc.EndAsync(session.Id, new EndSessionRequest { ExitTime = Now.AddHours(-1) }));
    }

    [Fact]
    public async Task EndAsync_throws_409_when_pending_payment_exists()
    {
        var (svc, sessions, tickets, slots, zones, _, _) = Build();
        var vehicles = new InMemoryRepository<Vehicle>();
        var (ticket, slot, _) = SeedAvailableTicket(tickets, slots, vehicles, zones);
        var session = new ParkingSession
        {
            Id = Guid.NewGuid(),
            TicketId = ticket.Id,
            VehicleId = ticket.VehicleId,
            SlotId = slot.Id,
            Status = SessionStatus.Active,
            EntryTime = Earlier,
            Payment = new Payment { Id = Guid.NewGuid(), Status = PaymentStatus.Pending, Amount = 1000m }
        };
        await sessions.AddAsync(session);

        await Assert.ThrowsAsync<ConflictException>(() =>
            svc.EndAsync(session.Id, new EndSessionRequest()));
    }

    [Fact]
    public async Task EndAsync_re_fetches_slot_when_navigation_null_and_404s_if_missing()
    {
        // Regression: if session.Slot is null we must look it up fresh, and 404 if gone.
        var (svc, sessions, tickets, slots, zones, _, _) = Build();
        var vehicles = new InMemoryRepository<Vehicle>();
        var (ticket, _, _) = SeedAvailableTicket(tickets, slots, vehicles, zones);
        var session = new ParkingSession
        {
            Id = Guid.NewGuid(),
            TicketId = ticket.Id,
            VehicleId = ticket.VehicleId,
            SlotId = Guid.NewGuid(), // slot NOT in store
            Status = SessionStatus.Active,
            EntryTime = Earlier
        };
        await sessions.AddAsync(session);

        await Assert.ThrowsAsync<NotFoundException>(() =>
            svc.EndAsync(session.Id, new EndSessionRequest()));
    }

    [Fact]
    public async Task CancelAsync_frees_slot_and_mirrors_cancel_onto_ticket()
    {
        var (svc, sessions, tickets, slots, zones, _, _) = Build();
        var vehicles = new InMemoryRepository<Vehicle>();
        var (ticket, slot, _) = SeedAvailableTicket(tickets, slots, vehicles, zones);
        var session = new ParkingSession
        {
            Id = Guid.NewGuid(),
            TicketId = ticket.Id,
            VehicleId = ticket.VehicleId,
            SlotId = slot.Id,
            Status = SessionStatus.Active,
            EntryTime = Earlier
        };
        ticket.Status = TicketStatus.Active;
        slot.Status = SlotStatus.Occupied;
        await sessions.AddAsync(session);

        var dto = await svc.CancelAsync(session.Id);

        Assert.Equal(SessionStatus.Cancelled, dto.Status);
        Assert.Equal(SlotStatus.Available, slot.Status);
        Assert.Equal(TicketStatus.Cancelled, ticket.Status);
        Assert.NotNull(session.ExitTime);
    }

    [Fact]
    public async Task CancelAsync_is_idempotent_when_already_cancelled()
    {
        var (svc, sessions, tickets, slots, zones, _, _) = Build();
        var vehicles = new InMemoryRepository<Vehicle>();
        var (ticket, slot, _) = SeedAvailableTicket(tickets, slots, vehicles, zones);
        var session = new ParkingSession
        {
            Id = Guid.NewGuid(),
            TicketId = ticket.Id,
            VehicleId = ticket.VehicleId,
            SlotId = slot.Id,
            Status = SessionStatus.Cancelled,
            EntryTime = Earlier
        };
        await sessions.AddAsync(session);

        var dto = await svc.CancelAsync(session.Id);

        Assert.Equal(SessionStatus.Cancelled, dto.Status);
        // Slot must NOT be touched on idempotent re-cancel.
        Assert.Equal(SlotStatus.Available, slot.Status);
    }

    [Fact]
    public async Task CancelAsync_refuses_completed_session()
    {
        var (svc, sessions, tickets, slots, zones, _, _) = Build();
        var vehicles = new InMemoryRepository<Vehicle>();
        var (ticket, slot, _) = SeedAvailableTicket(tickets, slots, vehicles, zones);
        var session = new ParkingSession
        {
            Id = Guid.NewGuid(),
            TicketId = ticket.Id,
            VehicleId = ticket.VehicleId,
            SlotId = slot.Id,
            Status = SessionStatus.Completed,
            EntryTime = Earlier,
            ExitTime = Now
        };
        await sessions.AddAsync(session);

        await Assert.ThrowsAsync<ValidationException>(() => svc.CancelAsync(session.Id));
    }

    [Fact]
    public async Task CancelAsync_preserves_already_completed_ticket()
    {
        // If the ticket is already Completed (e.g. via End), cancel must not regress it to Cancelled.
        var (svc, sessions, tickets, slots, zones, _, _) = Build();
        var vehicles = new InMemoryRepository<Vehicle>();
        var (ticket, slot, _) = SeedAvailableTicket(tickets, slots, vehicles, zones);
        ticket.Status = TicketStatus.Completed;
        var session = new ParkingSession
        {
            Id = Guid.NewGuid(),
            TicketId = ticket.Id,
            VehicleId = ticket.VehicleId,
            SlotId = slot.Id,
            Status = SessionStatus.Active,
            EntryTime = Earlier
        };
        await sessions.AddAsync(session);

        await svc.CancelAsync(session.Id);

        Assert.Equal(TicketStatus.Completed, ticket.Status);
    }
}
