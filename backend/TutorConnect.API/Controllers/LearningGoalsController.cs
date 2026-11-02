using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using TutorConnect.Application.Features.LearningGoals.DTOs;
using TutorConnect.Application.Services;

namespace TutorConnect.API.Controllers
{
    [ApiController]
    [Route("api/v1/learning-goals")]
    [Authorize]
    public class LearningGoalsController : ControllerBase
    {
        private readonly ILearningGoalService _learningGoalService;

        public LearningGoalsController(
            ILearningGoalService learningGoalService)
        {
            _learningGoalService = learningGoalService;
        }

        // 1. Student tạo Learning Goal
        [HttpPost]
        public async Task<IActionResult> CreateGoal(
            [FromBody] LearningGoalCreateRequest request,
            CancellationToken cancellationToken)
        {
            try
            {
                var result =
                    await _learningGoalService.CreateGoalAsync(
                        request,
                        GetCurrentUserId(),
                        cancellationToken);

                return Ok(result);
            }
            catch (InvalidOperationException ex)
            {
                return BadRequest(new { Message = ex.Message });
            }
        }

        // 2. Xem Learning Goal của mình
        [HttpGet("me")]
        public async Task<IActionResult> GetMyGoals(
            CancellationToken cancellationToken)
        {
            var result =
                await _learningGoalService.GetMyGoalsAsync(
                    GetCurrentUserId(),
                    cancellationToken);

            return Ok(result);
        }

        // 3. Xem chi tiết Learning Goal
        [HttpGet("{goalId:long}")]
        public async Task<IActionResult> GetGoalById(
            long goalId,
            CancellationToken cancellationToken)
        {
            var result =
                await _learningGoalService.GetGoalByIdAsync(
                    goalId,
                    GetCurrentUserId(),
                    cancellationToken);

            if (result == null)
            {
                return NotFound(new
                {
                    Message = "Không tìm thấy Learning Goal."
                });
            }

            return Ok(result);
        }

        // 4. Cập nhật Learning Goal
        [HttpPut("{goalId:long}")]
        public async Task<IActionResult> UpdateGoal(
            long goalId,
            [FromBody] LearningGoalUpdateRequest request,
            CancellationToken cancellationToken)
        {
            try
            {
                var result =
                    await _learningGoalService.UpdateGoalAsync(
                        goalId,
                        request,
                        GetCurrentUserId(),
                        cancellationToken);

                return Ok(result);
            }
            catch (InvalidOperationException ex)
            {
                return BadRequest(new { Message = ex.Message });
            }
        }

        // 5. Xóa Learning Goal
        [HttpDelete("{goalId:long}")]
        public async Task<IActionResult> DeleteGoal(
            long goalId,
            CancellationToken cancellationToken)
        {
            var success =
                await _learningGoalService.DeleteGoalAsync(
                    goalId,
                    GetCurrentUserId(),
                    cancellationToken);

            if (!success)
            {
                return NotFound(new
                {
                    Message = "Không tìm thấy Learning Goal."
                });
            }

            return Ok(new
            {
                Message = "Đã xóa Learning Goal."
            });
        }

        // 6. Tạo Milestone
        [HttpPost("{goalId:long}/milestones")]
        public async Task<IActionResult> CreateMilestone(
            long goalId,
            [FromBody] MilestoneCreateRequest request,
            CancellationToken cancellationToken)
        {
            try
            {
                var result =
                    await _learningGoalService.CreateMilestoneAsync(
                        goalId,
                        request,
                        GetCurrentUserId(),
                        cancellationToken);

                return Ok(result);
            }
            catch (InvalidOperationException ex)
            {
                return BadRequest(new { Message = ex.Message });
            }
        }

        // 7. Cập nhật Milestone
        [HttpPut("{goalId:long}/milestones/{milestoneId:long}")]
        public async Task<IActionResult> UpdateMilestone(
            long goalId,
            long milestoneId,
            [FromBody] MilestoneUpdateRequest request,
            CancellationToken cancellationToken)
        {
            try
            {
                var result =
                    await _learningGoalService.UpdateMilestoneAsync(
                        goalId,
                        milestoneId,
                        request,
                        GetCurrentUserId(),
                        cancellationToken);

                return Ok(result);
            }
            catch (InvalidOperationException ex)
            {
                return BadRequest(new { Message = ex.Message });
            }
        }

        // 8. Cập nhật trạng thái Milestone
        [HttpPatch("{goalId:long}/milestones/{milestoneId:long}/status")]
        public async Task<IActionResult> UpdateMilestoneStatus(
            long goalId,
            long milestoneId,
            [FromBody] MilestoneStatusRequest request,
            CancellationToken cancellationToken)
        {
            try
            {
                var result =
                    await _learningGoalService.UpdateMilestoneStatusAsync(
                        goalId,
                        milestoneId,
                        request,
                        GetCurrentUserId(),
                        cancellationToken);

                return Ok(result);
            }
            catch (InvalidOperationException ex)
            {
                return BadRequest(new { Message = ex.Message });
            }
        }

        // 9. Xóa Milestone
        [HttpDelete("{goalId:long}/milestones/{milestoneId:long}")]
        public async Task<IActionResult> DeleteMilestone(
            long goalId,
            long milestoneId,
            CancellationToken cancellationToken)
        {
            try
            {
                var success =
                    await _learningGoalService.DeleteMilestoneAsync(
                        goalId,
                        milestoneId,
                        GetCurrentUserId(),
                        cancellationToken);

                if (!success)
                {
                    return NotFound(new
                    {
                        Message = "Không tìm thấy Milestone."
                    });
                }

                return Ok(new
                {
                    Message = "Đã xóa Milestone."
                });
            }
            catch (InvalidOperationException ex)
            {
                return BadRequest(new { Message = ex.Message });
            }
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