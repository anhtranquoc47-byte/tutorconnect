import { useState, useRef, useEffect } from 'react'
import { Bot, X, Send, Sparkles, ChevronRight, PlusCircle, History, Trash2, MessageSquare } from 'lucide-react'
import { useAuthStore } from '@/features/auth/auth.store'
import { useNavigate } from 'react-router-dom'
import { chatbotApi, type ChatMessage } from '../api/chatbot.api'

export interface ChatSession {
  id: string
  title: string
  createdAt: string
  messages: ChatMessage[]
}

export function ChatbotWidget() {
  const { user } = useAuthStore()
  const navigate = useNavigate()
  const [isOpen, setIsOpen] = useState(false)
  const [showHistory, setShowHistory] = useState(false)
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const role: 'student' | 'tutor' = user?.role === 'tutor' ? 'tutor' : 'student'
  const userName = user?.name || (user as any)?.fullName || ''
  const userId = user?.id || (user as any)?.userId || 'guest'

  // Phân biệt Key LocalStorage theo userId + role để tài khoản mới không bị dính lịch sử cũ
  const sessionsStorageKey = `tutorconnect_chat_sessions_${userId}_${role}`
  const activeIdStorageKey = `tutorconnect_active_session_${userId}_${role}`

  const initialGreeting: ChatMessage = {
    id: 'welcome',
    sender: 'bot',
    text: role === 'student'
      ? `👋 Xin chào ${userName || 'Học viên'}! Tôi là Trợ lý AI TutorConnect. Bạn cần tôi hỗ trợ tìm gia sư, đặt lịch hay giải đáp nạp credit/hoàn tiền?`
      : `👋 Chào Gia sư ${userName || ''}! Tôi là Trợ lý AI TutorConnect. Tôi có thể giúp gì cho bạn về lịch dạy, tạo link Google Meet hay thù lao credit?`,
    timestamp: new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }),
    suggestedActions: role === 'student'
      ? [
          { label: '💳 Hướng dẫn Nạp Credit', link: '/student/wallet' },
          { label: '🔎 Tìm Gia sư môn học', link: '/student/tutors' },
          { label: '❓ Điều kiện Hoàn tiền 100%', link: '/student/schedule' },
        ]
      : [
          { label: '📅 Cách cài Lịch rảnh', link: '/tutor/timetable' },
          { label: '💰 Thù lao & Ví thu nhập', link: '/tutor/wallet' },
          { label: '🎥 Tạo link Google Meet', link: '/tutor/timetable' },
        ],
  }

  // Khởi tạo danh sách các cuộc trò chuyện từ localStorage
  const [sessions, setSessions] = useState<ChatSession[]>(() => {
    try {
      const saved = localStorage.getItem(sessionsStorageKey)
      if (saved) {
        const parsed = JSON.parse(saved)
        if (Array.isArray(parsed) && parsed.length > 0) return parsed
      }
    } catch (e) {
      console.warn('Lỗi đọc danh sách session từ localStorage:', e)
    }
    const defaultSess: ChatSession = {
      id: `sess-${Date.now()}`,
      title: 'Trò chuyện mới',
      createdAt: new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }),
      messages: [initialGreeting],
    }
    return [defaultSess]
  })

  // Session đang active
  const [activeSessionId, setActiveSessionId] = useState<string>(() => {
    try {
      const savedId = localStorage.getItem(activeIdStorageKey)
      if (savedId && sessions.some((s) => s.id === savedId)) return savedId
    } catch (e) {
      console.warn('Lỗi đọc active session ID:', e)
    }
    return sessions[0]?.id || `sess-${Date.now()}`
  })

  // Tự động tải lại lịch sử tương ứng khi đổi tài khoản (userId / sessionsStorageKey thay đổi)
  useEffect(() => {
    try {
      const saved = localStorage.getItem(sessionsStorageKey)
      if (saved) {
        const parsed = JSON.parse(saved)
        if (Array.isArray(parsed) && parsed.length > 0) {
          setSessions(parsed)
          const savedActiveId = localStorage.getItem(activeIdStorageKey)
          if (savedActiveId && parsed.some((s: ChatSession) => s.id === savedActiveId)) {
            setActiveSessionId(savedActiveId)
          } else if (parsed[0]?.id) {
            setActiveSessionId(parsed[0].id)
          }
          return
        }
      }
    } catch (e) {
      console.warn('Lỗi đọc lại session từ localStorage khi chuyển tài khoản:', e)
    }

    const defaultSess: ChatSession = {
      id: `sess-${Date.now()}`,
      title: 'Trò chuyện mới',
      createdAt: new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }),
      messages: [initialGreeting],
    }
    setSessions([defaultSess])
    setActiveSessionId(defaultSess.id)
  }, [sessionsStorageKey, activeIdStorageKey])

  // Tự động lưu toàn bộ danh sách sessions & active ID vào localStorage
  useEffect(() => {
    try {
      localStorage.setItem(sessionsStorageKey, JSON.stringify(sessions))
      localStorage.setItem(activeIdStorageKey, activeSessionId)
    } catch (e) {
      console.warn('Lỗi lưu chat session vào localStorage:', e)
    }
  }, [sessions, activeSessionId, sessionsStorageKey, activeIdStorageKey])

  // Lấy session hiện tại
  const currentSession = sessions.find((s) => s.id === activeSessionId) || sessions[0]
  const currentMessages = currentSession?.messages || [initialGreeting]

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [currentMessages, loading])

  // Gửi tin nhắn mới
  async function handleSend(textToSend?: string) {
    const query = textToSend || input.trim()
    if (!query || loading) return

    const userMsg: ChatMessage = {
      id: `usr-${Date.now()}`,
      sender: 'user',
      text: query,
      timestamp: new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }),
    }

    setSessions((prevSessions) =>
      prevSessions.map((sess) => {
        if (sess.id !== activeSessionId) return sess
        const updatedMessages = [...sess.messages, userMsg]
        const updatedTitle =
          sess.title === 'Trò chuyện mới' || sess.title === 'Cuộc trò chuyện mới'
            ? query.length > 25
              ? query.slice(0, 25) + '...'
              : query
            : sess.title
        return {
          ...sess,
          title: updatedTitle,
          messages: updatedMessages,
        }
      })
    )

    if (!textToSend) setInput('')
    setLoading(true)

    try {
      const res = await chatbotApi.ask({ message: query, role })
      const botMsg: ChatMessage = {
        id: `bot-${Date.now()}`,
        sender: 'bot',
        text: res.reply,
        timestamp: new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }),
        suggestedActions: res.suggestedActions,
      }

      setSessions((prevSessions) =>
        prevSessions.map((sess) => {
          if (sess.id !== activeSessionId) return sess
          return {
            ...sess,
            messages: [...sess.messages, botMsg],
          }
        })
      )
    } catch {
      const errorMsg: ChatMessage = {
        id: `err-${Date.now()}`,
        sender: 'bot',
        text: 'Rất tiếc, đã có lỗi khi kết nối với AI Assistant. Vui lòng thử lại sau!',
        timestamp: new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }),
      }
      setSessions((prevSessions) =>
        prevSessions.map((sess) => {
          if (sess.id !== activeSessionId) return sess
          return {
            ...sess,
            messages: [...sess.messages, errorMsg],
          }
        })
      )
    } finally {
      setLoading(false)
    }
  }

  function handleCreateNewChat() {
    const newSess: ChatSession = {
      id: `sess-${Date.now()}`,
      title: 'Cuộc trò chuyện mới',
      createdAt: new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }),
      messages: [initialGreeting],
    }
    setSessions((prev) => [newSess, ...prev])
    setActiveSessionId(newSess.id)
    setShowHistory(false)
  }

  function handleDeleteSession(sessionId: string, e: React.MouseEvent) {
    e.stopPropagation()
    const filtered = sessions.filter((s) => s.id !== sessionId)
    if (filtered.length === 0) {
      const newSess: ChatSession = {
        id: `sess-${Date.now()}`,
        title: 'Trò chuyện mới',
        createdAt: new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }),
        messages: [initialGreeting],
      }
      setSessions([newSess])
      setActiveSessionId(newSess.id)
    } else {
      setSessions(filtered)
      if (activeSessionId === sessionId && filtered[0]) {
        setActiveSessionId(filtered[0].id)
      }
    }
  }

  function handleClearAllHistory() {
    if (window.confirm('Bạn có chắc chắn muốn xóa TOÀN BỘ lịch sử các cuộc trò chuyện?')) {
      localStorage.removeItem(sessionsStorageKey)
      localStorage.removeItem(activeIdStorageKey)
      const newSess: ChatSession = {
        id: `sess-${Date.now()}`,
        title: 'Trò chuyện mới',
        createdAt: new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }),
        messages: [initialGreeting],
      }
      setSessions([newSess])
      setActiveSessionId(newSess.id)
      setShowHistory(false)
    }
  }

  return (
    <div className="fixed bottom-6 right-6 z-50">
      {/* NÚT BÓNG BÓNG MỞ CHATBOT */}
      {!isOpen && (
        <button
          type="button"
          onClick={() => setIsOpen(true)}
          className="group relative flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-tr from-indigo-600 via-brand-600 to-purple-600 text-white shadow-2xl transition-all hover:scale-110 active:scale-95"
          title="Mở AI Assistant"
        >
          <Bot className="h-7 w-7 transition-transform group-hover:rotate-12" />
          <span className="absolute -top-1 -right-1 flex h-4 w-4">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
            <span className="relative inline-flex rounded-full h-4 w-4 bg-emerald-500 border-2 border-white dark:border-slate-900" />
          </span>
        </button>
      )}

      {/* CỬA SỔ CHAT POPUP */}
      {isOpen && (
        <div className="relative flex h-[560px] w-[360px] sm:w-[420px] flex-col overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-2xl transition-all dark:border-slate-800 dark:bg-slate-900">
          {/* Header */}
          <div className="flex items-center justify-between border-b border-slate-100 bg-gradient-to-r from-indigo-600 to-brand-600 p-4 text-white dark:border-slate-800">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/20 backdrop-blur-xs">
                <Sparkles className="h-5 w-5 text-amber-300" />
              </div>
              <div>
                <h3 className="text-sm font-extrabold flex items-center gap-1.5">
                  TutorConnect AI
                  <span className="rounded-full bg-white/20 px-2 py-0.5 text-[10px] font-bold text-amber-200">24/7</span>
                </h3>
                <p className="text-[11px] text-emerald-200 font-medium flex items-center gap-1">🟢 Đang hoạt động</p>
              </div>
            </div>

            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={() => setShowHistory(!showHistory)}
                className={`flex items-center gap-1 rounded-lg px-2 py-1 text-[11px] font-bold transition ${
                  showHistory ? 'bg-white text-indigo-700' : 'bg-white/10 text-white hover:bg-white/20'
                }`}
                title="Danh sách lịch sử chat"
              >
                <History className="h-3.5 w-3.5 text-amber-300" />
                <span>Lịch sử ({sessions.length})</span>
              </button>

              <button
                type="button"
                onClick={handleCreateNewChat}
                className="flex items-center gap-1 rounded-lg bg-emerald-500 px-2 py-1 text-[11px] font-bold text-white hover:bg-emerald-600 transition shadow-xs"
                title="Tạo đoạn chat mới"
              >
                <PlusCircle className="h-3.5 w-3.5" />
                <span>Chat mới</span>
              </button>

              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="rounded-lg p-1.5 text-white/80 hover:bg-white/10 hover:text-white transition"
                title="Đóng chat"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
          </div>

          {/* MENU DANH SÁCH LỊCH SỬ CHAT */}
          {showHistory ? (
            <div className="flex-1 overflow-y-auto p-4 bg-slate-50 dark:bg-slate-900/90 space-y-2">
              <div className="flex items-center justify-between pb-2 border-b border-slate-200 dark:border-slate-800">
                <span className="text-xs font-bold text-slate-700 dark:text-slate-200">
                  📜 Lịch sử trò chuyện ({sessions.length})
                </span>
                <button
                  type="button"
                  onClick={handleClearAllHistory}
                  className="text-[11px] text-rose-500 hover:underline font-semibold flex items-center gap-1"
                >
                  <Trash2 className="h-3 w-3" />
                  Xóa tất cả
                </button>
              </div>

              {sessions.map((sess) => {
                const isActive = sess.id === activeSessionId
                return (
                  <div
                    key={sess.id}
                    onClick={() => {
                      setActiveSessionId(sess.id)
                      setShowHistory(false)
                    }}
                    className={`group flex items-center justify-between p-3 rounded-2xl border transition cursor-pointer ${
                      isActive
                        ? 'bg-brand-50 border-brand-300 dark:bg-brand-950/40 dark:border-brand-700'
                        : 'bg-white border-slate-200 hover:bg-slate-100 dark:bg-slate-800 dark:border-slate-700 dark:hover:bg-slate-700/60'
                    }`}
                  >
                    <div className="flex items-center gap-2.5 overflow-hidden">
                      <MessageSquare className={`h-4 w-4 shrink-0 ${isActive ? 'text-brand-600' : 'text-slate-400'}`} />
                      <div className="overflow-hidden">
                        <p className={`text-xs font-bold truncate ${isActive ? 'text-brand-700 dark:text-brand-300' : 'text-slate-800 dark:text-slate-200'}`}>
                          {sess.title}
                        </p>
                        <p className="text-[10px] text-slate-400">
                          {sess.messages.length} tin nhắn • {sess.createdAt}
                        </p>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={(e) => handleDeleteSession(sess.id, e)}
                      className="opacity-0 group-hover:opacity-100 p-1 text-slate-400 hover:text-rose-500 transition rounded-lg hover:bg-rose-50 dark:hover:bg-rose-950/30"
                      title="Xóa cuộc trò chuyện này"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                )
              })}
            </div>
          ) : (
            /* DANH SÁCH TIN NHẮN */
            <div className="flex-1 overflow-y-auto p-4 space-y-4 text-xs">
              {currentMessages.map((msg) => (
                <div
                  key={msg.id}
                  className={`flex flex-col ${msg.sender === 'user' ? 'items-end' : 'items-start'}`}
                >
                  <div
                    className={`max-w-[85%] rounded-2xl p-3.5 leading-relaxed shadow-xs ${
                      msg.sender === 'user'
                        ? 'bg-brand-600 text-white rounded-br-none'
                        : 'bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-200 rounded-bl-none'
                    }`}
                  >
                    <p className="whitespace-pre-line font-medium">{msg.text}</p>

                    {msg.suggestedActions && msg.suggestedActions.length > 0 && (
                      <div className="mt-3 pt-2.5 border-t border-slate-200 dark:border-slate-700/60 space-y-1.5">
                        {msg.suggestedActions.map((action, idx) => (
                          <button
                            key={idx}
                            type="button"
                            onClick={() => {
                              setIsOpen(false)
                              navigate(action.link)
                            }}
                            className="flex w-full items-center justify-between rounded-xl border border-brand-500/30 bg-brand-500/10 px-3 py-1.5 text-[11px] font-bold text-brand-600 hover:bg-brand-500/20 transition dark:text-brand-300"
                          >
                            <span>{action.label}</span>
                            <ChevronRight className="h-3.5 w-3.5" />
                          </button>
                        ))}
                      </div>
                    )}
                  </div>

                  <span className="mt-1 text-[10px] text-slate-400 px-1">{msg.timestamp}</span>
                </div>
              ))}

              {loading && (
                <div className="flex items-center gap-2 text-slate-400 bg-slate-100 dark:bg-slate-800 w-max px-3.5 py-2 rounded-2xl rounded-bl-none">
                  <span className="h-2 w-2 animate-bounce rounded-full bg-brand-500" />
                  <span className="h-2 w-2 animate-bounce rounded-full bg-brand-500 delay-150" />
                  <span className="h-2 w-2 animate-bounce rounded-full bg-brand-500 delay-300" />
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>
          )}

          {/* Quick suggestions & Input form footer */}
          {!showHistory && (
            <div className="border-t border-slate-100 dark:border-slate-800 p-3 bg-slate-50/50 dark:bg-slate-900/50">
              <div className="flex gap-1.5 overflow-x-auto pb-2 scrollbar-none text-[11px]">
                {(role === 'student'
                  ? ['Hoàn tiền 100%?', 'Nạp credit thế nào?', 'Tìm gia sư rảnh']
                  : ['Cách tạo lịch rảnh', 'Thù lao & Ví thu nhập', 'Tự tạo link Meet']
                ).map((prompt, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => handleSend(prompt)}
                    className="whitespace-nowrap rounded-xl border border-slate-200 bg-white px-3 py-1 font-semibold text-slate-600 hover:bg-slate-100 dark:border-slate-800 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700 transition shrink-0"
                  >
                    {prompt}
                  </button>
                ))}
              </div>

              {/* Input form */}
              <form
                onSubmit={(e) => {
                  e.preventDefault()
                  handleSend()
                }}
                className="flex items-center gap-2 mt-1"
              >
                <input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="Hỏi AI bất kỳ điều gì..."
                  className="flex-1 rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-brand-500 dark:border-slate-800 dark:bg-slate-800 dark:text-white"
                />
                <button
                  type="submit"
                  disabled={!input.trim() || loading}
                  className="flex h-9 w-9 items-center justify-center rounded-xl bg-brand-600 text-white transition hover:bg-brand-500 disabled:opacity-50 shrink-0"
                >
                  <Send className="h-4 w-4" />
                </button>
              </form>
            </div>
          )}
        </div>
      )}
    </div>
  )
}