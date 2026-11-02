namespace TutorConnect.Application.Features.Subjects.DTOs
{
    public record SubjectCreateRequest(
        string Code,
        string Name,
        string? Description);

    public record SubjectUpdateRequest(
        string Code,
        string Name,
        string? Description);

    public record SubjectStatusRequest(
        bool IsActive);

    public record SubjectResponse(
        long Id,
        string Code,
        string Name,
        string? Description,
        bool IsActive);
}
