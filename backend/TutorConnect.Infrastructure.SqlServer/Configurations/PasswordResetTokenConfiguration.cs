using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using TutorConnect.Domain.Entities;

namespace TutorConnect.Infrastructure.SqlServer.Configuration
{
    /// <summary>
    /// Ánh xạ entity PasswordResetToken -> bảng PasswordResetTokens.
    /// </summary>
    public sealed class PasswordResetTokenConfiguration : IEntityTypeConfiguration<PasswordResetToken>
    {
        public void Configure(EntityTypeBuilder<PasswordResetToken> builder)
        {
            builder.ToTable("PasswordResetTokens");

            builder.HasKey(t => t.Id);

            builder.Property(t => t.Id)
                .ValueGeneratedOnAdd();

            builder.Property(t => t.TokenHash)
                .HasColumnType("char(64)")
                .IsFixedLength()
                .IsRequired();

            builder.HasIndex(t => t.TokenHash)
                .IsUnique();

            builder.Property(t => t.ExpiresAtUtc)
                .HasColumnType("datetime2(0)")
                .IsRequired();

            builder.Property(t => t.UsedAtUtc)
                .HasColumnType("datetime2(0)");

            builder.HasOne(t => t.User)
                .WithMany()
                .HasForeignKey(t => t.UserId)
                .OnDelete(DeleteBehavior.Cascade);

            builder.HasIndex(t => t.UserId);
        }
    }
}
