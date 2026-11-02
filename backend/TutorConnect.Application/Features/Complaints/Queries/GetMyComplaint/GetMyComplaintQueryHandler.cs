using MediatR;
using TutorConnect.Application.Common.Exceptions;
using TutorConnect.Application.Features.Complaints.DTOs;
using TutorConnect.Domain.Interfaces;

namespace TutorConnect.Application.Features.Complaints.Queries.GetMyComplaint
{
    public class GetMyComplaintQueryHandler : IRequestHandler<GetMyComplaintQuery, ComplaintResponse>
    {
        private readonly IComplaintRepository _complaintRepository;

        public GetMyComplaintQueryHandler(IComplaintRepository complaintRepository)
        {
            _complaintRepository = complaintRepository;
        }

        public async Task<ComplaintResponse> Handle(GetMyComplaintQuery request, CancellationToken cancellationToken)
        {
            var complaint = await _complaintRepository.GetByIdForUserAsync(request.ComplaintId, request.UserId, cancellationToken)
                ?? throw new NotFoundException("Không tìm thấy khiếu nại");

            return complaint.ToResponse();
        }
    }
}
