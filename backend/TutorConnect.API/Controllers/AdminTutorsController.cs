using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using TutorConnect.Application.Features.Tutors.DTOs;
using TutorConnect.Application.Services;

namespace TutorConnect.API.Controllers
{
    [ApiController]
    [Authorize(Roles = "Admin")]
    [Route("api/v1/admin/tutors")]
    public sealed class AdminTutorsController : ControllerBase
    {
        private readonly ITutorService _tutorService;

        public AdminTutorsController(ITutorService tutorService)
        {
            _tutorService = tutorService;
        }

        [HttpGet]
        public async Task<ActionResult<IReadOnlyList<TutorAdminProfileResponse>>> GetProfiles(
            [FromQuery] string? status,
            CancellationToken cancellationToken)
        {
            var adminId = GetCurrentUserId();
            if (adminId == 0) return Forbid();

            return Ok(await _tutorService.GetAdminProfilesAsync(status, adminId, cancellationToken));
        }

        [HttpGet("{tutorId:long}")]
        public async Task<ActionResult<TutorAdminProfileResponse>> GetProfile(
            long tutorId,
            CancellationToken cancellationToken)
        {
            var adminId = GetCurrentUserId();
            if (adminId == 0) return Forbid();

            return Ok(await _tutorService.GetAdminProfileAsync(tutorId, adminId, cancellationToken));
        }

        [HttpPut("{tutorId:long}/approval")]
        public async Task<ActionResult<TutorAdminProfileResponse>> ReviewProfile(
            long tutorId,
            [FromBody] TutorApprovalUpdateRequest request,
            CancellationToken cancellationToken)
        {
            var adminId = GetCurrentUserId();
            if (adminId == 0) return Forbid();

            return Ok(await _tutorService.ReviewProfileAsync(
                tutorId,
                adminId,
                request,
                cancellationToken));
        }

        private long GetCurrentUserId()
        {
            var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value
                ?? User.FindFirst("sub")?.Value;
            return long.TryParse(userIdClaim, out var userId) ? userId : 0;
        }
    }
}
