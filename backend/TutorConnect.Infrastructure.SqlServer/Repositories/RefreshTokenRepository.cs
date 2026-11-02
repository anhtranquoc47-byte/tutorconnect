using Microsoft.EntityFrameworkCore;
using TutorConnect.Domain.Entities;
using TutorConnect.Domain.Interfaces;
using TutorConnect.Infrastructure.SqlServer.Persistence;

namespace TutorConnect.Infrastructure.SqlServer.Repositories
{
    public class RefreshTokenRepository : IRefreshTokenRepository
    {
        private readonly ApplicationDbContext _context;

        public RefreshTokenRepository(ApplicationDbContext context)
        {
            _context = context;
        }

        public async Task<RefreshToken?> GetByTokenHashAsync(string tokenHash, CancellationToken cancellationToken = default)
        {
            if (string.IsNullOrWhiteSpace(tokenHash))
            {
                return null;
            }

            return await _context.RefreshTokens
                .FirstOrDefaultAsync(rt => rt.TokenHash == tokenHash, cancellationToken);
        }

        public async Task AddAsync(RefreshToken refreshToken, CancellationToken cancellationToken = default)
        {
            if (refreshToken == null)
            {
                throw new ArgumentNullException(nameof(refreshToken));
            }

            await _context.RefreshTokens.AddAsync(refreshToken, cancellationToken);
        }

        public async Task UpdateAsync(RefreshToken refreshToken, CancellationToken cancellationToken = default)
        {
            if (refreshToken == null)
            {
                throw new ArgumentNullException(nameof(refreshToken));
            }

            _context.RefreshTokens.Update(refreshToken);
            await Task.CompletedTask;
        }

        public async Task SaveChangesAsync(CancellationToken cancellationToken = default)
        {
            await _context.SaveChangesAsync(cancellationToken);
        }
    }
}
