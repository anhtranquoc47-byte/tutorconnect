using Microsoft.EntityFrameworkCore;
using TutorConnect.Application.Features.Reviews.DTOs;
using TutorConnect.Application.Features.Users.DTOs;
using TutorConnect.Application.Services;
using TutorConnect.Domain.Entities;
using TutorConnect.Domain.Enums;
using TutorConnect.Infrastructure.SqlServer.Persistence;

namespace TutorConnect.Infrastructure.SqlServer.Services
{
    public class ReviewService : IReviewService
    {
        private readonly ApplicationDbContext _context;

        public ReviewService(
            ApplicationDbContext context)
        {
            _context = context;
        }

        public async Task<ReviewResponse> CreateReviewAsync(
            long bookingId,
            ReviewCreateRequest request,
            long currentUserId,
            CancellationToken cancellationToken = default)
        {
            if (request.Rating < 1 ||
                request.Rating > 5)
            {
                throw new InvalidOperationException(
                    "Rating phải nằm trong khoảng từ 1 đến 5.");
            }

            var booking = await _context.Bookings
                .Include(b => b.Student)
                .Include(b => b.TutorSubject)
                    .ThenInclude(ts => ts.Tutor)
                        .ThenInclude(t => t.User)
                .FirstOrDefaultAsync(
                    b => b.Id == bookingId,
                    cancellationToken);

            if (booking == null)
            {
                throw new InvalidOperationException(
                    "Không tìm thấy Booking.");
            }

            if (booking.Status != BookingStatus.Completed)
            {
                throw new InvalidOperationException(
                    "Chỉ có thể đánh giá sau khi buổi học hoàn thành.");
            }

            var tutorUserId =
                booking.TutorSubject.Tutor.UserId;

            var isStudent =
                booking.StudentId == currentUserId;

            var isTutor =
                tutorUserId == currentUserId;

            if (!isStudent && !isTutor)
            {
                throw new InvalidOperationException(
                    "Bạn không thuộc Booking này.");
            }

            var alreadyReviewed = await _context.Reviews
                .AnyAsync(
                    r => r.BookingId == bookingId &&
                         r.ReviewerId == currentUserId,
                    cancellationToken);

            if (alreadyReviewed)
            {
                throw new InvalidOperationException(
                    "Bạn đã đánh giá Booking này rồi.");
            }

            var review = new Review(
                bookingId,
                currentUserId,
                (byte)request.Rating,
                request.Comment);

            _context.Reviews.Add(review);

            await _context.SaveChangesAsync(
                cancellationToken);

            var reviewer = isStudent
                ? booking.Student
                : booking.TutorSubject.Tutor.User;

            return new ReviewResponse(
                review.Id,
                review.BookingId,

                new UserLiteResponse(
                    reviewer.Id,
                    reviewer.FullName,
                    reviewer.Role),

                review.Rating,
                review.Comment,
                booking.StartTimeUtc);
        }

        public async Task<ReceivedReviewsPageResponse>
            GetMyReceivedReviewsAsync(
                long currentUserId,
                int page,
                int pageSize,
                CancellationToken cancellationToken = default)
        {
            return await GetReceivedReviewsAsync(
                currentUserId,
                page,
                pageSize,
                cancellationToken);
        }

        public async Task<ReceivedReviewsPageResponse>
            GetUserReceivedReviewsAsync(
                long userId,
                int page,
                int pageSize,
                CancellationToken cancellationToken = default)
        {
            return await GetReceivedReviewsAsync(
                userId,
                page,
                pageSize,
                cancellationToken);
        }

        private async Task<ReceivedReviewsPageResponse>
            GetReceivedReviewsAsync(
                long userId,
                int page,
                int pageSize,
                CancellationToken cancellationToken)
        {
            if (page < 1)
            {
                page = 1;
            }

            if (pageSize < 1)
            {
                pageSize = 10;
            }

            if (pageSize > 100)
            {
                pageSize = 100;
            }

            var reviewsQuery = _context.Reviews
                .Include(r => r.Reviewer)
                .Include(r => r.Booking)
                    .ThenInclude(b => b.TutorSubject)
                        .ThenInclude(ts => ts.Tutor)
                .Where(r =>
                    r.Booking.StudentId == userId ||
                    r.Booking.TutorSubject.Tutor.UserId == userId);

            // Chỉ lấy review do người khác đánh giá mình,
            // không lấy review mình tự tạo.
            reviewsQuery = reviewsQuery
                .Where(r => r.ReviewerId != userId);

            var totalItems =
                await reviewsQuery.LongCountAsync(
                    cancellationToken);

            var reviews = await reviewsQuery
                .AsNoTracking()
                .OrderByDescending(r => r.Id)
                .Skip((page - 1) * pageSize)
                .Take(pageSize)
                .ToListAsync(cancellationToken);

            var responses = reviews
                .Select(r => new ReviewResponse(
                    r.Id,
                    r.BookingId,

                    new UserLiteResponse(
                        r.Reviewer.Id,
                        r.Reviewer.FullName,
                        r.Reviewer.Role),

                    r.Rating,
                    r.Comment,
                    r.Booking.StartTimeUtc))
                .ToList();

            var allRatings = await reviewsQuery
                .Select(r => (double)r.Rating)
                .ToListAsync(cancellationToken);

            var averageRating =
                allRatings.Count == 0
                    ? 0
                    : allRatings.Average();

            var summary =
                new UserReputationSummaryResponse(
                    averageRating,
                    allRatings.Count,
                    averageRating);

            var totalPages =
                (int)Math.Ceiling(
                    (double)totalItems / pageSize);

            return new ReceivedReviewsPageResponse(
                summary,
                responses,
                page,
                pageSize,
                totalItems,
                totalPages);
        }
    }
}