using TutorConnect.Domain.Common;

namespace TutorConnect.Domain.Entities
{
    public class SessionProgress
    {
        private SessionProgress()
        {
        }

        public SessionProgress(
            long bookingId,
            long learningGoalId,
            decimal? score,
            decimal? maxScore,
            decimal goalProgressPercent,
            string tutorComment)
        {
            DomainGuard.Positive(bookingId, nameof(bookingId));
            DomainGuard.Positive(learningGoalId, nameof(learningGoalId));
            BookingId = bookingId;
            LearningGoalId = learningGoalId;
            SetResult(score, maxScore, goalProgressPercent, tutorComment);
        }

        public long BookingId { get; private set; }
        public long LearningGoalId { get; private set; }
        public decimal? Score { get; private set; }
        public decimal? MaxScore { get; private set; }
        public decimal GoalProgressPercent { get; private set; }
        public string TutorComment { get; private set; } = string.Empty;

        public Booking Booking { get; private set; } = null!;
        public LearningGoal LearningGoal { get; private set; } = null!;

        public void UpdateResult(
            decimal? score,
            decimal? maxScore,
            decimal goalProgressPercent,
            string tutorComment)
        {
            SetResult(score, maxScore, goalProgressPercent, tutorComment);
        }

        private void SetResult(
            decimal? score,
            decimal? maxScore,
            decimal goalProgressPercent,
            string tutorComment)
        {
            DomainGuard.Score(score, maxScore);
            DomainGuard.Percentage(goalProgressPercent, nameof(goalProgressPercent));

            Score = score;
            MaxScore = maxScore;
            GoalProgressPercent = goalProgressPercent;
            TutorComment = DomainGuard.Required(tutorComment, nameof(tutorComment), 2000);
        }
    }
}
