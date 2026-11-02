using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using TutorConnect.Domain.Entities;

namespace TutorConnect.Infrastructure.SqlServer.Configuration
{
    public sealed class BookingConfiguration : IEntityTypeConfiguration<Booking>
    {
        public void Configure(EntityTypeBuilder<Booking> builder)
        {
            builder.ToTable("Bookings", table =>
            {
                table.HasCheckConstraint("CK_Bookings_Time", "[EndTimeUtc] > [StartTimeUtc]");
                table.HasCheckConstraint("CK_Bookings_CreditCost", "[CreditCost] > 0");
                table.HasCheckConstraint(
                    "CK_Bookings_Status",
                    "[Status] IN ('Pending', 'Confirmed', 'Rejected', 'Cancelled', 'Completed')");
                table.HasCheckConstraint(
                    "CK_Bookings_StatusFields",
                    "([Status] = 'Cancelled' AND [CancelledByUserId] IS NOT NULL AND NULLIF(LTRIM(RTRIM([StatusReason])), '') IS NOT NULL) OR " +
                    "([Status] = 'Rejected' AND [CancelledByUserId] IS NULL AND NULLIF(LTRIM(RTRIM([StatusReason])), '') IS NOT NULL) OR " +
                    "([Status] IN ('Pending', 'Confirmed', 'Completed') AND [CancelledByUserId] IS NULL AND [StatusReason] IS NULL)");
            });

            builder.HasKey(b => b.Id);
            builder.Property(b => b.Id).ValueGeneratedOnAdd();
            builder.Property(b => b.StartTimeUtc).HasColumnType("datetime2(0)").IsRequired();
            builder.Property(b => b.EndTimeUtc).HasColumnType("datetime2(0)").IsRequired();
            builder.Property(b => b.CreditCost).IsRequired();
            builder.Property(b => b.Status).HasConversion<string>().HasMaxLength(20).IsRequired();
            builder.Property(b => b.StudentNote).HasMaxLength(1000);
            builder.Property(b => b.MeetingUrl).HasMaxLength(1000);
            builder.Property(b => b.StatusReason).HasMaxLength(1000);

            builder.HasOne(b => b.Student)
                .WithMany(u => u.StudentBookings)
                .HasForeignKey(b => b.StudentId)
                .OnDelete(DeleteBehavior.NoAction);

            builder.HasOne(b => b.TutorSubject)
                .WithMany(ts => ts.Bookings)
                .HasForeignKey(b => b.TutorSubjectId)
                .OnDelete(DeleteBehavior.NoAction);

            builder.HasOne(b => b.CancelledByUser)
                .WithMany(u => u.CancelledBookings)
                .HasForeignKey(b => b.CancelledByUserId)
                .OnDelete(DeleteBehavior.NoAction);

            builder.HasIndex(b => new { b.StudentId, b.Status, b.StartTimeUtc, b.EndTimeUtc });
            builder.HasIndex(b => new { b.TutorSubjectId, b.Status, b.StartTimeUtc, b.EndTimeUtc });
            builder.HasIndex(b => new { b.Status, b.StartTimeUtc });
            builder.HasIndex(b => b.CancelledByUserId)
                .HasFilter("[CancelledByUserId] IS NOT NULL");
        }
    }
}
