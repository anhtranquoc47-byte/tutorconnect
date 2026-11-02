using MediatR;
using TutorConnect.Application.Features.Users.DTOs;

namespace TutorConnect.Application.Features.Users.Queries.GetCurrentUser
{
    /// <summary>
    /// Lấy thông tin tài khoản của người dùng hiện tại (dựa trên JWT).
    /// </summary>
    public class GetCurrentUserQuery : IRequest<UserProfileResponse>
    {
        public long UserId { get; set; }

        public GetCurrentUserQuery() { }

        public GetCurrentUserQuery(long userId)
        {
            UserId = userId;
        }
    }
}
