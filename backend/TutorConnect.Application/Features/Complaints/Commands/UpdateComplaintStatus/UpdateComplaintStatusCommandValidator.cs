using FluentValidation;

namespace TutorConnect.Application.Features.Complaints.Commands.UpdateComplaintStatus
{
    public class UpdateComplaintStatusCommandValidator : AbstractValidator<UpdateComplaintStatusCommand>
    {
        public UpdateComplaintStatusCommandValidator()
        {
            RuleFor(x => x.ComplaintId)
                .GreaterThan(0);

            RuleFor(x => x.Status)
                .IsInEnum();

            RuleFor(x => x.AdminResponse)
                .MaximumLength(2000);
        }
    }
}
