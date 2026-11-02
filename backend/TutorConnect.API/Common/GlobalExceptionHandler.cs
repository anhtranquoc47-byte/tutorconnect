using System.Net;
using TutorConnect.API.Models;
using TutorConnect.Application.Common.Exceptions;
using Microsoft.AspNetCore.Diagnostics;
using FluentValidation;

namespace TutorConnect.API.Common
{
    public sealed class GlobalExceptionHandler : IExceptionHandler
    {
        private readonly ILogger<GlobalExceptionHandler> _logger;

        public GlobalExceptionHandler(ILogger<GlobalExceptionHandler> logger)
        {
            _logger = logger;
        }

        public async ValueTask<bool> TryHandleAsync(
            HttpContext httpContext,
            Exception exception,
            CancellationToken cancellationToken)
        {
            var (statusCode, message) = exception switch
            {
                NotFoundException =>
                    (HttpStatusCode.NotFound, exception.Message),

                // Sai mật khẩu / chưa đăng nhập hợp lệ / token hết hạn -> 401
                InvalidCredentialsException =>
                    (HttpStatusCode.Unauthorized, exception.Message),
                InvalidTokenException =>
                    (HttpStatusCode.Unauthorized, exception.Message),
                UnauthorizedException =>
                    (HttpStatusCode.Unauthorized, exception.Message),
                ForbiddenException =>
                    (HttpStatusCode.Forbidden, exception.Message),

                KeyNotFoundException =>
                    (HttpStatusCode.NotFound, exception.Message),

                // Email trùng / tài nguyên đã tồn tại -> 409
                UserAlreadyExistsException =>
                    (HttpStatusCode.Conflict, exception.Message),

                // FluentValidation: gom toàn bộ message lỗi -> 400
                ValidationException validationException =>
                    (HttpStatusCode.BadRequest,
                        string.Join("; ", validationException.Errors.Select(e => e.ErrorMessage))),

                // Lỗi logic nghiệp vụ (vd: email đã xác minh rồi) -> 400
                InvalidOperationException =>
                    (HttpStatusCode.BadRequest, exception.Message),

                ArgumentException =>
                    (HttpStatusCode.BadRequest, exception.Message),

                _ =>
                    (HttpStatusCode.InternalServerError,
                        "An unexpected error occurred.")
            };

            if (statusCode == HttpStatusCode.InternalServerError)
            {
                _logger.LogError(
                    exception,
                    "Unhandled exception while processing {Path}",
                    httpContext.Request.Path);
            }

            httpContext.Response.StatusCode = (int)statusCode;
            await httpContext.Response.WriteAsJsonAsync(
                new ApiResponse<object?>
                {
                    Message = message,
                    Data = null,
                    Code = (int)statusCode
                },
                cancellationToken);

            return true;
        }
    }
}
