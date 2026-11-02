using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using TutorConnect.Domain.Entities;

namespace TutorConnect.Infrastructure.SqlServer.Configuration
{
    public sealed class TutorAvailabilityConfiguration : IEntityTypeConfiguration<TutorAvailability>
    {
        public void Configure(EntityTypeBuilder<TutorAvailability> builder)
        {
            builder.ToTable("TutorAvailabilities", table =>
            {
                table.HasCheckConstraint("CK_TutorAvailabilities_DayOfWeek", "[DayOfWeek] BETWEEN 0 AND 6");
                table.HasCheckConstraint("CK_TutorAvailabilities_Time", "[EndTime] > [StartTime]");
            });

            builder.HasKey(a => a.Id);
            builder.Property(a => a.Id).ValueGeneratedOnAdd();
            builder.Property(a => a.DayOfWeek).HasConversion<int>().IsRequired();
            builder.Property(a => a.StartTime).HasColumnType("time(0)").IsRequired();
            builder.Property(a => a.EndTime).HasColumnType("time(0)").IsRequired();
            builder.Property(a => a.IsActive).IsRequired();

            builder.HasOne(a => a.Tutor)
                .WithMany(t => t.TutorAvailabilities)
                .HasForeignKey(a => a.TutorId)
                .OnDelete(DeleteBehavior.NoAction);

            builder.HasIndex(a => new { a.TutorId, a.DayOfWeek, a.StartTime, a.EndTime }).IsUnique();
            builder.HasIndex(a => new { a.TutorId, a.IsActive, a.DayOfWeek });
        }
    }
}
