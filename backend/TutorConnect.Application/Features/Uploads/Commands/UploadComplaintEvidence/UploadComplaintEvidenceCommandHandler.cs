using MediatR;
using TutorConnect.Application.Features.Uploads.DTOs;
using TutorConnect.Domain.Interfaces;

namespace TutorConnect.Application.Features.Uploads.Commands.UploadComplaintEvidence
{
    public class UploadComplaintEvidenceCommandHandler : IRequestHandler<UploadComplaintEvidenceCommand, FileUploadResponse>
    {
        private readonly IFileStorageService _fileStorageService;

        public UploadComplaintEvidenceCommandHandler(IFileStorageService fileStorageService)
        {
            _fileStorageService = fileStorageService;
        }

        public async Task<FileUploadResponse> Handle(UploadComplaintEvidenceCommand request, CancellationToken cancellationToken)
        {
            var stored = await _fileStorageService.SaveAsync(
                request.Content,
                request.OriginalFileName,
                request.ContentType,
                request.SizeBytes,
                subFolder: "complaint-evidence",
                cancellationToken: cancellationToken);

            return new FileUploadResponse(
                stored.FileUrl,
                stored.OriginalFileName,
                stored.ContentType,
                stored.SizeBytes);
        }
    }
}
