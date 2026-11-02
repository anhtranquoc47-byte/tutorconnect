using TutorConnect.Domain.Common;
using TutorConnect.Domain.Enums;

namespace TutorConnect.Domain.Entities
{
    public class RescheduleRequest : BaseEntity
    {
        private RescheduleRequest()
        {
        }

        public RescheduleRequest(
            long bookingId,
            long requestedByUserId,
            DateTime originalStartTimeUtc,
            DateTime originalEndTimeUtc,
            DateTime proposedStartTimeUtc,
            DateTime proposedEndTimeUtc,
            DateTime requestedAtUtc,
            string? reason = null)
        {
            DomainGuard.Positive(bookingId, nameof(bookingId));
            DomainGuard.Positive(requestedByUserId, nameof(requestedByUserId));
            DomainGuard.Period(originalStartTimeUtc, originalEndTimeUtc);
            DomainGuard.Period(proposedStartTimeUtc, proposedEndTimeUtc);

            BookingId = bookingId;
            RequestedByUserId = requestedByUserId;
            OriginalStartTimeUtc = originalStartTimeUtc;
            OriginalEndTimeUtc = originalEndTimeUtc;
            ProposedStartTimeUtc = proposedStartTimeUtc;
            ProposedEndTimeUtc = proposedEndTimeUtc;
            Reason = DomainGuard.Optional(reason, nameof(reason), 1000);
            Status = RescheduleRequestStatus.Pending;
            RequestedAtUtc = requestedAtUtc;
        }

        public long BookingId { get; private set; }
        public long RequestedByUserId { get; private set; }
        public DateTime OriginalStartTimeUtc { get; private set; }
        public DateTime OriginalEndTimeUtc { get; private set; }
        public DateTime ProposedStartTimeUtc { get; private set; }
        public DateTime ProposedEndTimeUtc { get; private set; }
        public string? Reason { get; private set; }
        public RescheduleRequestStatus Status { get; private set; }
        public long? RespondedByUserId { get; private set; }
        public string? ResponseNote { get; private set; }
        public DateTime RequestedAtUtc { get; private set; }

        public Booking Booking { get; private set; } = null!;
        public User RequestedByUser { get; private set; } = null!;
        public User? RespondedByUser { get; private set; }

        public void Accept(long respondedByUserId, string? responseNote = null)
        {
            Respond(RescheduleRequestStatus.Accepted, respondedByUserId, responseNote);
        }

        public void Reject(long respondedByUserId, string? responseNote = null)
        {
            Respond(RescheduleRequestStatus.Rejected, respondedByUserId, responseNote);
        }

        public void Cancel()
        {
            EnsurePending();
            Status = RescheduleRequestStatus.Cancelled;
            RespondedByUserId = null;
            ResponseNote = null;
        }

        private void Respond(
            RescheduleRequestStatus status,
            long respondedByUserId,
            string? responseNote)
        {
            EnsurePending();
            DomainGuard.Positive(respondedByUserId, nameof(respondedByUserId));

            if (respondedByUserId == RequestedByUserId)
            {
                throw new ArgumentException(
                    "The responder must be different from the requester.",
                    nameof(respondedByUserId));
            }

            Status = status;
            RespondedByUserId = respondedByUserId;
            ResponseNote = DomainGuard.Optional(responseNote, nameof(responseNote), 1000);
        }

        private void EnsurePending()
        {
            if (Status != RescheduleRequestStatus.Pending)
            {
                throw new InvalidOperationException("Only a Pending reschedule request can be processed.");
            }
        }
    }
}
