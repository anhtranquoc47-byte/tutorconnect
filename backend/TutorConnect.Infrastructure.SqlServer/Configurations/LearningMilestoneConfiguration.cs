using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using TutorConnect.Domain.Entities;

namespace TutorConnect.Infrastructure.SqlServer.Configuration
{
    public sealed class LearningMilestoneConfiguration : IEntityTypeConfiguration<LearningMilestone>
    {
        public void Configure(EntityTypeBuilder<LearningMilestone> builder)
        {
            builder.ToTable("LearningMilestones", table =>
            {
                table.HasCheckConstraint("CK_LearningMilestones_OrderNumber", "[OrderNumber] > 0");
                table.HasCheckConstraint("CK_LearningMilestones_Title_NotBlank", "NULLIF(LTRIM(RTRIM([Title])), '') IS NOT NULL");
                table.HasCheckConstraint(
                    "CK_LearningMilestones_Status",
                    "[Status] IN ('NotStarted', 'InProgress', 'Completed', 'Cancelled')");
            });

            builder.HasKey(m => m.Id);
            builder.Property(m => m.Id).ValueGeneratedOnAdd();
            builder.Property(m => m.Title).HasMaxLength(250).IsRequired();
            builder.Property(m => m.Description).HasMaxLength(1000);
            builder.Property(m => m.TargetDate).HasColumnType("date");
            builder.Property(m => m.OrderNumber).IsRequired();
            builder.Property(m => m.Status).HasConversion<string>().HasMaxLength(20).IsRequired();

            builder.HasOne(m => m.LearningGoal)
                .WithMany(g => g.LearningMilestones)
                .HasForeignKey(m => m.LearningGoalId)
                .OnDelete(DeleteBehavior.NoAction);

            builder.HasIndex(m => new { m.LearningGoalId, m.OrderNumber }).IsUnique();
            builder.HasIndex(m => new { m.LearningGoalId, m.Status });
        }
    }
}
