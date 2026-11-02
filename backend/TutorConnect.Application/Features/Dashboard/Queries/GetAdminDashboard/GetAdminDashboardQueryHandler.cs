using MediatR;
using TutorConnect.Application.Features.Dashboard.DTOs;
using TutorConnect.Domain.Interfaces;

namespace TutorConnect.Application.Features.Dashboard.Queries.GetAdminDashboard
{
    public class GetAdminDashboardQueryHandler : IRequestHandler<GetAdminDashboardQuery, DashboardOverviewResponse>
    {
        private const int PopularSubjectsTop = 5;

        private readonly IDashboardRepository _dashboardRepository;

        public GetAdminDashboardQueryHandler(IDashboardRepository dashboardRepository)
        {
            _dashboardRepository = dashboardRepository;
        }

        public async Task<DashboardOverviewResponse> Handle(
            GetAdminDashboardQuery request,
            CancellationToken cancellationToken)
        {
            var toUtc = request.ToUtc ?? DateTime.UtcNow;
            var fromUtc = request.FromUtc ?? toUtc.AddDays(-30);

            var bookingStatistics = await _dashboardRepository.GetBookingStatisticsAsync(fromUtc, toUtc, cancellationToken);
            var popularSubjects = await _dashboardRepository.GetPopularSubjectsAsync(fromUtc, toUtc, PopularSubjectsTop, cancellationToken);
            var goalCompletion = await _dashboardRepository.GetGoalCompletionRateAsync(cancellationToken);
            var pendingTutorApprovals = await _dashboardRepository.CountPendingTutorApprovalsAsync(cancellationToken);
            var openComplaints = await _dashboardRepository.CountOpenComplaintsAsync(cancellationToken);

            var goalCompletionRatePercent = goalCompletion.EligibleGoals == 0
                ? 0d
                : Math.Round(goalCompletion.CompletedGoals * 100d / goalCompletion.EligibleGoals, 2);

            return new DashboardOverviewResponse(
                new DashboardPeriodResponse(fromUtc, toUtc),
                new DashboardPeriodMetricsResponse(
                    new BookingStatisticsResponse(
                        bookingStatistics.Total,
                        bookingStatistics.Pending,
                        bookingStatistics.Confirmed,
                        bookingStatistics.Completed,
                        bookingStatistics.Cancelled,
                        bookingStatistics.Rejected),
                    popularSubjects
                        .Select(s => new PopularSubjectResponse(s.SubjectId, s.SubjectName, s.BookingCount))
                        .ToList()),
                new DashboardCurrentSnapshotResponse(
                    new GoalCompletionRateResponse(
                        goalCompletion.CompletedGoals,
                        goalCompletion.EligibleGoals,
                        goalCompletionRatePercent),
                    pendingTutorApprovals,
                    openComplaints));
        }
    }
}
