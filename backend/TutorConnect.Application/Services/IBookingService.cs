using System;
using System.Collections.Generic;
using System.Threading;
using System.Threading.Tasks;
using TutorConnect.Application.Features.Bookings.DTOs;

namespace TutorConnect.Application.Services
{
    public interface IBookingService
    {
        Task<bool> HasScheduleConflictAsync(
            long userId,
            DateTime startTimeUtc,
            DateTime endTimeUtc,
            long? excludeBookingId = null,
            CancellationToken cancellationToken = default);

        Task<BookingResponse> CreateBookingAsync(
            BookingCreateRequest request,
            long studentId,
            CancellationToken cancellationToken = default);

        Task<IEnumerable<BookingResponse>> GetUserBookingsAsync(
            long userId,
            string? status = null,
            CancellationToken cancellationToken = default);

        Task<BookingResponse?> GetBookingByIdAsync(
            long bookingId,
            long userId,
            CancellationToken cancellationToken = default);

        Task<bool> ConfirmBookingAsync(
            long bookingId,
            long tutorUserId,
            string? meetingUrl,
            CancellationToken cancellationToken = default);

        Task<bool> RejectBookingAsync(
            long bookingId,
            long tutorUserId,
            string reason,
            CancellationToken cancellationToken = default);

        Task<bool> CancelBookingAsync(
            long bookingId,
            long userId,
            string reason,
            CancellationToken cancellationToken = default);

        Task<bool> UpdateMeetingUrlAsync(
            long bookingId,
            long tutorUserId,
            string meetingUrl,
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

        Task<bool> CompleteBookingAsync(
            long bookingId,
            long currentUserId,
            CompleteBookingRequest? request,
            CancellationToken cancellationToken = default);
    }
}