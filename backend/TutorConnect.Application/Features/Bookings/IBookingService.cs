using TutorConnect.Application.Features.Bookings.DTOs;

namespace TutorConnect.Application.Features.Bookings
{
    public interface IBookingService
    {
        Task<bool> HasScheduleConflictAsync(
            long userId,
            DateTime startTimeUtc,
            DateTime endTimeUtc,
            long? excludeBookingId = null,
            CancellationToken cancellationToken = default);

        Task<RescheduleResponse> CreateRescheduleRequestAsync(
            long bookingId,
            long currentUserId,
            RescheduleCreateRequest request,
            CancellationToken cancellationToken = default);

        Task<RescheduleResponse> RespondToRescheduleAsync(
            long bookingId,
            long proposalId,
            long currentUserId,
            RescheduleStatusUpdateRequest request,
            CancellationToken cancellationToken = default);
    }
}