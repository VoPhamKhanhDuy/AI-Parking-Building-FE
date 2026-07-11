using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using ParkingSystem.Application.Auth.Interfaces;
using ParkingSystem.Application.Common.Interfaces;
using ParkingSystem.Application.Settings;
using ParkingSystem.Domain.Common;
using ParkingSystem.Domain.Entities;
using ParkingSystem.Infrastructure.Auth;
using ParkingSystem.Infrastructure.Persistence;

namespace ParkingSystem.Infrastructure;

/// <summary>
/// DI extension for the Infrastructure layer. Call from <c>Program.cs</c>:
/// <c>builder.Services.AddInfrastructure(builder.Configuration);</c>
/// </summary>
public static class InfrastructureServiceCollectionExtensions
{
    public static IServiceCollection AddInfrastructure(this IServiceCollection services, IConfiguration configuration)
    {
        // Database
        var connectionString = configuration.GetConnectionString("DefaultConnection")
            ?? throw new InvalidOperationException("Connection string 'DefaultConnection' not found.");

        services.AddDbContext<AppDbContext>(options =>
            options.UseNpgsql(connectionString, npgsql =>
            {
                npgsql.MigrationsAssembly(typeof(AppDbContext).Assembly.GetName().Name);
            }));

        // Unit of work + generic repository for every entity.
        services.AddScoped<IUnitOfWork, UnitOfWork>();
        RegisterRepositories(services);

        // Auth services
        services.AddSingleton<IPasswordHasher, BcryptPasswordHasher>();
        services.AddSingleton<IJwtTokenService, JwtTokenService>();

        // System clock — wrapped so it can be replaced in tests.
        services.AddSingleton(TimeProvider.System);

        // JwtSettings bound from configuration and registered as a singleton so
        // Application services can take it via constructor injection without
        // depending on Microsoft.Extensions.Options.
        services.Configure<JwtSettings>(configuration.GetSection("JwtSettings"));
        services.AddSingleton(sp =>
        {
            var settings = configuration.GetSection("JwtSettings").Get<JwtSettings>()
                ?? throw new InvalidOperationException("Missing JwtSettings section.");
            return settings;
        });

        return services;
    }

    /// <summary>
    /// Registers <see cref="IRepository{T}"/> for every concrete entity in
    /// Domain. Centralized here so adding a new entity only requires one line.
    /// </summary>
    private static void RegisterRepositories(IServiceCollection services)
    {
        // BaseEntity-derived types only — primitive types and specifications excluded.
        var entityType = typeof(BaseEntity);

        var domainAssembly = entityType.Assembly;
        var types = domainAssembly.GetTypes()
            .Where(t => t is { IsClass: true, IsAbstract: false } && entityType.IsAssignableFrom(t));

        foreach (var t in types)
        {
            var repoInterface = typeof(IRepository<>).MakeGenericType(t);
            var repoImpl = typeof(Repository<>).MakeGenericType(t);
            services.AddScoped(repoInterface, repoImpl);
        }
    }
}