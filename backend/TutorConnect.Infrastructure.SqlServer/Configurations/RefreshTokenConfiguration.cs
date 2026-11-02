using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using TutorConnect.Domain.Entities;

namespace TutorConnect.Infrastructure.SqlServer.Configuration
{
    /// <summary>
    /// Ánh xạ entity RefreshToken -> bảng RefreshTokens.
    /// </summary>
    public sealed class RefreshTokenConfiguration : IEntityTypeConfiguration<RefreshToken>
    {
        public void Configure(EntityTypeBuilder<RefreshToken> builder)
        {
            builder.ToTable("RefreshTokens");

            builder.HasKey(rt => rt.Id);

            builder.Property(rt => rt.Id)
                .ValueGeneratedOnAdd();

            builder.Property(rt => rt.TokenHash)
                .HasColumnType("char(64)")
                .IsFixedLength()
                .IsRequired();

            builder.HasIndex(rt => rt.TokenHash)
                .IsUnique(); 

            builder.Property(rt => rt.ExpiresAtUtc)
                .HasColumnType("datetime2(0)")
                .IsRequired();

            builder.Property(rt => rt.RevokedAtUtc)
                .HasColumnType("datetime2(0)");

            // N - 1 với Users qua UserId .
            builder.HasOne(rt => rt.User)
                .WithMany(u => u.RefreshTokens)
                .HasForeignKey(rt => rt.UserId)
                .OnDelete(DeleteBehavior.Cascade);

            // Hỗ trợ truy vấn "lấy tất cả token đang hoạt động của 1 user".
            builder.HasIndex(rt => rt.UserId);
        }
    }
}
