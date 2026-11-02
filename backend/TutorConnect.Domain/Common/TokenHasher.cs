using System.Security.Cryptography;
using System.Text;

namespace TutorConnect.Domain.Common
{
    /// <summary>
    /// Hàm băm dùng chung cho các token nhạy cảm (email verification, password reset,
    /// refresh token) trước khi lưu vào Database. Không bao giờ lưu token thô.
    /// </summary>
    public static class TokenHasher
    {
        public static string Hash(string rawToken)
        {
            if (string.IsNullOrWhiteSpace(rawToken))
            {
                throw new ArgumentException("Token không được để trống.", nameof(rawToken));
            }

            var hashedBytes = SHA256.HashData(Encoding.UTF8.GetBytes(rawToken));
            return Convert.ToHexString(hashedBytes).ToLowerInvariant();
        }
    }
}
