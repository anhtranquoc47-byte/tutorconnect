using TutorConnect.Domain.Entities;

namespace TutorConnect.Domain.Interfaces
{
    /// <summary>
    /// Repository cho RefreshToken entity.
    /// </summary>
    public interface IRefreshTokenRepository
    {
        Task<RefreshToken?> GetByTokenHashAsync(string tokenHash, CancellationToken cancellationToken = default);

        Task AddAsync(RefreshToken refreshToken, CancellationToken cancellationToken = default);

        Task UpdateAsync(RefreshToken refreshToken, CancellationToken cancellationToken = default);

        Task SaveChangesAsync(CancellationToken cancellationToken = default);
    }
}
