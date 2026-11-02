using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using TutorConnect.Domain.Entities;

namespace TutorConnect.Infrastructure.SqlServer.Configuration
{
    public sealed class SessionProgressConfiguration : IEntityTypeConfiguration<SessionProgress>
    {
        public void Configure(EntityTypeBuilder<SessionProgress> builder)
        {
            builder.ToTable("SessionProgress", table =>
            {
                table.HasCheckConstraint(
                    "CK_SessionProgress_GoalProgress",
                    "[GoalProgressPercent] BETWEEN 0 AND 100");
                table.HasCheckConstraint(
                    "CK_SessionProgress_Score",
                    "([Score] IS NULL AND [MaxScore] IS NULL) OR ([Score] IS NOT NULL AND [MaxScore] IS NOT NULL AND [MaxScore] > 0 AND [Score] >= 0 AND [Score] <= [MaxScore])");
                table.HasCheckConstraint(
                    "CK_SessionProgress_TutorComment_NotBlank",
                    "NULLIF(LTRIM(RTRIM([TutorComment])), '') IS NOT NULL");
            });

            builder.HasKey(p => p.BookingId);
            builder.Property(p => p.BookingId).ValueGeneratedNever();
            builder.Property(p => p.Score).HasPrecision(7, 2);
            builder.Property(p => p.MaxScore).HasPrecision(7, 2);
            builder.Property(p => p.GoalProgressPercent).HasPrecision(5, 2).IsRequired();
            builder.Property(p => p.TutorComment).HasMaxLength(2000).IsRequired();

            builder.HasOne(p => p.Booking)
                .WithOne(b => b.SessionProgress)
                .HasForeignKey<SessionProgress>(p => p.BookingId)
                .OnDelete(DeleteBehavior.NoAction);

            builder.HasOne(p => p.LearningGoal)
                .WithMany(g => g.SessionProgresses)
                .HasForeignKey(p => p.LearningGoalId)
                .OnDelete(DeleteBehavior.NoAction);

            builder.HasIndex(p => new { p.LearningGoalId, p.BookingId });
        }
    }
}
