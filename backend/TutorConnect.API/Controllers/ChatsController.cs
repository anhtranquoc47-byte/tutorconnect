using System.Security.Claims;
using System.Threading;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using TutorConnect.Application.Features.Chats.DTOs;
using TutorConnect.Application.Services;

namespace TutorConnect.API.Controllers
{
    [ApiController]
    [Route("api/v1/chats")]
    [Authorize]
    public class ChatsController : ControllerBase
    {
        private readonly IChatService _chatService;

        public ChatsController(IChatService chatService)
        {
            _chatService = chatService;
        }

private long GetCurrentUserId()
{
    var userIdClaim =
        User.FindFirstValue(ClaimTypes.NameIdentifier)
        ?? User.FindFirstValue("sub")
        ?? User.FindFirstValue("nameid");

    if (!long.TryParse(userIdClaim, out var userId) || userId <= 0)
    {
        throw new UnauthorizedAccessException("Không xác định được người dùng.");
    }
    return userId;
}
        [HttpGet("conversations")]
        public async Task<IActionResult> GetMyConversations(CancellationToken cancellationToken)
        {
            var userId = GetCurrentUserId();
            var result = await _chatService.GetMyConversationsAsync(userId, cancellationToken);
            return Ok(result);
        }

        [HttpGet("conversations/{conversationId:long}/messages")]
        public async Task<IActionResult> GetMessages(long conversationId, CancellationToken cancellationToken)
        {
            var userId = GetCurrentUserId();
            var result = await _chatService.GetMessagesAsync(conversationId, userId, cancellationToken);
            return Ok(result);
        }

        [HttpPost("conversations")]
        public async Task<IActionResult> CreateOrGetConversation([FromBody] CreateConversationRequest request, CancellationToken cancellationToken)
        {
            var userId = GetCurrentUserId();
            var result = await _chatService.CreateOrGetConversationAsync(request, userId, cancellationToken);
            return Ok(result);
        }

        [HttpPost("messages")]
        public async Task<IActionResult> SendMessage([FromBody] SendChatMessageRequest request, CancellationToken cancellationToken)
        {
            var userId = GetCurrentUserId();
            var result = await _chatService.SendMessageAsync(request, userId, cancellationToken);
            return Ok(result);
        }

        [HttpGet("contacts")]
        public async Task<IActionResult> GetContacts(CancellationToken cancellationToken)
        {
            var userId = GetCurrentUserId();
            var result = await _chatService.GetAvailableContactsAsync(userId, cancellationToken);
            return Ok(result);
        }
    }
}