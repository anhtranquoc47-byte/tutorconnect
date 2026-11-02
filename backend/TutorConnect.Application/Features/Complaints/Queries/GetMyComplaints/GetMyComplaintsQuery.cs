using MediatR;
using TutorConnect.Application.Common.Models;
using TutorConnect.Application.Features.Complaints.DTOs;
using TutorConnect.Domain.Enums;

namespace TutorConnect.Application.Features.Complaints.Queries.GetMyComplaints
{
    /// <summary>
    /// Danh sách khiếu nại do người dùng hiện tại tạo (Student/Tutor).
    /// </summary>
    public class GetMyComplaintsQuery : IRequest<PaginationResponse<ComplaintResponse>>
    {
        public long UserId { get; set; }

        public int PageNumber { get; set; } = 1;

        public int PageSize { get; set; } = 20;

        public ComplaintStatus? Status { get; set; }
    }
}
