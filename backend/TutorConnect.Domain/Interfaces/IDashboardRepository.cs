using TutorConnect.Domain.Enums;

namespace TutorConnect.Domain.Interfaces
{
    public sealed record BookingStatisticsResult(
        long Total,
        long Pending,
        long Confirmed,
        long Completed,
        long Cancelled,
        long Rejected);

    public sealed record PopularSubjectResult(
        long SubjectId,
        string SubjectName,
        long BookingCount);

    public sealed record GoalCompletionRateResult(
        long CompletedGoals,
        long EligibleGoals);

    /// <summary>
    /// Tổng hợp các chỉ số dashboard cho Admin.
    /// </summary>
    public interface IDashboardRepository
    {
        Task<BookingStatisticsResult> GetBookingStatisticsAsync(
            DateTime fromUtc,
            DateTime toUtc,
            CancellationToken cancellationToken = default);

        Task<IReadOnlyList<PopularSubjectResult>> GetPopularSubjectsAsync(
            DateTime fromUtc,
            DateTime toUtc,
            int top,
            CancellationToken cancellationToken = default);

        Task<GoalCompletionRateResult> GetGoalCompletionRateAsync(CancellationToken cancellationToken = default);

        Task<long> CountPendingTutorApprovalsAsync(CancellationToken cancellationToken = default);

        Task<long> CountOpenComplaintsAsync(CancellationToken cancellationToken = default);
    }
}
