using MediatR;
using TutorConnect.Application.Features.Users.DTOs;

namespace TutorConnect.Application.Features.Users.Commands.UpdateCurrentUser
{
    /// <summary>
    /// Cập nhật thông tin tài khoản của chính người dùng hiện tại.
    /// </summary>
    public class UpdateCurrentUserCommand : IRequest<UserProfileResponse>
    {
        public long UserId { get; set; }

        public string FullName { get; set; } = null!;

        public string? Phone { get; set; }

        public string TimeZoneId { get; set; } = null!;

        public UpdateCurrentUserCommand() { }

        public UpdateCurrentUserCommand(long userId, UpdateMeRequest request)
        {
            UserId = userId;
            FullName = request.FullName;
            Phone = request.Phone;
            TimeZoneId = request.TimeZoneId;
        }
    }
}
