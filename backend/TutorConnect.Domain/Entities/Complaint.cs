using TutorConnect.Domain.Common;
using TutorConnect.Domain.Enums;

namespace TutorConnect.Domain.Entities
{
    public class Complaint : BaseEntity
    {
        private Complaint()
        {
        }

        public Complaint(
            long createdByUserId,
            long againstUserId,
            string type,
            string description,
            DateTime submittedAtUtc,
            long? bookingId = null,
            string? evidenceUrl = null)
        {
            DomainGuard.Positive(createdByUserId, nameof(createdByUserId));
            DomainGuard.Positive(againstUserId, nameof(againstUserId));

            if (bookingId.HasValue)
            {
                DomainGuard.Positive(bookingId.Value, nameof(bookingId));
            }

            if (createdByUserId == againstUserId)
            {
                throw new ArgumentException("The complaint creator and target must be different users.");
            }

            CreatedByUserId = createdByUserId;
            AgainstUserId = againstUserId;
            BookingId = bookingId;
            Type = DomainGuard.Required(type, nameof(type), 50);
            Description = DomainGuard.Required(description, nameof(description), 2000);
            EvidenceUrl = DomainGuard.Optional(evidenceUrl, nameof(evidenceUrl), 1000);
            Status = ComplaintStatus.Open;
            SubmittedAtUtc = submittedAtUtc;
        }

        public long CreatedByUserId { get; private set; }
        public long AgainstUserId { get; private set; }
        public long? BookingId { get; private set; }
        public string Type { get; private set; } = string.Empty;
        public string Description { get; private set; } = string.Empty;
        public string? EvidenceUrl { get; private set; }
        public ComplaintStatus Status { get; private set; }
        public string? AdminResponse { get; private set; }
        public long? ResolvedByAdminId { get; private set; }
        public DateTime SubmittedAtUtc { get; private set; }
        public DateTime? ResolvedAtUtc { get; private set; }

        public User CreatedByUser { get; private set; } = null!;
        public User AgainstUser { get; private set; } = null!;
        public Booking? Booking { get; private set; }
        public User? ResolvedByAdmin { get; private set; }

        public void StartReview()
        {
            if (Status != ComplaintStatus.Open)
            {
                throw new InvalidOperationException("Only an Open complaint can move to InReview.");
            }

            Status = ComplaintStatus.InReview;
        }

        public void Resolve(long adminId, string adminResponse, DateTime resolvedAtUtc)
        {
            Complete(ComplaintStatus.Resolved, adminId, adminResponse, resolvedAtUtc);
        }

        public void Reject(long adminId, string adminResponse, DateTime resolvedAtUtc)
        {
            Complete(ComplaintStatus.Rejected, adminId, adminResponse, resolvedAtUtc);
        }

        private void Complete(
            ComplaintStatus status,
            long adminId,
            string adminResponse,
            DateTime resolvedAtUtc)
        {
            if (Status is not (ComplaintStatus.Open or ComplaintStatus.InReview))
            {
                throw new InvalidOperationException("The complaint has already been completed.");
            }

            if (resolvedAtUtc < SubmittedAtUtc)
            {
                throw new ArgumentException(
                    "ResolvedAtUtc cannot be earlier than SubmittedAtUtc.",
                    nameof(resolvedAtUtc));
            }

            DomainGuard.Positive(adminId, nameof(adminId));
            Status = status;
            AdminResponse = DomainGuard.Required(adminResponse, nameof(adminResponse), 2000);
            ResolvedByAdminId = adminId;
            ResolvedAtUtc = resolvedAtUtc;
        }
    }
}
