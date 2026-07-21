using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using ParkingSystem.Domain.Entities;
using ParkingSystem.Domain.Enums;

namespace ParkingSystem.Infrastructure.Persistence.Configurations;

public class AIRecommendationLogConfiguration : IEntityTypeConfiguration<AIRecommendationLog>
{
    public void Configure(EntityTypeBuilder<AIRecommendationLog> builder)
    {
        builder.ConfigureBaseEntity();

        builder.ToTable("AIRecommendationLogs");

        builder.Property(a => a.VehicleCategory)
            .HasConversion<string>()
            .HasMaxLength(30);

        builder.Property(a => a.TicketType)
            .HasConversion<string>()
            .HasMaxLength(20);

        builder.Property(a => a.FinalScore)
            .HasColumnType("numeric(6,2)");

        builder.Property(a => a.Explanation)
            .IsRequired()
            .HasMaxLength(500);

        // SDD requirement: store as jsonb for queryability.
        builder.Property(a => a.AlternativeSlotsJson)
            .HasColumnType("jsonb")
            .HasDefaultValueSql("'[]'::jsonb");

        builder.Property(a => a.AiUnavailable).HasDefaultValue(false);
        builder.Property(a => a.RecommendationLatencyMs).HasDefaultValue(0L);

        builder.HasOne(a => a.Vehicle)
            .WithMany(v => v.AIRecommendations)
            .HasForeignKey(a => a.VehicleId)
            .OnDelete(DeleteBehavior.Cascade);

        builder.HasOne(a => a.RecommendedSlot)
            .WithMany(s => s.AIRecommendations)
            .HasForeignKey(a => a.RecommendedSlotId)
            .OnDelete(DeleteBehavior.SetNull);

        builder.HasIndex(a => a.CreatedAt);
        builder.HasIndex(a => a.VehicleId);
    }
}