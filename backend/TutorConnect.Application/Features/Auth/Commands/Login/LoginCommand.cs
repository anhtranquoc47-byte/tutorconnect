using MediatR;
using TutorConnect.Application.Features.Auth.DTOs;

namespace TutorConnect.Application.Features.Auth.Commands.Login
{
    public class LoginCommand : IRequest<LoginResponse>
    {
        public string Email { get; set; } = null!;
        public string Password { get; set; } = null!;

        public LoginCommand() { }

        public LoginCommand(LoginRequest request)
        {
            Email = request.Email;
            Password = request.Password;
        }
    }
}
