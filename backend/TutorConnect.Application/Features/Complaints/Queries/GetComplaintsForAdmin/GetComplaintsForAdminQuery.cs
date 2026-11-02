using MediatR;
using TutorConnect.Application.Common.Models;
using TutorConnect.Application.Features.Complaints.DTOs;
using TutorConnect.Domain.Enums;

namespace TutorConnect.Application.Features.Complaints.Queries.GetComplaintsForAdmin
{
    /// <summary>
    /// Danh sách khiếu nại cho Admin, có thể lọc theo trạng thái/loại.
    /// </summary>
    public class GetComplaintsForAdminQuery : IRequest<PaginationResponse<ComplaintResponse>>
    {
        public int PageNumber { get; set; } = 1;

        public int PageSize { get; set; } = 20;

        public ComplaintStatus? Status { get; set; }

        public string? Type { get; set; }
    }
}
