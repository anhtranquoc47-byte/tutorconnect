using Microsoft.EntityFrameworkCore;
using TutorConnect.Domain.Entities;
using TutorConnect.Domain.Enums;
using TutorConnect.Domain.Interfaces;
using TutorConnect.Infrastructure.SqlServer.Persistence;

namespace TutorConnect.Infrastructure.SqlServer.Repositories
{
    public class UserRepository : IUserRepository
    {
        private readonly ApplicationDbContext _context;

        public UserRepository(ApplicationDbContext context)
        {
            _context = context;
        }

        public async Task<User?> GetByEmailAsync(string email, CancellationToken cancellationToken = default)
        {
            if (string.IsNullOrWhiteSpace(email))
            {
                return null;
            }

            return await _context.Users
                .AsNoTracking()
                .FirstOrDefaultAsync(u => u.Email == email.ToLowerInvariant(), cancellationToken);
        }

        public async Task<User?> GetByIdAsync(long id, CancellationToken cancellationToken = default)
        {
            if (id <= 0)
            {
                return null;
            }

            // Include RefreshTokens: User.UpdatePassword() duyệt qua collection này
            // để revoke các session cũ khi reset mật khẩu. Nếu không Include, collection
            // luôn rỗng khi load từ DB và các refresh token cũ vẫn hoạt động sau khi
            // đổi mật khẩu.
            return await _context.Users
                .Include(u => u.RefreshTokens)
                .FirstOrDefaultAsync(u => u.Id == id, cancellationToken);
        }

        public async Task AddAsync(User user, CancellationToken cancellationToken = default)
        {
            if (user == null)
            {
                throw new ArgumentNullException(nameof(user));
            }

            await _context.Users.AddAsync(user, cancellationToken);
        }

        public async Task UpdateAsync(User user, CancellationToken cancellationToken = default)
        {
            if (user == null)
            {
                throw new ArgumentNullException(nameof(user));
            }

            _context.Users.Update(user);
            await Task.CompletedTask;
        }

        public async Task<(IReadOnlyList<User> Items, long TotalItems)> GetPagedAsync(
           int pageNumber,
           int pageSize,
           UserRole? role,
           UserStatus? status,
           string? search,
           CancellationToken cancellationToken = default)
        {
            var query = _context.Users.AsNoTracking().AsQueryable();

            if (role.HasValue)
            {
                query = query.Where(u => u.Role == role.Value);
            }

            if (status.HasValue)
            {
                query = query.Where(u => u.Status == status.Value);
            }

            if (!string.IsNullOrWhiteSpace(search))
            {
                var pattern = $"%{search.Trim()}%";
                query = query.Where(u =>
                    EF.Functions.Like(u.Email, pattern) ||
                    EF.Functions.Like(u.FullName, pattern));
            }

            var totalItems = await query.LongCountAsync(cancellationToken);

            var items = await query
                .OrderByDescending(u => u.Id)
                .Skip((pageNumber - 1) * pageSize)
                .Take(pageSize)
                .ToListAsync(cancellationToken);

            return (items, totalItems);
        }

        public async Task<bool> ExistsByEmailAsync(string email, CancellationToken cancellationToken = default)
        {
            if (string.IsNullOrWhiteSpace(email))
            {
                return false;
            }

            return await _context.Users
                .AnyAsync(u => u.Email == email.ToLowerInvariant(), cancellationToken);
        }

        public async Task SaveChangesAsync(CancellationToken cancellationToken = default)
        {
            await _context.SaveChangesAsync(cancellationToken);
        }
    }
}
