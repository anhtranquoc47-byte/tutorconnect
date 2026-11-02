using TutorConnect.Application.Features.Subjects.DTOs;
using TutorConnect.Domain.Enums;

namespace TutorConnect.Application.Features.Tutors.DTOs
{
    public record TutorProfileUpdateRequest(
        string Bio,
        string Qualification,
        int ExperienceYears,
        string? VerificationDocumentUrl);

    public record TutorApprovalUpdateRequest(
        string Status,
        string? ReviewNote);

    public record TutorSubjectCreateRequest(
        long SubjectId,
        string TeachingLevel,
        int FeePerSessionCredits);

    public record TutorSubjectUpdateRequest(
        int FeePerSessionCredits);

    public record TutorSubjectStatusRequest(
        bool IsActive);

    public record TutorSubjectResponse(
        long Id,
        long TutorId,
        SubjectResponse Subject,
        string TeachingLevel,
        int FeePerSessionCredits,
        bool IsActive);

    public record TutorSubjectSummaryResponse(
        long Id,
        SubjectResponse Subject,
        string TeachingLevel,
        int FeePerSessionCredits,
        bool IsActive);

    public record TutorPublicProfileResponse(
        long UserId,
        string FullName,
        string? Bio,
        string? Qualification,
        int ExperienceYears,
        double AverageRating,
        int ReviewCount,
        double ReputationScore,
        IReadOnlyList<TutorSubjectSummaryResponse> Subjects);

    public record TutorOwnerProfileResponse(
        long UserId,
        string FullName,
        string? Bio,
        string? Qualification,
        int ExperienceYears,
        double AverageRating,
        int ReviewCount,
        double ReputationScore,
        IReadOnlyList<TutorSubjectSummaryResponse> Subjects,
        string? Phone,
        string? VerificationDocumentUrl,
        TutorApprovalStatus ApprovalStatus,
        string? ReviewNote,
        DateTime? SubmittedAtUtc,
        DateTime? ReviewedAtUtc);

    public record TutorAdminProfileResponse(
        long UserId,
        string FullName,
        string? Bio,
        string? Qualification,
        int ExperienceYears,
        double AverageRating,
        int ReviewCount,
        double ReputationScore,
        IReadOnlyList<TutorSubjectSummaryResponse> Subjects,
        string? Phone,
        string? VerificationDocumentUrl,
        TutorApprovalStatus ApprovalStatus,
        string? ReviewNote,
        DateTime? SubmittedAtUtc,
        DateTime? ReviewedAtUtc,
        string Email,
        UserStatus UserStatus,
        long? ReviewedByAdminId);
}
