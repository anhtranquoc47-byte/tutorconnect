using Microsoft.EntityFrameworkCore;
using TutorConnect.Domain.Entities;
using TutorConnect.Domain.Interfaces;
using TutorConnect.Infrastructure.SqlServer.Persistence;
using System.Threading;
using System.Threading.Tasks;

namespace TutorConnect.Infrastructure.SqlServer.Repositories
{
    internal class SessionProgressRepository : ISessionProgressRepository
    {
        private readonly ApplicationDbContext _dbContext;

        public SessionProgressRepository(ApplicationDbContext dbContext)
        {
            _dbContext = dbContext;
        }

        public async Task<SessionProgress?> GetByBookingIdAsync(long bookingId, CancellationToken cancellationToken = default)
        {
            return await _dbContext.Set<SessionProgress>()
                .AsNoTracking()
                .FirstOrDefaultAsync(s => s.BookingId == bookingId, cancellationToken);
        }

        public async Task AddAsync(SessionProgress progress, CancellationToken cancellationToken = default)
        {
            await _dbContext.Set<SessionProgress>().AddAsync(progress, cancellationToken);
        }

        public Task UpdateAsync(SessionProgress progress, CancellationToken cancellationToken = default)
        {
            _dbContext.Set<SessionProgress>().Update(progress);
            return Task.CompletedTask;
        }

        public async Task SaveChangesAsync(CancellationToken cancellationToken = default)
        {
            await _dbContext.SaveChangesAsync(cancellationToken);
        }
    }
}
