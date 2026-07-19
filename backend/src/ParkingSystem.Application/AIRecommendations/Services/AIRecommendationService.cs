using System.Diagnostics;
using System.Text.Json;
using Microsoft.Extensions.Logging;
using ParkingSystem.Application.AIRecommendations.DTOs;
using ParkingSystem.Application.AIRecommendations.Interfaces;
using ParkingSystem.Application.AIRecommendations.Specifications;
using ParkingSystem.Application.Common.Exceptions;
using ParkingSystem.Application.Common.Interfaces;
using ParkingSystem.Domain.Entities;
using ParkingSystem.Domain.Enums;

namespace ParkingSystem.Application.AIRecommendations.Services;

/// <summary>
/// Slot recommender. Loads candidate zones via <see cref="IRepository{T}"/>
/// + Specifications, scores them with <see cref="SlotScorer"/>, and writes
/// one row to <c>AIRecommendationLogs</c> per request.
/// </summary>
public class AIRecommendationService : IAIRecommendationService
{
    private const int MaxAlternatives = 5;

    private readonly IRepository<ParkingZone> _zones;
    private readonly IRepository<VehicleType> _vehicleTypes;
    private readonly IRepository<Vehicle> _vehicles;
    private readonly IRepository<AIRecommendationLog> _logs;
    private readonly IUnitOfWork _uow;
    private readonly ILogger<AIRecommendationService> _logger;

    public AIRecommendationService(
        IRepository<ParkingZone> zones,
        IRepository<VehicleType> vehicleTypes,
        IRepository<Vehicle> vehicles,
        IRepository<AIRecommendationLog> logs,
        IUnitOfWork uow,
        ILogger<AIRecommendationService> logger)
    {
        _zones = zones;
        _vehicleTypes = vehicleTypes;
        _vehicles = vehicles;
        _logs = logs;
        _uow = uow;
        _logger = logger;
    }

    public async Task<AIRecommendationListDto> RecommendAsync(RequestRecommendationRequest req, CancellationToken ct = default)
    {
        if (req is null) throw new ValidationException("Request body is required.");

        var stopwatch = Stopwatch.StartNew();
        var vehicle = await ResolveOrCreateVehicleAsync(req.LicensePlate, req.VehicleCategory, ct);
        var candidates = await LoadCandidatesAsync(req.VehicleCategory, ct);

        AIRecommendationListDto payload = candidates.Count == 0
            ? BuildNoSlotsAvailable(req)
            : BuildRecommendation(req, candidates);

        stopwatch.Stop();

        if (vehicle is not null)
        {
            await PersistLogAsync(vehicle.Id, req, payload, payload.Alternatives.Count == 0 && candidates.Count == 0, stopwatch.ElapsedMilliseconds, ct);
        }

        return payload;
    }

    private async Task<Vehicle?> ResolveOrCreateVehicleAsync(string licensePlate, VehicleTypeCategory category, CancellationToken ct)
    {
        if (string.IsNullOrWhiteSpace(licensePlate)) return null;

        var normalized = licensePlate.Trim().ToUpperInvariant();

        // Serializable transaction collapses the check-then-insert race window
        // (e.g. React StrictMode's double-invoked effect in dev, or two
        // concurrent operators) so the unique index on Vehicles.LicensePlate
        // is no longer reached twice.
        await _uow.BeginTransactionAsync(System.Data.IsolationLevel.Serializable, ct);
        try
        {
            var existing = await _vehicles.FirstOrDefaultAsync(
                new AIRecommendationSpecifications.VehicleByLicensePlate(normalized), ct);
            if (existing is not null)
            {
                await _uow.CommitTransactionAsync(ct);
                return existing;
            }

            var vehicleType = await _vehicleTypes.FirstOrDefaultAsync(
                new AIRecommendationSpecifications.VehicleTypeByCategory(category), ct)
                ?? throw new NotFoundException(nameof(VehicleType), category.ToString());

            var vehicle = new Vehicle
            {
                LicensePlate = normalized,
                VehicleTypeId = vehicleType.Id
            };
            await _vehicles.AddAsync(vehicle, ct);
            await _uow.SaveChangesAsync(ct);
            await _uow.CommitTransactionAsync(ct);
            return vehicle;
        }
        catch (NotFoundException)
        {
            await _uow.RollbackTransactionAsync(ct);
            throw;
        }
        catch (ValidationException)
        {
            await _uow.RollbackTransactionAsync(ct);
            throw;
        }
        catch (Exception)
        {
            // Any other failure — including the rare unique-constraint violation
            // that can race through a concurrent non-transactional writer — is
            // rolled back and surfaced. The API middleware translates the
            // remaining provider exception into HTTP 409 conflict.
            await _uow.RollbackTransactionAsync(ct);
            throw;
        }
    }

    private async Task<List<RankedSlot>> LoadCandidatesAsync(VehicleTypeCategory category, CancellationToken ct)
    {
        var zones = await _zones.ListAsync(new AIRecommendationSpecifications.AllZonesWithVehicleType(), ct);
        var ranked = new List<RankedSlot>();
        foreach (var zone in zones.Where(z => z.VehicleType is not null && z.VehicleType.Category == category))
        {
            foreach (var slot in zone.Slots.Where(s => !s.IsDeleted && s.Status == SlotStatus.Available))
            {
                var distance = SlotScorer.ResolveDistance(slot, zone);
                ranked.Add(new RankedSlot(slot, zone, distance, SlotScorer.Score(slot, zone, distance)));
            }
        }
        return ranked;
    }

    private static AIRecommendationListDto BuildRecommendation(RequestRecommendationRequest req, List<RankedSlot> candidates)
    {
        candidates.Sort((a, b) => b.Score.CompareTo(a.Score));
        var top = candidates[0];
        var alternatives = candidates
            .Skip(1)
            .Take(MaxAlternatives)
            .Select(c => new AIRecommendationAlternativeDto
            {
                SlotId = c.Slot.Id,
                SlotCode = c.Slot.SlotCode,
                ZoneName = c.Zone.Name,
                FloorName = c.Zone.Floor?.Name ?? $"Floor {c.Zone.Floor?.FloorNumber}",
                Score = Math.Round(c.Score, 2),
                Reason = BuildReason(c)
            })
            .ToList();

        return new AIRecommendationListDto
        {
            RecommendedSlotId = top.Slot.Id,
            RecommendedSlotCode = top.Slot.SlotCode,
            RecommendedZoneName = top.Zone.Name,
            RecommendedFloorName = top.Zone.Floor?.Name ?? $"Floor {top.Zone.Floor?.FloorNumber}",
            Score = Math.Round((decimal)top.Score, 2),
            Explanation = BuildExplanation(top, req),
            Alternatives = alternatives
        };
    }

    private static AIRecommendationListDto BuildNoSlotsAvailable(RequestRecommendationRequest req) => new()
    {
        RecommendedSlotId = Guid.Empty,
        RecommendedSlotCode = string.Empty,
        RecommendedZoneName = string.Empty,
        RecommendedFloorName = string.Empty,
        Score = 0,
        Explanation = $"No {req.VehicleCategory} slots are currently available. Staff will assign manually.",
        Alternatives = Array.Empty<AIRecommendationAlternativeDto>()
    };

    private async Task PersistLogAsync(Guid vehicleId, RequestRecommendationRequest req, AIRecommendationListDto payload, bool aiUnavailable, long latencyMs, CancellationToken ct)
    {
        var log = new AIRecommendationLog
        {
            VehicleId = vehicleId,
            RecommendedSlotId = payload.RecommendedSlotId == Guid.Empty ? null : payload.RecommendedSlotId,
            VehicleCategory = req.VehicleCategory,
            TicketType = req.TicketType,
            FinalScore = payload.Score,
            Explanation = payload.Explanation,
            AlternativeSlotsJson = JsonSerializer.Serialize(payload.Alternatives.Select(a => new
            {
                slotId = a.SlotId,
                slotCode = a.SlotCode,
                score = a.Score,
                reason = a.Reason
            })),
            AiUnavailable = aiUnavailable,
            RecommendationLatencyMs = latencyMs
        };
        await _logs.AddAsync(log, ct);
        await _uow.SaveChangesAsync(ct);
    }

    private static string BuildReason(RankedSlot c)
    {
        var parts = new List<string>();
        if (c.Zone.Priority >= 1) parts.Add("Preferred zone");
        parts.Add(SlotScorer.ExplainDistance(c.Distance));
        parts.Add($"Score {Math.Round(c.Score, 1)}");
        return string.Join(" · ", parts);
    }

    private static string BuildExplanation(RankedSlot c, RequestRecommendationRequest req)
        => $"Slot {c.Slot.SlotCode} ({c.Zone.Name}) — best match for {req.VehicleCategory} under {req.TicketType} ticket; distance {(int)c.Distance}m to nearest exit/elevator.";

    private sealed record RankedSlot(ParkingSlot Slot, ParkingZone Zone, double Distance, double Score);
}
