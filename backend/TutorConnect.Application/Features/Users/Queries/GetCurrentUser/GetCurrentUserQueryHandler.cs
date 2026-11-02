using MediatR;
using TutorConnect.Application.Common.Exceptions;
using TutorConnect.Application.Features.Users.DTOs;
using TutorConnect.Domain.Interfaces;

namespace TutorConnect.Application.Features.Users.Queries.GetCurrentUser
{
    public class GetCurrentUserQueryHandler : IRequestHandler<GetCurrentUserQuery, UserProfileResponse>
    {
        private readonly IUserRepository _userRepository;

        public GetCurrentUserQueryHandler(IUserRepository userRepository)
        {
            _userRepository = userRepository;
        }

        public async Task<UserProfileResponse> Handle(
            GetCurrentUserQuery request,
            CancellationToken cancellationToken)
        {
            var user = await _userRepository.GetByIdAsync(request.UserId, cancellationToken)
                ?? throw new NotFoundException("Không tìm thấy tài khoản");

            return new UserProfileResponse(
                user.Id,
                user.Email,
                user.FullName,
                user.Phone,
                user.Role,
                user.Status,
                user.TimeZoneId);
        }
    }
}
