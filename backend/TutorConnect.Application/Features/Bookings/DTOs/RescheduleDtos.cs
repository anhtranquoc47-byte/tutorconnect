using System;
using TutorConnect.Domain.Enums;

namespace TutorConnect.Application.Features.Bookings.DTOs
{
    public record RescheduleCreateRequest(
        DateTime ProposedStartTimeUtc,
        DateTime ProposedEndTimeUtc,
        string? Reason
    );

    public record RescheduleStatusUpdateRequest(
        RescheduleStatusAction Status,
        string? ResponseNote
    );

    public enum RescheduleStatusAction
    {
        Approve = 1,
        Reject = 2
    }

    public record RescheduleResponse(
        long Id,
        long BookingId,
        long RequestedByUserId,
        DateTime OriginalStartTimeUtc,
        DateTime OriginalEndTimeUtc,
        DateTime ProposedStartTimeUtc,
        DateTime ProposedEndTimeUtc,
        string? Reason,
        string Status,
        long? RespondedByUserId,
        string? ResponseNote,
        DateTime RequestedAtUtc
    );
}