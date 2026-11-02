using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using TutorConnect.Domain.Entities;

namespace TutorConnect.Infrastructure.SqlServer.Configuration
{
    public sealed class TutorSubjectConfiguration : IEntityTypeConfiguration<TutorSubject>
    {
        public void Configure(EntityTypeBuilder<TutorSubject> builder)
        {
            builder.ToTable("TutorSubjects", table =>
            {
                table.HasCheckConstraint("CK_TutorSubjects_Fee", "[FeePerSessionCredits] > 0");
                table.HasCheckConstraint("CK_TutorSubjects_TeachingLevel_NotBlank", "NULLIF(LTRIM(RTRIM([TeachingLevel])), '') IS NOT NULL");
            });

            builder.HasKey(ts => ts.Id);
            builder.Property(ts => ts.Id).ValueGeneratedOnAdd();
            builder.Property(ts => ts.TeachingLevel).HasMaxLength(100).IsRequired();
            builder.Property(ts => ts.FeePerSessionCredits).IsRequired();
            builder.Property(ts => ts.IsActive).IsRequired();

            builder.HasOne(ts => ts.Tutor)
                .WithMany(t => t.TutorSubjects)
                .HasForeignKey(ts => ts.TutorId)
                .OnDelete(DeleteBehavior.NoAction);

            builder.HasOne(ts => ts.Subject)
                .WithMany(s => s.TutorSubjects)
                .HasForeignKey(ts => ts.SubjectId)
                .OnDelete(DeleteBehavior.NoAction);

            builder.HasIndex(ts => new { ts.TutorId, ts.SubjectId, ts.TeachingLevel }).IsUnique();
            builder.HasIndex(ts => new { ts.SubjectId, ts.TeachingLevel, ts.IsActive, ts.FeePerSessionCredits });
            builder.HasIndex(ts => new { ts.TutorId, ts.IsActive });
        }
    }
}
