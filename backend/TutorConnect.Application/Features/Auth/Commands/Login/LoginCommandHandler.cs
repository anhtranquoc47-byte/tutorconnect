using MediatR;
using TutorConnect.Application.Common.Exceptions;
using TutorConnect.Application.Features.Auth.DTOs;
using TutorConnect.Domain.Interfaces;

namespace TutorConnect.Application.Features.Auth.Commands.Login
{
    public class LoginCommandHandler : IRequestHandler<LoginCommand, LoginResponse>
    {
        private readonly IUserRepository _userRepository;
        private readonly IRefreshTokenRepository _refreshTokenRepository;
        private readonly IPasswordHasher _passwordHasher;
        private readonly IJwtTokenService _jwtTokenService;

        public LoginCommandHandler(
            IUserRepository userRepository,
            IRefreshTokenRepository refreshTokenRepository,
            IPasswordHasher passwordHasher,
            IJwtTokenService jwtTokenService)
        {
            _userRepository = userRepository;
            _refreshTokenRepository = refreshTokenRepository;
            _passwordHasher = passwordHasher;
            _jwtTokenService = jwtTokenService;
        }

        public async Task<LoginResponse> Handle(LoginCommand request, CancellationToken cancellationToken)
        {
            // Tìm user theo email
            var user = await _userRepository.GetByEmailAsync(request.Email, cancellationToken);
            if (user == null)
            {
                throw new InvalidCredentialsException();
            }

            // Tài khoản bị khóa hoặc ngừng hoạt động không được đăng nhập.
            if (!user.CanSignIn)
            {
                throw new UnauthorizedException("Tài khoản đã bị khóa. Vui lòng liên hệ quản trị viên");
            }

            // Xác minh mật khẩu & đếm số lần nhập sai
            if (!_passwordHasher.Verify(request.Password, user.PasswordHash))
            {
                user.RecordFailedLogin();
                await _userRepository.UpdateAsync(user, cancellationToken);
                await _userRepository.SaveChangesAsync(cancellationToken);
                throw new InvalidCredentialsException();
            }

            // Nhập đúng mật khẩu -> Reset biến đếm nhập sai về 0
            if (user.FailedLoginAttempts > 0)
            {
                user.ResetFailedLogin();
                await _userRepository.UpdateAsync(user, cancellationToken);
                await _userRepository.SaveChangesAsync(cancellationToken);
            }
            // Sinh tạo tokens
            var accessToken = _jwtTokenService.GenerateAccessToken(user);
            var refreshToken = _jwtTokenService.GenerateRefreshToken();
            var refreshTokenHash = _jwtTokenService.GetTokenHash(refreshToken);

            // Lưu refresh token
            var refreshTokenEntity = Domain.Entities.RefreshToken.Create(
                userId: user.Id,
                tokenHash: refreshTokenHash,
                expiresAtUtc: DateTime.UtcNow.AddDays(7));

            await _refreshTokenRepository.AddAsync(refreshTokenEntity, cancellationToken);
            await _refreshTokenRepository.SaveChangesAsync(cancellationToken);

            return new LoginResponse(
                AccessToken: accessToken,
                RefreshToken: refreshToken,
                ExpiresIn: _jwtTokenService.GetAccessTokenExpiryUtc(),
                Email: user.Email,
                FullName: user.FullName,
                Role: user.Role.ToString());
        }
    }
}
