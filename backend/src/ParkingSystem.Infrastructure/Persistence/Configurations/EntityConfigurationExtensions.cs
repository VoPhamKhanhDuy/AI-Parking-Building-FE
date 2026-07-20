using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using ParkingSystem.Domain.Common;
using ParkingSystem.Domain.Enums;

namespace ParkingSystem.Infrastructure.Persistence.Configurations;

internal static class EntityConfigurationExtensions
{
    /// <summary>
    /// Standard column conventions for <see cref="BaseEntity"/> inheritors:
    /// uuid PK, timestamptz audit fields, IsDeleted flag.
    /// </summary>
    public static void ConfigureBaseEntity<TEntity>(this EntityTypeBuilder<TEntity> builder)
        where TEntity : BaseEntity
    {
        builder.HasKey(e => e.Id);
        builder.Property(e => e.Id)
            .HasColumnName("Id")
            .HasColumnType("uuid");

        builder.Property(e => e.CreatedAt)
            .HasColumnType("timestamptz")
            .HasDefaultValueSql("now() at time zone 'utc'");

        builder.Property(e => e.UpdatedAt)
            .HasColumnType("timestamptz");

        builder.Property(e => e.IsDeleted)
            .HasDefaultValue(false);

        builder.HasIndex(e => e.CreatedAt);
    }

    /// <summary>
    /// Persists an enum as snake_case string in Postgres (e.g. <c>SlotStatus.Available</c> -> "available").
    /// </summary>
    public static PropertyBuilder HasEnumStringConversion(
        this PropertyBuilder propertyBuilder)
    {
        return propertyBuilder.HasConversion<string>();
    }
}