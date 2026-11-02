using TutorConnect.Domain.Common;

namespace TutorConnect.Domain.Entities
{
    /// <summary>
    /// Quản lý refresh token để cấp access token mới và thu hồi phiên đăng
    /// nhập (ERD 6.2). Một User có thể có nhiều RefreshToken (nhiều thiết bị
    /// / phiên đăng nhập cùng lúc).
    /// </summary>
    public sealed class RefreshToken : BaseEntity
    {
        public long UserId { get; private set; }

        /// <summary>
        /// Giá trị hash (SHA-256, 64 ký tự hex) của refresh token thô.
        /// </summary>
        public string TokenHash { get; private set; } = null!;

        public DateTime ExpiresAtUtc { get; private set; }

        /// <summary>
        /// Thời điểm token bị thu hồi; NULL nghĩa là chưa bị thu hồi.
        /// </summary>
        public DateTime? RevokedAtUtc { get; private set; }

        public User User { get; private set; } = null!;

        private RefreshToken()
        {
            // Dành cho EF Core.
        }

        public RefreshToken(long userId, string tokenHash, DateTime expiresAtUtc)
        {
            DomainGuard.Positive(userId, nameof(userId));
            UserId = userId;
            TokenHash = DomainGuard.Required(tokenHash, nameof(tokenHash), 64);

            if (TokenHash.Length != 64)
            {
                throw new ArgumentException("TokenHash must contain exactly 64 characters.", nameof(tokenHash));
            }

            ExpiresAtUtc = expiresAtUtc;
        }

        /// <summary>
        /// Tạo refresh token mới. userId phải là Id thật (đã tồn tại trong DB,
        /// != 0) - nghĩa là ở luồng Register, phải SaveChanges User trước rồi
        /// mới phát hành RefreshToken.
        /// </summary>
        public static RefreshToken Create(long userId, string tokenHash, DateTime expiresAtUtc)
        {
            if (userId <= 0)
            {
                throw new ArgumentException("UserId không hợp lệ.", nameof(userId));
            }

            if (string.IsNullOrWhiteSpace(tokenHash))
            {
                throw new ArgumentException("TokenHash không được để trống.", nameof(tokenHash));
            }

            if (tokenHash.Length != 64)
            {
                throw new ArgumentException(
                    "TokenHash phải có đúng 64 ký tự (SHA-256 dạng hex), khớp cột CHAR(64).",
                    nameof(tokenHash));
            }

            if (expiresAtUtc <= DateTime.UtcNow)
            {
                throw new ArgumentException("ExpiresAtUtc phải ở tương lai.", nameof(expiresAtUtc));
            }

            return new RefreshToken(userId, tokenHash, expiresAtUtc);
        }

        /// <summary>
        /// Token chỉ hợp lệ khi chưa hết hạn và RevokedAtUtc là NULL
        /// </summary>
        public bool IsActive(DateTime utcNow)
        {
            return RevokedAtUtc is null && ExpiresAtUtc > utcNow;
        }

        public bool IsExpired => ExpiresAtUtc <= DateTime.UtcNow;

        public bool IsRevoked => RevokedAtUtc is not null;

        public void Revoke()
        {
            Revoke(DateTime.UtcNow);
        }

        public void Revoke(DateTime revokedAtUtc)
        {
            if (RevokedAtUtc is null)
            {
                RevokedAtUtc = revokedAtUtc;
            }
        }
    }
}
