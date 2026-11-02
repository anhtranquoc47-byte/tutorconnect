using MediatR;
using TutorConnect.Application.Common.Exceptions;
using TutorConnect.Application.Features.Users.DTOs;
using TutorConnect.Domain.Enums;
using TutorConnect.Domain.Interfaces;

namespace TutorConnect.Application.Features.Users.Commands.UpdateUserStatus
{
    public class UpdateUserStatusCommandHandler : IRequestHandler<UpdateUserStatusCommand, UserProfileResponse>
    {
        private readonly IUserRepository _userRepository;

        public UpdateUserStatusCommandHandler(IUserRepository userRepository)
        {
            _userRepository = userRepository;
        }

        public async Task<UserProfileResponse> Handle(
            UpdateUserStatusCommand request,
            CancellationToken cancellationToken)
        {
            if (request.UserId == request.ActorUserId)
            {
                throw new InvalidOperationException("Không thể tự thay đổi trạng thái của chính tài khoản đang đăng nhập");
            }

            var user = await _userRepository.GetByIdAsync(request.UserId, cancellationToken)
                ?? throw new NotFoundException("Không tìm thấy tài khoản");

            switch (request.Status)
            {
                case UserStatus.Active:
                    user.Activate();
                    break;
                case UserStatus.Locked:
                    user.Lock();
                    break;
                case UserStatus.Inactive:
                    user.Deactivate();
                    break;
                default:
                    throw new InvalidOperationException($"Trạng thái '{request.Status}' không hợp lệ");
            }

            await _userRepository.UpdateAsync(user, cancellationToken);
            await _userRepository.SaveChangesAsync(cancellationToken);

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
