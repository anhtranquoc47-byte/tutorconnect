using MediatR;
using TutorConnect.Application.Features.Auth.DTOs;

namespace TutorConnect.Application.Features.Auth.Commands.ChangePassword
{
    public class ChangePasswordCommand : IRequest<Unit>
    {
        public long UserId { get; }
        public string CurrentPassword { get; }
        public string NewPassword { get; }

        public ChangePasswordCommand(long userId, ChangePasswordRequest request)
        {
            UserId = userId;
            CurrentPassword = request.CurrentPassword;
            NewPassword = request.NewPassword;
        }
    }
}