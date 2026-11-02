
using TutorConnect.Domain.Enums;

namespace TutorConnect.Application.Features.Users.DTOs
{
    public record IdNameResponse(
        long Id,
        string Name);

    public record UserLiteResponse(
        long Id,
        string FullName,
        UserRole Role);

    public record UserProfileResponse(
        long Id,
        string Email,
        string FullName,
        string? Phone,
        UserRole Role,
        UserStatus Status,
        string TimeZoneId);

    public record UpdateMeRequest(
        string FullName,
        string? Phone,
        string TimeZoneId);

    public record UpdateUserStatusRequest(
        UserStatus Status);
            public record SendSmsRequest(string Message);

    public record RiskViolationRuleDto(
        string Code,
        string Label,
        string Details);

    public record RiskWatchitemDto(
        string Id,
        long UserId,
        string UserName,
        string UserEmail,
        string UserPhone,
        string UserRole,
        string Severity,
        List<RiskViolationRuleDto> Violations,
        UserStatus UserStatus,
        DateTime DetectedAtUtc);
}
