namespace TutorConnect.Application.Features.Dashboard.DTOs
{
    public record DashboardPeriodResponse(
        DateTime FromUtc,
        DateTime ToUtc);

    public record BookingStatisticsResponse(
        long Total,
        long Pending,
        long Confirmed,
        long Completed,
        long Cancelled,
        long Rejected);

    public record PopularSubjectResponse(
        long SubjectId,
        string SubjectName,
        long BookingCount);

    public record DashboardPeriodMetricsResponse(
        BookingStatisticsResponse BookingStatistics,
        IReadOnlyList<PopularSubjectResponse> PopularSubjects);

    public record GoalCompletionRateResponse(
        long CompletedGoals,
        long EligibleGoals,
        double RatePercent);

    public record DashboardCurrentSnapshotResponse(
        GoalCompletionRateResponse GoalCompletionRate,
        long PendingTutorApprovals,
        long OpenComplaints);

    public record DashboardOverviewResponse(
        DashboardPeriodResponse Period,
        DashboardPeriodMetricsResponse PeriodMetrics,
        DashboardCurrentSnapshotResponse CurrentSnapshot);
}
