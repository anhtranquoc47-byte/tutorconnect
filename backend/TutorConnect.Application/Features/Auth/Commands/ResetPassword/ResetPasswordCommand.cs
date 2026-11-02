using MediatR;
using TutorConnect.Application.Features.Auth.DTOs;

namespace TutorConnect.Application.Features.Auth.Commands.ResetPassword
{
    public class ResetPasswordCommand : IRequest<Unit>
    {
        public string Token { get; set; } = null!;
        public string NewPassword { get; set; } = null!;
        public string ConfirmPassword { get; set; } = null!;

        public ResetPasswordCommand() { }

        public ResetPasswordCommand(ResetPasswordRequest request)
        {
            Token = request.Token;
            NewPassword = request.NewPassword;
            ConfirmPassword = request.ConfirmPassword;
        }
    }
}
