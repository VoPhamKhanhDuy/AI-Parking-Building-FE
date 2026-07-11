using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using ParkingSystem.Domain.Entities;
using ParkingSystem.Domain.Enums;

namespace ParkingSystem.Infrastructure.Persistence.Configurations;

public class PaymentConfiguration : IEntityTypeConfiguration<Payment>
{
    public void Configure(EntityTypeBuilder<Payment> builder)
    {
        builder.ConfigureBaseEntity();

        builder.ToTable("Payments");

        builder.Property(p => p.Amount).HasColumnType("numeric(12,2)");

        builder.Property(p => p.Method)
            .HasConversion<string>()
            .HasMaxLength(20);

        builder.Property(p => p.Status)
            .HasConversion<string>()
            .HasMaxLength(20)
            .HasDefaultValue(PaymentStatus.Pending);

        builder.Property(p => p.PaidAt).HasColumnType("timestamptz");

        builder.Property(p => p.TransactionReference).HasMaxLength(100);

        builder.HasOne(p => p.Session)
            .WithOne(s => s.Payment)
            .HasForeignKey<Payment>(p => p.SessionId)
            .OnDelete(DeleteBehavior.Restrict);

        builder.HasOne(p => p.ProcessedByUser)
            .WithMany()
            .HasForeignKey(p => p.ProcessedByUserId)
            .OnDelete(DeleteBehavior.SetNull);

        builder.HasIndex(p => p.Status);
        builder.HasIndex(p => p.PaidAt);
    }
}