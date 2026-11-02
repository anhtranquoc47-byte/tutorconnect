using MediatR;
using TutorConnect.Application.Common.Models;
using TutorConnect.Application.Features.Users.DTOs;
using TutorConnect.Domain.Enums;

namespace TutorConnect.Application.Features.Users.Queries.GetUsers
{
    /// <summary>
    /// Truy vấn danh sách người dùng có phân trang, dành cho Admin.
    /// </summary>
    public class GetUsersQuery : IRequest<PaginationResponse<UserProfileResponse>>
    {
        public int PageNumber { get; set; } = 1;

        public int PageSize { get; set; } = 20;

        /// <summary>
        /// Lọc theo vai trò; null nghĩa là lấy tất cả vai trò.
        /// </summary>
        public UserRole? Role { get; set; }

        /// <summary>
        /// Lọc theo trạng thái tài khoản; null nghĩa là lấy tất cả trạng thái.
        /// </summary>
        public UserStatus? Status { get; set; }

        /// <summary>
        /// Tìm kiếm theo email hoặc họ tên (chứa chuỗi, không phân biệt hoa thường).
        /// </summary>
        public string? Search { get; set; }
    }
}
