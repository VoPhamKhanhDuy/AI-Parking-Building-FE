using System.Reflection;
using FluentValidation;
using Microsoft.Extensions.DependencyInjection;
using ParkingSystem.Application.Auth.Interfaces;
using ParkingSystem.Application.Auth.Services;
using ParkingSystem.Application.ParkingSessions.Interfaces;
using ParkingSystem.Application.ParkingSessions.Services;
using ParkingSystem.Application.ParkingStructure.Interfaces;
using ParkingSystem.Application.ParkingStructure.Services;
using ParkingSystem.Application.Payments.Interfaces;
using ParkingSystem.Application.Payments.Services;
using ParkingSystem.Application.PricingRules.Interfaces;
using ParkingSystem.Application.PricingRules.Services;
using ParkingSystem.Application.Tickets.Interfaces;
using ParkingSystem.Application.Tickets.Services;
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

        return services;
    }
}