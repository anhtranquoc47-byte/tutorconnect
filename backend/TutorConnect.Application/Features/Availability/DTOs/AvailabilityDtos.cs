namespace TutorConnect.Application.Features.Availability.DTOs
{
    public record AvailabilityCreateRequest(
        DayOfWeek DayOfWeek,
        TimeOnly StartTime,
        TimeOnly EndTime);

    public record AvailabilityUpdateRequest(
        DayOfWeek DayOfWeek,
        TimeOnly StartTime,
        TimeOnly EndTime);

    public record AvailabilityStatusRequest(
        bool IsActive);

    public record TutorAvailabilityResponse(
        long Id,
        long TutorId,
        DayOfWeek DayOfWeek,
        TimeOnly StartTime,
        TimeOnly EndTime,
        bool IsActive);

    public record AvailableWindowResponse(
        DateTime StartTimeUtc,
        DateTime EndTimeUtc);
}
