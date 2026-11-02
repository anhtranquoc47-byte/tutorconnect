using MediatR;
using TutorConnect.Application.Common.Exceptions;
using TutorConnect.Application.Features.Auth.DTOs;
using TutorConnect.Domain.Interfaces;

namespace TutorConnect.Application.Features.Auth.Commands.RefreshToken
{
    public class RefreshTokenCommandHandler : IRequestHandler<RefreshTokenCommand, RefreshTokenResponse>
    {
        private readonly IRefreshTokenRepository _refreshTokenRepository;
        private readonly IUserRepository _userRepository;
        private readonly IJwtTokenService _jwtTokenService;

        public RefreshTokenCommandHandler(
            IRefreshTokenRepository refreshTokenRepository,
            IUserRepository userRepository,
            IJwtTokenService jwtTokenService)
        {
            _refreshTokenRepository = refreshTokenRepository;
            _userRepository = userRepository;
            _jwtTokenService = jwtTokenService;
        }

        public async Task<RefreshTokenResponse> Handle(RefreshTokenCommand request, CancellationToken cancellationToken)
        {
            // Hash refresh token
            var tokenHash = _jwtTokenService.GetTokenHash(request.RefreshToken);

            // Tìm refresh token trong database
            var existingRefreshToken = await _refreshTokenRepository.GetByTokenHashAsync(tokenHash, cancellationToken);
            if (existingRefreshToken == null || existingRefreshToken.IsExpired || existingRefreshToken.IsRevoked)
            {
                throw new InvalidTokenException("Refresh token không hợp lệ hoặc đã hết hạn");
            }

            // Tìm user
            var user = await _userRepository.GetByIdAsync(existingRefreshToken.UserId, cancellationToken);
            if (user == null)
            {
                throw new UnauthorizedException("Người dùng không tồn tại");
            }

            // Không cấp token mới nếu tài khoản đang bị khóa - trước đây chỉ kiểm
            // tra user có tồn tại hay không, cho phép tài khoản Locked vẫn refresh
            // được token.
            if (!user.CanSignIn)
            {
                throw new UnauthorizedException("Tài khoản đã bị khóa. Vui lòng liên hệ quản trị viên");
            }

            // Thu hồi token cũ
            existingRefreshToken.Revoke();
            await _refreshTokenRepository.UpdateAsync(existingRefreshToken, cancellationToken);

            // Sinh tạo tokens mới
            var newAccessToken = _jwtTokenService.GenerateAccessToken(user);
            var newRefreshToken = _jwtTokenService.GenerateRefreshToken();
            var newRefreshTokenHash = _jwtTokenService.GetTokenHash(newRefreshToken);

            // Lưu refresh token mới
            var refreshTokenEntity = Domain.Entities.RefreshToken.Create(
                userId: user.Id,
                tokenHash: newRefreshTokenHash,
                expiresAtUtc: DateTime.UtcNow.AddDays(7));

            await _refreshTokenRepository.AddAsync(refreshTokenEntity, cancellationToken);
            await _refreshTokenRepository.SaveChangesAsync(cancellationToken);

            return new RefreshTokenResponse(
                AccessToken: newAccessToken,
                RefreshToken: newRefreshToken,
                ExpiresIn: _jwtTokenService.GetAccessTokenExpiryUtc());
        }
    }
}
