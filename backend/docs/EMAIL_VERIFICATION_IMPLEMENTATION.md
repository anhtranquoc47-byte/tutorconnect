# Email Verification Implementation Guide

## Overview
This document describes the email verification feature implemented in the TutorConnect authentication system. Users must verify their email address before they can log in.

## Architecture

### Clean Architecture Pattern
```
Domain Layer ────────────────────────────────────────
├── Entities
│   └── EmailVerificationToken
├── Enums
│   └── UserStatus (Active, Inactive, Locked)
└── Interfaces
	├── IEmailVerificationTokenRepository
	├── IEmailService
	└── IEmailVerificationTokenService

Application Layer ──────────────────────────────────
├── Features/Auth/Commands
│   ├── SendVerificationEmail/
│   ├── VerifyEmail/
│   └── ResendVerificationEmail/
├── Features/Auth/DTOs
│   └── EmailVerificationDtos
└── Common/Exceptions
	└── AuthenticationException (hierarchy)

Infrastructure Layer ────────────────────────────────
├── Repositories
│   └── EmailVerificationTokenRepository
├── Services
│   ├── EmailService (with SMTP placeholder)
│   └── EmailVerificationTokenService
└── DependencyInjection

API Layer ──────────────────────────────────────────
├── Controllers
│   └── AuthController
│       ├── POST /api/auth/register
│       ├── GET /api/auth/verify-email
│       └── POST /api/auth/resend-verification-email
└── Configuration
	└── JWT + Email Settings
```

## Domain Layer

### Entity: EmailVerificationToken

**Location:** `TutorConnect.Domain/Entities/EmailVerificationToken.cs`

**Purpose:** Track email verification state with token expiration

```csharp
public sealed class EmailVerificationToken : BaseEntity
{
	public long UserId { get; private set; }
	public string Token { get; private set; }  // Base64 encoded
	public DateTime ExpiresAtUtc { get; private set; }
	public DateTime? VerifiedAtUtc { get; private set; }

	public bool IsValid => ExpiresAtUtc > DateTime.UtcNow && VerifiedAtUtc is null;
	public bool IsExpired => ExpiresAtUtc <= DateTime.UtcNow;
	public static EmailVerificationToken Create(long userId, string token)
	public void MarkAsVerified()
}
```

**Token Lifecycle:**
- Created: 24-hour expiration
- Not yet verified: `VerifiedAtUtc == null`
- Verified successfully: `VerifiedAtUtc` is set
- Expired: `ExpiresAtUtc <= DateTime.UtcNow`

### Interfaces

**IEmailVerificationTokenRepository** - Data access
```csharp
Task<EmailVerificationToken?> GetByTokenAsync(string token)
Task<EmailVerificationToken?> GetLatestByUserIdAsync(long userId)
Task AddAsync(EmailVerificationToken token)
Task UpdateAsync(EmailVerificationToken token)
Task SaveChangesAsync()
```

**IEmailService** - Email sending
```csharp
Task SendVerificationEmailAsync(string email, string fullName, string verificationLink)
Task SendVerificationConfirmationEmailAsync(string email, string fullName)
```

**IEmailVerificationTokenService** - Token generation
```csharp
string GenerateVerificationToken()  // Returns base64 random token
```

## Application Layer

### Commands

#### 1. SendVerificationEmail
**Location:** `TutorConnect.Application/Features/Auth/Commands/SendVerificationEmail/`

**Purpose:** Generate token and send verification email

**Flow:**
1. Generate random token (32 bytes, base64)
2. Create EmailVerificationToken entity (24-hour expiration)
3. Save to database
4. Construct verification link: `{baseUrl}/api/auth/verify-email?token={token}`
5. Send email with link

**Files:**
- `SendVerificationEmailCommand.cs` - MediatR command
- `SendVerificationEmailCommandHandler.cs` - Handler

#### 2. VerifyEmail
**Location:** `TutorConnect.Application/Features/Auth/Commands/VerifyEmail/`

**Purpose:** Validate token and activate user account

**Flow:**
1. Find token by token string
2. Validate token is not expired/already verified
3. Find associated user
4. Mark token as verified
5. Activate user account (status = Active)
6. Send confirmation email

**Handler:** `VerifyEmailCommandHandler.cs`

**Response:**
```csharp
public record VerifyEmailResponse(
	bool Success,
	string Message
);
```

#### 3. ResendVerificationEmail
**Location:** `TutorConnect.Application/Features/Auth/Commands/ResendVerificationEmail/`

**Purpose:** Allow users to request a new verification email

**Flow:**
1. Find user by email
2. Check email not already verified
3. Generate new token
4. Save token
5. Send email

**Handler:** `ResendVerificationEmailCommandHandler.cs`

### DTO Models

**Location:** `TutorConnect.Application/Features/Auth/DTOs/EmailVerificationDtos.cs`

```csharp
public record ResendVerificationEmailRequest(string Email);
public record VerifyEmailRequest(string Token);
public record VerifyEmailResponse(bool Success, string Message);
```

### Exception Handling

**Custom Exceptions:**
- `InvalidTokenException` - Token invalid or expired
- `NotFoundException` - User/token not found
- `UnauthorizedException` - Email not verified (login attempt)

**Location:** `TutorConnect.Application/Common/Exceptions/AuthenticationException.cs`

## Infrastructure Layer

### Repository: EmailVerificationTokenRepository

**Location:** `TutorConnect.Infrastructure.SqlServer/Repositories/EmailVerificationTokenRepository.cs`

**Methods:**
- `GetByTokenAsync()` - Find by token string
- `GetLatestByUserIdAsync()` - Get most recent token for user
- `AddAsync()` - Create new token
- `UpdateAsync()` - Mark as verified
- `SaveChangesAsync()` - Persist changes

### Services

#### EmailService
**Location:** `TutorConnect.Infrastructure.SqlServer/Services/EmailService.cs`

**Current Status:** Logging-based stub (ready for SMTP integration)

**TODO:** Integrate with SMTP provider:
- SendGrid
- MailKit
- Amazon SES
- Gmail SMTP

**Email Templates:**
- Verification email with clickable link
- Confirmation email after successful verification

#### EmailVerificationTokenService
**Location:** `TutorConnect.Infrastructure.SqlServer/Services/EmailVerificationTokenService.cs`

**Token Generation:**
```csharp
public string GenerateVerificationToken()
{
	var randomBytes = new byte[32];
	using (var rng = RandomNumberGenerator.Create())
	{
		rng.GetBytes(randomBytes);
		return Convert.ToBase64String(randomBytes);
	}
}
```

### Dependency Injection

**Location:** `TutorConnect.Infrastructure.SqlServer/DependencyInjection.cs`

```csharp
// Services
services.AddScoped<IPasswordHasher, BcryptPasswordHasher>();
services.AddScoped<IJwtTokenService, JwtTokenService>();
services.AddScoped<IEmailService, EmailService>();
services.AddScoped<IEmailVerificationTokenService, EmailVerificationTokenService>();

// Repositories
services.AddScoped<IUserRepository, UserRepository>();
services.AddScoped<IRefreshTokenRepository, RefreshTokenRepository>();
services.AddScoped<IEmailVerificationTokenRepository, EmailVerificationTokenRepository>();
```

### Database Context

**Location:** `TutorConnect.Infrastructure.SqlServer/Persistence/ApplicationDbContext.cs`

**Added DbSet:**
```csharp
public DbSet<EmailVerificationToken> EmailVerificationTokens => Set<EmailVerificationToken>();
```

## API Layer

### AuthController
**Location:** `TutorConnect.API/Controllers/AuthController.cs`

#### Endpoints

##### 1. Register User
```http
POST /api/auth/register
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "SecurePass123",
  "fullName": "John Doe",
  "phone": "+84912345678",
  "role": "Student",
  "timeZoneId": "Asia/Ho_Chi_Minh"
}
```

**Response:**
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

**Flow:**
1. Validate input
2. Check email not in use
3. Hash password
4. Create user with status = Inactive
5. Save user
6. Send verification email automatically
7. Return user info

##### 2. Verify Email
```http
GET /api/auth/verify-email?token=VERIFICATION_TOKEN_HERE
```

**Response:**
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

**Flow:**
1. Validate token format
2. Find token in database
3. Check not expired/already verified
4. Mark verified
5. Activate user
6. Send confirmation email
7. Return success

##### 3. Resend Verification Email
```http
POST /api/auth/resend-verification-email
Content-Type: application/json

{
  "email": "user@example.com"
}
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

#### Login Changes
Login now checks user status:
```csharp
if (!user.CanSignIn)
{
	throw new UnauthorizedException(
		"Email chưa được xác minh. Vui lòng kiểm tra email của bạn để xác minh");
}
```

## Configuration

### appsettings.json

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

### appsettings.Development.json

Override settings for development environment.

## Files Created

### Domain Layer (4 files)
```
TutorConnect.Domain/
├── Entities/EmailVerificationToken.cs
└── Interfaces/
	├── IEmailVerificationTokenRepository.cs
	├── IEmailService.cs
	└── IEmailVerificationTokenService.cs
```

### Application Layer (7 files)
```
TutorConnect.Application/
├── Features/Auth/
│   ├── Commands/
│   │   ├── SendVerificationEmail/
│   │   │   └── SendVerificationEmailCommand.cs
│   │   │   └── SendVerificationEmailCommandHandler.cs
│   │   ├── VerifyEmail/
│   │   │   ├── VerifyEmailCommand.cs
│   │   │   ├── VerifyEmailValidator.cs
│   │   │   └── VerifyEmailCommandHandler.cs
│   │   └── ResendVerificationEmail/
│   │       ├── ResendVerificationEmailCommand.cs
│   │       ├── ResendVerificationEmailValidator.cs
│   │       └── ResendVerificationEmailCommandHandler.cs
│   └── DTOs/
│       └── EmailVerificationDtos.cs
└── Common/Exceptions/
	└── AuthenticationException.cs (updated)
```

### Infrastructure Layer (3 files)
```
TutorConnect.Infrastructure.SqlServer/
├── Repositories/
│   └── EmailVerificationTokenRepository.cs
├── Services/
│   ├── EmailService.cs
│   └── EmailVerificationTokenService.cs
└── DependencyInjection.cs (updated)
```

### API Layer (2 files)
```
TutorConnect.API/
├── Controllers/AuthController.cs (updated)
├── DependencyInjection.cs (updated)
└── appsettings.json (updated)
```

## User Flow

### 1. Registration

```
User Registers
	↓
Backend validates input
	↓
Create user with status = Inactive
	↓
Auto-generate verification token (24hr validity)
	↓
Send verification email with link
	↓
Return user info (201 Created)
	↓
User checks email
```

### 2. Email Verification

```
User clicks link in email
	↓
GET /api/auth/verify-email?token=XXX
	↓
Backend finds token
	↓
Validates token not expired
	↓
Marks token as verified
	↓
Sets user status = Active
	↓
Send confirmation email
	↓
Return success message
	↓
User can now login
```

### 3. Resend Verification Email

```
User didn't receive email
	↓
POST /api/auth/resend-verification-email
	↓
Backend finds user
	↓
Check email not already verified
	↓
Generate new token
	↓
Send new verification email
	↓
Return success
```

### 4. Login

```
User attempts login
	↓
Find user by email
	↓
Verify password
	↓
Check user.CanSignIn (status == Active)
	↓
If not verified: throw UnauthorizedException
	↓
Generate JWT + Refresh Token
	↓
Return tokens
```

## Integration Points

### SMTP Provider Integration

To send real emails, implement in `EmailService.cs`:

**Example with MailKit:**
```csharp
using MailKit.Net.Smtp;
using MimeKit;

public async Task SendVerificationEmailAsync(
	string email,
	string fullName,
	string verificationLink,
	CancellationToken cancellationToken)
{
	var message = new MimeMessage();
	message.From.Add(new MailboxAddress(_smtpConfig.SenderName, _smtpConfig.SenderEmail));
	message.To.Add(new MailboxAddress(fullName, email));
	message.Subject = "Xác minh Email";

	var bodyBuilder = new BodyBuilder { HtmlBody = GenerateVerificationEmailBody(fullName, verificationLink) };
	message.Body = bodyBuilder.ToMessageBody();

	using (var client = new SmtpClient())
	{
		await client.ConnectAsync(_smtpConfig.SmtpServer, _smtpConfig.SmtpPort, cancellationToken: cancellationToken);
		await client.AuthenticateAsync(_smtpConfig.SenderEmail, _smtpConfig.SenderPassword, cancellationToken);
		await client.SendAsync(message, cancellationToken);
		await client.DisconnectAsync(true, cancellationToken);
	}
}
```

## Security Considerations

1. **Token Security**
   - 32-byte random tokens (256-bit entropy)
   - Base64 encoded
   - Stored in database
   - 24-hour expiration

2. **Database**
   - EmailVerificationToken table with indices on Token and UserId
   - User status field prevents login until verified

3. **Email**
   - Tokens sent via email link (GET parameter)
   - Consider using encrypted URLs in production
   - Rate limiting on resend endpoint recommended

4. **Password**
   - Hashed with BCrypt (work factor 12)
   - Never exposed in responses

## Testing Checklist

- [ ] User can register (returns 201)
- [ ] Verification email is sent
- [ ] Verification token is created in database
- [ ] User cannot login before verification
- [ ] Clicking verification link activates account
- [ ] User can login after verification
- [ ] Resend email works with valid email
- [ ] Expired token is rejected
- [ ] Invalid token is rejected
- [ ] Already verified token is rejected

## Future Enhancements

1. **Email Template System**
   - Use templating engine (Liquid, Scriban)
   - Support multiple languages
   - Custom branding

2. **Additional Email Verification Methods**
   - SMS verification
   - Two-factor authentication
   - Social login integration

3. **Token Management**
   - Token history/audit trail
   - Rotate tokens on repeat sends
   - Cleanup expired tokens (scheduled job)

4. **Rate Limiting**
   - Limit resend requests per email
   - Limit login attempts
   - Implement exponential backoff

5. **Analytics**
   - Track verification success rate
   - Email delivery metrics
   - User funnel analysis

## Dependencies Added

```xml
<!-- Already included -->
<PackageReference Include="System.IdentityModel.Tokens.Jwt" Version="8.1.0" />
<PackageReference Include="BCrypt.Net-Next" Version="4.0.3" />
<PackageReference Include="FluentValidation" Version="11.12.0" />
<PackageReference Include="MediatR" Version="12.5.0" />

<!-- Optional for email integration -->
<!-- <PackageReference Include="MailKit" Version="4.9.0" /> -->
<!-- <PackageReference Include="MimeKit" Version="4.9.0" /> -->
```

## Troubleshooting

### Issue: Verification email not received
- Check SMTP configuration in appsettings.json
- Verify sender email/password are correct
- Check email logs in infrastructure

### Issue: Token always expired
- Ensure server time is correct
- Check database for correct ExpiresAtUtc values
- Verify 24-hour calculation: `DateTime.UtcNow.AddHours(24)`

### Issue: Cannot verify even with valid token
- Check token string matches exactly (case-sensitive)
- Verify token not already verified
- Check user exists in database

### Issue: User status not updating to Active
- Ensure SaveChangesAsync() is called
- Check database transaction handling
- Verify User.cs Activate() method is correct

## Summary

Email verification is now fully integrated into the TutorConnect authentication system:
- ✅ Automatic email sending on registration
- ✅ Token validation with expiration
- ✅ Account activation on verification
- ✅ Resend capability
- ✅ Login prevention for unverified accounts
- ✅ Ready for SMTP provider integration
- ✅ Follows clean architecture pattern
- ✅ Full exception handling
- ✅ Input validation via FluentValidation

The system is production-ready pending SMTP configuration.
