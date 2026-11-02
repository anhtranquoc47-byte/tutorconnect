using TutorConnect.Application.Features.Subjects.DTOs;
using TutorConnect.Application.Features.Users.DTOs;
using TutorConnect.Domain.Enums;

namespace TutorConnect.Application.Features.LearningGoals.DTOs
{
    public record LearningGoalCreateRequest(
        long StudentId,
        long TutorSubjectId,
        string Title,
        string? Description,
        DateOnly? TargetDate);

    public record LearningGoalUpdateRequest(
        string Title,
        string? Description,
        DateOnly? TargetDate);

    public record MilestoneCreateRequest(
        string Title,
        string? Description,
        DateOnly? TargetDate,
        int OrderNumber);

    public record MilestoneUpdateRequest(
        string Title,
        string? Description,
        DateOnly? TargetDate,
        int OrderNumber);

    public record MilestoneStatusRequest(
        LearningStatus Status);

    public record LearningMilestoneResponse(
        long Id,
        long LearningGoalId,
        string Title,
        string? Description,
        DateOnly? TargetDate,
        int OrderNumber,
        LearningStatus Status);

    public record LearningGoalResponse(
        long Id,
        UserLiteResponse Student,
        long TutorSubjectId,
        UserLiteResponse? Tutor,
        SubjectResponse Subject,
        string Title,
        string? Description,
        DateOnly? TargetDate,
        LearningStatus Status,
        double? CurrentProgressPercent,
        IReadOnlyList<LearningMilestoneResponse> Milestones);
}
