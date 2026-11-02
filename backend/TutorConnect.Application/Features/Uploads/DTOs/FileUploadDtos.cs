namespace TutorConnect.Application.Features.Uploads.DTOs
{
    public record FileUploadResponse(
        string FileUrl,
        string? OriginalFileName,
        string? ContentType,
        long? SizeBytes);
}
