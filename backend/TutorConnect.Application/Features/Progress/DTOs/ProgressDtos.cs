namespace TutorConnect.Application.Features.Progress.DTOs
{
    public record SessionProgressUpsertRequest(
        long LearningGoalId,
        double? Score,
        double? MaxScore,
        double GoalProgressPercent,
        string TutorComment);

    public record SessionProgressResponse(
        long BookingId,
        long LearningGoalId,
        double? Score,
        double? MaxScore,
        double GoalProgressPercent,
        string TutorComment);

    public record ProgressChartPointResponse(
        long BookingId,
        DateTime SessionStartTimeUtc,
        double? Score,
        double? MaxScore,
        double GoalProgressPercent);

    public record ProgressChartResponse(
        long LearningGoalId,
        IReadOnlyList<ProgressChartPointResponse> Points);
}
