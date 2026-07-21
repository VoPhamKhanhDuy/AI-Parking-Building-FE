using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Design;
using Microsoft.Extensions.Configuration;

namespace ParkingSystem.Infrastructure.Persistence;

/// <summary>
/// Used by the EF Core CLI tools (e.g. <c>dotnet ef migrations add</c>)
/// when the API host is not running. Reads the connection string from
/// <c>src/ParkingSystem.API/appsettings.Development.json</c>.
/// </summary>
public class AppDbContextFactory : IDesignTimeDbContextFactory<AppDbContext>
{
    public AppDbContext CreateDbContext(string[] args)
    {
        // Locate the API project's appsettings. We walk up from the Infrastructure
        // project's bin/Debug/net8.0/ directory to find the API project.
        var apiProjectPath = Path.GetFullPath(
            Path.Combine(AppContext.BaseDirectory, "..", "..", "..", "..", "..", "src", "ParkingSystem.API"));

        var configuration = new ConfigurationBuilder()
            .SetBasePath(apiProjectPath)
            .AddJsonFile("appsettings.json", optional: false)
            .AddJsonFile("appsettings.Development.json", optional: true)
            .AddEnvironmentVariables()
            .Build();

        var connectionString = configuration.GetConnectionString("DefaultConnection")
            ?? throw new InvalidOperationException("Connection string 'DefaultConnection' not found.");

        var optionsBuilder = new DbContextOptionsBuilder<AppDbContext>();
        optionsBuilder.UseNpgsql(connectionString, npgsql =>
        {
            npgsql.MigrationsAssembly(typeof(AppDbContextFactory).Assembly.GetName().Name);
        });

        return new AppDbContext(optionsBuilder.Options);
    }
}