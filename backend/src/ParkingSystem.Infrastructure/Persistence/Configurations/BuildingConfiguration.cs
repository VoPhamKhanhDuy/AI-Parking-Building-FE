using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using ParkingSystem.Domain.Entities;

namespace ParkingSystem.Infrastructure.Persistence.Configurations;

public class BuildingConfiguration : IEntityTypeConfiguration<Building>
{
    public void Configure(EntityTypeBuilder<Building> builder)
    {
        builder.ConfigureBaseEntity();

        builder.ToTable("Buildings");

        builder.Property(b => b.Name)
            .IsRequired()
            .HasMaxLength(150);

        builder.Property(b => b.Address)
            .HasMaxLength(500);

        builder.Property(b => b.TotalFloors)
            .IsRequired();

        builder.HasIndex(b => b.Name).IsUnique();
    }
}