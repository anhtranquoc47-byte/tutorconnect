using MediatR;
using TutorConnect.Application.Features.Auth.DTOs;

namespace TutorConnect.Application.Features.Auth.Commands.ValidateResetToken
{
    public class ValidateResetTokenCommand : IRequest<ValidateResetTokenResponse>
    {
        public string Token { get; set; } = null!;

        public ValidateResetTokenCommand() { }

        public ValidateResetTokenCommand(ValidateResetTokenRequest request)
        {
            Token = request.Token;
        }
    }
}
