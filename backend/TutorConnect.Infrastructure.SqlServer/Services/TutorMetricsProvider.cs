using Microsoft.EntityFrameworkCore;
using TutorConnect.Domain.Enums;
using TutorConnect.Infrastructure.SqlServer.Persistence;

namespace TutorConnect.Infrastructure.SqlServer.Services
{
    internal sealed record TutorMetrics(
        double AverageRating,
        int ReviewCount,
        double ReputationScore);

    internal sealed class TutorMetricsProvider
    {
        private readonly ApplicationDbContext _dbContext;

        public TutorMetricsProvider(ApplicationDbContext dbContext)
        {
            _dbContext = dbContext;
        }

        public async Task<IReadOnlyDictionary<long, TutorMetrics>> GetAsync(
            IEnumerable<long> tutorIds,
            CancellationToken cancellationToken = default)
        {
            var ids = tutorIds.Distinct().ToArray();
            if (ids.Length == 0)
            {
                return new Dictionary<long, TutorMetrics>();
            }

            var ratingRows = await _dbContext.Reviews
                .AsNoTracking()
                .Where(r => ids.Contains(r.Booking.TutorSubject.TutorId)
                    && r.Booking.Status == BookingStatus.Completed
                    && r.ReviewerId == r.Booking.StudentId)
                .GroupBy(r => r.Booking.TutorSubject.TutorId)
                .Select(g => new
                {
                    TutorId = g.Key,
                    AverageRating = g.Average(r => (double)r.Rating),
                    ReviewCount = g.Count()
                })
                .ToListAsync(cancellationToken);

            var reliabilityRows = await _dbContext.Bookings
                .AsNoTracking()
                .Where(b => ids.Contains(b.TutorSubject.TutorId)
                    && (b.Status == BookingStatus.Completed
                        || b.Status == BookingStatus.Rejected
                        || (b.Status == BookingStatus.Cancelled
                            && b.CancelledByUserId == b.TutorSubject.TutorId)))
                .GroupBy(b => b.TutorSubject.TutorId)
                .Select(g => new
                {
                    TutorId = g.Key,
                    CompletedCount = g.Count(b => b.Status == BookingStatus.Completed),
                    NegativeCount = g.Count(b => b.Status == BookingStatus.Rejected
                        || (b.Status == BookingStatus.Cancelled
                            && b.CancelledByUserId == b.TutorSubject.TutorId))
                })
                .ToListAsync(cancellationToken);

            var ratingByTutor = ratingRows.ToDictionary(x => x.TutorId);
            var reliabilityByTutor = reliabilityRows.ToDictionary(x => x.TutorId);
            var result = new Dictionary<long, TutorMetrics>(ids.Length);

            foreach (var tutorId in ids)
            {
                var averageRating = ratingByTutor.TryGetValue(tutorId, out var rating)
                    ? rating.AverageRating
                    : 0d;
                var reviewCount = rating?.ReviewCount ?? 0;

                var ratingScore = reviewCount == 0
                    ? 50d
                    : averageRating / 5d * 100d;

                var reliabilityScore = 50d;
                if (reliabilityByTutor.TryGetValue(tutorId, out var reliability))
                {
                    var total = reliability.CompletedCount + reliability.NegativeCount;
                    if (total > 0)
                    {
                        reliabilityScore = (double)reliability.CompletedCount / total * 100d;
                    }
                }

                var reputationScore = Math.Round((ratingScore + reliabilityScore) / 2d, 2);
                result[tutorId] = new TutorMetrics(
                    Math.Round(averageRating, 2),
                    reviewCount,
                    reputationScore);
            }

            return result;
        }
    }
}
