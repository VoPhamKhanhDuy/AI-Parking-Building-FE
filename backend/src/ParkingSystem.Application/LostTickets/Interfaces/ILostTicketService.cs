using ParkingSystem.Application.LostTickets.DTOs;

namespace ParkingSystem.Application.LostTickets.Interfaces;

public interface ILostTicketService
{
    Task<LostTicketPageDataDto> GetPageDataAsync(CancellationToken ct = default);
    Task<LostTicketPolicyDto> GetPolicyAsync(CancellationToken ct = default);
    Task<LostTicketSessionDto?> FindSessionByTicketCodeAsync(string ticketCode, CancellationToken ct = default);
    Task<LostTicketSessionDto?> FindSessionByLicensePlateAsync(string licensePlate, CancellationToken ct = default);
    Task<CalculateFeeResponse> CalculateFeeAsync(CalculateFeeRequest req, CancellationToken ct = default);
    Task<LostTicketCaseDto> CreateCaseAsync(CreateLostTicketCaseRequest req, CancellationToken ct = default);
    Task<LostTicketCaseDto> ProcessPaymentAsync(Guid caseId, ProcessLostTicketRequest req, CancellationToken ct = default);
    Task<IReadOnlyList<LostTicketCaseDto>> ListRecentCasesAsync(int count = 10, CancellationToken ct = default);
}
