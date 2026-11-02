using MediatR;
using TutorConnect.Application.Features.Auth.DTOs;

namespace TutorConnect.Application.Features.Auth.Commands.ForgotPassword
{
    public class ForgotPasswordCommand : IRequest<Unit>
    {
        public string Email { get; set; } = null!;
        public string BaseUrl { get; set; } = null!;

        public ForgotPasswordCommand() { }

        public ForgotPasswordCommand(ForgotPasswordRequest request, string baseUrl)
        {
            Email = request.Email;
            BaseUrl = baseUrl;
        }
    }
}
