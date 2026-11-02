using TutorConnect.Domain.Common;

namespace TutorConnect.Domain.Entities
{
    public class Review : BaseEntity
    {
        private Review()
        {
        }

        public Review(long bookingId, long reviewerId, byte rating, string? comment = null)
        {
            DomainGuard.Positive(bookingId, nameof(bookingId));
            DomainGuard.Positive(reviewerId, nameof(reviewerId));
            DomainGuard.Rating(rating, nameof(rating));
            BookingId = bookingId;
            ReviewerId = reviewerId;
            Rating = rating;
            Comment = DomainGuard.Optional(comment, nameof(comment), 1500);
        }

        public long BookingId { get; private set; }
        public long ReviewerId { get; private set; }
        public byte Rating { get; private set; }
        public string? Comment { get; private set; }

        public Booking Booking { get; private set; } = null!;
        public User Reviewer { get; private set; } = null!;
    }
}
