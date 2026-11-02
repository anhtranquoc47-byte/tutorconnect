using Microsoft.EntityFrameworkCore;
using TutorConnect.Application.Common.Exceptions;
using TutorConnect.Application.Features.Bookings.DTOs;
using TutorConnect.Application.Features.Progress.DTOs;
using TutorConnect.Application.Services;
using TutorConnect.Domain.Entities;
using TutorConnect.Domain.Enums;
using TutorConnect.Infrastructure.SqlServer.Persistence;

namespace TutorConnect.Infrastructure.SqlServer.Services
{
    internal class SessionService : ISessionService
    {
        private readonly ApplicationDbContext _dbContext;

        public SessionService(ApplicationDbContext dbContext)
        {
            _dbContext = dbContext;
        }

        public async Task<CompleteBookingResult> CompleteBookingAsync(
            long bookingId,
            long tutorId,
            SessionProgressUpsertRequest request,
            CancellationToken cancellationToken = default)
        {
            await using var tx = await _dbContext.Database.BeginTransactionAsync(cancellationToken);

            var booking = await _dbContext.Bookings
                .Include(b => b.SessionProgress)
                .Include(b => b.TutorSubject)
                    .ThenInclude(ts => ts.Tutor)
                        .ThenInclude(t => t.User)
                .FirstOrDefaultAsync(b => b.Id == bookingId, cancellationToken);

            if (booking is null)
            {
                throw new NotFoundException("Booking not found.");
            }

            if (booking.TutorSubject.TutorId != tutorId)
            {
                throw new ForbiddenException("Only the Tutor assigned to this booking can complete it.");
            }

            EnsureTutorCanFulfillExistingBooking(booking.TutorSubject.Tutor);

            if (booking.Status != BookingStatus.Confirmed)
            {
                throw new InvalidOperationException("Only Confirmed bookings can be completed.");
            }

            if (DateTime.UtcNow < booking.EndTimeUtc)
            {
                throw new InvalidOperationException("A booking can only be completed after the session has ended.");
            }

            if (booking.SessionProgress is not null)
            {
                throw new InvalidOperationException("SessionProgress already exists for this booking.");
            }

            var learningGoal = await _dbContext.LearningGoals
                .FirstOrDefaultAsync(
                    g => g.Id == request.LearningGoalId
                        && g.StudentId == booking.StudentId
                        && g.TutorSubjectId == booking.TutorSubjectId,
                    cancellationToken);

            if (learningGoal is null)
            {
                throw new NotFoundException(
                    "LearningGoal not found or does not belong to this booking's Student and TutorSubject.");
            }

            var progress = new SessionProgress(
                bookingId,
                request.LearningGoalId,
                (decimal?)request.Score,
                (decimal?)request.MaxScore,
                (decimal)request.GoalProgressPercent,
                request.TutorComment);

            await _dbContext.SessionProgress.AddAsync(progress, cancellationToken);

            booking.Complete();
            learningGoal.SynchronizeStatus((decimal)request.GoalProgressPercent);

            await _dbContext.SaveChangesAsync(cancellationToken);
            await tx.CommitAsync(cancellationToken);

            var bookingMinimal = new BookingMinimal(
                booking.Id,
                booking.StudentId,
                booking.TutorSubjectId,
                booking.StartTimeUtc,
                booking.EndTimeUtc,
                booking.CreditCost,
                booking.Status,
                booking.MeetingUrl);

            return new CompleteBookingResult(
                bookingMinimal,
                new SessionProgressResponse(
                    progress.BookingId,
                    progress.LearningGoalId,
                    (double?)progress.Score,
                    (double?)progress.MaxScore,
                    (double)progress.GoalProgressPercent,
                    progress.TutorComment));
        }

        private static void EnsureTutorCanFulfillExistingBooking(TutorProfile tutorProfile)
        {
            if (tutorProfile.User.Role != UserRole.Tutor
                || tutorProfile.User.Status != UserStatus.Active
                || tutorProfile.ApprovalStatus == TutorApprovalStatus.Suspended)
            {
                throw new ForbiddenException("Tutor cannot perform this action for the existing booking.");
            }
        }
    }
}
