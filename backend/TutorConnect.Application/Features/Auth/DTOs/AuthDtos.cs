namespace TutorConnect.Application.Features.Auth.DTOs
{
    /// <summary>
    /// Request để đăng ký tài khoản Student. 
    /// </summary>
    public record RegisterStudentRequest(
        string Email,
        string Password,
        string FullName,
        string? Phone,
        string TimeZoneId = "Asia/Ho_Chi_Minh");

    /// <summary>
    /// Request để đăng ký tài khoản Tutor.
    /// </summary>
    public record RegisterTutorRequest(
        string Email,
        string Password,
        string FullName,
        string? Phone,
        string TimeZoneId = "Asia/Ho_Chi_Minh");

    /// <summary>
    /// Response sau khi đăng ký thành công.
    /// </summary>
    public record RegisterResponse(
        long UserId,
        string Email,
        string FullName,
        string Role);

    /// <summary>
    /// Request để đăng nhập.
    /// </summary>
    public record LoginRequest(
        string Email,
        string Password);

    /// <summary>
    /// Response sau khi đăng nhập thành công.
    /// </summary>
    public record LoginResponse(
        string AccessToken,
        string RefreshToken,
        DateTime ExpiresIn,
        string Email,
        string FullName,
        string Role);

    /// <summary>
    /// Request để làm mới access token.
    /// </summary>
    public record RefreshTokenRequest(
        string RefreshToken);

    /// <summary>
    /// Response sau khi làm mới token.
    /// </summary>
    public record RefreshTokenResponse(
        string AccessToken,
        string RefreshToken,
        DateTime ExpiresIn);

    /// <summary>
    /// Request để đăng xuất.
    /// </summary>
    public record LogoutRequest(
        string RefreshToken);
}
        /// <summary>
    /// Request để đổi mật khẩu khi đã đăng nhập.
    /// </summary>
    public record ChangePasswordRequest(
        string CurrentPassword,
        string NewPassword);
