using FluentValidation;

namespace TutorConnect.Application.Features.Users.Commands.UpdateUserStatus
{
    public class UpdateUserStatusCommandValidator : AbstractValidator<UpdateUserStatusCommand>
    {
        public UpdateUserStatusCommandValidator()
        {
            RuleFor(x => x.UserId)
                .GreaterThan(0);

            RuleFor(x => x.Status)
                .IsInEnum();
        }
    }
}
