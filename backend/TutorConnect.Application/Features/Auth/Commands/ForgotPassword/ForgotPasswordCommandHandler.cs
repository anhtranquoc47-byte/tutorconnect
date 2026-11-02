using MediatR;
using System.Security.Cryptography;
using TutorConnect.Application.Common.Exceptions;
using TutorConnect.Domain.Entities;
using TutorConnect.Domain.Interfaces;

namespace TutorConnect.Application.Features.Auth.Commands.ForgotPassword
{
    public class ForgotPasswordCommandHandler : IRequestHandler<ForgotPasswordCommand, Unit>
    {
        private readonly IUserRepository _userRepository;
        private readonly IPasswordResetTokenRepository _passwordResetTokenRepository;
        private readonly IEmailService _emailService;

        public ForgotPasswordCommandHandler(
            IUserRepository userRepository,
            IPasswordResetTokenRepository passwordResetTokenRepository,
            IEmailService emailService)
        {
            _userRepository = userRepository;
            _passwordResetTokenRepository = passwordResetTokenRepository;
            _emailService = emailService;
        }

        public async Task<Unit> Handle(ForgotPasswordCommand request, CancellationToken cancellationToken)
        {
            // Tìm user theo email
            var user = await _userRepository.GetByEmailAsync(request.Email, cancellationToken);
            if (user == null)
            {
                // Không tiết lộ thông tin user tồn tại hay không (bảo mật)
                return Unit.Value;
            }

            // Tài khoản bị khóa không được yêu cầu đặt lại mật khẩu
            if (!user.CanSignIn)
            {
                throw new UnauthorizedException("Tài khoản đã bị khóa. Vui lòng liên hệ quản trị viên");
            }

            // Sinh token đặt lại mật khẩu bằng bộ sinh số ngẫu nhiên mật mã.
            var rawToken = Convert.ToHexString(RandomNumberGenerator.GetBytes(32));

            // Tạo entity token
            var resetToken = PasswordResetToken.Create(user.Id, rawToken);

            // Lưu token vào database
            await _passwordResetTokenRepository.AddAsync(resetToken, cancellationToken);
            await _passwordResetTokenRepository.SaveChangesAsync(cancellationToken);

            // Link trỏ về trang Frontend (SPA), KHÔNG trỏ trực tiếp vào API backend.
            // API reset-password là [HttpPost], nếu người dùng click link trong mail
            // (luôn tạo ra GET request) sẽ bị lỗi 405 Method Not Allowed. Trang
            // Frontend sẽ đọc token từ URL rồi tự gửi POST tới API.
            var resetLink = $"{request.BaseUrl}/reset-password?token={Uri.EscapeDataString(rawToken)}";

            // Gửi email với link đặt lại mật khẩu
            await _emailService.SendPasswordResetEmailAsync(
                user.Email,
                user.FullName,
                resetLink,
                cancellationToken);

            return Unit.Value;
        }
    }
}
