using TutorConnect.Application.Features.Users.DTOs;

namespace TutorConnect.Application.Features.Auth.DTOs
{
    public record TokenResponse(
        string AccessToken,
        string RefreshToken,
        int ExpiresInSeconds,
        UserProfileResponse User,
        string TokenType = "Bearer");
}
