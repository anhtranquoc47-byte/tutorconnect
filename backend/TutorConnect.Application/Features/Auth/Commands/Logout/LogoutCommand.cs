using MediatR;
using TutorConnect.Application.Features.Auth.DTOs;

namespace TutorConnect.Application.Features.Auth.Commands.Logout
{
    public class LogoutCommand : IRequest<Unit>
    {
        public string RefreshToken { get; set; } = null!;

        public LogoutCommand() { }

        public LogoutCommand(LogoutRequest request)
        {
            RefreshToken = request.RefreshToken;
        }
    }
}
