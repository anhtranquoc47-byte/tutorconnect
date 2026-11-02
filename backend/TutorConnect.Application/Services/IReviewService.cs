using TutorConnect.Application.Features.Reviews.DTOs;

namespace TutorConnect.Application.Services
{
    public interface IReviewService
    {
        Task<ReviewResponse> CreateReviewAsync(
            long bookingId,
            ReviewCreateRequest request,
            long currentUserId,
            CancellationToken cancellationToken = default);

        Task<ReceivedReviewsPageResponse> GetMyReceivedReviewsAsync(
            long currentUserId,
            int page,
            int pageSize,
            CancellationToken cancellationToken = default);

        Task<ReceivedReviewsPageResponse> GetUserReceivedReviewsAsync(
            long userId,
            int page,
            int pageSize,
            CancellationToken cancellationToken = default);
    }
}