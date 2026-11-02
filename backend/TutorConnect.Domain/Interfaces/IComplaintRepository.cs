using TutorConnect.Domain.Entities;
using TutorConnect.Domain.Enums;

namespace TutorConnect.Domain.Interfaces
{
    /// <summary>
    /// Repository cho Complaint entity.
    /// </summary>
    public interface IComplaintRepository
    {
        Task<Complaint?> GetByIdAsync(long id, CancellationToken cancellationToken = default);

        /// <summary>
        /// Lấy khiếu nại theo id, chỉ trả về nếu do user này tạo (dùng cho endpoint tự-quản của user).
        /// </summary>
        Task<Complaint?> GetByIdForUserAsync(long id, long userId, CancellationToken cancellationToken = default);

        Task AddAsync(Complaint complaint, CancellationToken cancellationToken = default);

        Task<(IReadOnlyList<Complaint> Items, long TotalItems)> GetPagedForUserAsync(
            long userId,
            int pageNumber,
            int pageSize,
            ComplaintStatus? status,
            CancellationToken cancellationToken = default);

        Task<(IReadOnlyList<Complaint> Items, long TotalItems)> GetPagedForAdminAsync(
            int pageNumber,
            int pageSize,
            ComplaintStatus? status,
            string? type,
            CancellationToken cancellationToken = default);

        Task SaveChangesAsync(CancellationToken cancellationToken = default);
    }
}
