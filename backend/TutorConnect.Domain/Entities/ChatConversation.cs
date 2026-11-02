using System;
using System.Collections.Generic;
using TutorConnect.Domain.Common;

namespace TutorConnect.Domain.Entities
{
    public class ChatConversation : BaseEntity
    {
        private ChatConversation()
        {
        }

        public ChatConversation(
            long participant1Id,
            long participant2Id,
            string conversationType = "StudentTutor",
            string? title = null,
            long? tutorSubjectId = null)
        {
            DomainGuard.Positive(participant1Id, nameof(participant1Id));
            DomainGuard.Positive(participant2Id, nameof(participant2Id));

            Participant1Id = participant1Id;
            Participant2Id = participant2Id;
            ConversationType = conversationType;
            Title = title;
            TutorSubjectId = tutorSubjectId;
            LastMessageAtUtc = DateTime.UtcNow;
        }

        public long Participant1Id { get; private set; }
        public long Participant2Id { get; private set; }
        public string ConversationType { get; private set; } = "StudentTutor"; // StudentTutor, AdminStudent, AdminTutor
        public string? Title { get; private set; }
        public long? TutorSubjectId { get; private set; }
        public string? LastMessage { get; private set; }
        public DateTime LastMessageAtUtc { get; private set; }

        public User Participant1 { get; private set; } = null!;
        public User Participant2 { get; private set; } = null!;
        public ICollection<ChatMessage> Messages { get; private set; } = new List<ChatMessage>();

        public void UpdateLastMessage(string content, DateTime sentAtUtc)
        {
            LastMessage = content;
            LastMessageAtUtc = sentAtUtc;
        }
    }
}