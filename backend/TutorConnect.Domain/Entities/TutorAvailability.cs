using TutorConnect.Domain.Common;

namespace TutorConnect.Domain.Entities
{
    public class TutorAvailability : BaseEntity
    {
        private TutorAvailability()
        {
        }

        public TutorAvailability(
            long tutorId,
            DayOfWeek dayOfWeek,
            TimeOnly startTime,
            TimeOnly endTime)
        {
            DomainGuard.Positive(tutorId, nameof(tutorId));
            DomainGuard.DefinedEnum(dayOfWeek, nameof(dayOfWeek));
            DomainGuard.Period(startTime, endTime);

            TutorId = tutorId;
            DayOfWeek = dayOfWeek;
            StartTime = startTime;
            EndTime = endTime;
            IsActive = true;
        }

        public long TutorId { get; private set; }
        public DayOfWeek DayOfWeek { get; private set; }
        public TimeOnly StartTime { get; private set; }
        public TimeOnly EndTime { get; private set; }
        public bool IsActive { get; private set; }

        public TutorProfile Tutor { get; private set; } = null!;

        public void ChangePeriod(DayOfWeek dayOfWeek, TimeOnly startTime, TimeOnly endTime)
        {
            DomainGuard.DefinedEnum(dayOfWeek, nameof(dayOfWeek));
            DomainGuard.Period(startTime, endTime);

            DayOfWeek = dayOfWeek;
            StartTime = startTime;
            EndTime = endTime;
        }

        public void Activate() => IsActive = true;

        public void Deactivate() => IsActive = false;
    }
}
