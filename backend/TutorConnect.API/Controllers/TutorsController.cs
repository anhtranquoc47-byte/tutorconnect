using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using TutorConnect.Application.Features.Availability.DTOs;
using TutorConnect.Application.Features.Matching.DTOs;
using TutorConnect.Application.Features.Tutors.DTOs;
using TutorConnect.Application.Services;

namespace TutorConnect.API.Controllers
{
    [ApiController]
    [Authorize]
    [Route("api/v1/tutors")]
    public sealed class TutorsController : ControllerBase
    {
        private readonly ITutorService _tutorService;
        private readonly IMatchingService _matchingService;

        public TutorsController(ITutorService tutorService, IMatchingService matchingService)
        {
            _tutorService = tutorService;
            _matchingService = matchingService;
        }

        [HttpGet("me")]
        [Authorize(Roles = "Tutor")]
        public async Task<ActionResult<TutorOwnerProfileResponse>> GetMyProfile(
            CancellationToken cancellationToken)
        {
            var tutorId = GetCurrentUserId();
            if (tutorId == 0) return Forbid();

            return Ok(await _tutorService.GetOwnerProfileAsync(tutorId, cancellationToken));
        }

        [HttpPut("me")]
        [Authorize(Roles = "Tutor")]
        public async Task<ActionResult<TutorOwnerProfileResponse>> UpdateMyProfile(
            [FromBody] TutorProfileUpdateRequest request,
            CancellationToken cancellationToken)
        {
            var tutorId = GetCurrentUserId();
            if (tutorId == 0) return Forbid();

            return Ok(await _tutorService.UpdateOwnerProfileAsync(tutorId, request, cancellationToken));
        }

        [HttpPost("me/submit")]
        [Authorize(Roles = "Tutor")]
        public async Task<ActionResult<TutorOwnerProfileResponse>> SubmitMyProfile(
            CancellationToken cancellationToken)
        {
            var tutorId = GetCurrentUserId();
            if (tutorId == 0) return Forbid();

            return Ok(await _tutorService.SubmitProfileAsync(tutorId, cancellationToken));
        }

        [HttpGet("me/subjects")]
        [Authorize(Roles = "Tutor")]
        public async Task<ActionResult<IReadOnlyList<TutorSubjectResponse>>> GetMySubjects(
            CancellationToken cancellationToken)
        {
            var tutorId = GetCurrentUserId();
            if (tutorId == 0) return Forbid();

            return Ok(await _tutorService.GetTutorSubjectsAsync(tutorId, cancellationToken));
        }

        [HttpPost("me/subjects")]
        [Authorize(Roles = "Tutor")]
        public async Task<ActionResult<TutorSubjectResponse>> CreateMySubject(
            [FromBody] TutorSubjectCreateRequest request,
            CancellationToken cancellationToken)
        {
            var tutorId = GetCurrentUserId();
            if (tutorId == 0) return Forbid();

            return Ok(await _tutorService.CreateTutorSubjectAsync(tutorId, request, cancellationToken));
        }

        [HttpPut("me/subjects/{tutorSubjectId:long}")]
        [Authorize(Roles = "Tutor")]
        public async Task<ActionResult<TutorSubjectResponse>> UpdateMySubject(
            long tutorSubjectId,
            [FromBody] TutorSubjectUpdateRequest request,
            CancellationToken cancellationToken)
        {
            var tutorId = GetCurrentUserId();
            if (tutorId == 0) return Forbid();

            return Ok(await _tutorService.UpdateTutorSubjectAsync(
                tutorId,
                tutorSubjectId,
                request,
                cancellationToken));
        }

        [HttpPut("me/subjects/{tutorSubjectId:long}/status")]
        [Authorize(Roles = "Tutor")]
        public async Task<ActionResult<TutorSubjectResponse>> SetMySubjectStatus(
            long tutorSubjectId,
            [FromBody] TutorSubjectStatusRequest request,
            CancellationToken cancellationToken)
        {
            var tutorId = GetCurrentUserId();
            if (tutorId == 0) return Forbid();

            return Ok(await _tutorService.SetTutorSubjectStatusAsync(
                tutorId,
                tutorSubjectId,
                request,
                cancellationToken));
        }

        [HttpGet("me/availabilities")]
        [Authorize(Roles = "Tutor")]
        public async Task<ActionResult<IReadOnlyList<TutorAvailabilityResponse>>> GetMyAvailabilities(
            CancellationToken cancellationToken)
        {
            var tutorId = GetCurrentUserId();
            if (tutorId == 0) return Forbid();

            return Ok(await _tutorService.GetTutorAvailabilitiesAsync(tutorId, cancellationToken));
        }

        [HttpPost("me/availabilities")]
        [Authorize(Roles = "Tutor")]
        public async Task<ActionResult<TutorAvailabilityResponse>> CreateMyAvailability(
            [FromBody] AvailabilityCreateRequest request,
            CancellationToken cancellationToken)
        {
            var tutorId = GetCurrentUserId();
            if (tutorId == 0) return Forbid();

            return Ok(await _tutorService.CreateTutorAvailabilityAsync(tutorId, request, cancellationToken));
        }

        [HttpPut("me/availabilities/{availabilityId:long}")]
        [Authorize(Roles = "Tutor")]
        public async Task<ActionResult<TutorAvailabilityResponse>> UpdateMyAvailability(
            long availabilityId,
            [FromBody] AvailabilityUpdateRequest request,
            CancellationToken cancellationToken)
        {
            var tutorId = GetCurrentUserId();
            if (tutorId == 0) return Forbid();

            return Ok(await _tutorService.UpdateTutorAvailabilityAsync(
                tutorId,
                availabilityId,
                request,
                cancellationToken));
        }

        [HttpPut("me/availabilities/{availabilityId:long}/status")]
        [Authorize(Roles = "Tutor")]
        public async Task<ActionResult<TutorAvailabilityResponse>> SetMyAvailabilityStatus(
            long availabilityId,
            [FromBody] AvailabilityStatusRequest request,
            CancellationToken cancellationToken)
        {
            var tutorId = GetCurrentUserId();
            if (tutorId == 0) return Forbid();

            return Ok(await _tutorService.SetTutorAvailabilityStatusAsync(
                tutorId,
                availabilityId,
                request,
                cancellationToken));
        }

        [HttpGet("search")]
        [Authorize(Roles = "Student")]
        public async Task<ActionResult<IReadOnlyList<TutorSearchItemResponse>>> Search(
            [FromQuery] TutorSearchRequest request,
            CancellationToken cancellationToken)
        {
            var studentId = GetCurrentUserId();
            if (studentId == 0) return Forbid();

            return Ok(await _matchingService.SearchTutorsAsync(request, studentId, cancellationToken));
        }

        [HttpGet("{tutorId:long}")]
        public async Task<ActionResult<TutorPublicProfileResponse>> GetPublicProfile(
            long tutorId,
            CancellationToken cancellationToken)
        {
            return Ok(await _tutorService.GetPublicProfileAsync(tutorId, cancellationToken));
        }
                [HttpGet("{tutorId:long}/availabilities")]
        public async Task<ActionResult<IReadOnlyList<TutorAvailabilityResponse>>> GetPublicAvailabilities(
            long tutorId,
            CancellationToken cancellationToken)
        {
            return Ok(await _tutorService.GetTutorAvailabilitiesAsync(tutorId, cancellationToken));
        }

        private long GetCurrentUserId()
        {
            var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value
                ?? User.FindFirst("sub")?.Value;
            return long.TryParse(userIdClaim, out var userId) ? userId : 0;
        }
    }
}
