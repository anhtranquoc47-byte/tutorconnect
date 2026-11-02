import { http } from '@/lib/api/http'

export interface ChatMessageResponse {
  id: number
  conversationId: number
  senderId: number
  senderName: string
  content: string
  attachmentUrl?: string
  sentAtUtc: string
  isRead: boolean
}

export interface ChatConversationResponse {
  id: number
  participant1Id: number
  participant2Id: number
  conversationType: string
  title?: string
  otherUserName: string
  otherUserRole: string
  lastMessage?: string
  lastMessageAtUtc: string
  unreadCount: number
}

export interface ChatUserContactDto {
  userId: number
  fullName: string
  role: string
  email: string
}

// Bóc tách dữ liệu an toàn cho mọi kiểu phản hồi từ .NET
function unwrapData<T>(raw: any): T {
  if (!raw) return [] as unknown as T
  if (Array.isArray(raw)) return raw as T
  if (typeof raw === 'object') {
    if ('$values' in raw && Array.isArray(raw.$values)) return raw.$values as T
    if ('data' in raw && raw.data) return unwrapData<T>(raw.data)
    if ('Data' in raw && raw.Data) return unwrapData<T>(raw.Data)
  }
  return raw as T
}

export const chatApi = {
  getMyConversations: async (): Promise<ChatConversationResponse[]> => {
    const res = await http.get<any>('/api/v1/chats/conversations')
    return unwrapData<ChatConversationResponse[]>(res.data) || []
  },

  getMessages: async (conversationId: number): Promise<ChatMessageResponse[]> => {
    const res = await http.get<any>(`/api/v1/chats/conversations/${conversationId}/messages`)
    return unwrapData<ChatMessageResponse[]>(res.data) || []
  },

  // Hỗ trợ truyền thêm attachmentUrl (ảnh hoặc file đính kèm)
  sendMessage: async (conversationId: number, content: string, attachmentUrl?: string): Promise<ChatMessageResponse> => {
    const res = await http.post<any>('/api/v1/chats/messages', { conversationId, content, attachmentUrl })
    return unwrapData<ChatMessageResponse>(res.data)
  },

  createConversation: async (targetUserId: number): Promise<ChatConversationResponse> => {
    const res = await http.post<any>('/api/v1/chats/conversations', { targetUserId })
    return unwrapData<ChatConversationResponse>(res.data)
  },

  getContacts: async (): Promise<ChatUserContactDto[]> => {
    const res = await http.get<any>('/api/v1/chats/contacts')
    return unwrapData<ChatUserContactDto[]>(res.data) || []
  }
}