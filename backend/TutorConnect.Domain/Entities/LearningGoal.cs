using TutorConnect.Domain.Common;
using TutorConnect.Domain.Enums;

namespace TutorConnect.Domain.Entities
{
    public class LearningGoal : BaseEntity
    {
        private LearningGoal()
        {
        }

        public LearningGoal(
            long studentId,
            long tutorSubjectId,
            string title,
            string? description = null,
            DateOnly? targetDate = null)
        {
            DomainGuard.Positive(studentId, nameof(studentId));
            DomainGuard.Positive(tutorSubjectId, nameof(tutorSubjectId));
            StudentId = studentId;
            TutorSubjectId = tutorSubjectId;
            Title = DomainGuard.Required(title, nameof(title), 250);
            Description = DomainGuard.Optional(description, nameof(description), 1500);
            TargetDate = targetDate;
            Status = LearningStatus.NotStarted;
        }

        public long StudentId { get; private set; }
        public long TutorSubjectId { get; private set; }
        public string Title { get; private set; } = string.Empty;
        public string? Description { get; private set; }
        public DateOnly? TargetDate { get; private set; }
        public LearningStatus Status { get; private set; }

        public User Student { get; private set; } = null!;
        public TutorSubject TutorSubject { get; private set; } = null!;
        public ICollection<LearningMilestone> LearningMilestones { get; private set; } = new List<LearningMilestone>();
        public ICollection<SessionProgress> SessionProgresses { get; private set; } = new List<SessionProgress>();

        public void Update(string title, string? description, DateOnly? targetDate)
        {
            Title = DomainGuard.Required(title, nameof(title), 250);
            Description = DomainGuard.Optional(description, nameof(description), 1500);
            TargetDate = targetDate;
        }

        public void SynchronizeStatus(decimal goalProgressPercent)
        {
            DomainGuard.Percentage(goalProgressPercent, nameof(goalProgressPercent));

            if (Status == LearningStatus.Cancelled)
            {
                return;
            }

            Status = goalProgressPercent switch
            {
                0 => LearningStatus.NotStarted,
                100 => LearningStatus.Completed,
                _ => LearningStatus.InProgress
            };
        }

        public void Cancel()
        {
            Status = LearningStatus.Cancelled;
        }
    }
}
