using MediatR;
using TutorConnect.Application.Common.Exceptions;
using TutorConnect.Domain.Interfaces;

namespace TutorConnect.Application.Features.Auth.Commands.ResetPassword
{
    public class ResetPasswordCommandHandler : IRequestHandler<ResetPasswordCommand, Unit>
    {
        private readonly IPasswordResetTokenRepository _passwordResetTokenRepository;
        private readonly IUserRepository _userRepository;
        private readonly IPasswordHasher _passwordHasher;
        private readonly IEmailService _emailService;

        public ResetPasswordCommandHandler(
            IPasswordResetTokenRepository passwordResetTokenRepository,
            IUserRepository userRepository,
            IPasswordHasher passwordHasher,
            IEmailService emailService)
        {
            _passwordResetTokenRepository = passwordResetTokenRepository;
            _userRepository = userRepository;
            _passwordHasher = passwordHasher;
            _emailService = emailService;
        }

        public async Task<Unit> Handle(ResetPasswordCommand request, CancellationToken cancellationToken)
        {
            // Tìm token đặt lại mật khẩu
            var resetToken = await _passwordResetTokenRepository.GetByTokenAsync(request.Token, cancellationToken);
            if (resetToken == null)
            {
                throw new NotFoundException("Token không hợp lệ hoặc không tìm thấy");
            }

            // Kiểm tra token có hiệu lực
            if (!resetToken.IsValid)
            {
                if (resetToken.IsExpired)
                {
                    throw new UnauthorizedException("Token đã hết hạn");
                }

                if (resetToken.IsUsed)
                {
                    throw new UnauthorizedException("Token đã được sử dụng");
                }

                throw new UnauthorizedException("Token không hợp lệ");
            }

            // Tìm user
            var user = await _userRepository.GetByIdAsync(resetToken.UserId, cancellationToken);
            if (user == null)
            {
                throw new NotFoundException("Không tìm thấy người dùng");
            }

            // Hash mật khẩu mới
            var passwordHash = _passwordHasher.Hash(request.NewPassword);

            // Cập nhật mật khẩu người dùng
            user.UpdatePassword(passwordHash);

            // Lưu thay đổi
            await _userRepository.UpdateAsync(user, cancellationToken);

            // Đánh dấu token là đã sử dụng
            resetToken.MarkAsUsed();
            await _passwordResetTokenRepository.UpdateAsync(resetToken, cancellationToken);

            // Lưu lại database
            await _passwordResetTokenRepository.SaveChangesAsync(cancellationToken);

            // Gửi email xác nhận (tùy chọn)
            await _emailService.SendPasswordChangedConfirmationEmailAsync(
                user.Email,
                user.FullName,
                cancellationToken);

            return Unit.Value;
        }
    }
}
