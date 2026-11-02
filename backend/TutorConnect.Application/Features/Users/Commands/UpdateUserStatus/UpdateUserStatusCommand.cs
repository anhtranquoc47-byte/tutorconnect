using MediatR;
using TutorConnect.Application.Features.Users.DTOs;
using TutorConnect.Domain.Enums;

namespace TutorConnect.Application.Features.Users.Commands.UpdateUserStatus
{
    /// <summary>
    /// Admin cập nhật trạng thái (Active/Locked/Inactive) của một tài khoản.
    /// </summary>
    public class UpdateUserStatusCommand : IRequest<UserProfileResponse>
    {
        public long UserId { get; set; }

        public UserStatus Status { get; set; }

        /// <summary>
        /// Id của Admin đang thực hiện thao tác - dùng để chặn việc tự khóa/tự vô hiệu hóa
        /// chính tài khoản đang đăng nhập.
        /// </summary>
        public long ActorUserId { get; set; }

        public UpdateUserStatusCommand() { }

        public UpdateUserStatusCommand(long userId, UpdateUserStatusRequest request, long actorUserId)
        {
            UserId = userId;
            Status = request.Status;
            ActorUserId = actorUserId;
        }
    }
}
