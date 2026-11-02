using System;
using System.Security.Claims;
using System.Threading;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using TutorConnect.Application.Features.Bookings.DTOs;
using TutorConnect.Application.Services;

namespace TutorConnect.API.Controllers
{
    [ApiController]
    [Route("api/v1/bookings")]
    [Authorize]
    public class BookingsController : ControllerBase
    {
        private readonly IBookingService _bookingService;

        public BookingsController(IBookingService bookingService)
        {
            _bookingService = bookingService;
        }

        // 1. Student tạo Booking
        [HttpPost]
        public async Task<IActionResult> CreateBooking(
            [FromBody] BookingCreateRequest request,
            CancellationToken cancellationToken)
        {
            try
            {
                var result = await _bookingService.CreateBookingAsync(
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

        // 2. Student/Tutor xem danh sách Booking của mình
        [HttpGet]
        public async Task<IActionResult> GetBookings(
            [FromQuery] string? status,
            CancellationToken cancellationToken)
        {
            try
            {
                var result = await _bookingService.GetUserBookingsAsync(
                    GetCurrentUserId(),
                    status,
                    cancellationToken);

                return Ok(result);
            }
            catch (InvalidOperationException ex)
            {
                return BadRequest(new { Message = ex.Message });
            }
        }

        // 3. Xem chi tiết Booking
        [HttpGet("{bookingId:long}")]
        public async Task<IActionResult> GetBookingById(
            long bookingId,
            CancellationToken cancellationToken)
        {
            var result = await _bookingService.GetBookingByIdAsync(
                bookingId,
                GetCurrentUserId(),
                cancellationToken);

            if (result == null)
            {
                return NotFound(new
                {
                    Message = "Không tìm thấy Booking hoặc bạn không có quyền truy cập."
                });
            }

            return Ok(result);
        }

        // 4. Tutor Confirm Booking
        [HttpPut("{bookingId:long}/confirm")]
        public async Task<IActionResult> ConfirmBooking(
            long bookingId,
            [FromBody] UpdateMeetingUrlRequest? request,
            CancellationToken cancellationToken)
        {
            try
            {
                var success = await _bookingService.ConfirmBookingAsync(
                    bookingId,
                    GetCurrentUserId(),
                    request?.MeetingUrl,
                    cancellationToken);

                if (!success)
                {
                    return BadRequest(new
                    {
                        Message = "Không thể xác nhận Booking."
                    });
                }

                return Ok(new
                {
                    Message = "Đã xác nhận Booking thành công."
                });
            }
            catch (InvalidOperationException ex)
            {
                return BadRequest(new { Message = ex.Message });
            }
        }

        // 5. Tutor Reject Booking
        [HttpPut("{bookingId:long}/reject")]
        public async Task<IActionResult> RejectBooking(
            long bookingId,
            [FromBody] RejectBookingRequest request,
            CancellationToken cancellationToken)
        {
            try
            {
                var success = await _bookingService.RejectBookingAsync(
                    bookingId,
                    GetCurrentUserId(),
                    request.Reason,
                    cancellationToken);

                if (!success)
                {
                    return BadRequest(new
                    {
                        Message = "Không thể từ chối Booking."
                    });
                }

                return Ok(new
                {
                    Message = "Đã từ chối Booking."
                });
            }
            catch (InvalidOperationException ex)
            {
                return BadRequest(new { Message = ex.Message });
            }
        }

        // 6. Student/Tutor Cancel Booking
        [HttpPost("{bookingId:long}/cancel")]
        public async Task<IActionResult> CancelBooking(
            long bookingId,
            [FromBody] CancelBookingRequest request,
            CancellationToken cancellationToken)
        {
            try
            {
                var success = await _bookingService.CancelBookingAsync(
                    bookingId,
                    GetCurrentUserId(),
                    request.Reason,
                    cancellationToken);

                if (!success)
                {
                    return BadRequest(new
                    {
                        Message = "Không thể hủy Booking."
                    });
                }

                return Ok(new
                {
                    Message = "Đã hủy Booking thành công."
                });
            }
            catch (InvalidOperationException ex)
            {
                return BadRequest(new { Message = ex.Message });
            }
        }

        // 7. Tutor cập nhật link phòng học
        [HttpPut("{bookingId:long}/meeting-url")]
        public async Task<IActionResult> UpdateMeetingUrl(
            long bookingId,
            [FromBody] UpdateMeetingUrlRequest request,
            CancellationToken cancellationToken)
        {
            try
            {
                var success = await _bookingService.UpdateMeetingUrlAsync(
                    bookingId,
                    GetCurrentUserId(),
                    request.MeetingUrl,
                    cancellationToken);

                if (!success)
                {
                    return BadRequest(new
                    {
                        Message = "Không thể cập nhật link phòng học."
                    });
                }

                return Ok(new
                {
                    Message = "Cập nhật link phòng học thành công."
                });
            }
            catch (InvalidOperationException ex)
            {
                return BadRequest(new { Message = ex.Message });
            }
        }

        // 8. Student/Tutor đề xuất đổi lịch
        [HttpPost("{bookingId:long}/reschedule")]
        public async Task<IActionResult> RescheduleBooking(
            long bookingId,
            [FromBody] RescheduleCreateRequest request,
            CancellationToken cancellationToken)
        {
            try
            {
                var result = await _bookingService.CreateRescheduleRequestAsync(
                    bookingId,
                    GetCurrentUserId(),
                    request,
                    cancellationToken);

                return Ok(result);
            }
            catch (InvalidOperationException ex)
            {
                return BadRequest(new { Message = ex.Message });
            }
        }

        // 9. Người còn lại Approve/Reject đề xuất đổi lịch
        [HttpPut("{bookingId:long}/reschedule/{proposalId:long}/status")]
        public async Task<IActionResult> UpdateRescheduleStatus(
            long bookingId,
            long proposalId,
            [FromBody] RescheduleStatusUpdateRequest request,
            CancellationToken cancellationToken)
        {
            try
            {
                var result = await _bookingService.RespondToRescheduleAsync(
                    bookingId,
                    proposalId,
                    GetCurrentUserId(),
                    request,
                    cancellationToken);

                return Ok(result);
            }
            catch (InvalidOperationException ex)
            {
                return BadRequest(new { Message = ex.Message });
            }
        }

        // 10. Tutor hoàn thành buổi học
        [HttpPost("{bookingId:long}/complete")]
        public async Task<IActionResult> CompleteBooking(
            long bookingId,
            [FromBody] CompleteBookingRequest? request,
            CancellationToken cancellationToken)
        {
            try
            {
                var success = await _bookingService.CompleteBookingAsync(
                    bookingId,
                    GetCurrentUserId(),
                    request,
                    cancellationToken);

                if (!success)
                {
                    return BadRequest(new
                    {
                        Message = "Không thể hoàn thành buổi học."
                    });
                }

                return Ok(new
                {
                    Message = "Buổi học đã được hoàn thành."
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
                User.FindFirstValue(ClaimTypes.NameIdentifier)
                ?? User.FindFirstValue("sub");

            if (!long.TryParse(userIdClaim, out var userId) || userId <= 0)
            {
                throw new UnauthorizedAccessException("Không xác định được người dùng.");
            }

            return userId;
        }
    }
}