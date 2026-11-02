using System;
using TutorConnect.Domain.Enums;
using TutorConnect.Application.Features.Progress.DTOs;

namespace TutorConnect.Application.Features.Bookings.DTOs
{
    public record BookingCreateRequest(
        long TutorSubjectId,
        DateTime StartTimeUtc,
        DateTime EndTimeUtc,
        int CreditCost,
        string? StudentNote
    );

    public record BookingResponse(
        long Id,
        long StudentId,
        long TutorSubjectId,
        DateTime StartTimeUtc,
        DateTime EndTimeUtc,
        int CreditCost,
        BookingStatus Status,
        string? StudentNote,
        string? MeetingUrl,
        string? StatusReason,
        long? CancelledByUserId,
        string? SubjectName = null,
        string? TutorName = null,
        string? StudentName = null,
        string? TutorComment = null,
        double? GoalProgressPercent = null,
        double? Score = null,
        int? StudentRating = null,
        string? StudentReviewComment = null
    );

    public record CancelBookingRequest(
        string Reason
    );

    public record RejectBookingRequest(
        string Reason
    );

    public record UpdateMeetingUrlRequest(
        string MeetingUrl
    );

    // Dùng đúng cấu trúc của SessionProgress trong project
    public record CompleteBookingRequest(
        long LearningGoalId,
        double? Score,
        double? MaxScore,
        double GoalProgressPercent,
        string TutorComment
    );

    // Các DTO này đang được SessionService của project sử dụng
    public record BookingMinimal(
        long Id,
        long StudentId,
        long TutorSubjectId,
        DateTime StartTimeUtc,
        DateTime EndTimeUtc,
        int CreditCost,
        BookingStatus Status,
        string? MeetingUrl
    );

    public record CompleteBookingResult(
        BookingMinimal Booking,
        SessionProgressResponse SessionProgress
    );
}