using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using TutorConnect.Domain.Entities;

namespace TutorConnect.Infrastructure.SqlServer.Configuration
{
    public sealed class SubjectConfiguration : IEntityTypeConfiguration<Subject>
    {
        public void Configure(EntityTypeBuilder<Subject> builder)
        {
            builder.ToTable("Subjects", table =>
            {
                table.HasCheckConstraint("CK_Subjects_Code_NotBlank", "NULLIF(LTRIM(RTRIM([Code])), '') IS NOT NULL");
                table.HasCheckConstraint("CK_Subjects_Name_NotBlank", "NULLIF(LTRIM(RTRIM([Name])), '') IS NOT NULL");
            });
            builder.HasKey(s => s.Id);
            builder.Property(s => s.Id).ValueGeneratedOnAdd();
            builder.Property(s => s.Code).HasMaxLength(30).IsRequired();
            builder.Property(s => s.Name).HasMaxLength(150).IsRequired();
            builder.Property(s => s.Description).HasMaxLength(1000);
            builder.Property(s => s.IsActive).IsRequired();

            builder.HasIndex(s => s.Code).IsUnique();
            builder.HasIndex(s => s.Name).IsUnique();
            builder.HasIndex(s => new { s.IsActive, s.Name });
        }
    }
}
