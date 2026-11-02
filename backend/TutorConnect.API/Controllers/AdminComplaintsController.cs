using System.Security.Claims;
using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using TutorConnect.API.Models;
using TutorConnect.Application.Common.Models;
using TutorConnect.Application.Features.Complaints.Commands.UpdateComplaintStatus;
using TutorConnect.Application.Features.Complaints.DTOs;
using TutorConnect.Application.Features.Complaints.Queries.GetComplaintForAdmin;
using TutorConnect.Application.Features.Complaints.Queries.GetComplaintsForAdmin;
using TutorConnect.Domain.Enums;

namespace TutorConnect.API.Controllers
{
    [ApiController]
    [Authorize(Roles = "Admin")]
    [Route("api/v1/admin/complaints")]
    public class AdminComplaintsController : ControllerBase
    {
        private readonly IMediator _mediator;

        public AdminComplaintsController(IMediator mediator)
        {
            _mediator = mediator;
        }

        /// <summary>
        /// Danh sách khiếu nại cho Admin, có thể lọc theo trạng thái/loại.
        /// </summary>
        [HttpGet]
        [ProducesResponseType(StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status403Forbidden)]
        public async Task<ActionResult<PaginationResponse<ComplaintResponse>>> GetComplaints(
            [FromQuery] PaginationRequest pagination,
            [FromQuery] ComplaintStatus? status,
            [FromQuery] string? type,
            CancellationToken cancellationToken)
        {
            var query = new GetComplaintsForAdminQuery
            {
                PageNumber = pagination.PageNumber,
                PageSize = pagination.PageSize,
                Status = status,
                Type = type
            };

            var response = await _mediator.Send(query, cancellationToken);
            return Ok(response);
        }

        /// <summary>
        /// Xem chi tiết khiếu nại cho Admin.
        /// </summary>
        [HttpGet("{complaintId:long}")]
        [ProducesResponseType(StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        public async Task<ActionResult<ComplaintResponse>> GetComplaint(
            long complaintId,
            CancellationToken cancellationToken)
        {
            var response = await _mediator.Send(new GetComplaintForAdminQuery(complaintId), cancellationToken);
            return Ok(response);
        }

        /// <summary>
        /// Cập nhật trạng thái và phản hồi khiếu nại (InReview/Resolved/Rejected).
        /// </summary>
        [HttpPatch("{complaintId:long}")]
        [ProducesResponseType(StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        public async Task<ActionResult<ComplaintResponse>> UpdateComplaint(
            long complaintId,
            [FromBody] ComplaintAdminUpdateRequest request,
            CancellationToken cancellationToken)
        {
            var command = new UpdateComplaintStatusCommand(complaintId, request, GetCurrentUserId());
            var response = await _mediator.Send(command, cancellationToken);
            return Ok(response);
        }

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
