using MediatR;
using TutorConnect.Application.Common.Exceptions;
using TutorConnect.Domain.Interfaces;

namespace TutorConnect.Application.Features.Auth.Commands.Logout
{
    public class LogoutCommandHandler : IRequestHandler<LogoutCommand, Unit>
    {
        private readonly IRefreshTokenRepository _refreshTokenRepository;
        private readonly IJwtTokenService _jwtTokenService;

        public LogoutCommandHandler(IRefreshTokenRepository refreshTokenRepository, IJwtTokenService jwtTokenService)
        {
            _refreshTokenRepository = refreshTokenRepository;
            _jwtTokenService = jwtTokenService;
        }

        public async Task<Unit> Handle(LogoutCommand request, CancellationToken cancellationToken)
        {
            // Hash refresh token
            var tokenHash = _jwtTokenService.GetTokenHash(request.RefreshToken);

            // Tìm refresh token
            var refreshToken = await _refreshTokenRepository.GetByTokenHashAsync(tokenHash, cancellationToken);
            if (refreshToken == null)
            {
                throw new InvalidTokenException("Refresh token không hợp lệ");
            }

            // Thu hồi token
            refreshToken.Revoke();
            await _refreshTokenRepository.UpdateAsync(refreshToken, cancellationToken);
            await _refreshTokenRepository.SaveChangesAsync(cancellationToken);

            return Unit.Value;
        }
    }
}
