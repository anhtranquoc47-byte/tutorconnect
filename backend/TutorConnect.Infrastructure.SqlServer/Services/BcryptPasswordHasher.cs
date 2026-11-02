using System.Security.Cryptography;
using System.Text;
using TutorConnect.Domain.Interfaces;
using BCrypt.Net;

namespace TutorConnect.Infrastructure.SqlServer.Services
{
    /// <summary>
    /// Thực thi mã hóa mật khẩu bằng BCrypt.
    /// </summary>
    public class BcryptPasswordHasher : IPasswordHasher
    {
        private const int WorkFactor = 12;

        public string Hash(string password)
        {
            if (string.IsNullOrWhiteSpace(password))
            {
                throw new ArgumentException("Mật khẩu không được để trống", nameof(password));
            }

            return BCrypt.Net.BCrypt.HashPassword(password, WorkFactor);
        }

        public bool Verify(string password, string hash)
        {
            if (string.IsNullOrWhiteSpace(password) || string.IsNullOrWhiteSpace(hash))
            {
                return false;
            }

            try
            {
                return BCrypt.Net.BCrypt.Verify(password, hash);
            }
            catch
            {
                return false;
            }
        }
    }
}
