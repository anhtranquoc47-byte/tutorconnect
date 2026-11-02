using System.Threading;
using System.Threading.Tasks;
using TutorConnect.Domain.Entities;

namespace TutorConnect.Domain.Interfaces
{
    public interface ISessionProgressRepository
    {
        Task<SessionProgress?> GetByBookingIdAsync(long bookingId, CancellationToken cancellationToken = default);
        Task AddAsync(SessionProgress progress, CancellationToken cancellationToken = default);
        Task UpdateAsync(SessionProgress progress, CancellationToken cancellationToken = default);
        Task SaveChangesAsync(CancellationToken cancellationToken = default);
    }
}
