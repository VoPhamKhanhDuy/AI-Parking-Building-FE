using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using ParkingSystem.Domain.Entities;
using ParkingSystem.Domain.Enums;

namespace ParkingSystem.Infrastructure.Persistence.Configurations;

public class PricingRuleConfiguration : IEntityTypeConfiguration<PricingRule>
{
    public void Configure(EntityTypeBuilder<PricingRule> builder)
    {
        builder.ConfigureBaseEntity();

        builder.ToTable("PricingRules");

        builder.Property(p => p.TicketType)
            .HasConversion<string>()
            .HasMaxLength(20);

        builder.Property(p => p.PricePerHour).HasColumnType("numeric(12,2)");
        builder.Property(p => p.PricePerDay).HasColumnType("numeric(12,2)");
        builder.Property(p => p.PricePerMonth).HasColumnType("numeric(12,2)");
        builder.Property(p => p.PenaltyFee).HasColumnType("numeric(12,2)");

        builder.Property(p => p.EffectiveFrom).HasColumnType("timestamptz");
        builder.Property(p => p.EffectiveTo).HasColumnType("timestamptz");

        builder.Property(p => p.IsActive).HasDefaultValue(true);

        builder.HasOne(p => p.VehicleType)
            .WithMany(vt => vt.PricingRules)
            .HasForeignKey(p => p.VehicleTypeId)
            .OnDelete(DeleteBehavior.Restrict);

        builder.HasIndex(p => new { p.VehicleTypeId, p.TicketType, p.IsActive });
    }
}