using FluentValidation;

namespace TutorConnect.Application.Features.Uploads.Commands.UploadComplaintEvidence
{
    public class UploadComplaintEvidenceCommandValidator : AbstractValidator<UploadComplaintEvidenceCommand>
    {
        private static readonly string[] AllowedContentTypes =
        {
            "image/jpeg", "image/png", "image/webp", "application/pdf"
        };

        private const long MaxSizeBytes = 10 * 1024 * 1024; // 10 MB

        public UploadComplaintEvidenceCommandValidator()
        {
            RuleFor(x => x.UploadedByUserId)
                .GreaterThan(0);

            RuleFor(x => x.OriginalFileName)
                .NotEmpty()
                .MaximumLength(255);

            RuleFor(x => x.ContentType)
                .NotEmpty()
                .Must(ct => AllowedContentTypes.Contains(ct))
                .WithMessage($"Loại file không hỗ trợ. Chỉ chấp nhận: {string.Join(", ", AllowedContentTypes)}");

            RuleFor(x => x.SizeBytes)
                .GreaterThan(0)
                .LessThanOrEqualTo(MaxSizeBytes)
                .WithMessage("Kích thước file tối đa là 10MB");
        }
    }
}
