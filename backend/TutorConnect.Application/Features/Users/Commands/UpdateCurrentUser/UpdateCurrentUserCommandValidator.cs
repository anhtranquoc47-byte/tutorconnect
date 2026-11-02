using FluentValidation;

namespace TutorConnect.Application.Features.Users.Commands.UpdateCurrentUser
{
    public class UpdateCurrentUserCommandValidator : AbstractValidator<UpdateCurrentUserCommand>
    {
        public UpdateCurrentUserCommandValidator()
        {
            RuleFor(x => x.UserId)
                .GreaterThan(0);

            RuleFor(x => x.FullName)
                .NotEmpty()
                .MaximumLength(150);

            RuleFor(x => x.Phone)
                .MaximumLength(30);

            RuleFor(x => x.TimeZoneId)
                .NotEmpty()
                .MaximumLength(100)
                .Must(BeSupportedTimeZone)
                .WithMessage("Múi giờ không được hệ thống hỗ trợ");
        }

        private static bool BeSupportedTimeZone(string timeZoneId)
        {
            if (string.IsNullOrWhiteSpace(timeZoneId))
            {
                return false;
            }

            try
            {
                _ = TimeZoneInfo.FindSystemTimeZoneById(timeZoneId.Trim());
                return true;
            }
            catch (TimeZoneNotFoundException)
            {
                return false;
            }
            catch (InvalidTimeZoneException)
            {
                return false;
            }
        }
    }
}
