using MediatR;
using TutorConnect.Application.Common.Exceptions;
using TutorConnect.Application.Features.Complaints.DTOs;
using TutorConnect.Domain.Interfaces;

namespace TutorConnect.Application.Features.Complaints.Queries.GetComplaintForAdmin
{
    public class GetComplaintForAdminQueryHandler : IRequestHandler<GetComplaintForAdminQuery, ComplaintResponse>
    {
        private readonly IComplaintRepository _complaintRepository;

        public GetComplaintForAdminQueryHandler(IComplaintRepository complaintRepository)
        {
            _complaintRepository = complaintRepository;
        }

        public async Task<ComplaintResponse> Handle(GetComplaintForAdminQuery request, CancellationToken cancellationToken)
        {
            var complaint = await _complaintRepository.GetByIdAsync(request.ComplaintId, cancellationToken)
                ?? throw new NotFoundException("Không tìm thấy khiếu nại");

            return complaint.ToResponse();
        }
    }
}
