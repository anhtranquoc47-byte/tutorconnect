using TutorConnect.Domain.Common;
using TutorConnect.Domain.Enums;

namespace TutorConnect.Domain.Entities
{
    public class Booking : BaseEntity
    {
        private Booking()
        {
        }

        public Booking(
            long studentId,
            long tutorSubjectId,
            DateTime startTimeUtc,
            DateTime endTimeUtc,
            int creditCost,
            string? studentNote = null)
        {
            DomainGuard.Positive(studentId, nameof(studentId));
            DomainGuard.Positive(tutorSubjectId, nameof(tutorSubjectId));
            DomainGuard.Period(startTimeUtc, endTimeUtc);
            DomainGuard.Positive(creditCost, nameof(creditCost));

            StudentId = studentId;
            TutorSubjectId = tutorSubjectId;
            StartTimeUtc = startTimeUtc;
            EndTimeUtc = endTimeUtc;
            CreditCost = creditCost;
            Status = BookingStatus.Pending;
            StudentNote = DomainGuard.Optional(studentNote, nameof(studentNote), 1000);
        }

        public long StudentId { get; private set; }
        public long TutorSubjectId { get; private set; }
        public DateTime StartTimeUtc { get; private set; }
        public DateTime EndTimeUtc { get; private set; }
        public int CreditCost { get; private set; }
        public BookingStatus Status { get; private set; }
        public string? StudentNote { get; private set; }
        public string? MeetingUrl { get; private set; }
        public string? StatusReason { get; private set; }
        public long? CancelledByUserId { get; private set; }

        public User Student { get; private set; } = null!;
        public TutorSubject TutorSubject { get; private set; } = null!;
        public User? CancelledByUser { get; private set; }
        public ICollection<RescheduleRequest> RescheduleRequests { get; private set; } = new List<RescheduleRequest>();
        public SessionProgress? SessionProgress { get; private set; }
        public ICollection<Review> Reviews { get; private set; } = new List<Review>();
        public ICollection<Complaint> Complaints { get; private set; } = new List<Complaint>();

        public void Confirm(string? meetingUrl = null)
        {
            EnsureStatus(BookingStatus.Pending);
            Status = BookingStatus.Confirmed;
            MeetingUrl = DomainGuard.Optional(meetingUrl, nameof(meetingUrl), 1000);
            StatusReason = null;
            CancelledByUserId = null;
        }

        public void SetMeetingUrl(string? meetingUrl)
        {
            if (Status is BookingStatus.Rejected or BookingStatus.Cancelled or BookingStatus.Completed)
            {
                throw new InvalidOperationException("Meeting URL cannot be changed for the current booking status.");
            }

            MeetingUrl = DomainGuard.Optional(meetingUrl, nameof(meetingUrl), 1000);
        }

        public void Reject(string reason)
        {
            EnsureStatus(BookingStatus.Pending);
            Status = BookingStatus.Rejected;
            StatusReason = DomainGuard.Required(reason, nameof(reason), 1000);
            CancelledByUserId = null;
        }

        public void Cancel(long cancelledByUserId, string reason)
        {
            if (Status is not (BookingStatus.Pending or BookingStatus.Confirmed))
            {
                throw new InvalidOperationException("Only Pending or Confirmed bookings can be cancelled.");
            }

            DomainGuard.Positive(cancelledByUserId, nameof(cancelledByUserId));
            Status = BookingStatus.Cancelled;
            CancelledByUserId = cancelledByUserId;
            StatusReason = DomainGuard.Required(reason, nameof(reason), 1000);
        }

        public void Complete()
        {
            EnsureStatus(BookingStatus.Confirmed);
            Status = BookingStatus.Completed;
            StatusReason = null;
            CancelledByUserId = null;
        }

        public void ChangeSchedule(DateTime startTimeUtc, DateTime endTimeUtc)
        {
            if (Status is not (BookingStatus.Pending or BookingStatus.Confirmed))
            {
                throw new InvalidOperationException("Only Pending or Confirmed bookings can be rescheduled.");
            }

            DomainGuard.Period(startTimeUtc, endTimeUtc);
            StartTimeUtc = startTimeUtc;
            EndTimeUtc = endTimeUtc;
        }

        private void EnsureStatus(BookingStatus expectedStatus)
        {
            if (Status != expectedStatus)
            {
                throw new InvalidOperationException(
                    $"Booking must be {expectedStatus} to perform this operation.");
            }
        }
    }
}
