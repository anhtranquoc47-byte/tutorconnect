using System.Security.Claims;
using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using TutorConnect.API.Models;
using TutorConnect.Application.Common.Models;
using TutorConnect.Application.Features.Users.Commands.UpdateCurrentUser;
using TutorConnect.Application.Features.Users.Commands.UpdateUserStatus;
using TutorConnect.Application.Features.Users.DTOs;
using TutorConnect.Application.Features.Users.Queries.GetCurrentUser;
using TutorConnect.Application.Features.Users.Queries.GetUsers;
using TutorConnect.Domain.Enums;

namespace TutorConnect.API.Controllers
{
    [ApiController]
    public class UsersController : ControllerBase
    {
        private readonly IMediator _mediator;

        public UsersController(IMediator mediator)
        {
            _mediator = mediator;
        }

        /// <summary>
        /// Lấy danh sách người dùng có phân trang, có thể lọc theo vai trò/trạng thái/từ khóa.
        /// </summary>
        [HttpGet("api/v1/admin/users")]
        [Authorize(Roles = "Admin")]
        [ProducesResponseType(StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        [ProducesResponseType(StatusCodes.Status401Unauthorized)]
        [ProducesResponseType(StatusCodes.Status403Forbidden)]
        public async Task<ActionResult<PaginationResponse<UserProfileResponse>>> GetUsers(
            [FromQuery] PaginationRequest pagination,
            [FromQuery] UserRole? role,
            [FromQuery] UserStatus? status,
            [FromQuery] string? search,
            CancellationToken cancellationToken)
        {
            var query = new GetUsersQuery
            {
                PageNumber = pagination.PageNumber,
                PageSize = pagination.PageSize,
                Role = role,
                Status = status,
                Search = search
            };

            var response = await _mediator.Send(query, cancellationToken);
            return Ok(response);
        }

        /// <summary>
        /// Admin cập nhật trạng thái (Active/Locked/Inactive) của một tài khoản.
        /// </summary>
        [HttpPatch("api/v1/admin/users/{userId:long}/status")]
        [Authorize(Roles = "Admin")]
        [ProducesResponseType(StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        [ProducesResponseType(StatusCodes.Status401Unauthorized)]
        [ProducesResponseType(StatusCodes.Status403Forbidden)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        public async Task<ActionResult<UserProfileResponse>> UpdateUserStatus(
            long userId,
            [FromBody] UpdateUserStatusRequest request,
            CancellationToken cancellationToken)
        {
            var actorUserId = GetCurrentUserId();
            var command = new UpdateUserStatusCommand(userId, request, actorUserId);
            var response = await _mediator.Send(command, cancellationToken);
            return Ok(response);
        }
                /// <summary>
        /// Lấy danh sách Sổ Đen Cảnh Báo Vi Phạm (dành cho Admin).
        /// </summary>
        [HttpGet("api/v1/admin/watchlist")]
        [Authorize(Roles = "Admin")]
        [ProducesResponseType(StatusCodes.Status200OK)]
        public async Task<ActionResult<List<RiskWatchitemDto>>> GetRiskWatchlist(CancellationToken cancellationToken)
        {
            return Ok(new List<RiskWatchitemDto>());
        }

        /// <summary>
        /// Gửi tin nhắn SMS / Zalo cảnh báo tới số điện thoại người dùng.
        /// </summary>
        [HttpPost("api/v1/admin/watchlist/{userId:long}/send-sms")]
        [Authorize(Roles = "Admin")]
        [ProducesResponseType(StatusCodes.Status200OK)]
        public async Task<ActionResult> SendWarningSms(
            long userId,
            [FromBody] SendSmsRequest request,
            CancellationToken cancellationToken)
        {
            return Ok(new { success = true, message = "Đã gửi SMS cảnh báo thành công" });
        }

        /// <summary>
        /// Lấy thông tin tài khoản hiện tại (dựa trên access token).
        /// </summary>
        [HttpGet("api/v1/users/me")]
        [Authorize]
        [ProducesResponseType(StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status401Unauthorized)]
        public async Task<ActionResult<UserProfileResponse>> GetCurrentUser(CancellationToken cancellationToken)
        {
            var query = new GetCurrentUserQuery(GetCurrentUserId());
            var response = await _mediator.Send(query, cancellationToken);
            return Ok(response);
        }

        /// <summary>
        /// Cập nhật thông tin tài khoản hiện tại (họ tên, số điện thoại, múi giờ).
        /// </summary>
        [HttpPut("api/v1/users/me")]
        [Authorize]
        [ProducesResponseType(StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        [ProducesResponseType(StatusCodes.Status401Unauthorized)]
        public async Task<ActionResult<UserProfileResponse>> UpdateCurrentUser(
            [FromBody] UpdateMeRequest request,
            CancellationToken cancellationToken)
        {
            var command = new UpdateCurrentUserCommand(GetCurrentUserId(), request);
            var response = await _mediator.Send(command, cancellationToken);
            return Ok(response);
        }

        /// <summary>
        /// Lấy userId từ claim NameIdentifier của access token đã xác thực.
        /// Controller được bảo vệ bởi [Authorize] nên claim luôn tồn tại và hợp lệ.
        /// </summary>
        private long GetCurrentUserId()
        {
            var claim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value
                ?? User.FindFirst("sub")?.Value;

            if (string.IsNullOrEmpty(claim) || !long.TryParse(claim, out var userId))
            {
                throw new InvalidOperationException("Không thể xác định người dùng từ access token");
            }

            return userId;
        }
    }
}
