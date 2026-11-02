using System;
using System.Collections.Generic;

namespace TutorConnect.Application.Features.Chats.DTOs
{
    public record CreateConversationRequest(
        long TargetUserId,
        string ConversationType = "General",
        string? Title = null,
        long? TutorSubjectId = null,
        string? InitialMessage = null
    );

    public record SendChatMessageRequest(
        long ConversationId,
        string Content,
        string? AttachmentUrl = null
    );

    public record ChatConversationResponse(
        long Id,
        long Participant1Id,
        long Participant2Id,
        string ConversationType,
        string? Title,
        string OtherUserName,
        string OtherUserRole,
        string? LastMessage,
        DateTime LastMessageAtUtc,
        int UnreadCount
    );

    public record ChatMessageResponse(
        long Id,
        long ConversationId,
        long SenderId,
        string SenderName,
        string Content,
        string? AttachmentUrl,
        DateTime SentAtUtc,
        bool IsRead
    );

    public record ChatUserContactDto(
        long UserId,
        string FullName,
        string Role,
        string Email
    );
}