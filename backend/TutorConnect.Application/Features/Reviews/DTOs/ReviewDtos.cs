using TutorConnect.Application.Features.Users.DTOs;

namespace TutorConnect.Application.Features.Reviews.DTOs
{
    public record ReviewCreateRequest(
        int Rating,
        string? Comment);

    public record ReviewResponse(
        long Id,
        long BookingId,
        UserLiteResponse Reviewer,
        int Rating,
        string? Comment,
        DateTime SessionStartTimeUtc);

    public record UserReputationSummaryResponse(
        double AverageRating,
        int ReviewCount,
        double ReputationScore);

    public record ReceivedReviewsPageResponse(
        UserReputationSummaryResponse Summary,
        IReadOnlyList<ReviewResponse> Items,
        int PageNumber,
        int PageSize,
        long TotalItems,
        int TotalPages);
}
