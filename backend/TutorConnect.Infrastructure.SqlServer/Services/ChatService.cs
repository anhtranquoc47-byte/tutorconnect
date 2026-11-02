using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;
using TutorConnect.Application.Features.Chats.DTOs;
using TutorConnect.Application.Services;
using TutorConnect.Domain.Entities;
using TutorConnect.Domain.Enums;
using TutorConnect.Infrastructure.SqlServer.Persistence;

namespace TutorConnect.Infrastructure.SqlServer.Services
{
    public class ChatService : IChatService
    {
        private readonly ApplicationDbContext _context;

        public ChatService(ApplicationDbContext context)
        {
            _context = context;
        }

        public async Task<IEnumerable<ChatConversationResponse>> GetMyConversationsAsync(
            long currentUserId,
            CancellationToken cancellationToken = default)
        {
            var currentUser = await _context.Users
                .AsNoTracking()
                .FirstOrDefaultAsync(u => u.Id == currentUserId, cancellationToken);

            var isAdmin = currentUser?.Role == UserRole.Admin;

            var conversations = await _context.Set<ChatConversation>()
                .Include(c => c.Participant1)
                .Include(c => c.Participant2)
                .Include(c => c.Messages)
                .AsNoTracking()
                .Where(c => c.Participant1Id == currentUserId || 
                            c.Participant2Id == currentUserId || 
                            (isAdmin && (c.Participant1.Role == UserRole.Admin || c.Participant2.Role == UserRole.Admin)))
                .OrderByDescending(c => c.LastMessageAtUtc)
                .ToListAsync(cancellationToken);

            return conversations.Select(c =>
            {
                var otherUser = c.Participant1Id == currentUserId ? c.Participant2 : c.Participant1;
                if (isAdmin && otherUser?.Id == currentUserId)
                {
                    otherUser = c.Participant1.Role == UserRole.Admin ? c.Participant2 : c.Participant1;
                }

                var unreadCount = c.Messages.Count(m => m.SenderId != currentUserId && !m.IsRead);

                return new ChatConversationResponse(
                    c.Id,
                    c.Participant1Id,
                    c.Participant2Id,
                    c.ConversationType,
                    c.Title,
                    otherUser?.FullName ?? "Người dùng",
                    otherUser?.Role.ToString() ?? "User",
                    c.LastMessage,
                    c.LastMessageAtUtc,
                    unreadCount
                );
            });
        }

        public async Task<IEnumerable<ChatMessageResponse>> GetMessagesAsync(
            long conversationId,
            long currentUserId,
            CancellationToken cancellationToken = default)
        {
            var currentUser = await _context.Users
                .AsNoTracking()
                .FirstOrDefaultAsync(u => u.Id == currentUserId, cancellationToken);

            var isAdmin = currentUser?.Role == UserRole.Admin;

            var conversation = await _context.Set<ChatConversation>()
                .Include(c => c.Participant1)
                .Include(c => c.Participant2)
                .AsNoTracking()
                .FirstOrDefaultAsync(c => c.Id == conversationId && 
                    (c.Participant1Id == currentUserId || 
                     c.Participant2Id == currentUserId || 
                     (isAdmin && (c.Participant1.Role == UserRole.Admin || c.Participant2.Role == UserRole.Admin))), 
                    cancellationToken);

            if (conversation == null)
            {
                throw new InvalidOperationException("Không tìm thấy cuộc trò chuyện hoặc bạn không có quyền.");
            }

            var unreadMessages = await _context.Set<ChatMessage>()
                .Where(m => m.ConversationId == conversationId && m.SenderId != currentUserId && !m.IsRead)
                .ToListAsync(cancellationToken);

            if (unreadMessages.Any())
            {
                foreach (var msg in unreadMessages)
                {
                    msg.MarkAsRead();
                }
                await _context.SaveChangesAsync(cancellationToken);
            }

            var messages = await _context.Set<ChatMessage>()
                .Include(m => m.Sender)
                .AsNoTracking()
                .Where(m => m.ConversationId == conversationId)
                .OrderBy(m => m.SentAtUtc)
                .ToListAsync(cancellationToken);

            return messages.Select(m => new ChatMessageResponse(
                m.Id,
                m.ConversationId,
                m.SenderId,
                m.Sender?.FullName ?? "Người dùng",
                m.Content,
                m.AttachmentUrl,
                m.SentAtUtc,
                m.IsRead
            ));
        }

public async Task<ChatConversationResponse> CreateOrGetConversationAsync(
    CreateConversationRequest request,
    long currentUserId,
    CancellationToken cancellationToken = default)
{
    var targetUserId = request.TargetUserId;
    
    // Nếu TargetUserId <= 0 (Bấm Chat với Admin), tự động tìm Admin.
    // Nếu CSDL chưa có Admin, tự động lấy User bất kỳ khác me hoặc tạo hội thoại hỗ trợ.
    if (targetUserId <= 0)
    {
        var targetUser = await _context.Users
            .AsNoTracking()
            .FirstOrDefaultAsync(u => u.Role == UserRole.Admin && u.Id != currentUserId, cancellationToken)
            ?? await _context.Users
            .AsNoTracking()
            .FirstOrDefaultAsync(u => u.Id != currentUserId, cancellationToken);

        // Nếu CSDL chỉ có duy nhất 1 user, dùng chính user đó làm target hỗ trợ
        targetUserId = targetUser != null ? targetUser.Id : currentUserId;
    }

    var existing = await _context.Set<ChatConversation>()
        .Include(c => c.Participant1)
        .Include(c => c.Participant2)
        .FirstOrDefaultAsync(c =>
            (c.Participant1Id == currentUserId && c.Participant2Id == targetUserId) ||
            (c.Participant1Id == targetUserId && c.Participant2Id == currentUserId),
            cancellationToken);

    if (existing == null)
    {
        existing = new ChatConversation(
            currentUserId,
            targetUserId,
            request.ConversationType,
            request.Title,
            request.TutorSubjectId
        );

        _context.Set<ChatConversation>().Add(existing);
        await _context.SaveChangesAsync(cancellationToken);

        existing = await _context.Set<ChatConversation>()
            .Include(c => c.Participant1)
            .Include(c => c.Participant2)
            .FirstOrDefaultAsync(c => c.Id == existing.Id, cancellationToken);
    }

    var otherUser = existing!.Participant1Id == currentUserId ? existing.Participant2 : existing.Participant1;

    return new ChatConversationResponse(
        existing.Id,
        existing.Participant1Id,
        existing.Participant2Id,
        existing.ConversationType,
        existing.Title,
        otherUser?.FullName ?? "Admin Hỗ Trợ Hệ Thống",
        otherUser?.Role.ToString() ?? "Admin",
        existing.LastMessage,
        existing.LastMessageAtUtc,
        0
    );
}

        public async Task<ChatMessageResponse> SendMessageAsync(
            SendChatMessageRequest request,
            long currentUserId,
            CancellationToken cancellationToken = default)
        {
            var currentUser = await _context.Users
                .AsNoTracking()
                .FirstOrDefaultAsync(u => u.Id == currentUserId, cancellationToken);

            var isAdmin = currentUser?.Role == UserRole.Admin;

            var conversation = await _context.Set<ChatConversation>()
                .Include(c => c.Participant1)
                .Include(c => c.Participant2)
                .FirstOrDefaultAsync(c => c.Id == request.ConversationId && 
                    (c.Participant1Id == currentUserId || 
                     c.Participant2Id == currentUserId || 
                     (isAdmin && (c.Participant1.Role == UserRole.Admin || c.Participant2.Role == UserRole.Admin))), 
                    cancellationToken);

            if (conversation == null)
            {
                throw new InvalidOperationException("Không tìm thấy cuộc trò chuyện hoặc bạn không có quyền.");
            }

            var message = new ChatMessage(request.ConversationId, currentUserId, request.Content, request.AttachmentUrl);
            _context.Set<ChatMessage>().Add(message);

            conversation.UpdateLastMessage(message.Content, message.SentAtUtc);

            await _context.SaveChangesAsync(cancellationToken);

            return new ChatMessageResponse(
                message.Id,
                message.ConversationId,
                message.SenderId,
                currentUser?.FullName ?? "Người dùng",
                message.Content,
                message.AttachmentUrl,
                message.SentAtUtc,
                message.IsRead
            );
        }

      public async Task<IEnumerable<ChatUserContactDto>> GetAvailableContactsAsync(
    long currentUserId,
    CancellationToken cancellationToken = default)
{
    var users = await _context.Users
        .AsNoTracking()
        .Where(u => u.Id != currentUserId)
        .OrderByDescending(u => u.Role == UserRole.Admin)
        .ThenBy(u => u.FullName)
        .Take(50)
        .ToListAsync(cancellationToken);

    // Nếu CSDL chưa có user khác, tự động tạo 1 liên hệ Admin Hỗ Trợ mẫu để không bị rỗng
    if (!users.Any())
    {
        return new List<ChatUserContactDto>
        {
            new ChatUserContactDto(0, "Admin Hỗ Trợ Hệ Thống", "Admin", "admin@tutorconnect.com")
        };
    }

    return users.Select(u => new ChatUserContactDto(
        u.Id,
        u.FullName,
        u.Role.ToString(),
        u.Email
    ));
}
    }
}