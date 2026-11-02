using MediatR;
using TutorConnect.Application.Common.Exceptions;
using TutorConnect.Application.Features.Complaints.DTOs;
using TutorConnect.Domain.Enums;
using TutorConnect.Domain.Interfaces;

namespace TutorConnect.Application.Features.Complaints.Commands.UpdateComplaintStatus
{
    public class UpdateComplaintStatusCommandHandler : IRequestHandler<UpdateComplaintStatusCommand, ComplaintResponse>
    {
        private readonly IComplaintRepository _complaintRepository;

        public UpdateComplaintStatusCommandHandler(IComplaintRepository complaintRepository)
        {
            _complaintRepository = complaintRepository;
        }

        public async Task<ComplaintResponse> Handle(UpdateComplaintStatusCommand request, CancellationToken cancellationToken)
        {
            var complaint = await _complaintRepository.GetByIdAsync(request.ComplaintId, cancellationToken)
                ?? throw new NotFoundException("Không tìm thấy khiếu nại");

            switch (request.Status)
            {
                case ComplaintStatus.InReview:
                    complaint.StartReview();
                    break;
                case ComplaintStatus.Resolved:
                    RequireAdminResponse(request.AdminResponse);
                    complaint.Resolve(request.AdminUserId, request.AdminResponse!, DateTime.UtcNow);
                    break;
                case ComplaintStatus.Rejected:
                    RequireAdminResponse(request.AdminResponse);
                    complaint.Reject(request.AdminUserId, request.AdminResponse!, DateTime.UtcNow);
                    break;
                default:
                    throw new InvalidOperationException($"Không thể chuyển khiếu nại sang trạng thái '{request.Status}'");
            }

            await _complaintRepository.SaveChangesAsync(cancellationToken);

            return complaint.ToResponse();
        }

        private static void RequireAdminResponse(string? adminResponse)
        {
            if (string.IsNullOrWhiteSpace(adminResponse))
            {
                throw new ArgumentException("AdminResponse là bắt buộc khi Resolve hoặc Reject khiếu nại");
            }
        }
    }
}
