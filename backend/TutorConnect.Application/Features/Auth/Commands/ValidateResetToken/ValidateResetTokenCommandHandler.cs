using MediatR;
using TutorConnect.Application.Features.Auth.DTOs;
using TutorConnect.Domain.Interfaces;

namespace TutorConnect.Application.Features.Auth.Commands.ValidateResetToken
{
    public class ValidateResetTokenCommandHandler : IRequestHandler<ValidateResetTokenCommand, ValidateResetTokenResponse>
    {
        private readonly IPasswordResetTokenRepository _passwordResetTokenRepository;

        public ValidateResetTokenCommandHandler(
            IPasswordResetTokenRepository passwordResetTokenRepository)
        {
            _passwordResetTokenRepository = passwordResetTokenRepository;
        }

        public async Task<ValidateResetTokenResponse> Handle(
            ValidateResetTokenCommand request,
            CancellationToken cancellationToken)
        {
            // Tìm token
            var resetToken = await _passwordResetTokenRepository.GetByTokenAsync(request.Token, cancellationToken);

            // Kiểm tra token có tồn tại
            if (resetToken == null)
            {
                return new ValidateResetTokenResponse(
                    IsValid: false,
                    Message: "Token không hợp lệ hoặc không tìm thấy");
            }

            // Kiểm tra token có hiệu lực
            if (!resetToken.IsValid)
            {
                if (resetToken.IsExpired)
                {
                    return new ValidateResetTokenResponse(
                        IsValid: false,
                        Message: "Token đã hết hạn");
                }

                if (resetToken.IsUsed)
                {
                    return new ValidateResetTokenResponse(
                        IsValid: false,
                        Message: "Token đã được sử dụng");
                }

                return new ValidateResetTokenResponse(
                    IsValid: false,
                    Message: "Token không hợp lệ");
            }

            return new ValidateResetTokenResponse(
                IsValid: true,
                Message: "Token hợp lệ");
        }
    }
}
