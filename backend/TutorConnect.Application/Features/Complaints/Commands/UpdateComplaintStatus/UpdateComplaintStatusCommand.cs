using MediatR;
using TutorConnect.Application.Features.Complaints.DTOs;
using TutorConnect.Domain.Enums;

namespace TutorConnect.Application.Features.Complaints.Commands.UpdateComplaintStatus
{
    /// <summary>
    /// Admin cập nhật trạng thái và phản hồi cho một khiếu nại.
    /// </summary>
    public class UpdateComplaintStatusCommand : IRequest<ComplaintResponse>
    {
        public long ComplaintId { get; set; }

        public ComplaintStatus Status { get; set; }

        public string? AdminResponse { get; set; }

        public long AdminUserId { get; set; }

        public UpdateComplaintStatusCommand() { }

        public UpdateComplaintStatusCommand(long complaintId, ComplaintAdminUpdateRequest request, long adminUserId)
        {
            ComplaintId = complaintId;
            Status = Enum.TryParse<ComplaintStatus>(request.Status, ignoreCase: true, out var status)
                ? status
                : throw new ArgumentException($"Trạng thái '{request.Status}' không hợp lệ", nameof(request));
            AdminResponse = request.AdminResponse;
            AdminUserId = adminUserId;
        }
    }
}
