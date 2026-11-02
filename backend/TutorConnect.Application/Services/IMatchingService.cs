using TutorConnect.Application.Features.Matching.DTOs;

namespace TutorConnect.Application.Services
{
    public interface IMatchingService
    {
        Task<IReadOnlyList<TutorSearchItemResponse>> SearchTutorsAsync(
            TutorSearchRequest request,
            long studentId,
            CancellationToken cancellationToken = default);
    }
}
