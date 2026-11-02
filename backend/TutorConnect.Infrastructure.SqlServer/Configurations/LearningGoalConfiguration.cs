using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using TutorConnect.Domain.Entities;

namespace TutorConnect.Infrastructure.SqlServer.Configuration
{
    public sealed class LearningGoalConfiguration : IEntityTypeConfiguration<LearningGoal>
    {
        public void Configure(EntityTypeBuilder<LearningGoal> builder)
        {
            builder.ToTable("LearningGoals", table =>
            {
                table.HasCheckConstraint("CK_LearningGoals_Title_NotBlank", "NULLIF(LTRIM(RTRIM([Title])), '') IS NOT NULL");
                table.HasCheckConstraint(
                    "CK_LearningGoals_Status",
                    "[Status] IN ('NotStarted', 'InProgress', 'Completed', 'Cancelled')");
            });

            builder.HasKey(g => g.Id);
            builder.Property(g => g.Id).ValueGeneratedOnAdd();
            builder.Property(g => g.Title).HasMaxLength(250).IsRequired();
            builder.Property(g => g.Description).HasMaxLength(1500);
            builder.Property(g => g.TargetDate).HasColumnType("date");
            builder.Property(g => g.Status).HasConversion<string>().HasMaxLength(20).IsRequired();

            builder.HasOne(g => g.Student)
                .WithMany(u => u.LearningGoals)
                .HasForeignKey(g => g.StudentId)
                .OnDelete(DeleteBehavior.NoAction);

            builder.HasOne(g => g.TutorSubject)
                .WithMany(ts => ts.LearningGoals)
                .HasForeignKey(g => g.TutorSubjectId)
                .OnDelete(DeleteBehavior.NoAction);

            builder.HasIndex(g => new { g.StudentId, g.Status });
            builder.HasIndex(g => new { g.TutorSubjectId, g.Status });
        }
    }
}
