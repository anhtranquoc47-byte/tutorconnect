using Microsoft.EntityFrameworkCore;
using TutorConnect.Domain.Entities;

namespace TutorConnect.Infrastructure.SqlServer.Persistence
{
    public sealed class ApplicationDbContext : DbContext
    {
        public ApplicationDbContext(DbContextOptions<ApplicationDbContext> options)
            : base(options)
        {
        }

        public DbSet<User> Users => Set<User>();
        public DbSet<RefreshToken> RefreshTokens => Set<RefreshToken>();
        public DbSet<PasswordResetToken> PasswordResetTokens => Set<PasswordResetToken>();

        public DbSet<TutorProfile> TutorProfiles => Set<TutorProfile>();
        public DbSet<Subject> Subjects => Set<Subject>();
        public DbSet<TutorSubject> TutorSubjects => Set<TutorSubject>();
        public DbSet<TutorAvailability> TutorAvailabilities => Set<TutorAvailability>();
        public DbSet<Booking> Bookings => Set<Booking>();
        public DbSet<RescheduleRequest> RescheduleRequests => Set<RescheduleRequest>();
        public DbSet<LearningGoal> LearningGoals => Set<LearningGoal>();
        public DbSet<LearningMilestone> LearningMilestones => Set<LearningMilestone>();
        public DbSet<SessionProgress> SessionProgress => Set<SessionProgress>();
        public DbSet<Review> Reviews => Set<Review>();
        public DbSet<Complaint> Complaints => Set<Complaint>();
                public DbSet<ChatConversation> ChatConversations => Set<ChatConversation>();
        public DbSet<ChatMessage> ChatMessages => Set<ChatMessage>();

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);
            modelBuilder.ApplyConfigurationsFromAssembly(typeof(ApplicationDbContext).Assembly);
        }
    }
}
