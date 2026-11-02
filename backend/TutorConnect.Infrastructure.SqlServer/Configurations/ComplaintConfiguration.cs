using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using TutorConnect.Domain.Entities;

namespace TutorConnect.Infrastructure.SqlServer.Configuration
{
    public sealed class ComplaintConfiguration : IEntityTypeConfiguration<Complaint>
    {
        public void Configure(EntityTypeBuilder<Complaint> builder)
        {
            builder.ToTable("Complaints", table =>
            {
                table.HasCheckConstraint("CK_Complaints_Type_NotBlank", "NULLIF(LTRIM(RTRIM([Type])), '') IS NOT NULL");
                table.HasCheckConstraint("CK_Complaints_Description_NotBlank", "NULLIF(LTRIM(RTRIM([Description])), '') IS NOT NULL");
                table.HasCheckConstraint(
                    "CK_Complaints_DifferentUsers",
                    "[CreatedByUserId] <> [AgainstUserId]");
                table.HasCheckConstraint(
                    "CK_Complaints_Status",
                    "[Status] IN ('Open', 'InReview', 'Resolved', 'Rejected')");
                table.HasCheckConstraint(
                    "CK_Complaints_ResolutionFields",
                    "([Status] IN ('Open', 'InReview') AND [AdminResponse] IS NULL AND [ResolvedByAdminId] IS NULL AND [ResolvedAtUtc] IS NULL) OR " +
                    "([Status] IN ('Resolved', 'Rejected') AND NULLIF(LTRIM(RTRIM([AdminResponse])), '') IS NOT NULL AND [ResolvedByAdminId] IS NOT NULL AND [ResolvedAtUtc] IS NOT NULL)");
                table.HasCheckConstraint(
                    "CK_Complaints_ResolutionChronology",
                    "[ResolvedAtUtc] IS NULL OR [ResolvedAtUtc] >= [SubmittedAtUtc]");
            });

            builder.HasKey(c => c.Id);
            builder.Property(c => c.Id).ValueGeneratedOnAdd();
            builder.Property(c => c.Type).HasMaxLength(50).IsRequired();
            builder.Property(c => c.Description).HasMaxLength(2000).IsRequired();
            builder.Property(c => c.EvidenceUrl).HasMaxLength(1000);
            builder.Property(c => c.Status).HasConversion<string>().HasMaxLength(20).IsRequired();
            builder.Property(c => c.AdminResponse).HasMaxLength(2000);
            builder.Property(c => c.SubmittedAtUtc).HasColumnType("datetime2(0)").IsRequired();
            builder.Property(c => c.ResolvedAtUtc).HasColumnType("datetime2(0)");

            builder.HasOne(c => c.CreatedByUser)
                .WithMany(u => u.CreatedComplaints)
                .HasForeignKey(c => c.CreatedByUserId)
                .OnDelete(DeleteBehavior.NoAction);

            builder.HasOne(c => c.AgainstUser)
                .WithMany(u => u.ComplaintsAgainstUser)
                .HasForeignKey(c => c.AgainstUserId)
                .OnDelete(DeleteBehavior.NoAction);

            builder.HasOne(c => c.Booking)
                .WithMany(b => b.Complaints)
                .HasForeignKey(c => c.BookingId)
                .OnDelete(DeleteBehavior.NoAction);

            builder.HasOne(c => c.ResolvedByAdmin)
                .WithMany(u => u.ResolvedComplaints)
                .HasForeignKey(c => c.ResolvedByAdminId)
                .OnDelete(DeleteBehavior.NoAction);

            builder.HasIndex(c => new { c.Status, c.SubmittedAtUtc });
            builder.HasIndex(c => new { c.CreatedByUserId, c.SubmittedAtUtc });
            builder.HasIndex(c => new { c.AgainstUserId, c.SubmittedAtUtc });
            builder.HasIndex(c => c.BookingId).HasFilter("[BookingId] IS NOT NULL");
            builder.HasIndex(c => c.ResolvedByAdminId).HasFilter("[ResolvedByAdminId] IS NOT NULL");
        }
    }
}
