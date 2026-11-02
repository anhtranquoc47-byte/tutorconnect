namespace TutorConnect.Domain.Interfaces
{
    /// <summary>
    /// Dịch vụ gửi email.
    /// </summary>
    public interface IEmailService
    {
        /// <summary>
        /// Gửi email xác minh email.
        /// </summary>
        Task SendVerificationEmailAsync(
            string email,
            string fullName,
            string verificationLink,
            CancellationToken cancellationToken = default);

        /// <summary>
        /// Gửi email thông báo xác minh thành công.
        /// </summary>
        Task SendVerificationConfirmationEmailAsync(
            string email,
            string fullName,
            CancellationToken cancellationToken = default);

        /// <summary>
        /// Gửi email yêu cầu đặt lại mật khẩu.
        /// </summary>
        Task SendPasswordResetEmailAsync(
            string email,
            string fullName,
            string resetLink,
            CancellationToken cancellationToken = default);

        /// <summary>
        /// Gửi email xác nhận mật khẩu đã được thay đổi.
        /// </summary>
        Task SendPasswordChangedConfirmationEmailAsync(
            string email,
            string fullName,
            CancellationToken cancellationToken = default);
    }
}
