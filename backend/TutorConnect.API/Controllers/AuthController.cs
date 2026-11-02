using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Configuration;
using TutorConnect.Application.Features.Auth.Commands.ForgotPassword;
using TutorConnect.Application.Features.Auth.Commands.Login;
using TutorConnect.Application.Features.Auth.Commands.Logout;
using TutorConnect.Application.Features.Auth.Commands.RefreshToken;
using TutorConnect.Application.Features.Auth.Commands.Register;
using TutorConnect.Application.Features.Auth.Commands.ResetPassword;
using TutorConnect.Application.Features.Auth.Commands.ValidateResetToken;
using TutorConnect.Application.Features.Auth.DTOs;
using System.Security.Claims;
using TutorConnect.Application.Features.Auth.Commands.ChangePassword;

namespace TutorConnect.API.Controllers
{
    [ApiController]
    [Route("api/v1/auth")]
    public class AuthController : ControllerBase
    {
        private readonly IMediator _mediator;
        private readonly IConfiguration _configuration;

        public AuthController(IMediator mediator, IConfiguration configuration)
        {
            _mediator = mediator;
            _configuration = configuration;
        }

        /// <summary>
        /// Đăng ký tài khoản Student mới.
        /// </summary>
        [HttpPost("register/student")]
        [ProducesResponseType(StatusCodes.Status201Created)]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        [ProducesResponseType(StatusCodes.Status409Conflict)]
        public async Task<ActionResult<RegisterResponse>> RegisterStudent(
            [FromBody] RegisterStudentRequest request,
            CancellationToken cancellationToken)
        {
            var command = new RegisterCommand(request) { BaseUrl = GetFrontendBaseUrl() };
            var response = await _mediator.Send(command, cancellationToken);
            return CreatedAtAction(nameof(RegisterStudent), response);
        }

        /// <summary>
        /// Đăng ký tài khoản Tutor mới (khởi tạo TutorProfile ở trạng thái Draft).
        /// </summary>
        [HttpPost("register/tutor")]
        [ProducesResponseType(StatusCodes.Status201Created)]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        [ProducesResponseType(StatusCodes.Status409Conflict)]
        public async Task<ActionResult<RegisterResponse>> RegisterTutor(
            [FromBody] RegisterTutorRequest request,
            CancellationToken cancellationToken)
        {
            var command = new RegisterCommand(request) { BaseUrl = GetFrontendBaseUrl() };
            var response = await _mediator.Send(command, cancellationToken);
            return CreatedAtAction(nameof(RegisterTutor), response);
        }

        /// <summary>
        /// Đăng nhập với email và mật khẩu.
        /// </summary>
        [HttpPost("login")]
        [ProducesResponseType(StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        [ProducesResponseType(StatusCodes.Status401Unauthorized)]
        public async Task<ActionResult<LoginResponse>> Login(
            [FromBody] LoginRequest request,
            CancellationToken cancellationToken)
        {
            var command = new LoginCommand(request);
            var response = await _mediator.Send(command, cancellationToken);
            return Ok(response);
        }


        /// <summary>
        /// Yêu cầu đặt lại mật khẩu - gửi link đặt lại qua email.
        /// </summary>
        [HttpPost("forgot-password")]
        [ProducesResponseType(StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        public async Task<ActionResult> ForgotPassword(
            [FromBody] ForgotPasswordRequest request,
            CancellationToken cancellationToken)
        {
            var command = new ForgotPasswordCommand(request, GetFrontendBaseUrl());
            await _mediator.Send(command, cancellationToken);
            return Ok(new { message = "Nếu email tồn tại, link đặt lại mật khẩu sẽ được gửi" });
        }

        /// <summary>
        /// Xác thực token đặt lại mật khẩu trước khi gửi form đặt mật khẩu.
        /// </summary>
        [HttpPost("validate-reset-token")]
        [ProducesResponseType(StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        public async Task<ActionResult<ValidateResetTokenResponse>> ValidateResetToken(
            [FromBody] ValidateResetTokenRequest request,
            CancellationToken cancellationToken)
        {
            var command = new ValidateResetTokenCommand(request);
            var response = await _mediator.Send(command, cancellationToken);
            return Ok(response);
        }

        /// <summary>
        /// Đặt lại mật khẩu bằng token. Đây là endpoint mà Frontend (SPA) gọi
        /// bằng POST sau khi lấy token từ URL - KHÔNG phải endpoint mà link
        /// trong email trỏ trực tiếp tới (xem GetFrontendBaseUrl()).
        /// </summary>
        [HttpPost("reset-password")]
        [ProducesResponseType(StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        [ProducesResponseType(StatusCodes.Status401Unauthorized)]
        public async Task<ActionResult> ResetPassword(
            [FromBody] ResetPasswordRequest request,
            CancellationToken cancellationToken)
        {
            var command = new ResetPasswordCommand(request);
            await _mediator.Send(command, cancellationToken);
            return Ok(new { message = "Mật khẩu đã được đặt lại thành công" });
        }

        /// <summary>
        /// Làm mới access token bằng refresh token.
        /// </summary>
        [HttpPost("refresh")]
        [ProducesResponseType(StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        [ProducesResponseType(StatusCodes.Status401Unauthorized)]
        public async Task<ActionResult<RefreshTokenResponse>> Refresh(
            [FromBody] RefreshTokenRequest request,
            CancellationToken cancellationToken)
        {
            var command = new RefreshTokenCommand(request);
            var response = await _mediator.Send(command, cancellationToken);
            return Ok(response);
        }
                [Authorize]
        [HttpPost("change-password")]
        [ProducesResponseType(StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        [ProducesResponseType(StatusCodes.Status401Unauthorized)]
        public async Task<ActionResult> ChangePassword(
            [FromBody] ChangePasswordRequest request,
            CancellationToken cancellationToken)
        {
            var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value
                ?? User.FindFirst("sub")?.Value;

            if (!long.TryParse(userIdClaim, out var userId) || userId <= 0)
            {
                return Unauthorized();
            }

            var command = new ChangePasswordCommand(userId, request);
            await _mediator.Send(command, cancellationToken);
            return Ok(new { message = "Mật khẩu đã được đổi thành công" });
        }

        /// <summary>
        /// Đăng xuất bằng cách thu hồi refresh token. Yêu cầu Bearer access token
        /// hợp lệ theo API Contract.
        /// </summary>
        [Authorize]
        [HttpPost("logout")]
        [ProducesResponseType(StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        [ProducesResponseType(StatusCodes.Status401Unauthorized)]
        public async Task<ActionResult> Logout(
            [FromBody] LogoutRequest request,
            CancellationToken cancellationToken)
        {
            var command = new LogoutCommand(request);
            var response = await _mediator.Send(command, cancellationToken);
            return Ok(response);
        }

        /// <summary>
        /// Lấy base URL của Frontend từ cấu hình (appsettings: Frontend:BaseUrl),
        /// </summary>
        private string GetFrontendBaseUrl()
        {
            return _configuration["Frontend:BaseUrl"]
                ?? throw new InvalidOperationException("Frontend:BaseUrl chưa được cấu hình trong appsettings.json");
        }
    }
}
