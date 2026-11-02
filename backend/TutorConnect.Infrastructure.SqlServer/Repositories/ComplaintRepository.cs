using Microsoft.EntityFrameworkCore;
using TutorConnect.Domain.Entities;
using TutorConnect.Domain.Enums;
using TutorConnect.Domain.Interfaces;
using TutorConnect.Infrastructure.SqlServer.Persistence;

namespace TutorConnect.Infrastructure.SqlServer.Repositories
{
    public class ComplaintRepository : IComplaintRepository
    {
        private readonly ApplicationDbContext _context;

        public ComplaintRepository(ApplicationDbContext context)
        {
            _context = context;
        }

        private IQueryable<Complaint> BaseQuery(bool tracking) =>
            (tracking ? _context.Complaints : _context.Complaints.AsNoTracking())
                .Include(c => c.CreatedByUser)
                .Include(c => c.AgainstUser)
                .Include(c => c.ResolvedByAdmin);

        public async Task<Complaint?> GetByIdAsync(long id, CancellationToken cancellationToken = default)
        {
            if (id <= 0)
            {
                return null;
            }

            return await BaseQuery(tracking: true)
                .FirstOrDefaultAsync(c => c.Id == id, cancellationToken);
        }

        public async Task<Complaint?> GetByIdForUserAsync(long id, long userId, CancellationToken cancellationToken = default)
        {
            if (id <= 0 || userId <= 0)
            {
                return null;
            }

            return await BaseQuery(tracking: false)
                .FirstOrDefaultAsync(c => c.Id == id && c.CreatedByUserId == userId, cancellationToken);
        }

        public async Task AddAsync(Complaint complaint, CancellationToken cancellationToken = default)
        {
            if (complaint == null)
            {
                throw new ArgumentNullException(nameof(complaint));
            }

            await _context.Complaints.AddAsync(complaint, cancellationToken);
        }

        public async Task<(IReadOnlyList<Complaint> Items, long TotalItems)> GetPagedForUserAsync(
            long userId,
            int pageNumber,
            int pageSize,
            ComplaintStatus? status,
            CancellationToken cancellationToken = default)
        {
            var query = BaseQuery(tracking: false).Where(c => c.CreatedByUserId == userId);

            if (status.HasValue)
            {
                query = query.Where(c => c.Status == status.Value);
            }

            query = query.OrderByDescending(c => c.SubmittedAtUtc);

            var totalItems = await query.LongCountAsync(cancellationToken);

            var items = await query
                .Skip((pageNumber - 1) * pageSize)
                .Take(pageSize)
                .ToListAsync(cancellationToken);

            return (items, totalItems);
        }

        public async Task<(IReadOnlyList<Complaint> Items, long TotalItems)> GetPagedForAdminAsync(
            int pageNumber,
            int pageSize,
            ComplaintStatus? status,
            string? type,
            CancellationToken cancellationToken = default)
        {
            var query = BaseQuery(tracking: false);

            if (status.HasValue)
            {
                query = query.Where(c => c.Status == status.Value);
            }

            if (!string.IsNullOrWhiteSpace(type))
            {
                query = query.Where(c => c.Type == type);
            }

            query = query.OrderByDescending(c => c.SubmittedAtUtc);

            var totalItems = await query.LongCountAsync(cancellationToken);

            var items = await query
                .Skip((pageNumber - 1) * pageSize)
                .Take(pageSize)
                .ToListAsync(cancellationToken);

            return (items, totalItems);
        }

        public Task SaveChangesAsync(CancellationToken cancellationToken = default) =>
            _context.SaveChangesAsync(cancellationToken);
    }
}
