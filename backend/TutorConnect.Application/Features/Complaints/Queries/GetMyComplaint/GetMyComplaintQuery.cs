using MediatR;
using TutorConnect.Application.Features.Complaints.DTOs;

namespace TutorConnect.Application.Features.Complaints.Queries.GetMyComplaint
{
    /// <summary>
    /// Xem chi tiết một khiếu nại do chính người dùng hiện tại tạo.
    /// </summary>
    public class GetMyComplaintQuery : IRequest<ComplaintResponse>
    {
        public long ComplaintId { get; set; }

        public long UserId { get; set; }

        public GetMyComplaintQuery() { }

        public GetMyComplaintQuery(long complaintId, long userId)
        {
            ComplaintId = complaintId;
            UserId = userId;
        }
    }
}
