using MediatR;
using TutorConnect.Application.Common.Models;
using TutorConnect.Application.Features.Complaints.DTOs;
using TutorConnect.Domain.Interfaces;

namespace TutorConnect.Application.Features.Complaints.Queries.GetComplaintsForAdmin
{
    public class GetComplaintsForAdminQueryHandler : IRequestHandler<GetComplaintsForAdminQuery, PaginationResponse<ComplaintResponse>>
    {
        private readonly IComplaintRepository _complaintRepository;

        public GetComplaintsForAdminQueryHandler(IComplaintRepository complaintRepository)
        {
            _complaintRepository = complaintRepository;
        }

        public async Task<PaginationResponse<ComplaintResponse>> Handle(
            GetComplaintsForAdminQuery request,
            CancellationToken cancellationToken)
        {
            var (items, totalItems) = await _complaintRepository.GetPagedForAdminAsync(
                request.PageNumber,
                request.PageSize,
                request.Status,
                request.Type,
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
