using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using ParkingSystem.Domain.Entities;
using ParkingSystem.Domain.Enums;

namespace ParkingSystem.Infrastructure.Persistence.Configurations;

public class UserConfiguration : IEntityTypeConfiguration<User>
{
    public void Configure(EntityTypeBuilder<User> builder)
    {
        builder.ConfigureBaseEntity();

        builder.ToTable("Users");

        builder.Property(u => u.Email)
            .IsRequired()
            .HasMaxLength(255);

        builder.HasIndex(u => u.Email).IsUnique();

        builder.Property(u => u.PasswordHash)
            .IsRequired()
            .HasMaxLength(255);

        builder.Property(u => u.FullName)
            .IsRequired()
            .HasMaxLength(150);

        builder.Property(u => u.PhoneNumber)
            .HasMaxLength(30);

        builder.Property(u => u.Status)
            .HasConversion<string>()
            .HasMaxLength(20)
            .HasDefaultValue(UserAccountStatus.Active);

        builder.Property(u => u.LastLoginAt).HasColumnType("timestamptz");
        builder.Property(u => u.RefreshTokenExpiresAt).HasColumnType("timestamptz");

        builder.Property(u => u.RefreshTokenHash).HasMaxLength(255);

        builder.HasOne(u => u.Role)
            .WithMany(r => r.Users)
            .HasForeignKey(u => u.RoleId)
            .OnDelete(DeleteBehavior.Restrict);

        builder.HasIndex(u => u.RoleId);
    }
}