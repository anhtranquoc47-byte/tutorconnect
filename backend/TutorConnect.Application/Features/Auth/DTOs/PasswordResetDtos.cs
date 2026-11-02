namespace TutorConnect.Application.Features.Auth.DTOs
{
    /// <summary>
    /// Request để yêu cầu đặt lại mật khẩu.
    /// </summary>
    public record ForgotPasswordRequest(
        string Email);

    /// <summary>
    /// Request để xác thực token đặt lại mật khẩu.
    /// </summary>
    public record ValidateResetTokenRequest(
        string Token);

    /// <summary>
    /// Response sau khi xác thực token thành công.
    /// </summary>
    public record ValidateResetTokenResponse(
        bool IsValid,
        string Message);

    /// <summary>
    /// Request để đặt lại mật khẩu.
    /// </summary>
    public record ResetPasswordRequest(
        string Token,
        string NewPassword,
        string ConfirmPassword);

    /// <summary>
    /// Response sau khi đặt lại mật khẩu thành công.
    /// </summary>
    public record ResetPasswordResponse(
        bool Success,
        string Message);
}
