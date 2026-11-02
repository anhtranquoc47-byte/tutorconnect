using FluentValidation;

namespace TutorConnect.Application.Features.Auth.Commands.ResetPassword
{
    public class ResetPasswordCommandValidator : AbstractValidator<ResetPasswordCommand>
    {
        public ResetPasswordCommandValidator()
        {
            RuleFor(x => x.Token)
                .NotEmpty().WithMessage("Token là bắt buộc");

            RuleFor(x => x.NewPassword)
                .NotEmpty().WithMessage("Mật khẩu mới là bắt buộc")
                .MinimumLength(8).WithMessage("Mật khẩu phải có ít nhất 8 ký tự")
                .Matches(@"[A-Z]").WithMessage("Mật khẩu phải chứa ít nhất một ký tự in hoa")
                .Matches(@"[a-z]").WithMessage("Mật khẩu phải chứa ít nhất một ký tự in thường")
                .Matches(@"[0-9]").WithMessage("Mật khẩu phải chứa ít nhất một chữ số")
                .Matches(@"[^a-zA-Z0-9]").WithMessage("Mật khẩu phải chứa ít nhất một ký tự đặc biệt");

            RuleFor(x => x.ConfirmPassword)
                .Equal(x => x.NewPassword).WithMessage("Mật khẩu xác nhận không khớp");
        }
    }
}
