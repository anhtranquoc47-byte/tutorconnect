using MediatR;
using TutorConnect.Application.Common.Exceptions;
using TutorConnect.Application.Features.Complaints.DTOs;
using TutorConnect.Domain.Entities;
using TutorConnect.Domain.Interfaces;

namespace TutorConnect.Application.Features.Complaints.Commands.CreateComplaint
{
    public class CreateComplaintCommandHandler : IRequestHandler<CreateComplaintCommand, ComplaintResponse>
    {
        private readonly IComplaintRepository _complaintRepository;
        private readonly IUserRepository _userRepository;

        public CreateComplaintCommandHandler(
            IComplaintRepository complaintRepository,
            IUserRepository userRepository)
        {
            _complaintRepository = complaintRepository;
            _userRepository = userRepository;
        }

        public async Task<ComplaintResponse> Handle(CreateComplaintCommand request, CancellationToken cancellationToken)
        {
            var againstUser = await _userRepository.GetByIdAsync(request.AgainstUserId, cancellationToken)
                ?? throw new NotFoundException("Không tìm thấy người dùng bị khiếu nại");

            var complaint = new Complaint(
                request.CreatedByUserId,
                request.AgainstUserId,
                request.Type,
                request.Description,
                DateTime.UtcNow,
                request.BookingId,
                request.EvidenceUrl);

            await _complaintRepository.AddAsync(complaint, cancellationToken);
            await _complaintRepository.SaveChangesAsync(cancellationToken);

            var saved = await _complaintRepository.GetByIdAsync(complaint.Id, cancellationToken)
                ?? throw new NotFoundException("Không tìm thấy khiếu nại vừa tạo");

            return saved.ToResponse();
        }
    }
}
