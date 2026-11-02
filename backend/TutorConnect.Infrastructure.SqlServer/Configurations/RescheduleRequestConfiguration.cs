using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using TutorConnect.Domain.Entities;

namespace TutorConnect.Infrastructure.SqlServer.Configuration
{
    public sealed class RescheduleRequestConfiguration : IEntityTypeConfiguration<RescheduleRequest>
    {
        public void Configure(EntityTypeBuilder<RescheduleRequest> builder)
        {
            builder.ToTable("RescheduleRequests", table =>
            {
                table.HasCheckConstraint("CK_RescheduleRequests_OriginalTime", "[OriginalEndTimeUtc] > [OriginalStartTimeUtc]");
                table.HasCheckConstraint("CK_RescheduleRequests_ProposedTime", "[ProposedEndTimeUtc] > [ProposedStartTimeUtc]");
                table.HasCheckConstraint(
                    "CK_RescheduleRequests_Status",
                    "[Status] IN ('Pending', 'Accepted', 'Rejected', 'Cancelled')");
                table.HasCheckConstraint(
                    "CK_RescheduleRequests_DifferentUsers",
                    "[RespondedByUserId] IS NULL OR [RespondedByUserId] <> [RequestedByUserId]");
                table.HasCheckConstraint(
                    "CK_RescheduleRequests_StatusFields",
                    "([Status] = 'Pending' AND [RespondedByUserId] IS NULL AND [ResponseNote] IS NULL) OR " +
                    "([Status] IN ('Accepted', 'Rejected') AND [RespondedByUserId] IS NOT NULL) OR " +
                    "([Status] = 'Cancelled' AND [RespondedByUserId] IS NULL AND [ResponseNote] IS NULL)");
            });

            builder.HasKey(r => r.Id);
            builder.Property(r => r.Id).ValueGeneratedOnAdd();
            builder.Property(r => r.OriginalStartTimeUtc).HasColumnType("datetime2(0)").IsRequired();
            builder.Property(r => r.OriginalEndTimeUtc).HasColumnType("datetime2(0)").IsRequired();
            builder.Property(r => r.ProposedStartTimeUtc).HasColumnType("datetime2(0)").IsRequired();
            builder.Property(r => r.ProposedEndTimeUtc).HasColumnType("datetime2(0)").IsRequired();
            builder.Property(r => r.Reason).HasMaxLength(1000);
            builder.Property(r => r.Status).HasConversion<string>().HasMaxLength(20).IsRequired();
            builder.Property(r => r.ResponseNote).HasMaxLength(1000);
            builder.Property(r => r.RequestedAtUtc).HasColumnType("datetime2(0)").IsRequired();

            builder.HasOne(r => r.Booking)
                .WithMany(b => b.RescheduleRequests)
                .HasForeignKey(r => r.BookingId)
                .OnDelete(DeleteBehavior.NoAction);

            builder.HasOne(r => r.RequestedByUser)
                .WithMany(u => u.RequestedRescheduleRequests)
                .HasForeignKey(r => r.RequestedByUserId)
                .OnDelete(DeleteBehavior.NoAction);

            builder.HasOne(r => r.RespondedByUser)
                .WithMany(u => u.RespondedRescheduleRequests)
                .HasForeignKey(r => r.RespondedByUserId)
                .OnDelete(DeleteBehavior.NoAction);

            builder.HasIndex(r => r.BookingId)
                .IsUnique()
                .HasFilter("[Status] = 'Pending'");
            builder.HasIndex(r => new { r.BookingId, r.Status, r.RequestedAtUtc });
            builder.HasIndex(r => new { r.RequestedByUserId, r.RequestedAtUtc });
            builder.HasIndex(r => r.RespondedByUserId)
                .HasFilter("[RespondedByUserId] IS NOT NULL");
        }
    }
}
