using TutorConnect.Domain.Entities;
using TutorConnect.Domain.Enums;

namespace TutorConnect.Domain.Interfaces
{
    /// <summary>
    /// Repository cho User entity.
    /// </summary>
    public interface IUserRepository
    {
        Task<User?> GetByEmailAsync(string email, CancellationToken cancellationToken = default);

        Task<User?> GetByIdAsync(long id, CancellationToken cancellationToken = default);

        Task AddAsync(User user, CancellationToken cancellationToken = default);

        Task UpdateAsync(User user, CancellationToken cancellationToken = default);

        Task<bool> ExistsByEmailAsync(string email, CancellationToken cancellationToken = default);

        Task<(IReadOnlyList<User> Items, long TotalItems)> GetPagedAsync(
           int pageNumber,
           int pageSize,
           UserRole? role,
           UserStatus? status,
           string? search,
           CancellationToken cancellationToken = default);


        Task SaveChangesAsync(CancellationToken cancellationToken = default);
    }
}
