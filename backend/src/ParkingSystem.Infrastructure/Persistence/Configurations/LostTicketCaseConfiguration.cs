using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using ParkingSystem.Domain.Entities;
using ParkingSystem.Domain.Enums;

namespace ParkingSystem.Infrastructure.Persistence.Configurations;

public class LostTicketCaseConfiguration : IEntityTypeConfiguration<LostTicketCase>
{
    public void Configure(EntityTypeBuilder<LostTicketCase> builder)
    {
        builder.ConfigureBaseEntity();

        builder.ToTable("LostTicketCases");

        builder.Property(c => c.OwnerName).HasMaxLength(100).IsRequired();
        builder.Property(c => c.Phone).HasMaxLength(20);
        builder.Property(c => c.ParkingFee).HasColumnType("numeric(12,2)");
        builder.Property(c => c.Penalty).HasColumnType("numeric(12,2)");
        builder.Property(c => c.Discount).HasColumnType("numeric(12,2)");
        builder.Property(c => c.TotalPaid).HasColumnType("numeric(12,2)");

        builder.Property(c => c.PaymentStatus)
            .HasConversion<string>()
            .HasMaxLength(20)
            .HasDefaultValue(PaymentStatus.Pending);

        builder.Property(c => c.PaidAt).HasColumnType("timestamptz");

        builder.Property(c => c.CaseCode).HasMaxLength(30).IsRequired();
        builder.HasIndex(c => c.CaseCode).IsUnique();

        builder.Property(c => c.Notes).HasMaxLength(500);

        builder.HasOne(c => c.Session)
            .WithMany()
            .HasForeignKey(c => c.SessionId)
            .OnDelete(DeleteBehavior.Restrict);

        builder.HasOne(c => c.Ticket)
            .WithMany()
            .HasForeignKey(c => c.TicketId)
            .OnDelete(DeleteBehavior.Restrict);

        builder.HasOne(c => c.Vehicle)
            .WithMany()
            .HasForeignKey(c => c.VehicleId)
            .OnDelete(DeleteBehavior.Restrict);

        builder.HasOne(c => c.Payment)
            .WithMany()
            .HasForeignKey(c => c.PaymentId)
            .OnDelete(DeleteBehavior.SetNull);

        builder.HasIndex(c => c.PaymentStatus);
        builder.HasIndex(c => c.CreatedAt);
    }
}
