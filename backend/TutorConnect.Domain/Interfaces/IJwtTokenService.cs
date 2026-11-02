using TutorConnect.Domain.Entities;

namespace TutorConnect.Domain.Interfaces
{
    /// <summary>
    /// Dịch vụ sinh tạo JWT tokens.
    /// </summary>
    public interface IJwtTokenService
    {
        /// <summary>
        /// Sinh tạo access token từ user.
        /// </summary>
        string GenerateAccessToken(User user);

        DateTime GetAccessTokenExpiryUtc();

        /// <summary>
        /// Sinh tạo refresh token.
        /// </summary>
        string GenerateRefreshToken();

        /// <summary>
        /// Lấy hash của refresh token (SHA-256).
        /// </summary>
        string GetTokenHash(string token);

        /// <summary>
        /// Xác thực access token và trích xuất thông tin.
        /// </summary>
        (bool IsValid, long? UserId) ValidateAccessToken(string token);
    }
}
