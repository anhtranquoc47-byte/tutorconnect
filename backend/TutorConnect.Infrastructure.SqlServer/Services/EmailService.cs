using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Logging;
using TutorConnect.Domain.Interfaces;
using MailKit.Net.Smtp;
using MailKit.Security;
using MimeKit;

namespace TutorConnect.Infrastructure.SqlServer.Services
{
    /// <summary>
    /// Email service implementation 
    /// </summary>
    public class EmailService : IEmailService
    {
        private readonly IConfiguration _configuration;
        private readonly ILogger<EmailService> _logger;

        public EmailService(IConfiguration configuration, ILogger<EmailService> logger)
        {
            _configuration = configuration;
            _logger = logger;
        }

        #region Public Methods

        public async Task SendVerificationEmailAsync(
            string email,
            string fullName,
            string verificationLink,
            CancellationToken cancellationToken = default)
        {
            try
            {
                var subject = "Xác minh email của bạn";
                var htmlBody = GenerateVerificationEmailBody(fullName, verificationLink);

                _logger.LogInformation("Đang gửi email xác minh đến {Email}", email);

                await SendEmailAsync(email, subject, htmlBody, cancellationToken);

                _logger.LogInformation("Email xác minh đã được gửi thành công đến {Email}", email);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Lỗi khi gửi email xác minh đến {Email}", email);
                throw;
            }
        }

        public async Task SendVerificationConfirmationEmailAsync(
            string email,
            string fullName,
            CancellationToken cancellationToken = default)
        {
            try
            {
                var subject = "Email của bạn đã được xác minh";
                var htmlBody = GenerateConfirmationEmailBody(fullName);

                _logger.LogInformation("Đang gửi email xác nhận xác minh đến {Email}", email);

                await SendEmailAsync(email, subject, htmlBody, cancellationToken);

                _logger.LogInformation("Email xác nhận đã được gửi thành công đến {Email}", email);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Lỗi khi gửi email xác nhận đến {Email}", email);
                throw;
            }
        }

        public async Task SendPasswordResetEmailAsync(
            string email,
            string fullName,
            string resetLink,
            CancellationToken cancellationToken = default)
        {
            try
            {
                var subject = "Đặt lại mật khẩu của bạn";
                var htmlBody = GeneratePasswordResetEmailBody(fullName, resetLink);

                // Không ghi resetLink (chứa token nhạy cảm) vào log - ai đọc được log
                // hệ thống đều có thể chiếm đoạt tài khoản.
                _logger.LogInformation("Đang gửi email đặt lại mật khẩu đến {Email}", email);

                await SendEmailAsync(email, subject, htmlBody, cancellationToken);

                _logger.LogInformation("Email đặt lại mật khẩu đã được gửi thành công đến {Email}", email);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Lỗi khi gửi email đặt lại mật khẩu đến {Email}", email);
                throw;
            }
        }

        public async Task SendPasswordChangedConfirmationEmailAsync(
            string email,
            string fullName,
            CancellationToken cancellationToken = default)
        {
            try
            {
                var subject = "Mật khẩu của bạn đã được thay đổi";
                var htmlBody = GeneratePasswordChangedConfirmationEmailBody(fullName);

                _logger.LogInformation("Đang gửi email xác nhận thay đổi mật khẩu đến {Email}", email);

                await SendEmailAsync(email, subject, htmlBody, cancellationToken);

                _logger.LogInformation("Email xác nhận thay đổi mật khẩu đã được gửi thành công đến {Email}", email);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Lỗi khi gửi email xác nhận thay đổi mật khẩu đến {Email}", email);
                throw;
            }
        }

        #endregion

        #region Core Email Sending Logic

        private async Task SendEmailAsync(
            string to,
            string subject,
            string htmlBody,
            CancellationToken cancellationToken)
        {
            var host = _configuration["Email:SmtpServer"];
            var port = int.Parse(_configuration["Email:SmtpPort"] ?? "587");
            var from = _configuration["Email:SenderEmail"];
            var password = _configuration["Email:SenderPassword"];
            var displayName = _configuration["Email:SenderName"];

            var message = new MimeMessage();
            message.From.Add(new MailboxAddress(displayName, from));
            message.To.Add(MailboxAddress.Parse(to));
            message.Subject = subject;

            message.Body = new BodyBuilder
            {
                HtmlBody = htmlBody
            }.ToMessageBody();

            using var smtp = new SmtpClient();

            await smtp.ConnectAsync(
                host,
                port,
                SecureSocketOptions.StartTls,
                cancellationToken);

            await smtp.AuthenticateAsync(
                from,
                password,
                cancellationToken);

            await smtp.SendAsync(message, cancellationToken);
            await smtp.DisconnectAsync(true, cancellationToken);
        }

        #endregion

        #region HTML Template Generators

        private string GenerateVerificationEmailBody(string fullName, string verificationLink)
        {
            return $@"
<!DOCTYPE html>
<html>
<head>
    <meta charset='utf-8' />
    <title>Xác minh Email</title>
</head>
<body style='font-family: Arial, sans-serif; line-height: 1.6; color: #333;'>
    <div style='max-width: 600px; margin: 0 auto; padding: 20px;'>
        <h2>Xác minh Email của Bạn</h2>
        <p>Xin chào {fullName},</p>
        <p>Cảm ơn bạn đã đăng ký tài khoản TutorConnect. Để hoàn thành quá trình đăng ký, vui lòng xác minh email của bạn bằng cách nhấp vào liên kết dưới đây:</p>
        <p>
            <a href='{verificationLink}' style='background-color: #4CAF50; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; display: inline-block;'>
                Xác minh Email
            </a>
        </p>
        <p>Hoặc sao chép và dán liên kết này vào trình duyệt của bạn:</p>
        <p style='word-break: break-all;'>{verificationLink}</p>
        <p style='color: #999; font-size: 12px;'>Liên kết này sẽ hết hạn trong 24 giờ.</p>
        <hr style='border: none; border-top: 1px solid #ddd; margin: 20px 0;' />
        <p style='color: #999; font-size: 12px;'>TutorConnect Team</p>
    </div>
</body>
</html>";
        }

        private string GenerateConfirmationEmailBody(string fullName)
        {
            return $@"
<!DOCTYPE html>
<html>
<head>
    <meta charset='utf-8' />
    <title>Xác minh Thành Công</title>
</head>
<body style='font-family: Arial, sans-serif; line-height: 1.6; color: #333;'>
    <div style='max-width: 600px; margin: 0 auto; padding: 20px;'>
        <h2>Email Đã Được Xác minh</h2>
        <p>Xin chào {fullName},</p>
        <p>Email của bạn đã được xác minh thành công! Bạn có thể bây giờ đăng nhập vào tài khoản TutorConnect của mình.</p>
        <p>Nếu bạn không thực hiện hành động này, vui lòng liên hệ với chúng tôi ngay lập tức.</p>
        <hr style='border: none; border-top: 1px solid #ddd; margin: 20px 0;' />
        <p style='color: #999; font-size: 12px;'>TutorConnect Team</p>
    </div>
</body>
</html>";
        }

        private string GeneratePasswordResetEmailBody(string fullName, string resetLink)
        {
            return $@"
<!DOCTYPE html>
<html>
<head>
    <meta charset='utf-8' />
    <title>Đặt lại Mật khẩu</title>
</head>
<body style='font-family: Arial, sans-serif; line-height: 1.6; color: #333;'>
    <div style='max-width: 600px; margin: 0 auto; padding: 20px;'>
        <h2>Đặt lại Mật khẩu của Bạn</h2>
        <p>Xin chào {fullName},</p>
        <p>Chúng tôi nhận được yêu cầu đặt lại mật khẩu cho tài khoản TutorConnect của bạn. Vui lòng nhấp vào liên kết bên dưới để tiếp tục:</p>
        <p>
            <a href='{resetLink}' style='background-color: #4CAF50; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; display: inline-block;'>
                Đặt lại Mật khẩu
            </a>
        </p>
        <p>Hoặc sao chép và dán liên kết này vào trình duyệt của bạn:</p>
        <p style='word-break: break-all;'>{resetLink}</p>
        <p style='color: #999; font-size: 12px;'>Liên kết này sẽ hết hạn trong 1 giờ.</p>
        <p style='color: #999; font-size: 12px;'>Nếu bạn không yêu cầu đặt lại mật khẩu, vui lòng bỏ qua email này. Mật khẩu của bạn sẽ không thay đổi.</p>
        <hr style='border: none; border-top: 1px solid #ddd; margin: 20px 0;' />
        <p style='color: #999; font-size: 12px;'>TutorConnect Team</p>
    </div>
</body>
</html>";
        }

        private string GeneratePasswordChangedConfirmationEmailBody(string fullName)
        {
            return $@"
<!DOCTYPE html>
<html>
<head>
    <meta charset='utf-8' />
    <title>Mật khẩu Đã Thay Đổi</title>
</head>
<body style='font-family: Arial, sans-serif; line-height: 1.6; color: #333;'>
    <div style='max-width: 600px; margin: 0 auto; padding: 20px;'>
        <h2>Mật khẩu Đã Được Thay Đổi</h2>
        <p>Xin chào {fullName},</p>
        <p>Mật khẩu của tài khoản TutorConnect của bạn đã được thay đổi thành công. Nếu bạn không thực hiện hành động này, vui lòng liên hệ với chúng tôi ngay lập tức.</p>
        <hr style='border: none; border-top: 1px solid #ddd; margin: 20px 0;' />
        <p style='color: #999; font-size: 12px;'>TutorConnect Team</p>
    </div>
</body>
</html>";
        }

        #endregion
    }
}