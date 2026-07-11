using ParkingSystem.Application.Common.Exceptions;
using ParkingSystem.Application.Common.Interfaces;
using ParkingSystem.Application.ParkingSessions.DTOs;
using ParkingSystem.Application.ParkingSessions.Interfaces;
using ParkingSystem.Application.ParkingSessions.Mappings;
using ParkingSystem.Application.ParkingSessions.Specifications;
using ParkingSystem.Domain.Entities;
using ParkingSystem.Domain.Enums;

namespace ParkingSystem.Application.ParkingSessions.Services;

public class ParkingSessionService : IParkingSessionService
{
    private readonly IRepository<ParkingSession> _sessions;
    private readonly IRepository<ParkingTicket> _tickets;
    private readonly IRepository<ParkingSlot> _slots;
    private readonly IUnitOfWork _uow;
    private readonly TimeProvider _clock;

    public ParkingSessionService(
        IRepository<ParkingSession> sessions,
        IRepository<ParkingTicket> tickets,
        IRepository<ParkingSlot> slots,
        IUnitOfWork uow,
        TimeProvider clock)
    {
        _sessions = sessions;
        _tickets = tickets;
        _slots = slots;
        _uow = uow;
        _clock = clock;
    }

    public async Task<IReadOnlyList<ParkingSessionDto>> ListAsync(
        SessionStatus? status,
        Guid? vehicleId,
        Guid? slotId,
        Guid? ticketId,
        DateTime? fromUtc,
        DateTime? toUtc,
        CancellationToken ct = default)
    {
        var rows = await _sessions.ListAsync(
            new ParkingSessionSpecifications.ListFiltered(status, vehicleId, slotId, ticketId, fromUtc, toUtc),
            ct);
        return rows.Select(s => s.ToDto()).ToList();
    }

    public async Task<ParkingSessionDto?> GetByIdAsync(Guid id, CancellationToken ct = default)
    {
        var s = await _sessions.FirstOrDefaultAsync(new ParkingSessionSpecifications.ByIdWithDetails(id), ct);
        return s?.ToDto();
    }

    public async Task<ParkingSessionDto?> GetActiveByTicketAsync(Guid ticketId, CancellationToken ct = default)
    {
        var s = await _sessions.FirstOrDefaultAsync(
            new ParkingSessionSpecifications.ActiveByTicket(ticketId), ct);
        return s?.ToDto();
    }

    public async Task<ParkingSessionDto?> GetActiveBySlotAsync(Guid slotId, CancellationToken ct = default)
    {
        var s = await _sessions.FirstOrDefaultAsync(
            new ParkingSessionSpecifications.ActiveBySlot(slotId), ct);
        return s?.ToDto();
    }

    public async Task<ParkingSessionDto?> GetActiveByVehicleAsync(Guid vehicleId, CancellationToken ct = default)
    {
        var s = await _sessions.FirstOrDefaultAsync(
            new ParkingSessionSpecifications.ActiveByVehicle(vehicleId), ct);
        return s?.ToDto();
    }

    public async Task<ParkingSessionDto> StartAsync(StartSessionRequest req, CancellationToken ct = default)
    {
        var ticket = await _tickets.GetByIdAsync(req.TicketId, ct)
            ?? throw new NotFoundException(nameof(ParkingTicket), req.TicketId);

        if (ticket.Status == TicketStatus.Cancelled || ticket.Status == TicketStatus.Completed)
        {
            throw new ValidationException(
                $"Ticket '{ticket.TicketCode}' is {ticket.Status} and cannot start a session.");
        }

        // Enforce unique-active per ticket and per slot.
        var existingForTicket = await _sessions.FirstOrDefaultAsync(
            new ParkingSessionSpecifications.ActiveByTicket(ticket.Id), ct);
        if (existingForTicket is not null)
        {
            throw new ConflictException(
                $"Ticket '{ticket.TicketCode}' already has an active session.");
        }

        var slot = await _slots.GetByIdAsync(req.SlotId, ct)
            ?? throw new NotFoundException(nameof(ParkingSlot), req.SlotId);

        if (slot.Status == SlotStatus.Maintenance)
        {
            throw new ValidationException(
                $"Slot '{slot.SlotCode}' is under maintenance and cannot be used.");
        }

        // Unique-active invariant: a slot can only have ONE active session at a time,
        // regardless of its current SlotStatus (Available / Occupied / Reserved).
        var activeOnSlot = await _sessions.FirstOrDefaultAsync(
            new ParkingSessionSpecifications.ActiveBySlot(slot.Id), ct);
        if (activeOnSlot is not null)
        {
            throw new ConflictException(
                $"Slot '{slot.SlotCode}' is already occupied by another active session.");
        }

        var entry = EnsureUtc(req.EntryTime) ?? _clock.GetUtcNow().UtcDateTime;

        var session = new ParkingSession
        {
            TicketId = ticket.Id,
            VehicleId = ticket.VehicleId,
            SlotId = slot.Id,
            Status = SessionStatus.Active,
            EntryTime = entry
        };

        // Claim the slot.
        slot.Status = SlotStatus.Occupied;
        slot.UpdatedAt = _clock.GetUtcNow().UtcDateTime;

        // Move the ticket to Active.
        ticket.Status = TicketStatus.Active;
        if (!ticket.EntryTime.HasValue || ticket.EntryTime.Value > entry)
        {
            ticket.EntryTime = entry;
        }
        ticket.UpdatedAt = _clock.GetUtcNow().UtcDateTime;

        await _sessions.AddAsync(session, ct);
        _tickets.Update(ticket);
        _slots.Update(slot);
        await _uow.SaveChangesAsync(ct);

        session.Ticket = ticket;
        session.Vehicle = ticket.Vehicle;
        session.Slot = slot;
        return session.ToDto();
    }

    public async Task<ParkingSessionDto> EndAsync(Guid id, EndSessionRequest req, CancellationToken ct = default)
    {
        var session = await _sessions.FirstOrDefaultAsync(
            new ParkingSessionSpecifications.ByIdWithDetails(id), ct)
            ?? throw new NotFoundException(nameof(ParkingSession), id);

        if (session.Status != SessionStatus.Active)
        {
            throw new ValidationException(
                $"Session '{session.Id}' is {session.Status} and cannot be ended again.");
        }

        var exitUtc = EnsureUtc(req.ExitTime) ?? _clock.GetUtcNow().UtcDateTime;
        if (exitUtc < session.EntryTime)
        {
            throw new ValidationException("ExitTime must be greater than or equal to EntryTime.");
        }

        // Refuse to end if a payment is already pending — the attendant must complete payment first.
        if (session.Payment is { Status: PaymentStatus.Pending })
        {
            throw new ConflictException(
                "Cannot end session while a pending payment exists. Complete or cancel the payment first.");
        }

        session.ExitTime = exitUtc;
        session.Status = SessionStatus.Completed;
        session.UpdatedAt = _clock.GetUtcNow().UtcDateTime;

        // Free the slot. Always re-fetch from the repo to avoid operating on a stale
        // (or null) navigation property — otherwise the slot could be left "Occupied" forever.
        var slot = await _slots.GetByIdAsync(session.SlotId, ct);
        if (slot is null)
        {
            throw new NotFoundException(nameof(ParkingSlot), session.SlotId);
        }
        slot.Status = SlotStatus.Available;
        slot.UpdatedAt = _clock.GetUtcNow().UtcDateTime;
        _slots.Update(slot);

        // Mark the ticket as Completed if it isn't already.
        var ticket = session.Ticket ?? await _tickets.GetByIdAsync(session.TicketId, ct);
        if (ticket is not null && ticket.Status != TicketStatus.Completed)
        {
            ticket.Status = TicketStatus.Completed;
            ticket.ExitTime = ticket.ExitTime ?? exitUtc;
            ticket.UpdatedAt = _clock.GetUtcNow().UtcDateTime;
            _tickets.Update(ticket);
        }

        _sessions.Update(session);
        await _uow.SaveChangesAsync(ct);
        return session.ToDto();
    }

    public async Task<ParkingSessionDto> CancelAsync(Guid id, CancellationToken ct = default)
    {
        var session = await _sessions.FirstOrDefaultAsync(
            new ParkingSessionSpecifications.ByIdWithDetails(id), ct)
            ?? throw new NotFoundException(nameof(ParkingSession), id);

        if (session.Status == SessionStatus.Completed)
        {
            throw new ValidationException("Cannot cancel a completed session.");
        }
        if (session.Status == SessionStatus.Cancelled)
        {
            return session.ToDto();
        }

        session.Status = SessionStatus.Cancelled;
        session.ExitTime = session.ExitTime ?? _clock.GetUtcNow().UtcDateTime;
        session.UpdatedAt = _clock.GetUtcNow().UtcDateTime;

        var slot = await _slots.GetByIdAsync(session.SlotId, ct);
        if (slot is null)
        {
            throw new NotFoundException(nameof(ParkingSlot), session.SlotId);
        }
        slot.Status = SlotStatus.Available;
        slot.UpdatedAt = _clock.GetUtcNow().UtcDateTime;
        _slots.Update(slot);

        // Mirror the cancellation onto the ticket so it doesn't stay "Active" forever.
        var ticket = session.Ticket ?? await _tickets.GetByIdAsync(session.TicketId, ct);
        if (ticket is not null && ticket.Status != TicketStatus.Completed && ticket.Status != TicketStatus.Cancelled)
        {
            ticket.Status = TicketStatus.Cancelled;
            ticket.ExitTime = ticket.ExitTime ?? session.ExitTime;
            ticket.UpdatedAt = _clock.GetUtcNow().UtcDateTime;
            _tickets.Update(ticket);
        }

        _sessions.Update(session);
        await _uow.SaveChangesAsync(ct);
        return session.ToDto();
    }

    private static DateTime? EnsureUtc(DateTime? value)
    {
        if (!value.HasValue) return null;
        return value.Value.Kind switch
        {
            DateTimeKind.Utc => value.Value,
            DateTimeKind.Local => value.Value.ToUniversalTime(),
            _ => DateTime.SpecifyKind(value.Value, DateTimeKind.Utc)
        };
    }
}