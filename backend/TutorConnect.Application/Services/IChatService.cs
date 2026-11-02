using System.Collections.Generic;
using System.Threading;
using System.Threading.Tasks;
using TutorConnect.Application.Features.Chats.DTOs;

namespace TutorConnect.Application.Services
{
    public interface IChatService
    {
        Task<IEnumerable<ChatConversationResponse>> GetMyConversationsAsync(long currentUserId, CancellationToken cancellationToken = default);
        Task<IEnumerable<ChatMessageResponse>> GetMessagesAsync(long conversationId, long currentUserId, CancellationToken cancellationToken = default);
        Task<ChatConversationResponse> CreateOrGetConversationAsync(CreateConversationRequest request, long currentUserId, CancellationToken cancellationToken = default);
        Task<ChatMessageResponse> SendMessageAsync(SendChatMessageRequest request, long currentUserId, CancellationToken cancellationToken = default);
        Task<IEnumerable<ChatUserContactDto>> GetAvailableContactsAsync(long currentUserId, CancellationToken cancellationToken = default);
    }
}