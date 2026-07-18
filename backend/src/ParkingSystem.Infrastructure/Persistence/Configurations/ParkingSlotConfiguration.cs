using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using ParkingSystem.Domain.Entities;
using ParkingSystem.Domain.Enums;

namespace ParkingSystem.Infrastructure.Persistence.Configurations;

public class ParkingSlotConfiguration : IEntityTypeConfiguration<ParkingSlot>
{
    public void Configure(EntityTypeBuilder<ParkingSlot> builder)
    {
        builder.ConfigureBaseEntity();

        builder.ToTable("ParkingSlots");

        builder.Property(s => s.SlotCode)
            .IsRequired()
            .HasMaxLength(30);

        builder.Property(s => s.Status)
            .HasConversion<string>()
            .HasMaxLength(20)
            .HasDefaultValue(SlotStatus.Available);

        builder.Property(s => s.DistanceToExitOrElevator);

        builder.HasOne(s => s.ParkingZone)
            .WithMany(z => z.Slots)
            .HasForeignKey(s => s.ParkingZoneId)
            .OnDelete(DeleteBehavior.Cascade);

        // SDD requirement: SlotCode is unique within a ParkingZone.
        builder.HasIndex(s => new { s.ParkingZoneId, s.SlotCode }).IsUnique();
        builder.HasIndex(s => s.Status);
    }
}