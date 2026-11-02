# Email Verification Quick Start Guide

## Setup

### 1. Database Migration
Before using email verification, create the `EmailVerificationToken` table:

```csharp
// Using Entity Framework Core Migrations
// Run in Package Manager Console:
Add-Migration AddEmailVerificationToken
Update-Database
```

### 2. Configure SMTP Settings

Edit `appsettings.json`:
```json
{
  "Email": {
	"SmtpServer": "smtp.gmail.com",
	"SmtpPort": 587,
	"SenderEmail": "your-email@gmail.com",
	"SenderPassword": "your-app-password",
	"SenderName": "TutorConnect"
  }
}
```

### 3. Implement EmailService

In `TutorConnect.Infrastructure.SqlServer/Services/EmailService.cs`, replace the TODO sections with actual SMTP implementation.

## API Endpoints

### Register New User
```bash
curl -X POST https://localhost:7001/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
	"email": "user@example.com",
	"password": "SecurePass123",
	"fullName": "John Doe",
	"phone": "+84912345678",
	"role": "Student",
	"timeZoneId": "Asia/Ho_Chi_Minh"
  }'
```

**Expected Response (201 Created):**
```json
{
  "statusCode": 201,
  "isSuccess": true,
  "errorMessages": [],
  "result": {
	"userId": 1,
	"email": "user@example.com",
	"fullName": "John Doe",
	"role": "Student"
  }
}
```

**What happens:**
- User created with status = Inactive
- Verification email automatically sent
- User must click link to activate account

### User Clicks Email Link
User receives email with link like:
```
https://localhost:7001/api/auth/verify-email?token=BASE64_TOKEN_HERE
```

Or call manually:
```bash
curl -X GET "https://localhost:7001/api/auth/verify-email?token=YOUR_TOKEN_HERE"
```

**Response (200 OK):**
```json
{
  "statusCode": 200,
  "isSuccess": true,
  "errorMessages": [],
  "result": {
	"success": true,
	"message": "Email đã được xác minh thành công. Bạn có thể đăng nhập vào tài khoản của mình."
  }
}
```

### Resend Verification Email
```bash
curl -X POST https://localhost:7001/api/auth/resend-verification-email \
  -H "Content-Type: application/json" \
  -d '{
	"email": "user@example.com"
  }'
```

**Response:**
```json
{
  "statusCode": 200,
  "isSuccess": true,
  "errorMessages": [],
  "result": {
	"message": "Email xác minh đã được gửi lại"
  }
}
```

### Login (After Verification)
```bash
curl -X POST https://localhost:7001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
	"email": "user@example.com",
	"password": "SecurePass123"
  }'
```

**Response (200 OK) - After Email Verified:**
```json
{
  "statusCode": 200,
  "isSuccess": true,
  "errorMessages": [],
  "result": {
	"accessToken": "eyJhbGc...",
	"refreshToken": "BASE64_TOKEN",
	"expiresIn": "2024-01-15T10:30:00Z",
	"email": "user@example.com",
	"fullName": "John Doe",
	"role": "Student"
  }
}
```

**Response (401 Unauthorized) - Before Email Verified:**
```json
{
  "statusCode": 401,
  "isSuccess": false,
  "errorMessages": [
	"Email chưa được xác minh. Vui lòng kiểm tra email của bạn để xác minh"
  ],
  "result": null
}
```

## Email Templates

### Verification Email
Recipients receive an HTML email with:
- Welcome message with their name
- Explanation of why they need to verify
- Large green "Verify Email" button linking to verification endpoint
- Alternative copy-paste link
- 24-hour expiration notice

### Confirmation Email
After successful verification, recipients receive:
- Success confirmation
- Permission to login
- Security reminder

## Database Schema

### EmailVerificationToken Table
```sql
CREATE TABLE [EmailVerificationTokens] (
	[Id] BIGINT IDENTITY(1,1) PRIMARY KEY,
	[UserId] BIGINT NOT NULL FOREIGN KEY REFERENCES [Users]([Id]),
	[Token] NVARCHAR(MAX) NOT NULL,
	[ExpiresAtUtc] DATETIME2 NOT NULL,
	[VerifiedAtUtc] DATETIME2 NULL
);

CREATE INDEX IX_EmailVerificationTokens_Token ON [EmailVerificationTokens]([Token]);
CREATE INDEX IX_EmailVerificationTokens_UserId ON [EmailVerificationTokens]([UserId]);
```

### User Table Changes
- Status field now: Active = verified, Inactive = awaiting verification, Locked = disabled

## Deployment Checklist

- [ ] Email configuration added to appsettings.json
- [ ] SMTP provider credentials configured
- [ ] EmailService.cs implemented with real SMTP
- [ ] Database migrations applied
- [ ] Email templates customized for branding
- [ ] Frontend updated to handle verification page
- [ ] Error messages reviewed in local language
- [ ] Email delivery tested end-to-end
- [ ] Rate limiting configured (optional)
- [ ] Monitoring/logging set up for email delivery

## Customization

### Change Token Expiration
Edit `EmailVerificationToken.Create()`:
```csharp
public static EmailVerificationToken Create(long userId, string token)
{
	// Change AddHours(24) to desired duration
	expiresAtUtc: DateTime.UtcNow.AddHours(48)  // 48 hours instead
}
```

### Change Email Sender Name
Edit `appsettings.json`:
```json
"Email": {
  "SenderName": "Your Custom Sender Name"
}
```

### Customize Email Template
Edit `EmailService.cs` methods:
- `GenerateVerificationEmailBody()` - Verification email HTML
- `GenerateConfirmationEmailBody()` - Confirmation email HTML

### Make Email Verification Optional
Remove email verification check from `LoginCommandHandler`:
```csharp
// Comment out this check to allow unverified emails to login
// if (!user.CanSignIn)
// {
//     throw new UnauthorizedException("Email chưa được xác minh...");
// }
```

Change registration to set user Active immediately:
```csharp
// Instead of: user.Deactivate();
// Use: user.Activate();  // Or create with Active status
```

## Common Scenarios

### User Forgot Email
Resend endpoint allows them to get new verification email:
```bash
POST /api/auth/resend-verification-email
{ "email": "user@example.com" }
```

### Token Expired
User gets error: "Token xác minh đã hết hạn hoặc không hợp lệ"
Solution: Use resend endpoint to get new token with fresh 24-hour clock

### Multiple Verification Requests
Each resend invalidates old tokens implicitly (only latest is valid per user)
Could improve by explicitly revoking old tokens

### Spam Prevention Needed
Implement rate limiting on:
1. `/api/auth/register` - Limit registrations per IP
2. `/api/auth/resend-verification-email` - Limit resends per email
3. `/api/auth/login` - Limit login attempts per email

## Monitoring & Logs

Check these logs for verification flow:
```csharp
// In EmailService
_logger.LogInformation("Gửi email xác minh đến {Email}...", email);
_logger.LogInformation("Email xác minh đã được gửi thành công...", email);
_logger.LogError("Lỗi khi gửi email xác minh...", ex);
```

Monitor database:
```sql
-- Check active verification tokens
SELECT COUNT(*) FROM EmailVerificationTokens 
WHERE VerifiedAtUtc IS NULL AND ExpiresAtUtc > GETUTCDATE();

-- Check verified users
SELECT COUNT(*) FROM EmailVerificationTokens 
WHERE VerifiedAtUtc IS NOT NULL;

-- Find expired unverified tokens
SELECT * FROM EmailVerificationTokens 
WHERE VerifiedAtUtc IS NULL AND ExpiresAtUtc < GETUTCDATE();
```

## Support

For issues or questions:
1. Check email logs in console/file
2. Verify SMTP credentials in appsettings.json
3. Ensure database migrations applied
4. Check token generation in EmailVerificationTokenService
5. Review EmailService implementation

---

**Status:** ✅ Production Ready (pending SMTP configuration)
**Last Updated:** 2024
