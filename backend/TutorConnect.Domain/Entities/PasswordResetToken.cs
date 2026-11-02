using TutorConnect.Domain.Common;

namespace TutorConnect.Domain.Entities
{
    /// <summary>
    /// Quản lý token đặt lại mật khẩu.
    /// Token có thời hạn 1 giờ và chỉ sử dụng được một lần.
    /// </summary>
    public sealed class PasswordResetToken : BaseEntity
    {
        public long UserId { get; private set; }

        /// <summary>
        /// Bản băm SHA-256 (hex, 64 ký tự) của token gửi qua email. Không bao giờ
        /// lưu token thô - chỉ lưu hash để tránh lộ token nếu Database bị rò rỉ.
        /// </summary>
        public string TokenHash { get; private set; } = null!;

        /// <summary>
        /// Thời điểm token hết hạn (UTC).
        /// </summary>
        public DateTime ExpiresAtUtc { get; private set; }

        /// <summary>
        /// Thời điểm token được sử dụng để đặt lại mật khẩu; NULL nếu chưa dùng.
        /// </summary>
        public DateTime? UsedAtUtc { get; private set; }

        public User User { get; private set; } = null!;

        private PasswordResetToken()
        {
            // Dành cho EF Core.
        }

        private PasswordResetToken(long userId, string tokenHash, DateTime expiresAtUtc)
        {
            UserId = userId;
            TokenHash = tokenHash;
            ExpiresAtUtc = expiresAtUtc;
        }

        /// <summary>
        /// Tạo token đặt lại mật khẩu mới từ token thô (raw token sẽ được gửi qua email,
        /// chỉ bản hash của nó được lưu vào Database). Token có hiệu lực trong 1 giờ.
        /// </summary>
        public static PasswordResetToken Create(long userId, string rawToken)
        {
            if (userId <= 0)
            {
                throw new ArgumentException("UserId không hợp lệ", nameof(userId));
            }

            if (string.IsNullOrWhiteSpace(rawToken))
            {
                throw new ArgumentException("Token không được để trống", nameof(rawToken));
            }

            return new PasswordResetToken(
                userId: userId,
                tokenHash: TokenHasher.Hash(rawToken),
                expiresAtUtc: DateTime.UtcNow.AddHours(1));
        }

        /// <summary>
        /// Token có hiệu lực khi chưa hết hạn và chưa được sử dụng.
        /// </summary>
        public bool IsValid => ExpiresAtUtc > DateTime.UtcNow && UsedAtUtc is null;

        /// <summary>
        /// Token đã hết hạn.
        /// </summary>
        public bool IsExpired => ExpiresAtUtc <= DateTime.UtcNow;

        /// <summary>
        /// Token đã được sử dụng.
        /// </summary>
        public bool IsUsed => UsedAtUtc is not null;

        /// <summary>
        /// Đánh dấu token là đã sử dụng.
        /// </summary>
        public void MarkAsUsed()
        {
            UsedAtUtc ??= DateTime.UtcNow;
        }
    }
}
