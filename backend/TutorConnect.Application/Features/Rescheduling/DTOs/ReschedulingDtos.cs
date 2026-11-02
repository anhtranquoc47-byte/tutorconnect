using TutorConnect.Domain.Enums;

namespace TutorConnect.Application.Features.Rescheduling.DTOs
{
    public record RescheduleCreateRequest(
        DateTime ProposedStartTimeUtc,
        DateTime ProposedEndTimeUtc,
        string? Reason);

    public record OptionalNoteRequest(
        string? ResponseNote);

    public record RescheduleResponse(
        long Id,
        long BookingId,
        long RequestedByUserId,
        DateTime OriginalStartTimeUtc,
        DateTime OriginalEndTimeUtc,
        DateTime ProposedStartTimeUtc,
        DateTime ProposedEndTimeUtc,
        string? Reason,
        RescheduleRequestStatus Status,
        long? RespondedByUserId,
        string? ResponseNote,
        DateTime RequestedAtUtc);
}
