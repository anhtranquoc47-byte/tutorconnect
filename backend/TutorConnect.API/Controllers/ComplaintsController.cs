using System.Security.Claims;
using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using TutorConnect.API.Models;
using TutorConnect.Application.Common.Models;
using TutorConnect.Application.Features.Complaints.Commands.CreateComplaint;
using TutorConnect.Application.Features.Complaints.DTOs;
using TutorConnect.Application.Features.Complaints.Queries.GetMyComplaint;
using TutorConnect.Application.Features.Complaints.Queries.GetMyComplaints;
using TutorConnect.Domain.Enums;

namespace TutorConnect.API.Controllers
{
    [ApiController]
    [Authorize(Roles = "Student,Tutor")]
    [Route("api/v1/complaints")]
    public class ComplaintsController : ControllerBase
    {
        private readonly IMediator _mediator;

        public ComplaintsController(IMediator mediator)
        {
            _mediator = mediator;
        }

        /// <summary>
        /// Danh sách khiếu nại do người dùng hiện tại tạo.
        /// </summary>
        [HttpGet]
        [ProducesResponseType(StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status401Unauthorized)]
        public async Task<ActionResult<PaginationResponse<ComplaintResponse>>> GetMyComplaints(
            [FromQuery] PaginationRequest pagination,
            [FromQuery] ComplaintStatus? status,
            CancellationToken cancellationToken)
        {
            var query = new GetMyComplaintsQuery
            {
                UserId = GetCurrentUserId(),
                PageNumber = pagination.PageNumber,
                PageSize = pagination.PageSize,
                Status = status
            };

            var response = await _mediator.Send(query, cancellationToken);
            return Ok(response);
        }

        /// <summary>
        /// Tạo khiếu nại mới.
        /// </summary>
        [HttpPost]
        [ProducesResponseType(StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        public async Task<ActionResult<ComplaintResponse>> CreateComplaint(
            [FromBody] ComplaintCreateRequest request,
            CancellationToken cancellationToken)
        {
            var command = new CreateComplaintCommand(GetCurrentUserId(), request);
            var response = await _mediator.Send(command, cancellationToken);
            return Ok(response);
        }

        /// <summary>
        /// Xem chi tiết khiếu nại của mình.
        /// </summary>
        [HttpGet("{complaintId:long}")]
        [ProducesResponseType(StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        public async Task<ActionResult<ComplaintResponse>> GetMyComplaint(
            long complaintId,
            CancellationToken cancellationToken)
        {
            var query = new GetMyComplaintQuery(complaintId, GetCurrentUserId());
            var response = await _mediator.Send(query, cancellationToken);
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
