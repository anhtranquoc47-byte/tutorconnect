using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using TutorConnect.Application.Features.Subjects.DTOs;
using TutorConnect.Application.Services;

namespace TutorConnect.API.Controllers
{
    [ApiController]
    [Authorize]
    [Route("api/v1/subjects")]
    public sealed class SubjectsController : ControllerBase
    {
        private readonly ISubjectService _subjectService;

        public SubjectsController(ISubjectService subjectService)
        {
            _subjectService = subjectService;
        }

        [HttpGet]
        public async Task<ActionResult<IReadOnlyList<SubjectResponse>>> GetSubjects(
            [FromQuery] bool includeInactive = false,
            CancellationToken cancellationToken = default)
        {
            if (includeInactive && !User.IsInRole("Admin"))
            {
                return Forbid();
            }

            return Ok(await _subjectService.GetSubjectsAsync(includeInactive, cancellationToken));
        }

        [HttpGet("{subjectId:long}")]
        public async Task<ActionResult<SubjectResponse>> GetSubject(
            long subjectId,
            [FromQuery] bool includeInactive = false,
            CancellationToken cancellationToken = default)
        {
            if (includeInactive && !User.IsInRole("Admin"))
            {
                return Forbid();
            }

            return Ok(await _subjectService.GetSubjectAsync(subjectId, includeInactive, cancellationToken));
        }

        [HttpPost]
        [Authorize(Roles = "Admin")]
        public async Task<ActionResult<SubjectResponse>> CreateSubject(
            [FromBody] SubjectCreateRequest request,
            CancellationToken cancellationToken)
        {
            var adminId = GetCurrentUserId();
            if (adminId == 0) return Forbid();

            return Ok(await _subjectService.CreateSubjectAsync(request, adminId, cancellationToken));
        }

        [HttpPut("{subjectId:long}")]
        [Authorize(Roles = "Admin")]
        public async Task<ActionResult<SubjectResponse>> UpdateSubject(
            long subjectId,
            [FromBody] SubjectUpdateRequest request,
            CancellationToken cancellationToken)
        {
            var adminId = GetCurrentUserId();
            if (adminId == 0) return Forbid();

            return Ok(await _subjectService.UpdateSubjectAsync(
                subjectId,
                request,
                adminId,
                cancellationToken));
        }

        [HttpPut("{subjectId:long}/status")]
        [Authorize(Roles = "Admin")]
        public async Task<ActionResult<SubjectResponse>> SetSubjectStatus(
            long subjectId,
            [FromBody] SubjectStatusRequest request,
            CancellationToken cancellationToken)
        {
            var adminId = GetCurrentUserId();
            if (adminId == 0) return Forbid();

            return Ok(await _subjectService.SetSubjectStatusAsync(
                subjectId,
                request,
                adminId,
                cancellationToken));
        }
                [HttpDelete("{subjectId:long}")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> DeleteSubject(
            long subjectId,
            CancellationToken cancellationToken)
        {
            var adminId = GetCurrentUserId();
            if (adminId == 0) return Forbid();

            await _subjectService.DeleteSubjectAsync(subjectId, adminId, cancellationToken);
            return NoContent();
        }

        private long GetCurrentUserId()
        {
            var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value
                ?? User.FindFirst("sub")?.Value;
            return long.TryParse(userIdClaim, out var userId) ? userId : 0;
        }
    }
}
