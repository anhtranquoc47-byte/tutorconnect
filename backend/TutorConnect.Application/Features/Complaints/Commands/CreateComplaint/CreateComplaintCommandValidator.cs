using FluentValidation;

namespace TutorConnect.Application.Features.Complaints.Commands.CreateComplaint
{
    public class CreateComplaintCommandValidator : AbstractValidator<CreateComplaintCommand>
    {
        private static readonly string[] AllowedTypes =
        {
            "NoShow", "Behavior", "Payment", "Quality", "Safety", "Other"
        };

        public CreateComplaintCommandValidator()
        {
            RuleFor(x => x.CreatedByUserId)
                .GreaterThan(0);

            RuleFor(x => x.AgainstUserId)
                .GreaterThan(0);

            RuleFor(x => x)
                .Must(x => x.CreatedByUserId != x.AgainstUserId)
                .WithMessage("Không thể tự khiếu nại chính mình")
                .OverridePropertyName(nameof(CreateComplaintCommand.AgainstUserId));

            RuleFor(x => x.BookingId)
                .GreaterThan(0)
                .When(x => x.BookingId.HasValue);

            RuleFor(x => x.Type)
                .NotEmpty()
                .MaximumLength(50)
                .Must(t => AllowedTypes.Contains(t))
                .WithMessage($"Type phải là một trong: {string.Join(", ", AllowedTypes)}");

            RuleFor(x => x.Description)
                .NotEmpty()
                .MaximumLength(2000);

            RuleFor(x => x.EvidenceUrl)
                .MaximumLength(1000);
        }
    }
}
