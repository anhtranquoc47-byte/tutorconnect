namespace TutorConnect.Domain.Interfaces
{
    /// <summary>
    /// Xử lý mã hóa và xác minh mật khẩu.
    /// </summary>
    public interface IPasswordHasher
    {
        /// <summary>
        /// Mã hóa mật khẩu.
        /// </summary>
        string Hash(string password);

        /// <summary>
        /// Xác minh mật khẩu.
        /// </summary>
        bool Verify(string password, string hash);

        /// <summary>
        /// Mã hóa mật khẩu (alias cho Hash).
        /// </summary>
        string HashPassword(string password) => Hash(password);
    }
}
