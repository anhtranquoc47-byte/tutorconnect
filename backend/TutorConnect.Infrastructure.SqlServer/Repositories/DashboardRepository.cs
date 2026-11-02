using Microsoft.EntityFrameworkCore;
using TutorConnect.Domain.Enums;
using TutorConnect.Domain.Interfaces;
using TutorConnect.Infrastructure.SqlServer.Persistence;

namespace TutorConnect.Infrastructure.SqlServer.Repositories
{
    public class DashboardRepository : IDashboardRepository
    {
        private readonly ApplicationDbContext _context;

        public DashboardRepository(ApplicationDbContext context)
        {
            _context = context;
        }

        public async Task<BookingStatisticsResult> GetBookingStatisticsAsync(
            DateTime fromUtc,
            DateTime toUtc,
            CancellationToken cancellationToken = default)
        {
            var counts = await _context.Bookings
                .AsNoTracking()
                .Where(b => b.StartTimeUtc >= fromUtc && b.StartTimeUtc < toUtc)
                .GroupBy(b => b.Status)
                .Select(g => new { Status = g.Key, Count = (long)g.Count() })
                .ToListAsync(cancellationToken);

            long CountOf(BookingStatus status) => counts.FirstOrDefault(c => c.Status == status)?.Count ?? 0;

            return new BookingStatisticsResult(
                Total: counts.Sum(c => c.Count),
                Pending: CountOf(BookingStatus.Pending),
                Confirmed: CountOf(BookingStatus.Confirmed),
                Completed: CountOf(BookingStatus.Completed),
                Cancelled: CountOf(BookingStatus.Cancelled),
                Rejected: CountOf(BookingStatus.Rejected));
        }

        public async Task<IReadOnlyList<PopularSubjectResult>> GetPopularSubjectsAsync(
            DateTime fromUtc,
            DateTime toUtc,
            int top,
            CancellationToken cancellationToken = default)
        {
            var raw = await _context.Bookings
            .AsNoTracking()
            .Where(b => b.StartTimeUtc >= fromUtc && b.StartTimeUtc < toUtc)
            .GroupBy(b => new { b.TutorSubject.SubjectId, b.TutorSubject.Subject.Name })
            .Select(g => new
            {
             g.Key.SubjectId,
             g.Key.Name,
             BookingCount = g.Count()
            })
            .OrderByDescending(r => r.BookingCount)
            .Take(top)
            .ToListAsync(cancellationToken);

            return raw
                .Select(r => new PopularSubjectResult(r.SubjectId, r.Name, r.BookingCount))
                .ToList();
        }

        public async Task<GoalCompletionRateResult> GetGoalCompletionRateAsync(CancellationToken cancellationToken = default)
        {
            var eligible = _context.LearningGoals
                .AsNoTracking()
                .Where(g => g.Status != LearningStatus.Cancelled);

            var eligibleCount = await eligible.LongCountAsync(cancellationToken);
            var completedCount = await eligible.LongCountAsync(g => g.Status == LearningStatus.Completed, cancellationToken);

            return new GoalCompletionRateResult(completedCount, eligibleCount);
        }

        public Task<long> CountPendingTutorApprovalsAsync(CancellationToken cancellationToken = default) =>
            _context.TutorProfiles
                .AsNoTracking()
                .LongCountAsync(t => t.ApprovalStatus == TutorApprovalStatus.Pending, cancellationToken);

        public Task<long> CountOpenComplaintsAsync(CancellationToken cancellationToken = default) =>
            _context.Complaints
                .AsNoTracking()
                .LongCountAsync(c => c.Status == ComplaintStatus.Open, cancellationToken);
    }
}
