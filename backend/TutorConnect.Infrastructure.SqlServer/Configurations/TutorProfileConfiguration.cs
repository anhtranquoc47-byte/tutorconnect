using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using TutorConnect.Domain.Entities;

namespace TutorConnect.Infrastructure.SqlServer.Configuration
{
    public sealed class TutorProfileConfiguration : IEntityTypeConfiguration<TutorProfile>
    {
        public void Configure(EntityTypeBuilder<TutorProfile> builder)
        {
            builder.ToTable("TutorProfiles", table =>
            {
                table.HasCheckConstraint("CK_TutorProfiles_ExperienceYears", "[ExperienceYears] BETWEEN 0 AND 80");
                table.HasCheckConstraint(
                    "CK_TutorProfiles_ApprovalStatus",
                    "[ApprovalStatus] IN ('Draft', 'Pending', 'Approved', 'Rejected', 'Suspended')");
                table.HasCheckConstraint(
                    "CK_TutorProfiles_ApprovalFields",
                    "([ApprovalStatus] = 'Draft' AND [SubmittedAtUtc] IS NULL AND [ReviewedByAdminId] IS NULL AND [ReviewedAtUtc] IS NULL) OR " +
                    "([ApprovalStatus] = 'Pending' AND [SubmittedAtUtc] IS NOT NULL AND [ReviewedByAdminId] IS NULL AND [ReviewedAtUtc] IS NULL) OR " +
                    "([ApprovalStatus] = 'Approved' AND [SubmittedAtUtc] IS NOT NULL AND [ReviewedByAdminId] IS NOT NULL AND [ReviewedAtUtc] IS NOT NULL) OR " +
                    "([ApprovalStatus] IN ('Rejected', 'Suspended') AND [SubmittedAtUtc] IS NOT NULL AND [ReviewedByAdminId] IS NOT NULL AND [ReviewedAtUtc] IS NOT NULL AND NULLIF(LTRIM(RTRIM([ReviewNote])), '') IS NOT NULL)");
                table.HasCheckConstraint(
                    "CK_TutorProfiles_ReviewChronology",
                    "[ReviewedAtUtc] IS NULL OR ([SubmittedAtUtc] IS NOT NULL AND [ReviewedAtUtc] >= [SubmittedAtUtc])");
            });

            builder.HasKey(p => p.UserId);
            builder.Property(p => p.UserId).ValueGeneratedNever();
            builder.Property(p => p.Bio).HasMaxLength(1500);
            builder.Property(p => p.Qualification).HasMaxLength(1000);
            builder.Property(p => p.ExperienceYears).IsRequired();
            builder.Property(p => p.VerificationDocumentUrl).HasMaxLength(1000);
            builder.Property(p => p.ApprovalStatus)
                .HasConversion<string>()
                .HasMaxLength(20)
                .IsRequired();
            builder.Property(p => p.ReviewNote).HasMaxLength(1000);
            builder.Property(p => p.SubmittedAtUtc).HasColumnType("datetime2(0)");
            builder.Property(p => p.ReviewedAtUtc).HasColumnType("datetime2(0)");

            builder.HasOne(p => p.User)
                .WithOne(u => u.TutorProfile)
                .HasForeignKey<TutorProfile>(p => p.UserId)
                .OnDelete(DeleteBehavior.NoAction);

            builder.HasOne(p => p.ReviewedByAdmin)
                .WithMany(u => u.ReviewedTutorProfiles)
                .HasForeignKey(p => p.ReviewedByAdminId)
                .OnDelete(DeleteBehavior.NoAction);

            builder.HasIndex(p => p.ApprovalStatus);
            builder.HasIndex(p => p.ReviewedByAdminId)
                .HasFilter("[ReviewedByAdminId] IS NOT NULL");
        }
    }
}
