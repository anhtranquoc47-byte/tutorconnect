using MediatR;
using TutorConnect.Application.Common.Exceptions;
using TutorConnect.Application.Features.Auth.DTOs;
using TutorConnect.Domain.Entities;
using TutorConnect.Domain.Enums;
using TutorConnect.Domain.Interfaces;

namespace TutorConnect.Application.Features.Auth.Commands.Register
{
    public class RegisterCommandHandler : IRequestHandler<RegisterCommand, RegisterResponse>
    {
        private readonly IUserRepository _userRepository;
        private readonly IPasswordHasher _passwordHasher;

        public RegisterCommandHandler(
            IUserRepository userRepository,
            IPasswordHasher passwordHasher)
        {
            _userRepository = userRepository;
            _passwordHasher = passwordHasher;
        }

        public async Task<RegisterResponse> Handle(RegisterCommand request, CancellationToken cancellationToken)
        {
            // Kiểm tra email đã tồn tại
            bool emailExists = await _userRepository.ExistsByEmailAsync(request.Email, cancellationToken);
            if (emailExists)
            {
                throw new UserAlreadyExistsException(request.Email);
            }

            // Mã hóa mật khẩu
            string passwordHash = _passwordHasher.Hash(request.Password);

            // Tạo user mới. Role đến từ command (đã được endpoint gán cứng theo
            // register/student hoặc register/tutor), không đến từ input client.
            var user = User.Create(
                email: request.Email,
                passwordHash: passwordHash,
                fullName: request.FullName,
                phone: request.Phone,
                role: request.Role,
                timeZoneId: request.TimeZoneId);

            if (request.Role == UserRole.Tutor)
            {
                user.InitializeTutorProfile();
            }

            // Lưu vào database
            await _userRepository.AddAsync(user, cancellationToken);
            await _userRepository.SaveChangesAsync(cancellationToken);

            return new RegisterResponse(
                UserId: user.Id,
                Email: user.Email,
                FullName: user.FullName,
                Role: user.Role.ToString());
        }
    }
}
