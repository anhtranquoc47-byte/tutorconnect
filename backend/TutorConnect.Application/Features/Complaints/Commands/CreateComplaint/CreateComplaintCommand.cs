using MediatR;
using TutorConnect.Application.Features.Complaints.DTOs;

namespace TutorConnect.Application.Features.Complaints.Commands.CreateComplaint
{
    /// <summary>
    /// Student/Tutor tạo khiếu nại mới.
    /// </summary>
    public class CreateComplaintCommand : IRequest<ComplaintResponse>
    {
        public long CreatedByUserId { get; set; }

        public long AgainstUserId { get; set; }

        public long? BookingId { get; set; }

        public string Type { get; set; } = string.Empty;

        public string Description { get; set; } = string.Empty;

        public string? EvidenceUrl { get; set; }

        public CreateComplaintCommand() { }

        public CreateComplaintCommand(long createdByUserId, ComplaintCreateRequest request)
        {
            CreatedByUserId = createdByUserId;
            AgainstUserId = request.AgainstUserId;
            BookingId = request.BookingId;
            Type = request.Type;
            Description = request.Description;
            EvidenceUrl = request.EvidenceUrl;
        }
    }
}
