using MediatR;
using TutorConnect.Application.Common.Models;
using TutorConnect.Application.Features.Complaints.DTOs;
using TutorConnect.Domain.Interfaces;

namespace TutorConnect.Application.Features.Complaints.Queries.GetMyComplaints
{
    public class GetMyComplaintsQueryHandler : IRequestHandler<GetMyComplaintsQuery, PaginationResponse<ComplaintResponse>>
    {
        private readonly IComplaintRepository _complaintRepository;

        public GetMyComplaintsQueryHandler(IComplaintRepository complaintRepository)
        {
            _complaintRepository = complaintRepository;
        }

        public async Task<PaginationResponse<ComplaintResponse>> Handle(
            GetMyComplaintsQuery request,
            CancellationToken cancellationToken)
        {
            var (items, totalItems) = await _complaintRepository.GetPagedForUserAsync(
                request.UserId,
                request.PageNumber,
                request.PageSize,
                request.Status,
                cancellationToken);

            var responses = items.Select(c => c.ToResponse()).ToList();

            return new PaginationResponse<ComplaintResponse>(
                responses,
                totalItems,
                request.PageNumber,
                request.PageSize);
        }
    }
}
