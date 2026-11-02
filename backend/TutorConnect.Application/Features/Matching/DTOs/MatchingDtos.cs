using TutorConnect.Application.Features.Availability.DTOs;

namespace TutorConnect.Application.Features.Matching.DTOs
{
    public record TutorSearchRequest(
        long SubjectId,
        string TeachingLevel,
        DateTime? StartTimeUtc = null,
        DateTime? EndTimeUtc = null);
    public record TutorSearchItemResponse(
        long TutorId,
        string FullName,
        string? Bio,
        string? Qualification,
        int ExperienceYears,
        long SubjectId,
        string SubjectName,
        string TeachingLevel,
        int FeePerSessionCredits,
        double AverageRating,
        int ReviewCount,
        double MatchingScore,
        AvailableWindowResponse? MatchedAvailability,
        double ReputationScore);
}
