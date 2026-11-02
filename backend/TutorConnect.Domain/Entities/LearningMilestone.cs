using TutorConnect.Domain.Common;
using TutorConnect.Domain.Enums;

namespace TutorConnect.Domain.Entities
{
    public class LearningMilestone : BaseEntity
    {
        private LearningMilestone()
        {
        }

        public LearningMilestone(
            long learningGoalId,
            string title,
            short orderNumber,
            string? description = null,
            DateOnly? targetDate = null)
        {
            DomainGuard.Positive(learningGoalId, nameof(learningGoalId));
            DomainGuard.Positive(orderNumber, nameof(orderNumber));
            LearningGoalId = learningGoalId;
            Title = DomainGuard.Required(title, nameof(title), 250);
            Description = DomainGuard.Optional(description, nameof(description), 1000);
            TargetDate = targetDate;
            OrderNumber = orderNumber;
            Status = LearningStatus.NotStarted;
        }

        public long LearningGoalId { get; private set; }
        public string Title { get; private set; } = string.Empty;
        public string? Description { get; private set; }
        public DateOnly? TargetDate { get; private set; }
        public short OrderNumber { get; private set; }
        public LearningStatus Status { get; private set; }

        public LearningGoal LearningGoal { get; private set; } = null!;

        public void Update(string title, string? description, DateOnly? targetDate)
        {
            Title = DomainGuard.Required(title, nameof(title), 250);
            Description = DomainGuard.Optional(description, nameof(description), 1000);
            TargetDate = targetDate;
        }

        public void ChangeOrder(short orderNumber)
        {
            DomainGuard.Positive(orderNumber, nameof(orderNumber));
            OrderNumber = orderNumber;
        }

        public void ChangeStatus(LearningStatus status)
        {
            DomainGuard.DefinedEnum(status, nameof(status));
            Status = status;
        }
    }
}
