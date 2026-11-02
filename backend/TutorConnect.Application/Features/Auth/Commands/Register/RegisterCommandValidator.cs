using FluentValidation;

namespace TutorConnect.Application.Features.Auth.Commands.Register
{
    public class RegisterCommandValidator : AbstractValidator<RegisterCommand>
    {
        public RegisterCommandValidator()
        {
            RuleFor(x => x.Email)
                .NotEmpty().WithMessage("Email là bắt buộc")
                .EmailAddress().WithMessage("Email không hợp lệ");

            RuleFor(x => x.Password)
                .NotEmpty().WithMessage("Mật khẩu là bắt buộc")
                .MinimumLength(8).WithMessage("Mật khẩu phải ít nhất 8 ký tự");

            RuleFor(x => x.FullName)
                .NotEmpty().WithMessage("Tên đầy đủ là bắt buộc")
                .Length(2, 100).WithMessage("Tên đầy đủ phải từ 2 đến 100 ký tự");

            RuleFor(x => x.Role)
                .NotEqual(TutorConnect.Domain.Enums.UserRole.Admin)
                .WithMessage("Không được phép tự đăng ký tài khoản Admin qua API công khai");

            RuleFor(x => x.TimeZoneId)
                .NotEmpty().WithMessage("Múi giờ là bắt buộc")
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
