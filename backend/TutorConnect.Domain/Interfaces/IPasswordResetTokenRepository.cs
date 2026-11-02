using TutorConnect.Domain.Entities;

namespace TutorConnect.Domain.Interfaces
{
    /// <summary>
    /// Repository cho PasswordResetToken entity.
    /// </summary>
    public interface IPasswordResetTokenRepository
    {
        Task<PasswordResetToken?> GetByTokenAsync(string rawToken, CancellationToken cancellationToken = default);

        Task<PasswordResetToken?> GetLatestByUserIdAsync(long userId, CancellationToken cancellationToken = default);

        Task AddAsync(PasswordResetToken token, CancellationToken cancellationToken = default);

        Task UpdateAsync(PasswordResetToken token, CancellationToken cancellationToken = default);

        Task SaveChangesAsync(CancellationToken cancellationToken = default);
    }
}
