using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using ParkingSystem.Domain.Entities;

namespace ParkingSystem.Infrastructure.Persistence.Configurations;

public class FloorConfiguration : IEntityTypeConfiguration<Floor>
{
    public void Configure(EntityTypeBuilder<Floor> builder)
    {
        builder.ConfigureBaseEntity();

        builder.ToTable("Floors");

        builder.Property(f => f.FloorNumber).IsRequired();
        builder.Property(f => f.Name).HasMaxLength(100);

        builder.HasOne(f => f.Building)
            .WithMany(b => b.Floors)
            .HasForeignKey(f => f.BuildingId)
            .OnDelete(DeleteBehavior.Cascade);

        // Same floor number cannot appear twice in the same building
        builder.HasIndex(f => new { f.BuildingId, f.FloorNumber }).IsUnique();
    }
}