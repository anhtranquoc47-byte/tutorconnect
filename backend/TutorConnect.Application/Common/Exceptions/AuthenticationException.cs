namespace TutorConnect.Application.Common.Exceptions
{
    public class AuthenticationException : Exception
    {
        public AuthenticationException(string message) : base(message) { }
    }

    public class UnauthorizedException : AuthenticationException
    {
        public UnauthorizedException(string message = "Unauthorized") : base(message) { }
    }

    public class ForbiddenException : AuthenticationException
    {
        public ForbiddenException(string message = "Forbidden") : base(message) { }
    }

    public class InvalidCredentialsException : AuthenticationException
    {
        public InvalidCredentialsException() : base("Email hoặc mật khẩu không đúng") { }
    }

    public class UserAlreadyExistsException : AuthenticationException
    {
        public UserAlreadyExistsException(string email) : base($"Người dùng với email '{email}' đã tồn tại") { }
    }

    public class InvalidTokenException : AuthenticationException
    {
        public InvalidTokenException(string message = "Token không hợp lệ") : base(message) { }
    }
}
