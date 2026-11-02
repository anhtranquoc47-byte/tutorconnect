# TutorConnect Authentication Guide

## Overview

This guide covers the complete authentication system for TutorConnect, including:
- **User Registration & Email Verification** - Secure email-based account activation
- **Login & JWT Tokens** - Stateless, token-based authentication with refresh tokens
- **Password Reset** - Secure password recovery workflow

All flows follow security best practices including token expiration, one-time use tokens, and email confirmation.

---

## Table of Contents

1. [Architecture](#architecture)
2. [Email Verification Flow](#email-verification-flow)
3. [Login & JWT Authentication](#login--jwt-authentication)
4. [Password Reset Flow](#password-reset-flow)
5. [API Endpoints](#api-endpoints)
6. [Security Considerations](#security-considerations)
7. [Database Schema](#database-schema)
8. [Configuration](#configuration)

---

## Architecture

### Layered Design

The authentication system follows a **Clean Architecture** pattern:

```
API Layer (Controllers)
	↓
Application Layer (Commands/Handlers, DTOs, Validators)
	↓
Domain Layer (Entities, Interfaces, Business Rules)
	↓
Infrastructure Layer (Repositories, Services, Database)
```

### Key Components

- **Domain Entities**: `User`, `RefreshToken`, `EmailVerificationToken`, `PasswordResetToken`
- **Domain Interfaces**: `IUserRepository`, `IJwtTokenService`, `IPasswordHasher`, `IEmailService`, etc.
- **Application Commands**: `Register`, `Login`, `VerifyEmail`, `ForgotPassword`, `ResetPassword`
- **Infrastructure Services**: `JwtTokenService`, `BcryptPasswordHasher`, `EmailService`

---

## Email Verification Flow

### Process Overview

```
User Registration
	↓
Create Inactive User (Status: Inactive)
	↓
Generate Email Verification Token (24-hour expiry)
	↓
Send Verification Email with Link
	↓
User Clicks Verification Link
	↓
Activate User Account (Status: Active)
	↓
Ready to Login
```

### Implementation Details

#### 1. Domain Entity: EmailVerificationToken

```csharp
public sealed class EmailVerificationToken : BaseEntity
{
	public long UserId { get; private set; }
	public string Token { get; private set; }           // Base64 encoded random bytes
	public DateTime ExpiresAtUtc { get; private set; }  // 24-hour expiry
	public DateTime? VerifiedAtUtc { get; private set; } // When token was used

	public bool IsValid => ExpiresAtUtc > DateTime.UtcNow && VerifiedAtUtc is null;
	public bool IsExpired => ExpiresAtUtc <= DateTime.UtcNow;
	public bool IsUsed => VerifiedAtUtc is not null;

	public void MarkAsVerified() => VerifiedAtUtc ??= DateTime.UtcNow;
}
```

#### 2. Registration Command Handler Flow

When a user registers:

1. **Create Inactive User** - User created with `Status = UserStatus.Inactive`
2. **Generate Token** - Random 32-byte token (Base64 encoded)
3. **Save Token** - Store in database with 24-hour expiration
4. **Send Email** - HTML email with verification link
5. **Return Response** - 201 Created with success message

```csharp
// RegisterCommandHandler
var user = User.Create(...);
user.Deactivate(); // Status = Inactive
await _userRepository.AddAsync(user);

var verificationToken = EmailVerificationToken.Create(user.Id, tokenString);
await _emailVerificationTokenRepository.AddAsync(verificationToken);

await _emailService.SendVerificationEmailAsync(
	user.Email, user.FullName, verificationLink);
```

#### 3. Email Verification Handler

When user clicks verification link:

1. **Validate Token** - Check existence, expiration, and usage status
2. **Activate User** - Update user status to `Active`
3. **Mark Token Used** - Set `VerifiedAtUtc` to prevent reuse
4. **Confirm Email** - Send confirmation email to user

```csharp
// VerifyEmailCommandHandler
var token = await _emailVerificationTokenRepository.GetByTokenAsync(request.Token);
if (!token.IsValid) throw new UnauthorizedException("Token invalid or expired");

var user = await _userRepository.GetByIdAsync(token.UserId);
user.Activate(); // Status = Active
token.MarkAsVerified();

await _userRepository.UpdateAsync(user);
await _emailVerificationTokenRepository.SaveChangesAsync();
```

#### 4. Resend Verification Email

Users can request a new verification email:

1. **Find User by Email** - Verify email exists
2. **Check Status** - Must not be Active (already verified)
3. **Create New Token** - Previous token remains but unused
4. **Send Email** - New verification link
5. **Return Success** - 200 OK

---

## Login & JWT Authentication

### JWT Token Structure

#### Access Token (Short-lived, ~15 minutes)

```
Header: {
  "alg": "HS256",
  "typ": "JWT"
}
Payload: {
  "sub": "123",              // User ID
  "email": "user@example.com",
  "role": "Student",
  "iat": 1704067200,        // Issued at
  "exp": 1704068100         // Expires in 15 minutes
}
Signature: HMAC-SHA256
```

#### Refresh Token

```
{
  "id": 1,
  "userId": 123,
  "tokenHash": "bcrypt_hashed_value",  // Never store plain token
  "expiresAtUtc": "2025-01-01T00:00:00Z",  // 30 days
  "revokedAtUtc": null,
  "createdAtUtc": "2024-12-01T00:00:00Z"
}
```

### Login Flow

```
User Submits Email + Password
	↓
Find User by Email
	↓
Verify Password (BCrypt)
	↓
Check User Status (Must be Active)
	↓
Generate Access Token (JWT, 15 min)
	↓
Generate & Hash Refresh Token
	↓
Save Refresh Token to Database
	↓
Return Access Token + Refresh Token
```

### JWT Configuration

```json
{
  "Jwt": {
	"SecretKey": "your-very-long-secret-key-min-32-chars",
	"Issuer": "TutorConnect.API",
	"Audience": "TutorConnect.Client",
	"ExpirationMinutes": 15
  }
}
```

### Token Refresh Flow

When access token expires:

```
Client Sends Refresh Token
	↓
Validate Refresh Token
	↓
Check Not Revoked & Not Expired
	↓
Generate New Access Token
	↓
(Optional) Rotate Refresh Token
	↓
Return New Access Token
```

---

## Password Reset Flow

### Process Overview

```
User Requests Password Reset (Forgot Password)
	↓
Find User by Email (No error if not found - security)
	↓
Check Email Verified (Only verified users)
	↓
Generate Reset Token (Base64, 1-hour expiry)
	↓
Save Token to Database
	↓
Send Reset Email with Link
	↓
User Receives Email & Clicks Link
	↓
(Optional) Client Validates Token
	↓
User Enters New Password
	↓
Reset Password Handler Validates Token
	↓
Hash & Update Password
	↓
Revoke All Refresh Tokens (Force re-login all devices)
	↓
Mark Reset Token as Used
	↓
Send Confirmation Email
```

### Implementation Details

#### 1. Domain Entity: PasswordResetToken

```csharp
public sealed class PasswordResetToken : BaseEntity
{
	public long UserId { get; private set; }
	public string Token { get; private set; }          // Base64 encoded
	public DateTime ExpiresAtUtc { get; private set; } // 1-hour expiry
	public DateTime? UsedAtUtc { get; private set; }   // When password was reset

	public bool IsValid => ExpiresAtUtc > DateTime.UtcNow && UsedAtUtc is null;
	public bool IsExpired => ExpiresAtUtc <= DateTime.UtcNow;
	public bool IsUsed => UsedAtUtc is not null;

	public void MarkAsUsed() => UsedAtUtc ??= DateTime.UtcNow;
}
```

#### 2. ForgotPassword Handler

```csharp
// ForgotPasswordCommandHandler
var user = await _userRepository.GetByEmailAsync(request.Email);
if (user == null) return Unit.Value; // No error for security

if (!user.CanSignIn)
	throw new UnauthorizedException("Email not verified");

var token = _tokenService.GenerateVerificationToken();
var resetToken = PasswordResetToken.Create(user.Id, token);
await _passwordResetTokenRepository.AddAsync(resetToken);

var resetLink = $"{request.BaseUrl}/reset-password?token={token}";
await _emailService.SendPasswordResetEmailAsync(
	user.Email, user.FullName, resetLink);
```

#### 3. ValidateResetToken Handler (Optional)

Frontend can pre-validate token without consuming it:

```csharp
// ValidateResetTokenCommandHandler
var token = await _passwordResetTokenRepository.GetByTokenAsync(request.Token);
if (!token.IsValid) return ValidateResetTokenResponse(false, "Token invalid");
return ValidateResetTokenResponse(true, "Token valid");
```

#### 4. ResetPassword Handler

```csharp
// ResetPasswordCommandHandler
var resetToken = await _passwordResetTokenRepository.GetByTokenAsync(request.Token);
if (!resetToken.IsValid) throw new UnauthorizedException("Token invalid or expired");

var user = await _userRepository.GetByIdAsync(resetToken.UserId);

// Hash new password
var passwordHash = _passwordHasher.Hash(request.NewPassword);

// UpdatePassword revokes all refresh tokens (forces re-login)
user.UpdatePassword(passwordHash);

await _userRepository.UpdateAsync(user);
resetToken.MarkAsUsed();
await _passwordResetTokenRepository.UpdateAsync(resetToken);

// Send confirmation email
await _emailService.SendPasswordChangedConfirmationEmailAsync(
	user.Email, user.FullName);
```

---

## API Endpoints

### Registration & Verification

#### POST /api/auth/register
**Register new user account**

Request:
```json
{
  "email": "user@example.com",
  "password": "SecureP@ss123",
  "fullName": "John Doe",
  "role": "Student",
  "timeZoneId": "Asia/Ho_Chi_Minh",
  "phone": "0901234567"
}
```

Response: `201 Created`
```json
{
  "userId": 123,
  "email": "user@example.com",
  "fullName": "John Doe",
  "message": "Registration successful. Please verify your email."
}
```

Errors:
- `400 Bad Request` - Validation failed (weak password, invalid email)
- `409 Conflict` - Email already registered

---

#### GET /api/auth/verify-email?token=...
**Verify email with token from email link**

Response: `200 OK`
```json
{
  "success": true,
  "message": "Email verified successfully"
}
```

Errors:
- `400 Bad Request` - Token missing
- `401 Unauthorized` - Token expired or invalid

---

#### POST /api/auth/resend-verification-email
**Request new verification email**

Request:
```json
{
  "email": "user@example.com"
}
```

Response: `200 OK`
```json
{
  "message": "Verification email resent (if account exists)"
}
```

---

### Login & Tokens

#### POST /api/auth/login
**Login with email and password**

Request:
```json
{
  "email": "user@example.com",
  "password": "SecureP@ss123"
}
```

Response: `200 OK`
```json
{
  "accessToken": "eyJhbGc...",
  "refreshToken": "uuid-token-string",
  "expiresIn": 900,
  "user": {
	"id": 123,
	"email": "user@example.com",
	"fullName": "John Doe",
	"role": "Student"
  }
}
```

Errors:
- `400 Bad Request` - Validation failed
- `401 Unauthorized` - Invalid credentials or email not verified

---

#### POST /api/auth/refresh-token
**Get new access token using refresh token**

Request:
```json
{
  "refreshToken": "uuid-token-string"
}
```

Response: `200 OK`
```json
{
  "accessToken": "eyJhbGc...",
  "expiresIn": 900
}
```

Errors:
- `401 Unauthorized` - Refresh token invalid or expired

---

#### POST /api/auth/logout
**Logout and revoke refresh token**

Request:
```json
{
  "refreshToken": "uuid-token-string"
}
```

Response: `200 OK`
```json
{
  "message": "Logged out successfully"
}
```

---

### Password Reset

#### POST /api/auth/forgot-password
**Request password reset**

Request:
```json
{
  "email": "user@example.com"
}
```

Response: `200 OK`
```json
{
  "message": "If email exists, reset link will be sent"
}
```

**Security Note**: Always returns 200 OK regardless of whether email exists, preventing email enumeration attacks.

---

#### POST /api/auth/validate-reset-token
**Validate password reset token (optional frontend pre-check)**

Request:
```json
{
  "token": "base64-encoded-token"
}
```

Response: `200 OK`
```json
{
  "isValid": true,
  "message": "Token valid"
}
```

or

```json
{
  "isValid": false,
  "message": "Token expired"
}
```

---

#### POST /api/auth/reset-password
**Reset password with valid token**

Request:
```json
{
  "token": "base64-encoded-token",
  "newPassword": "NewSecureP@ss123",
  "confirmPassword": "NewSecureP@ss123"
}
```

Response: `200 OK`
```json
{
  "message": "Password reset successfully"
}
```

Errors:
- `400 Bad Request` - Validation failed (weak password, mismatch)
- `401 Unauthorized` - Token invalid or expired

---

## Security Considerations

### Password Security

1. **Hashing Algorithm**: BCrypt with salt
   - Never store plain passwords
   - Uses adaptive work factor (currently 10)
   - Salt generated per password

2. **Password Requirements**
   ```
   - Minimum 8 characters
   - At least one uppercase letter (A-Z)
   - At least one lowercase letter (a-z)
   - At least one digit (0-9)
   - At least one special character (!@#$%^&*)
   ```

3. **Password Reset Security**
   - Tokens have 1-hour expiration
   - Tokens are single-use (marked as used after reset)
   - All refresh tokens revoked after password change
   - Forces re-login on all devices for account takeover prevention

### Token Security

1. **JWT Access Tokens**
   - Short lifetime (15 minutes)
   - Signed with HS256 (HMAC-SHA256)
   - Contains user ID, email, and role claims
   - Stored in secure HTTP-only cookies (recommended) or localStorage

2. **Refresh Tokens**
   - Long lifetime (30 days)
   - Stored in database with hashed values
   - Can be revoked (revocation persists in DB)
   - One per user per device (rotated on use)
   - Also revoked when password is reset

3. **Token Transmission**
   ```
   Authorization: Bearer <access_token>
   ```
   - Use HTTPS only
   - Never log tokens
   - Implement token rotation for refresh tokens

### Email Verification Security

1. **Token Generation**
   - Cryptographically random (32 bytes)
   - Base64 encoded for URL safety
   - Database stores full token (not hashed, only used once)

2. **Token Expiration**
   - Email verification tokens: 24 hours
   - Password reset tokens: 1 hour
   - Shorter for sensitive operations

3. **One-Time Use**
   - Each token can only verify/reset once
   - Attempt to reuse is rejected
   - Prevents token replay attacks

### User Status Management

```csharp
public enum UserStatus
{
	Active = 1,      // Can login and perform operations
	Inactive = 2,    // Cannot login until email verified
	Locked = 3       // Account locked due to security issue
}
```

- **New registrations**: Created as `Inactive`
- **After verification**: Status changed to `Active`
- **Failed login attempts**: Can trigger `Locked` status
- **Password reset**: Doesn't affect status, but revokes all sessions

### CORS & API Security

Configure CORS for frontend domains:

```csharp
services.AddCors(options =>
{
	options.AddPolicy("AllowFrontend", builder =>
	{
		builder.WithOrigins("https://tutorconnect.example.com")
			   .AllowAnyMethod()
			   .AllowAnyHeader()
			   .AllowCredentials();
	});
});
```

### Rate Limiting (Recommended)

Implement rate limiting for auth endpoints:

```csharp
// Protect against brute force
POST /api/auth/login - 5 attempts per 15 minutes per IP
POST /api/auth/forgot-password - 3 attempts per hour per email
POST /api/auth/reset-password - 5 attempts per hour per token
```

---

## Database Schema

### Users Table

```sql
CREATE TABLE [dbo].[Users] (
	[Id] BIGINT PRIMARY KEY IDENTITY(1,1),
	[Email] NVARCHAR(255) NOT NULL UNIQUE,
	[PasswordHash] NVARCHAR(MAX) NOT NULL,
	[FullName] NVARCHAR(255) NOT NULL,
	[Phone] NVARCHAR(20),
	[Role] INT NOT NULL,           -- 0=Student, 1=Tutor, 2=Admin
	[Status] INT NOT NULL,         -- 1=Active, 2=Inactive, 3=Locked
	[TimeZoneId] NVARCHAR(50) NOT NULL,
	[CreatedAtUtc] DATETIME2 NOT NULL DEFAULT GETUTCDATE(),
	[UpdatedAtUtc] DATETIME2 NOT NULL DEFAULT GETUTCDATE()
)
```

### RefreshTokens Table

```sql
CREATE TABLE [dbo].[RefreshTokens] (
	[Id] BIGINT PRIMARY KEY IDENTITY(1,1),
	[UserId] BIGINT NOT NULL FOREIGN KEY REFERENCES [Users](Id),
	[TokenHash] NVARCHAR(MAX) NOT NULL,
	[ExpiresAtUtc] DATETIME2 NOT NULL,
	[RevokedAtUtc] DATETIME2,
	[CreatedAtUtc] DATETIME2 NOT NULL DEFAULT GETUTCDATE(),
	[UpdatedAtUtc] DATETIME2 NOT NULL DEFAULT GETUTCDATE()
)
CREATE INDEX IDX_RefreshToken_UserId ON [RefreshTokens]([UserId])
CREATE INDEX IDX_RefreshToken_ExpiresAt ON [RefreshTokens]([ExpiresAtUtc])
```

### EmailVerificationTokens Table

```sql
CREATE TABLE [dbo].[EmailVerificationTokens] (
	[Id] BIGINT PRIMARY KEY IDENTITY(1,1),
	[UserId] BIGINT NOT NULL FOREIGN KEY REFERENCES [Users](Id),
	[Token] NVARCHAR(MAX) NOT NULL,
	[ExpiresAtUtc] DATETIME2 NOT NULL,
	[VerifiedAtUtc] DATETIME2,
	[CreatedAtUtc] DATETIME2 NOT NULL DEFAULT GETUTCDATE(),
	[UpdatedAtUtc] DATETIME2 NOT NULL DEFAULT GETUTCDATE()
)
CREATE INDEX IDX_EmailVerificationToken_UserId ON [EmailVerificationTokens]([UserId])
CREATE INDEX IDX_EmailVerificationToken_Token ON [EmailVerificationTokens]([Token])
```

### PasswordResetTokens Table

```sql
CREATE TABLE [dbo].[PasswordResetTokens] (
	[Id] BIGINT PRIMARY KEY IDENTITY(1,1),
	[UserId] BIGINT NOT NULL FOREIGN KEY REFERENCES [Users](Id),
	[Token] NVARCHAR(MAX) NOT NULL,
	[ExpiresAtUtc] DATETIME2 NOT NULL,
	[UsedAtUtc] DATETIME2,
	[CreatedAtUtc] DATETIME2 NOT NULL DEFAULT GETUTCDATE(),
	[UpdatedAtUtc] DATETIME2 NOT NULL DEFAULT GETUTCDATE()
)
CREATE INDEX IDX_PasswordResetToken_UserId ON [PasswordResetTokens]([UserId])
CREATE INDEX IDX_PasswordResetToken_Token ON [PasswordResetTokens]([Token])
```

---

## Configuration

### appsettings.json

```json
{
  "ConnectionStrings": {
	"DefaultConnection": "Server=.;Database=TutorConnectDb;Trusted_Connection=true;TrustServerCertificate=true;"
  },
  "Jwt": {
	"SecretKey": "your-very-long-secret-key-minimum-32-characters-required",
	"Issuer": "TutorConnect.API",
	"Audience": "TutorConnect.Client",
	"ExpirationMinutes": 15
  },
  "EmailConfig": {
	"SmtpServer": "smtp.gmail.com",
	"Port": 587,
	"SenderEmail": "noreply@tutorconnect.example.com",
	"SenderName": "TutorConnect",
	"UserName": "your-email@gmail.com",
	"Password": "your-app-password",
	"EnableSSL": true,
	"EmailVerificationTokenExpiryHours": 24,
	"PasswordResetTokenExpiryHours": 1
  },
  "Logging": {
	"LogLevel": {
	  "Default": "Information",
	  "Microsoft": "Warning",
	  "TutorConnect": "Debug"
	}
  }
}
```

### Program.cs Registration

```csharp
// Add JWT Authentication
services.AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
	.AddJwtBearer(options =>
	{
		var jwtSettings = configuration.GetSection("Jwt");
		var secretKey = Encoding.ASCII.GetBytes(jwtSettings["SecretKey"]!);

		options.TokenValidationParameters = new TokenValidationParameters
		{
			ValidateIssuerSigningKey = true,
			IssuerSigningKey = new SymmetricSecurityKey(secretKey),
			ValidateIssuer = true,
			ValidIssuer = jwtSettings["Issuer"],
			ValidateAudience = true,
			ValidAudience = jwtSettings["Audience"],
			ValidateLifetime = true,
			ClockSkew = TimeSpan.Zero
		};
	});

// Add Infrastructure Services
services.AddInfrastructureSqlServer(configuration);

// Add Application Services (MediatR, FluentValidation)
services.AddApplication();

// Add Controllers
services.AddControllers();
```

---

## Testing

### Unit Tests - Command Handlers

```csharp
[Fact]
public async Task RegisterCommand_WithValidData_CreatesInactiveUser()
{
	// Arrange
	var request = new RegisterRequest 
	{ 
		Email = "test@example.com",
		Password = "SecureP@ss123",
		FullName = "Test User"
	};
	var command = new RegisterCommand(request) { BaseUrl = "https://localhost" };

	// Act
	var response = await _handler.Handle(command, CancellationToken.None);

	// Assert
	response.Should().NotBeNull();
	var user = await _userRepository.GetByEmailAsync("test@example.com");
	user!.Status.Should().Be(UserStatus.Inactive);
}

[Fact]
public async Task ResetPasswordCommand_WithValidToken_UpdatesPasswordAndRevokesTokens()
{
	// Arrange
	var user = User.Create("test@example.com", "hash", "Test", UserRole.Student, "UTC");
	var resetToken = PasswordResetToken.Create(user.Id, "token123");
	var request = new ResetPasswordRequest 
	{ 
		Token = "token123",
		NewPassword = "NewSecureP@ss123",
		ConfirmPassword = "NewSecureP@ss123"
	};

	// Act
	await _handler.Handle(new ResetPasswordCommand(request), CancellationToken.None);

	// Assert
	var updatedUser = await _userRepository.GetByIdAsync(user.Id);
	updatedUser!.RefreshTokens.Should().AllSatisfy(t => t.IsRevoked.Should().BeTrue());
}
```

### Integration Tests - API Endpoints

```csharp
[Fact]
public async Task RegisterEndpoint_ReturnsCreated_WithValidRequest()
{
	// Arrange
	var request = new RegisterRequest { ... };

	// Act
	var response = await _httpClient.PostAsJsonAsync("/api/auth/register", request);

	// Assert
	response.StatusCode.Should().Be(HttpStatusCode.Created);
}

[Fact]
public async Task ResetPasswordEndpoint_ReturnsOk_WithValidToken()
{
	// Arrange
	var resetRequest = new ResetPasswordRequest { ... };

	// Act
	var response = await _httpClient.PostAsJsonAsync("/api/auth/reset-password", resetRequest);

	// Assert
	response.StatusCode.Should().Be(HttpStatusCode.OK);
}
```

---

## Common Issues & Solutions

### Issue: "Email not verified" error on login
**Solution**: User must click verification link in email first. Use `/api/auth/resend-verification-email` if email missing.

### Issue: "Token expired" on password reset
**Solution**: Password reset tokens expire in 1 hour. User should request new reset link.

### Issue: JWT token claims missing
**Solution**: Ensure `JwtTokenService.GenerateAccessToken()` includes all required claims before returning to client.

### Issue: Refresh token doesn't work after password reset
**Solution**: This is intentional - password reset revokes all refresh tokens for security. User must login again.

---

## Future Enhancements

1. **Two-Factor Authentication (2FA)** - Add TOTP/SMS verification
2. **Social Login** - Google, GitHub, Facebook integration
3. **OAuth2/OpenID Connect** - For third-party integrations
4. **Rate Limiting** - Prevent brute force attacks
5. **Account Lockout** - After X failed attempts
6. **Session Management** - Track active sessions per device
7. **Audit Logging** - Log all auth-related operations
8. **API Key Management** - For service-to-service authentication

---

## References

- [JWT Best Practices (RFC 8725)](https://tools.ietf.org/html/rfc8725)
- [OWASP Authentication Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/Authentication_Cheat_Sheet.html)
- [ASP.NET Core Security Documentation](https://learn.microsoft.com/en-us/aspnet/core/security/)
