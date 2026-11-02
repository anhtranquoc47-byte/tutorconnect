using TutorConnect.Application.Features.Users.DTOs;
using TutorConnect.Domain.Enums;

namespace TutorConnect.Application.Features.Complaints.DTOs
{
    public record ComplaintCreateRequest(
        long AgainstUserId,
        long? BookingId,
        string Type,
        string Description,
        string? EvidenceUrl);

    public record ComplaintAdminUpdateRequest(
        string Status,
        string? AdminResponse);

    public record ComplaintResponse(
        long Id,
        UserLiteResponse CreatedBy,
        UserLiteResponse AgainstUser,
        long? BookingId,
        string Type,
        string Description,
        string? EvidenceUrl,
        ComplaintStatus Status,
        string? AdminResponse,
        UserLiteResponse? ResolvedByAdmin, 
        DateTime SubmittedAtUtc,
        DateTime? ResolvedAtUtc);
}
