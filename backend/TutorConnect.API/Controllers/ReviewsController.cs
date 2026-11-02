using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using TutorConnect.Application.Features.Reviews.DTOs;
using TutorConnect.Application.Services;

namespace TutorConnect.API.Controllers
{
    [ApiController]
    [Route("api/v1")]
    [Authorize]
    public class ReviewsController : ControllerBase
    {
        private readonly IReviewService _reviewService;

        public ReviewsController(
            IReviewService reviewService)
        {
            _reviewService = reviewService;
        }

        // Student đánh giá Tutor
        // hoặc Tutor đánh giá Student
        [HttpPost("bookings/{bookingId:long}/reviews")]
        public async Task<IActionResult> CreateReview(
            long bookingId,
            [FromBody] ReviewCreateRequest request,
            CancellationToken cancellationToken)
        {
            try
            {
                var result =
                    await _reviewService.CreateReviewAsync(
                        bookingId,
                        request,
                        GetCurrentUserId(),
                        cancellationToken);

                return Ok(result);
            }
            catch (InvalidOperationException ex)
            {
                return BadRequest(
                    new { Message = ex.Message });
            }
        }

        // Xem những review mình nhận được
        [HttpGet("reviews/me/received")]
        public async Task<IActionResult> GetMyReceivedReviews(
            [FromQuery] int page = 1,
            [FromQuery] int pageSize = 10,
            CancellationToken cancellationToken = default)
        {
            var result =
                await _reviewService.GetMyReceivedReviewsAsync(
                    GetCurrentUserId(),
                    page,
                    pageSize,
                    cancellationToken);

            return Ok(result);
        }

        // Xem review của một user
        [HttpGet("users/{userId:long}/reviews")]
        public async Task<IActionResult> GetUserReviews(
            long userId,
            [FromQuery] int page = 1,
            [FromQuery] int pageSize = 10,
            CancellationToken cancellationToken = default)
        {
            var result =
                await _reviewService.GetUserReceivedReviewsAsync(
                    userId,
                    page,
                    pageSize,
                    cancellationToken);

            return Ok(result);
        }

        private long GetCurrentUserId()
        {
            var userIdClaim =
                User.FindFirstValue(
                    ClaimTypes.NameIdentifier)
                ?? User.FindFirstValue("sub");

            if (!long.TryParse(
                    userIdClaim,
                    out var userId) ||
                userId <= 0)
            {
                throw new UnauthorizedAccessException(
                    "Không xác định được người dùng.");
            }

            return userId;
        }
    }
}