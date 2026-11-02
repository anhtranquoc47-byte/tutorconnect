using System.Security.Claims;
using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using TutorConnect.Application.Features.Uploads.Commands.UploadComplaintEvidence;
using TutorConnect.Application.Features.Uploads.DTOs;

namespace TutorConnect.API.Controllers
{
    [ApiController]
    [Authorize(Roles = "Student,Tutor")]
    [Route("api/v1/uploads")]
    public class UploadsController : ControllerBase
    {
        private readonly IMediator _mediator;

        public UploadsController(IMediator mediator)
        {
            _mediator = mediator;
        }

        /// <summary>
        /// Upload bằng chứng khiếu nại (ảnh JPEG/PNG/WebP hoặc PDF, tối đa 10MB).
        /// Trả về FileUrl để đính kèm vào trường EvidenceUrl khi tạo khiếu nại.
        /// </summary>
        [HttpPost("complaint-evidence")]
        [ProducesResponseType(StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        [RequestSizeLimit(10 * 1024 * 1024)]
        public async Task<ActionResult<FileUploadResponse>> UploadComplaintEvidence(
            IFormFile file,
            CancellationToken cancellationToken)
        {
            if (file is null || file.Length == 0)
            {
                return BadRequest("Không có file nào được tải lên");
            }

            await using var stream = file.OpenReadStream();

            var command = new UploadComplaintEvidenceCommand
            {
                Content = stream,
                OriginalFileName = file.FileName,
                ContentType = file.ContentType,
                SizeBytes = file.Length,
                UploadedByUserId = GetCurrentUserId()
            };

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
