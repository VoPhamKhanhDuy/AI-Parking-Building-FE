using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using ParkingSystem.Domain.Entities;

namespace ParkingSystem.Infrastructure.Persistence.Configurations;

public class VehicleConfiguration : IEntityTypeConfiguration<Vehicle>
{
    public void Configure(EntityTypeBuilder<Vehicle> builder)
    {
        builder.ConfigureBaseEntity();

        builder.ToTable("Vehicles");

        builder.Property(v => v.LicensePlate)
            .IsRequired()
            .HasMaxLength(20);

        builder.Property(v => v.Brand).HasMaxLength(50);
        builder.Property(v => v.Model).HasMaxLength(50);
        builder.Property(v => v.Color).HasMaxLength(30);

        builder.HasOne(v => v.VehicleType)
            .WithMany(vt => vt.Vehicles)
            .HasForeignKey(v => v.VehicleTypeId)
            .OnDelete(DeleteBehavior.Restrict);

        builder.HasOne(v => v.OwnerUser)
            .WithMany()
            .HasForeignKey(v => v.OwnerUserId)
            .OnDelete(DeleteBehavior.SetNull);

        builder.HasIndex(v => v.LicensePlate).IsUnique();
    }
}