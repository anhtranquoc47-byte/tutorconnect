using MediatR;
using TutorConnect.Application.Common.Exceptions;
using TutorConnect.Application.Features.Users.DTOs;
using TutorConnect.Domain.Interfaces;

namespace TutorConnect.Application.Features.Users.Commands.UpdateCurrentUser
{
    public class UpdateCurrentUserCommandHandler : IRequestHandler<UpdateCurrentUserCommand, UserProfileResponse>
    {
        private readonly IUserRepository _userRepository;

        public UpdateCurrentUserCommandHandler(IUserRepository userRepository)
        {
            _userRepository = userRepository;
        }

        public async Task<UserProfileResponse> Handle(
            UpdateCurrentUserCommand request,
            CancellationToken cancellationToken)
        {
            var user = await _userRepository.GetByIdAsync(request.UserId, cancellationToken)
                ?? throw new NotFoundException("Không tìm thấy tài khoản");

            user.UpdateProfile(request.FullName, request.Phone, request.TimeZoneId);

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
