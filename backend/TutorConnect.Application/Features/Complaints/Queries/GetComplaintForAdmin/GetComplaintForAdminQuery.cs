using MediatR;
using TutorConnect.Application.Features.Complaints.DTOs;

namespace TutorConnect.Application.Features.Complaints.Queries.GetComplaintForAdmin
{
    /// <summary>
    /// Xem chi tiết khiếu nại cho Admin (không giới hạn theo chủ sở hữu).
    /// </summary>
    public class GetComplaintForAdminQuery : IRequest<ComplaintResponse>
    {
        public long ComplaintId { get; set; }

        public GetComplaintForAdminQuery() { }

        public GetComplaintForAdminQuery(long complaintId)
        {
            ComplaintId = complaintId;
        }
    }
}
