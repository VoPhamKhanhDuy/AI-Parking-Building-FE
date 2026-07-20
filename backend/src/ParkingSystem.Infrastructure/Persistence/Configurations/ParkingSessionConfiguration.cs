using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using ParkingSystem.Domain.Entities;
using ParkingSystem.Domain.Enums;

namespace ParkingSystem.Infrastructure.Persistence.Configurations;

public class ParkingSessionConfiguration : IEntityTypeConfiguration<ParkingSession>
{
    public void Configure(EntityTypeBuilder<ParkingSession> builder)
    {
        builder.ConfigureBaseEntity();

        builder.ToTable("ParkingSessions");

        builder.Property(s => s.Status)
            .HasConversion<string>()
            .HasMaxLength(20)
            .HasDefaultValue(SessionStatus.Active);

        builder.Property(s => s.EntryTime).HasColumnType("timestamptz");
        builder.Property(s => s.ExitTime).HasColumnType("timestamptz");

        builder.HasOne(s => s.Vehicle)
            .WithMany()
            .HasForeignKey(s => s.VehicleId)
            .OnDelete(DeleteBehavior.Restrict);

        builder.HasOne(s => s.Slot)
            .WithMany(slot => slot.Sessions)
            .HasForeignKey(s => s.SlotId)
            .OnDelete(DeleteBehavior.Restrict);

        // SDD requirement: a slot can only host ONE active session at a time.
        // This is a *filtered* unique index (Postgres-only feature).
        builder.HasIndex(s => s.SlotId)
            .IsUnique()
            .HasFilter("\"Status\" = 'Active'")
            .HasDatabaseName("IX_ParkingSessions_SlotId_Active_Unique");

        builder.HasIndex(s => s.Status);
        builder.HasIndex(s => s.EntryTime);
    }
}