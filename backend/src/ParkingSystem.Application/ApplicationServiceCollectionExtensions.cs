using System.Reflection;
using FluentValidation;
using Microsoft.Extensions.DependencyInjection;
using ParkingSystem.Application.Auth.Interfaces;
using ParkingSystem.Application.Auth.Services;
using ParkingSystem.Application.MonthlyPasses.Interfaces;
using ParkingSystem.Application.MonthlyPasses.Services;
using ParkingSystem.Application.Notifications.Interfaces;
using ParkingSystem.Application.Notifications.Services;
using ParkingSystem.Application.ParkingSessions.Interfaces;
using ParkingSystem.Application.ParkingSessions.Services;
using ParkingSystem.Application.ParkingStructure.Interfaces;
using ParkingSystem.Application.ParkingStructure.Services;
using ParkingSystem.Application.Payments.Interfaces;
using ParkingSystem.Application.Payments.Services;
using ParkingSystem.Application.PricingRules.Interfaces;
using ParkingSystem.Application.PricingRules.Services;
using ParkingSystem.Application.Reservations.Interfaces;
using ParkingSystem.Application.Reservations.Services;
    // SystemLogs / Audit
    using ParkingSystem.Application.SystemLogs.Interfaces;
    using ParkingSystem.Application.SystemLogs.Services;

    // AI recommendations
    using ParkingSystem.Application.AIRecommendations.Interfaces;
    using ParkingSystem.Application.AIRecommendations.Services;
using ParkingSystem.Application.Tickets.Interfaces;
using ParkingSystem.Application.Tickets.Services;
using ParkingSystem.Application.LostTickets.Interfaces;
using ParkingSystem.Application.LostTickets.Services;
using ParkingSystem.Application.VehicleExits.Interfaces;
using ParkingSystem.Application.VehicleExits.Services;
using ParkingSystem.Application.Vehicles.Interfaces;
using ParkingSystem.Application.Vehicles.Services;

namespace ParkingSystem.Application;

/// <summary>
/// DI extension for the Application layer. Call from <c>Program.cs</c>:
/// <c>builder.Services.AddApplication();</c>
/// </summary>
public static class ApplicationServiceCollectionExtensions
{
    public static IServiceCollection AddApplication(this IServiceCollection services)
    {
        var assembly = Assembly.GetExecutingAssembly();

        // Register all FluentValidation validators in this assembly.
        services.AddValidatorsFromAssembly(assembly);

        // Auth/User services
        services.AddScoped<IAuthService, AuthService>();
        services.AddScoped<IUserService, UserService>();

        // Parking structure
        services.AddScoped<IBuildingService, BuildingService>();
        services.AddScoped<IFloorService, FloorService>();
        services.AddScoped<IParkingZoneService, ParkingZoneService>();
        services.AddScoped<IParkingSlotService, ParkingSlotService>();

        // Vehicles
        services.AddScoped<IVehicleService, VehicleService>();

        // Tickets (check-in / check-out)
        services.AddScoped<IParkingTicketService, ParkingTicketService>();

        // Pricing
        services.AddScoped<IPricingRuleService, PricingRuleService>();

        // Parking sessions + payments (runtime / billing)
        services.AddScoped<IParkingSessionService, ParkingSessionService>();
        services.AddScoped<IPaymentService, PaymentService>();

        // Audit trail
        services.AddScoped<ISystemLogService, SystemLogService>();
        services.AddScoped<ISystemLogQueryService, SystemLogQueryService>();

        // Vehicle exits
        services.AddScoped<IVehicleExitService, VehicleExitService>();

        // Reservations
        services.AddScoped<IReservationService, ReservationService>();

        // Notifications
        services.AddScoped<INotificationService, NotificationService>();

        // Monthly passes
        services.AddScoped<IMonthlyPassService, MonthlyPassService>();

        // Lost tickets
        services.AddScoped<ILostTicketService, LostTicketService>();

        // AI recommendations
        services.AddScoped<IAIRecommendationService, AIRecommendationService>();

        return services;
    }
}