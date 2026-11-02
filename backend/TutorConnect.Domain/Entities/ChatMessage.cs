using System;
using TutorConnect.Domain.Common;

namespace TutorConnect.Domain.Entities
{
    public class ChatMessage : BaseEntity
    {
        private ChatMessage()
        {
        }

        public ChatMessage(
            long conversationId,
            long senderId,
            string content,
            string? attachmentUrl = null)
        {
            DomainGuard.Positive(conversationId, nameof(conversationId));
            DomainGuard.Positive(senderId, nameof(senderId));
            DomainGuard.Required(content, nameof(content), 4000);

            ConversationId = conversationId;
            SenderId = senderId;
            Content = content;
            AttachmentUrl = attachmentUrl;
            SentAtUtc = DateTime.UtcNow;
            IsRead = false;
        }

        public long ConversationId { get; private set; }
        public long SenderId { get; private set; }
        public string Content { get; private set; } = string.Empty;
        public string? AttachmentUrl { get; private set; }
        public DateTime SentAtUtc { get; private set; }
        public bool IsRead { get; private set; }

        public ChatConversation Conversation { get; private set; } = null!;
        public User Sender { get; private set; } = null!;

        public void MarkAsRead()
        {
            IsRead = true;
        }
    }
}