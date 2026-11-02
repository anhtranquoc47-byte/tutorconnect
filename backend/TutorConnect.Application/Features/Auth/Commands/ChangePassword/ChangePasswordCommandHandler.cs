using MediatR;
using TutorConnect.Application.Common.Exceptions;
using TutorConnect.Domain.Interfaces;

namespace TutorConnect.Application.Features.Auth.Commands.ChangePassword
{
    public class ChangePasswordCommandHandler : IRequestHandler<ChangePasswordCommand, Unit>
    {
        private readonly IUserRepository _userRepository;
        private readonly IPasswordHasher _passwordHasher;

        public ChangePasswordCommandHandler(
            IUserRepository userRepository,
            IPasswordHasher passwordHasher)
        {
            _userRepository = userRepository;
            _passwordHasher = passwordHasher;
        }

        public async Task<Unit> Handle(ChangePasswordCommand request, CancellationToken cancellationToken)
        {
            var user = await _userRepository.GetByIdAsync(request.UserId, cancellationToken);
            if (user is null)
            {
                throw new NotFoundException("User not found.");
            }

            if (!_passwordHasher.Verify(request.CurrentPassword, user.PasswordHash))
            {
                throw new UnauthorizedException("Mật khẩu hiện tại không đúng.");
            }

            var newHash = _passwordHasher.Hash(request.NewPassword);
            user.UpdatePassword(newHash);

            await _userRepository.UpdateAsync(user, cancellationToken);
            await _userRepository.SaveChangesAsync(cancellationToken);

            return Unit.Value;
        }
    }
}