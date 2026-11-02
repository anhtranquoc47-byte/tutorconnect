using MediatR;
using TutorConnect.Application.Features.Auth.DTOs;

namespace TutorConnect.Application.Features.Auth.Commands.RefreshToken
{
    public class RefreshTokenCommand : IRequest<RefreshTokenResponse>
    {
        public string RefreshToken { get; set; } = null!;

        public RefreshTokenCommand() { }

        public RefreshTokenCommand(RefreshTokenRequest request)
        {
            RefreshToken = request.RefreshToken;
        }
    }
}
