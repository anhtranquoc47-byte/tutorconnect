using MediatR;
using TutorConnect.Application.Features.Auth.DTOs;
using TutorConnect.Domain.Enums;

namespace TutorConnect.Application.Features.Auth.Commands.Register
{
    /// <summary>
    /// Command đăng ký dùng nội bộ cho cả 2 luồng Student/Tutor. 
    /// </summary>
    public class RegisterCommand : IRequest<RegisterResponse>
    {
        public string Email { get; set; } = null!;
        public string Password { get; set; } = null!;
        public string FullName { get; set; } = null!;
        public string? Phone { get; set; }
        public UserRole Role { get; set; }
        public string TimeZoneId { get; set; } = "Asia/Ho_Chi_Minh";
        public string? BaseUrl { get; set; }

        public RegisterCommand() { }

        public RegisterCommand(RegisterStudentRequest request)
        {
            Email = request.Email;
            Password = request.Password;
            FullName = request.FullName;
            Phone = request.Phone;
            Role = UserRole.Student;
            TimeZoneId = request.TimeZoneId;
        }

        public RegisterCommand(RegisterTutorRequest request)
        {
            Email = request.Email;
            Password = request.Password;
            FullName = request.FullName;
            Phone = request.Phone;
            Role = UserRole.Tutor;
            TimeZoneId = request.TimeZoneId;
        }
    }
}
