using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using TutorConnect.Domain.Entities;

namespace TutorConnect.Infrastructure.SqlServer.Configuration
{
    /// <summary>
    /// Ánh xạ entity User -> bảng Users 
    /// </summary>
    public sealed class UserConfiguration : IEntityTypeConfiguration<User>
    {
        public void Configure(EntityTypeBuilder<User> builder)
        {
            builder.ToTable("Users", table =>
            {
                table.HasCheckConstraint("CK_Users_Role", "[Role] IN ('Admin', 'Tutor', 'Student')");
                table.HasCheckConstraint("CK_Users_Status", "[Status] IN ('Active', 'Locked', 'Inactive')");
            });

            builder.HasKey(u => u.Id);

            builder.Property(u => u.Id)
                .ValueGeneratedOnAdd();

            builder.Property(u => u.Email)
                .HasMaxLength(320)
                .IsRequired();

            builder.HasIndex(u => u.Email)
                .IsUnique();

            builder.Property(u => u.PasswordHash)
                .HasMaxLength(500)
                .IsRequired();

            builder.Property(u => u.FullName)
                .HasMaxLength(150)
                .IsRequired();

            builder.Property(u => u.Phone)
                .HasMaxLength(30);

            // Lưu enum dưới dạng chuỗi để khớp NVARCHAR(20) + CHECK constraint.
            builder.Property(u => u.Role)
                .HasConversion<string>()
                .HasMaxLength(20)
                .IsRequired();

            builder.Property(u => u.Status)
                .HasConversion<string>()
                .HasMaxLength(20)
                .IsRequired();

            builder.Property(u => u.FailedLoginAttempts)
                .HasDefaultValue(0)
                .IsRequired();

            builder.Property(u => u.TimeZoneId)
                .HasMaxLength(100)
                .IsRequired();
        }
    }
}
