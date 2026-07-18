using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using ParkingSystem.Domain.Entities;

namespace ParkingSystem.Infrastructure.Persistence.Configurations;

public class SystemLogConfiguration : IEntityTypeConfiguration<SystemLog>
{
    public void Configure(EntityTypeBuilder<SystemLog> builder)
    {
        builder.ConfigureBaseEntity();

        builder.ToTable("SystemLogs");

        builder.Property(l => l.Action)
            .IsRequired()
            .HasMaxLength(100);

        builder.Property(l => l.TargetEntity).HasMaxLength(100);
        builder.Property(l => l.Description).HasMaxLength(500);
        builder.Property(l => l.IpAddress).HasMaxLength(45);

        builder.HasOne(l => l.User)
            .WithMany()
            .HasForeignKey(l => l.UserId)
            .OnDelete(DeleteBehavior.SetNull);

        builder.HasIndex(l => new { l.Action, l.CreatedAt });
        builder.HasIndex(l => new { l.TargetEntity, l.TargetEntityId });
        builder.HasIndex(l => l.UserId);
    }
}