export interface SuggestedAction {
  label: string
  link: string
}

export interface ChatMessage {
  id: string
  sender: 'user' | 'bot'
  text: string
  timestamp: string
  suggestedActions?: SuggestedAction[]
}

export interface ChatRequest {
  message: string
  role: 'student' | 'tutor'
}

export interface ChatResponse {
  reply: string
  suggestedActions?: SuggestedAction[]
}