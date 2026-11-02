using TutorConnect.Domain.Common;
using TutorConnect.Domain.Enums;

namespace TutorConnect.Domain.Entities
{
    public class TutorProfile
    {
        private TutorProfile()
        {
        }

        internal TutorProfile(User user, short experienceYears = 0)
        {
            User = user ?? throw new ArgumentNullException(nameof(user));
            DomainGuard.InRange(experienceYears, 0, 80, nameof(experienceYears));
            UserId = user.Id;
            ExperienceYears = experienceYears;
            ApprovalStatus = TutorApprovalStatus.Draft;
        }

        public TutorProfile(long userId, short experienceYears = 0)
        {
            DomainGuard.Positive(userId, nameof(userId));
            DomainGuard.InRange(experienceYears, 0, 80, nameof(experienceYears));
            UserId = userId;
            ExperienceYears = experienceYears;
            ApprovalStatus = TutorApprovalStatus.Draft;
        }

        public long UserId { get; private set; }
        public string? Bio { get; private set; }
        public string? Qualification { get; private set; }
        public short ExperienceYears { get; private set; }
        public string? VerificationDocumentUrl { get; private set; }
        public TutorApprovalStatus ApprovalStatus { get; private set; }
        public string? ReviewNote { get; private set; }
        public DateTime? SubmittedAtUtc { get; private set; }
        public long? ReviewedByAdminId { get; private set; }
        public DateTime? ReviewedAtUtc { get; private set; }

        public User User { get; private set; } = null!;
        public User? ReviewedByAdmin { get; private set; }
        public ICollection<TutorSubject> TutorSubjects { get; private set; } = new List<TutorSubject>();
        public ICollection<TutorAvailability> TutorAvailabilities { get; private set; } = new List<TutorAvailability>();

        public void UpdateProfessionalInformation(
            string? bio,
            string? qualification,
            short experienceYears,
            string? verificationDocumentUrl)
        {
            DomainGuard.InRange(experienceYears, 0, 80, nameof(experienceYears));

            var normalizedBio = DomainGuard.Optional(bio, nameof(bio), 1500);
            var normalizedQualification = DomainGuard.Optional(qualification, nameof(qualification), 1000);
            var normalizedVerificationDocumentUrl = DomainGuard.Optional(
                verificationDocumentUrl,
                nameof(verificationDocumentUrl),
                1000);

            var anyChange = Bio != normalizedBio
                || Qualification != normalizedQualification
                || ExperienceYears != experienceYears
                || VerificationDocumentUrl != normalizedVerificationDocumentUrl;

            var reviewSensitiveChange = Qualification != normalizedQualification
                || ExperienceYears != experienceYears
                || VerificationDocumentUrl != normalizedVerificationDocumentUrl;

            Bio = normalizedBio;
            Qualification = normalizedQualification;
            ExperienceYears = experienceYears;
            VerificationDocumentUrl = normalizedVerificationDocumentUrl;

            if (reviewSensitiveChange
                || (ApprovalStatus == TutorApprovalStatus.Rejected && anyChange))
            {
                RequireReapproval();
            }
        }

        public void RequireReapproval()
        {
            if (ApprovalStatus is TutorApprovalStatus.Draft or TutorApprovalStatus.Suspended)
            {
                return;
            }

            ApprovalStatus = TutorApprovalStatus.Draft;
            ReviewNote = null;
            SubmittedAtUtc = null;
            ReviewedByAdminId = null;
            ReviewedAtUtc = null;
        }

        public void Submit(DateTime submittedAtUtc)
        {
            if (ApprovalStatus != TutorApprovalStatus.Draft)
            {
                throw new InvalidOperationException("Only a Draft tutor profile can be submitted.");
            }

            ApprovalStatus = TutorApprovalStatus.Pending;
            SubmittedAtUtc = submittedAtUtc;
            ReviewNote = null;
            ReviewedByAdminId = null;
            ReviewedAtUtc = null;
        }

        public void Approve(long adminId, DateTime reviewedAtUtc, string? reviewNote = null)
        {
            if (ApprovalStatus is not (TutorApprovalStatus.Pending or TutorApprovalStatus.Suspended))
            {
                throw new InvalidOperationException(
                    "Only a Pending or Suspended tutor profile can be approved.");
            }

            EnsureSubmitted(reviewedAtUtc);
            DomainGuard.Positive(adminId, nameof(adminId));

            ApprovalStatus = TutorApprovalStatus.Approved;
            ReviewNote = DomainGuard.Optional(reviewNote, nameof(reviewNote), 1000);
            ReviewedByAdminId = adminId;
            ReviewedAtUtc = reviewedAtUtc;
        }

        public void Reject(long adminId, string reviewNote, DateTime reviewedAtUtc)
        {
            if (ApprovalStatus != TutorApprovalStatus.Pending)
            {
                throw new InvalidOperationException("Only a Pending tutor profile can be rejected.");
            }

            CompleteNegativeReview(TutorApprovalStatus.Rejected, adminId, reviewNote, reviewedAtUtc);
        }

        public void Suspend(long adminId, string reviewNote, DateTime reviewedAtUtc)
        {
            if (ApprovalStatus != TutorApprovalStatus.Approved)
            {
                throw new InvalidOperationException("Only an Approved tutor profile can be suspended.");
            }

            CompleteNegativeReview(TutorApprovalStatus.Suspended, adminId, reviewNote, reviewedAtUtc);
        }

        private void CompleteNegativeReview(
            TutorApprovalStatus status,
            long adminId,
            string reviewNote,
            DateTime reviewedAtUtc)
        {
            EnsureSubmitted(reviewedAtUtc);
            DomainGuard.Positive(adminId, nameof(adminId));

            ApprovalStatus = status;
            ReviewNote = DomainGuard.Required(reviewNote, nameof(reviewNote), 1000);
            ReviewedByAdminId = adminId;
            ReviewedAtUtc = reviewedAtUtc;
        }

        private void EnsureSubmitted(DateTime reviewedAtUtc)
        {
            if (SubmittedAtUtc is null)
            {
                throw new InvalidOperationException("The tutor profile must be submitted before it can be reviewed.");
            }

            if (reviewedAtUtc < SubmittedAtUtc.Value)
            {
                throw new ArgumentException("ReviewedAtUtc cannot be earlier than SubmittedAtUtc.", nameof(reviewedAtUtc));
            }
        }
    }
}
