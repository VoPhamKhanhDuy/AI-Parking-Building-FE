using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using ParkingSystem.Domain.Entities;
using ParkingSystem.Domain.Enums;

namespace ParkingSystem.Infrastructure.Persistence.Configurations;

public class VehicleTypeConfiguration : IEntityTypeConfiguration<VehicleType>
{
    public void Configure(EntityTypeBuilder<VehicleType> builder)
    {
        builder.ConfigureBaseEntity();

        builder.ToTable("VehicleTypes");

        builder.Property(vt => vt.Name)
            .IsRequired()
            .HasMaxLength(50);

        builder.Property(vt => vt.Category)
            .HasConversion<string>()
            .HasMaxLength(30);

        builder.Property(vt => vt.DefaultHourlyRate)
            .HasColumnType("numeric(12,2)");

        builder.HasIndex(vt => vt.Name).IsUnique();
    }
}