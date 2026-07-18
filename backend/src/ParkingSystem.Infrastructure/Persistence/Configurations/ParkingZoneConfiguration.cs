using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using ParkingSystem.Domain.Entities;

namespace ParkingSystem.Infrastructure.Persistence.Configurations;

public class ParkingZoneConfiguration : IEntityTypeConfiguration<ParkingZone>
{
    public void Configure(EntityTypeBuilder<ParkingZone> builder)
    {
        builder.ConfigureBaseEntity();

        builder.ToTable("ParkingZones");

        builder.Property(z => z.Name)
            .IsRequired()
            .HasMaxLength(100);

        builder.Property(z => z.DistanceToExitOrElevator).IsRequired();
        builder.Property(z => z.Priority).HasDefaultValue(0);

        builder.HasOne(z => z.Floor)
            .WithMany(f => f.Zones)
            .HasForeignKey(z => z.FloorId)
            .OnDelete(DeleteBehavior.Cascade);

        builder.HasOne(z => z.VehicleType)
            .WithMany(vt => vt.Zones)
            .HasForeignKey(z => z.VehicleTypeId)
            .OnDelete(DeleteBehavior.Restrict);

        builder.HasIndex(z => new { z.FloorId, z.Name }).IsUnique();
    }
}