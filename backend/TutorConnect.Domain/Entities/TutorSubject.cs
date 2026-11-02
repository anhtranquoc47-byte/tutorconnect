using TutorConnect.Domain.Common;

namespace TutorConnect.Domain.Entities
{
    public class TutorSubject : BaseEntity
    {
        private TutorSubject()
        {
        }

        public TutorSubject(
            long tutorId,
            long subjectId,
            string teachingLevel,
            int feePerSessionCredits)
        {
            DomainGuard.Positive(tutorId, nameof(tutorId));
            DomainGuard.Positive(subjectId, nameof(subjectId));
            DomainGuard.Positive(feePerSessionCredits, nameof(feePerSessionCredits));
            TutorId = tutorId;
            SubjectId = subjectId;
            TeachingLevel = DomainGuard.Required(teachingLevel, nameof(teachingLevel), 100);
            FeePerSessionCredits = feePerSessionCredits;
            IsActive = true;
        }

        public long TutorId { get; private set; }
        public long SubjectId { get; private set; }
        public string TeachingLevel { get; private set; } = string.Empty;
        public int FeePerSessionCredits { get; private set; }
        public bool IsActive { get; private set; }

        public TutorProfile Tutor { get; private set; } = null!;
        public Subject Subject { get; private set; } = null!;
        public ICollection<Booking> Bookings { get; private set; } = new List<Booking>();
        public ICollection<LearningGoal> LearningGoals { get; private set; } = new List<LearningGoal>();

        public void UpdateFee(int feePerSessionCredits)
        {
            DomainGuard.Positive(feePerSessionCredits, nameof(feePerSessionCredits));
            FeePerSessionCredits = feePerSessionCredits;
        }

        public void Activate()
        {
            IsActive = true;
        }

        public void Deactivate()
        {
            IsActive = false;
        }
    }
}
