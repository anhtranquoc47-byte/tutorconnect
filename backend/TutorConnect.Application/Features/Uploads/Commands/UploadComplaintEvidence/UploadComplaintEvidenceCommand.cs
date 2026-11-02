using MediatR;
using TutorConnect.Application.Features.Uploads.DTOs;

namespace TutorConnect.Application.Features.Uploads.Commands.UploadComplaintEvidence
{
    /// <summary>
    /// Upload một file bằng chứng khiếu nại (ảnh/PDF) và trả về URL công khai.
    /// Việc đọc IFormFile diễn ra ở API layer; Application layer chỉ nhận stream + metadata
    /// để giữ tầng Application độc lập với ASP.NET MVC.
    /// </summary>
    public class UploadComplaintEvidenceCommand : IRequest<FileUploadResponse>
    {
        public Stream Content { get; set; } = Stream.Null;

        public string OriginalFileName { get; set; } = string.Empty;

        public string ContentType { get; set; } = string.Empty;

        public long SizeBytes { get; set; }

        public long UploadedByUserId { get; set; }
    }
}
