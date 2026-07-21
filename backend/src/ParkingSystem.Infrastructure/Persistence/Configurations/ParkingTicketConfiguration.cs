using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using ParkingSystem.Domain.Entities;
using ParkingSystem.Domain.Enums;

namespace ParkingSystem.Infrastructure.Persistence.Configurations;

public class ParkingTicketConfiguration : IEntityTypeConfiguration<ParkingTicket>
{
    public void Configure(EntityTypeBuilder<ParkingTicket> builder)
    {
        builder.ConfigureBaseEntity();

        builder.ToTable("ParkingTickets");

        builder.Property(t => t.TicketCode)
            .IsRequired()
            .HasMaxLength(40);

        builder.Property(t => t.Type)
            .HasConversion<string>()
            .HasMaxLength(20)
            .HasDefaultValue(TicketType.Hourly);

        builder.Property(t => t.Status)
            .HasConversion<string>()
            .HasMaxLength(20)
            .HasDefaultValue(TicketStatus.Issued);

        builder.Property(t => t.IssuedAt).HasColumnType("timestamptz");
        builder.Property(t => t.EntryTime).HasColumnType("timestamptz");
        builder.Property(t => t.ExitTime).HasColumnType("timestamptz");

        builder.HasOne(t => t.Vehicle)
            .WithMany(v => v.Tickets)
            .HasForeignKey(t => t.VehicleId)
            .OnDelete(DeleteBehavior.Restrict);

        builder.HasOne(t => t.IssuedByUser)
            .WithMany()
            .HasForeignKey(t => t.IssuedByUserId)
            .OnDelete(DeleteBehavior.SetNull);

        builder.HasOne(t => t.Session)
            .WithOne(s => s.Ticket)
            .HasForeignKey<ParkingSession>(s => s.TicketId)
            .OnDelete(DeleteBehavior.Restrict);

        builder.HasIndex(t => t.TicketCode).IsUnique();
        builder.HasIndex(t => t.Status);
        builder.HasIndex(t => t.IssuedAt);
    }
}