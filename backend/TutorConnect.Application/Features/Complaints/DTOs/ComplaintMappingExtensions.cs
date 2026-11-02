using TutorConnect.Application.Features.Users.DTOs;
using TutorConnect.Domain.Entities;

namespace TutorConnect.Application.Features.Complaints.DTOs
{
    public static class ComplaintMappingExtensions
    {
        public static ComplaintResponse ToResponse(this Complaint complaint)
        {
            return new ComplaintResponse(
                complaint.Id,
                new UserLiteResponse(complaint.CreatedByUser.Id, complaint.CreatedByUser.FullName, complaint.CreatedByUser.Role),
                new UserLiteResponse(complaint.AgainstUser.Id, complaint.AgainstUser.FullName, complaint.AgainstUser.Role),
                complaint.BookingId,
                complaint.Type,
                complaint.Description,
                complaint.EvidenceUrl,
                complaint.Status,
                complaint.AdminResponse,
                complaint.ResolvedByAdmin is null
                    ? null
                    : new UserLiteResponse(complaint.ResolvedByAdmin.Id, complaint.ResolvedByAdmin.FullName, complaint.ResolvedByAdmin.Role),
                complaint.SubmittedAtUtc,
                complaint.ResolvedAtUtc);
        }
    }
}
