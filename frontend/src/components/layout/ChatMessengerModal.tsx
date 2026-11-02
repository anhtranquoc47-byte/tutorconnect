import { useState, useEffect, useRef, useMemo } from 'react'
import { createPortal } from 'react-dom'
import {
  MessageCircle,
  Send,
  X,
  Search,
  Loader2,
  ShieldAlert,
  Paperclip,
  Smile,
  FileText,
  Download,
  GraduationCap,
  ShieldCheck,
  User,
  Users,
} from 'lucide-react'
import { useAuthStore } from '@/features/auth/auth.store'
import {
  chatApi,
  type ChatConversationResponse,
  type ChatMessageResponse,
  type ChatUserContactDto,
} from '@/apis/fe2/chat.api'

// Danh sách các biểu tượng cảm xúc chuẩn Facebook Messenger
const FB_REACTIONS = [
  { type: 'like', emoji: '👍', label: 'Thích' },
  { type: 'love', emoji: '❤️', label: 'Yêu thích' },
  { type: 'haha', emoji: '😂', label: 'Haha' },
  { type: 'wow', emoji: '😮', label: 'Wow' },
  { type: 'sad', emoji: '😢', label: 'Buồn' },
  { type: 'angry', emoji: '😡', label: 'Phẫn nộ' },
]

interface MessageReaction {
  userId: number
  userName: string
  emoji: string
  type: string
}

interface AttachedFileItem {
  id: string
  name: string
  size: number
  type: string
  dataUrl: string
  isImage: boolean
}

type RoleFilterType = 'ALL' | 'tutor' | 'student' | 'admin'

// Chuẩn hóa vai trò từ dữ liệu backend
function normalizeRole(role?: string): 'admin' | 'tutor' | 'student' {
  const r = (role || '').toLowerCase().trim()
  if (r.includes('admin') || r.includes('quản trị')) return 'admin'
  if (r.includes('tutor') || r.includes('gia su') || r.includes('sư')) return 'tutor'
  return 'student'
}

// Cấu hình giao diện theo vai trò (Avatar, Màu sắc, Badge)
function getRoleBadgeConfig(role?: string) {
  const normalized = normalizeRole(role)
  switch (normalized) {
    case 'admin':
      return {
        key: 'admin',
        label: 'Quản trị viên',
        shortLabel: 'Admin',
        icon: ShieldCheck,
        avatarBg: 'bg-gradient-to-tr from-purple-600 via-indigo-600 to-indigo-800 text-white shadow-xs',
        badgeBg: 'bg-purple-100 text-purple-700 border-purple-200',
        activeTabBg: 'bg-purple-600 text-white',
      }
    case 'tutor':
      return {
        key: 'tutor',
        label: 'Gia sư',
        shortLabel: 'Gia sư',
        icon: GraduationCap,
        avatarBg: 'bg-gradient-to-tr from-emerald-500 to-teal-600 text-white shadow-xs',
        badgeBg: 'bg-emerald-100 text-emerald-700 border-emerald-200',
        activeTabBg: 'bg-emerald-600 text-white',
      }
    case 'student':
    default:
      return {
        key: 'student',
        label: 'Học viên',
        shortLabel: 'Học viên',
        icon: User,
        avatarBg: 'bg-gradient-to-tr from-blue-500 to-cyan-600 text-white shadow-xs',
        badgeBg: 'bg-blue-100 text-blue-700 border-blue-200',
        activeTabBg: 'bg-blue-600 text-white',
      }
  }
}

// Định dạng kích thước file
function formatFileSize(bytes?: number): string {
  if (!bytes) return ''
  if (bytes < 1024) return bytes + ' B'
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB'
  return (bytes / (1024 * 1024)).toFixed(1) + ' MB'
}

export function ChatMessengerModal() {
  const { user } = useAuthStore()
  const [isOpen, setIsOpen] = useState(false)
  const [conversations, setConversations] = useState<ChatConversationResponse[]>([])
  const [activeConvId, setActiveConvId] = useState<number | null>(null)
  const [messages, setMessages] = useState<ChatMessageResponse[]>([])
  const [newMessage, setNewMessage] = useState('')
  const [loading, setLoading] = useState(false)
  const [sending, setSending] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [showContacts, setShowContacts] = useState(false)
  const [contacts, setContacts] = useState<ChatUserContactDto[]>([])
  const [loadingContacts, setLoadingContacts] = useState(false)

  // Bộ lọc vai trò cho Danh bạ người dùng: 'ALL' | 'tutor' | 'student' | 'admin'
  const [roleFilter, setRoleFilter] = useState<RoleFilterType>('ALL')

  // 1. Quản lý Đính kèm file & Dán ảnh (Ctrl + V)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [attachedFiles, setAttachedFiles] = useState<AttachedFileItem[]>([])
  const [previewImageModal, setPreviewImageModal] = useState<string | null>(null)

  // 2. Quản lý Thả cảm xúc (Reactions)
  const [hoveredMessageId, setHoveredMessageId] = useState<number | null>(null)
  const [reactionsMap, setReactionsMap] = useState<Record<number, MessageReaction[]>>(() => {
    try {
      const saved = localStorage.getItem('chat_messenger_reactions_v1')
      return saved ? JSON.parse(saved) : {}
    } catch {
      return {}
    }
  })

  const messagesEndRef = useRef<HTMLDivElement>(null)

  const saveReactions = (newMap: Record<number, MessageReaction[]>) => {
    setReactionsMap(newMap)
    try {
      localStorage.setItem('chat_messenger_reactions_v1', JSON.stringify(newMap))
    } catch (e) {
      console.error('Không thể lưu reactions:', e)
    }
  }

  const handleToggleReaction = (messageId: number, reactionType: string, reactionEmoji: string) => {
    if (!user) return
    const currentList = reactionsMap[messageId] || []
    const existingIndex = currentList.findIndex((r) => r.userId === user.id)

    let updatedList: MessageReaction[]
    if (existingIndex > -1) {
      const existingReaction = currentList[existingIndex]
      if (existingReaction && existingReaction.emoji === reactionEmoji) {
        // Gỡ bỏ reaction nếu bấm lại đúng emoji đó
        updatedList = currentList.filter((_, idx) => idx !== existingIndex)
      } else {
        // Chuyển sang reaction khác
        updatedList = [
          ...currentList.filter((_, idx) => idx !== existingIndex),
          { userId: user.id, userName: user.name || 'Người dùng', emoji: reactionEmoji, type: reactionType },
        ]
      }
    } else {
      // Thêm reaction mới
      updatedList = [
        ...currentList,
        { userId: user.id, userName: user.name || 'Người dùng', emoji: reactionEmoji, type: reactionType },
      ]
    }

    const newMap = { ...reactionsMap, [messageId]: updatedList }
    saveReactions(newMap)
  }

  // Tải danh sách hội thoại
  const loadConversations = async () => {
    try {
      const data = await chatApi.getMyConversations()
      const list = Array.isArray(data) ? data : []
      setConversations(list)

      const firstConv = list.length > 0 ? list[0] : null
      if (!activeConvId && firstConv && firstConv.id) {
        setActiveConvId(firstConv.id)
      }
    } catch (err) {
      console.error('Lỗi tải danh sách hội thoại:', err)
    }
  }

  // Tải tin nhắn của hội thoại đang chọn
  const loadMessages = async (convId: number) => {
    try {
      const data = await chatApi.getMessages(convId)
      setMessages(Array.isArray(data) ? data : [])
    } catch (err) {
      console.error('Lỗi tải tin nhắn:', err)
    }
  }

  // Tải danh bạ người dùng
  const loadContacts = async () => {
    setLoadingContacts(true)
    try {
      const data = await chatApi.getContacts()
      setContacts(Array.isArray(data) ? data : [])
    } catch (err) {
      console.error('Lỗi tải danh bạ:', err)
    } finally {
      setLoadingContacts(false)
    }
  }

  useEffect(() => {
    loadConversations()
    const interval = setInterval(() => {
      loadConversations()
      if (isOpen && activeConvId) {
        loadMessages(activeConvId)
      }
    }, 3000)
    return () => clearInterval(interval)
  }, [isOpen, activeConvId])

  useEffect(() => {
    if (activeConvId && isOpen) {
      setLoading(true)
      loadMessages(activeConvId).finally(() => setLoading(false))
    }
  }, [activeConvId, isOpen])

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  // Xử lý nạp File xem trước
  const addFile = (file: File) => {
    if (file.size > 10 * 1024 * 1024) {
      alert(`Tệp "${file.name}" vượt quá giới hạn dung lượng 10MB!`)
      return
    }
    const reader = new FileReader()
    reader.onload = () => {
      const isImg = file.type.startsWith('image/')
      const item: AttachedFileItem = {
        id: `${Date.now()}-${Math.random()}`,
        name: file.name,
        size: file.size,
        type: file.type,
        dataUrl: reader.result as string,
        isImage: isImg,
      }
      setAttachedFiles((prev) => [...prev, item])
    }
    reader.readAsDataURL(file)
  }

  // Bắt sự kiện dán ảnh Ctrl + V
  const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    const items = e.clipboardData?.items
    if (!items) return

    let hasImage = false
    for (let i = 0; i < items.length; i++) {
      const item = items[i]
      if (item && item.type.indexOf('image') !== -1) {
        const file = item.getAsFile()
        if (file) {
          hasImage = true
          addFile(file)
        }
      }
    }
    if (hasImage) {
      e.preventDefault()
    }
  }

  // Chọn file từ nút kẹp ghim
  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (!files || files.length === 0) return
    Array.from(files).forEach((file) => addFile(file))
    e.target.value = ''
  }

  const handleRemoveAttachment = (id: string) => {
    setAttachedFiles((prev) => prev.filter((f) => f.id !== id))
  }

  const totalUnread = conversations.reduce((sum, c) => sum + (c.unreadCount || 0), 0)

  // Gửi tin nhắn
  const handleSendMessage = async (e?: React.FormEvent) => {
    if (e) e.preventDefault()
    if ((!newMessage.trim() && attachedFiles.length === 0) || !activeConvId || sending) return

    setSending(true)
    try {
      if (attachedFiles.length === 0) {
        const sentMsg = await chatApi.sendMessage(activeConvId, newMessage.trim())
        setMessages((prev) => [...prev, sentMsg])
      } else {
        for (let i = 0; i < attachedFiles.length; i++) {
          const file = attachedFiles[i]
          if (!file) continue

          const attachmentPayload = JSON.stringify({
            name: file.name,
            size: file.size,
            type: file.type,
            dataUrl: file.dataUrl,
            isImage: file.isImage,
          })

          let text = ''
          if (i === 0 && newMessage.trim()) {
            text = newMessage.trim()
          } else {
            text = file.isImage ? '[Hình ảnh]' : `[Tệp đính kèm: ${file.name}]`
          }

          const sentMsg = await chatApi.sendMessage(activeConvId, text, attachmentPayload)
          setMessages((prev) => [...prev, sentMsg])
        }
        setAttachedFiles([])
      }
      setNewMessage('')
      loadConversations()
    } catch {
      alert('Không thể gửi tin nhắn. Vui lòng thử lại!')
    } finally {
      setSending(false)
    }
  }

  const handleStartChatWithUser = async (targetUserId: number) => {
    try {
      const conv = await chatApi.createConversation(targetUserId)
      setShowContacts(false)
      await loadConversations()
      if (conv && conv.id) {
        setActiveConvId(conv.id)
      }
    } catch {
      alert('Không thể mở cuộc trò chuyện với người dùng này!')
    }
  }

  const activeConversation = conversations.find((c) => c.id === activeConvId)
  const otherPartyName = activeConversation ? activeConversation.otherUserName : ''
  const otherPartyRole = activeConversation ? activeConversation.otherUserRole : ''

  const filteredConversations = conversations.filter((c) => {
    return (c.otherUserName || '').toLowerCase().includes(searchTerm.toLowerCase())
  })

  // Thống kê số lượng theo vai trò trong danh bạ
  const roleCounts = useMemo(() => {
    let tutorCount = 0
    let studentCount = 0
    let adminCount = 0
    contacts.forEach((c) => {
      const r = normalizeRole(c.role)
      if (r === 'tutor') tutorCount++
      else if (r === 'admin') adminCount++
      else studentCount++
    })
    return {
      all: contacts.length,
      tutor: tutorCount,
      student: studentCount,
      admin: adminCount,
    }
  }, [contacts])

  // Lọc danh bạ theo từ khóa tìm kiếm và tab vai trò
  const filteredContacts = useMemo(() => {
    return contacts.filter((c) => {
      const search = searchTerm.trim().toLowerCase()
      const matchSearch =
        !search ||
        (c.fullName || '').toLowerCase().includes(search) ||
        (c.email || '').toLowerCase().includes(search) ||
        (c.role || '').toLowerCase().includes(search)

      if (!matchSearch) return false

      if (roleFilter === 'ALL') return true
      return normalizeRole(c.role) === roleFilter
    })
  }, [contacts, searchTerm, roleFilter])

  // Gom nhóm danh bạ theo vai trò khi ở tab "Tất cả"
  const groupedContacts = useMemo(() => {
    if (roleFilter !== 'ALL' || searchTerm.trim().length > 0) {
      return null
    }
    const admins = contacts.filter((c) => normalizeRole(c.role) === 'admin')
    const tutors = contacts.filter((c) => normalizeRole(c.role) === 'tutor')
    const students = contacts.filter((c) => normalizeRole(c.role) === 'student')
    return { admins, tutors, students }
  }, [contacts, roleFilter, searchTerm])

  // Hiển thị nội dung tin nhắn, ảnh và file đính kèm
  const renderMessageContent = (msg: ChatMessageResponse, isMe: boolean) => {
    let attachmentData: AttachedFileItem | null = null
    if (msg.attachmentUrl) {
      try {
        attachmentData = JSON.parse(msg.attachmentUrl)
      } catch {
        if (msg.attachmentUrl.startsWith('data:image/') || /\.(png|jpe?g|gif|webp|svg)$/i.test(msg.attachmentUrl)) {
          attachmentData = {
            id: String(msg.id),
            name: 'Hình ảnh',
            size: 0,
            type: 'image/*',
            dataUrl: msg.attachmentUrl,
            isImage: true,
          }
        }
      }
    }

    const isOnlyFallbackText =
      msg.content === '[Hình ảnh]' || (attachmentData && msg.content === `[Tệp đính kèm: ${attachmentData.name}]`)

    return (
      <div className="flex flex-col gap-1.5">
        {!isOnlyFallbackText && (
          <div className="leading-relaxed break-words whitespace-pre-wrap">{msg.content}</div>
        )}

        {/* 1. Hiển thị ảnh kèm Lightbox phóng to */}
        {attachmentData && attachmentData.isImage && (
          <div className="overflow-hidden rounded-xl border border-slate-200/40 bg-black/5 mt-0.5">
            <img
              src={attachmentData.dataUrl}
              alt={attachmentData.name || 'Hình ảnh'}
              className="max-h-56 max-w-full rounded-lg object-contain cursor-pointer hover:opacity-95 transition"
              onClick={() => {
                if (attachmentData) {
                  setPreviewImageModal(attachmentData.dataUrl)
                }
              }}
              title="Bấm để xem ảnh kích thước lớn"
            />
          </div>
        )}

        {/* 2. Hiển thị tệp đính kèm kèm nút tải xuống */}
        {attachmentData && !attachmentData.isImage && (
          <div
            className={`flex items-center gap-2.5 rounded-xl p-2 mt-0.5 border transition ${
              isMe
                ? 'bg-indigo-700/80 border-indigo-500/50 text-white'
                : 'bg-slate-50 border-slate-200 text-slate-800'
            }`}
          >
            <div
              className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg ${
                isMe ? 'bg-white/20 text-white' : 'bg-indigo-100 text-indigo-600'
              }`}
            >
              <FileText className="h-5 w-5" />
            </div>
            <div className="flex-1 min-w-0 pr-1 text-left">
              <p className="truncate text-xs font-semibold leading-tight">{attachmentData.name}</p>
              {attachmentData.size > 0 && (
                <p className={`text-[10px] ${isMe ? 'text-indigo-200' : 'text-slate-400'}`}>
                  {formatFileSize(attachmentData.size)}
                </p>
              )}
            </div>
            <a
              href={attachmentData.dataUrl}
              download={attachmentData.name}
              className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-lg transition ${
                isMe
                  ? 'bg-white/20 text-white hover:bg-white/30'
                  : 'bg-indigo-600 text-white hover:bg-indigo-700'
              }`}
              title={`Tải xuống "${attachmentData.name}"`}
            >
              <Download className="h-3.5 w-3.5" />
            </a>
          </div>
        )}
      </div>
    )
  }

  // Component phụ hiển thị một mục liên hệ trong danh bạ
  const renderContactItem = (contact: ChatUserContactDto) => {
    const config = getRoleBadgeConfig(contact.role)
    const RoleIcon = config.icon

    return (
      <button
        key={contact.userId}
        onClick={() => handleStartChatWithUser(contact.userId)}
        className="flex w-full items-center gap-2.5 px-3 py-2.5 text-left transition hover:bg-indigo-50/70 border-b border-slate-100 last:border-b-0"
      >
        <div className="relative">
          <div className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-xs font-bold ${config.avatarBg}`}>
            {contact.fullName ? contact.fullName.charAt(0).toUpperCase() : 'U'}
          </div>
          <span
            className={`absolute -bottom-0.5 -right-0.5 flex h-4 w-4 items-center justify-center rounded-full border border-white text-[9px] ${
              config.key === 'admin'
                ? 'bg-purple-600 text-white'
                : config.key === 'tutor'
                ? 'bg-emerald-600 text-white'
                : 'bg-blue-600 text-white'
            }`}
            title={config.label}
          >
            <RoleIcon className="h-2.5 w-2.5" />
          </span>
        </div>

        <div className="flex-1 overflow-hidden">
          <div className="flex items-center justify-between gap-1">
            <span className="truncate text-xs font-bold text-slate-800">{contact.fullName}</span>
            <span
              className={`inline-flex shrink-0 items-center gap-0.5 rounded-md px-1.5 py-0.5 text-[9px] font-bold border ${config.badgeBg}`}
            >
              {config.key === 'admin' ? '🛡️ Admin' : config.key === 'tutor' ? '👨‍🏫 Gia sư' : '🎓 Học viên'}
            </span>
          </div>
          <p className="truncate text-[10px] text-slate-400 mt-0.5">{contact.email}</p>
        </div>
      </button>
    )
  }

  if (!user) return null

  const modalContent = isOpen ? (
    <div className="fixed inset-0 z-[99999] flex items-center justify-center bg-slate-900/60 p-4 sm:p-6 backdrop-blur-xs">
      <div className="flex h-[590px] max-h-[88vh] w-full max-w-3xl overflow-hidden rounded-2xl bg-white shadow-2xl border border-slate-200">
        {/* CỘT TRÁI: Danh sách cuộc trò chuyện / Danh bạ */}
        <div className="flex w-80 shrink-0 flex-col border-r border-slate-200 bg-slate-50">
          <div className="flex items-center justify-between border-b border-slate-200 p-3 bg-white">
            <h3 className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
              <MessageCircle className="h-4 w-4 text-indigo-600" />
              {showContacts ? 'Danh bạ người dùng' : 'Tin nhắn'}
            </h3>

            <div className="flex gap-1">
              {user.role !== 'admin' && (
                <button
                  onClick={() => handleStartChatWithUser(0)}
                  className="rounded-lg bg-emerald-600 px-2 py-1 text-[11px] font-bold text-white hover:bg-emerald-700 transition flex items-center gap-1 shadow-xs"
                  title="Chat trực tiếp với Admin Hỗ Trợ"
                >
                  <ShieldAlert className="h-3 w-3" />
                  Admin
                </button>
              )}

              <button
                onClick={() => {
                  if (!showContacts) loadContacts()
                  setShowContacts(!showContacts)
                }}
                className={`rounded-lg px-2.5 py-1 text-[11px] font-bold transition flex items-center gap-1 ${
                  showContacts ? 'bg-slate-200 text-slate-800' : 'bg-indigo-600 text-white hover:bg-indigo-700 shadow-xs'
                }`}
                title="Tạo cuộc hội thoại mới"
              >
                {showContacts ? 'Hội thoại' : '+ Chat Mới'}
              </button>
            </div>
          </div>

          {/* Ô TÌM KIẾM */}
          <div className="p-2.5 bg-slate-50 border-b border-slate-200">
            <div className="relative">
              <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-slate-400" />
              <input
                type="text"
                placeholder={showContacts ? 'Tìm theo tên, email, vai trò...' : 'Tìm hội thoại...'}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full rounded-xl border border-slate-200 bg-white pl-8 pr-3 py-1.5 text-xs text-slate-800 placeholder:text-slate-400 focus:outline-hidden focus:border-indigo-400 transition"
              />
            </div>

            {/* BỘ LỌC PHÂN LOẠI VAI TRÒ DÀNH CHO DANH BẠ */}
            {showContacts && (
              <div className="mt-2 grid grid-cols-4 gap-1">
                <button
                  type="button"
                  onClick={() => setRoleFilter('ALL')}
                  className={`rounded-lg px-1 py-1 text-[10px] font-bold transition flex flex-col items-center justify-center border ${
                    roleFilter === 'ALL'
                      ? 'bg-slate-800 text-white border-slate-800 shadow-xs'
                      : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-100'
                  }`}
                  title="Tất cả người dùng"
                >
                  <span>Tất cả</span>
                  <span className="text-[9px] opacity-80">({roleCounts.all})</span>
                </button>

                <button
                  type="button"
                  onClick={() => setRoleFilter('tutor')}
                  className={`rounded-lg px-1 py-1 text-[10px] font-bold transition flex flex-col items-center justify-center border ${
                    roleFilter === 'tutor'
                      ? 'bg-emerald-600 text-white border-emerald-600 shadow-xs'
                      : 'bg-white text-emerald-700 border-emerald-200 hover:bg-emerald-50'
                  }`}
                  title="Chỉ hiển thị Gia sư"
                >
                  <span className="truncate">👨‍🏫 Gia sư</span>
                  <span className="text-[9px] opacity-80">({roleCounts.tutor})</span>
                </button>

                <button
                  type="button"
                  onClick={() => setRoleFilter('student')}
                  className={`rounded-lg px-1 py-1 text-[10px] font-bold transition flex flex-col items-center justify-center border ${
                    roleFilter === 'student'
                      ? 'bg-blue-600 text-white border-blue-600 shadow-xs'
                      : 'bg-white text-blue-700 border-blue-200 hover:bg-blue-50'
                  }`}
                  title="Chỉ hiển thị Học viên"
                >
                  <span className="truncate">🎓 Học viên</span>
                  <span className="text-[9px] opacity-80">({roleCounts.student})</span>
                </button>

                <button
                  type="button"
                  onClick={() => setRoleFilter('admin')}
                  className={`rounded-lg px-1 py-1 text-[10px] font-bold transition flex flex-col items-center justify-center border ${
                    roleFilter === 'admin'
                      ? 'bg-purple-600 text-white border-purple-600 shadow-xs'
                      : 'bg-white text-purple-700 border-purple-200 hover:bg-purple-50'
                  }`}
                  title="Chỉ hiển thị Quản trị viên"
                >
                  <span className="truncate">🛡️ Admin</span>
                  <span className="text-[9px] opacity-80">({roleCounts.admin})</span>
                </button>
              </div>
            )}
          </div>

          {/* DANH SÁCH CUỘC HỘI THOẠI HOẶC DANH BẠ ĐÃ PHÂN LOẠI */}
          <div className="flex-1 overflow-y-auto divide-y divide-slate-100 bg-slate-50">
            {showContacts ? (
              loadingContacts ? (
                <div className="p-6 text-center text-xs text-slate-400 flex flex-col items-center justify-center gap-2">
                  <Loader2 className="h-5 w-5 animate-spin text-indigo-600" />
                  <span>Đang tải danh bạ người dùng...</span>
                </div>
              ) : filteredContacts.length === 0 ? (
                <div className="p-6 text-center text-xs text-slate-400">
                  <Users className="h-8 w-8 mx-auto text-slate-300 mb-1.5" />
                  Không tìm thấy người dùng phù hợp.
                </div>
              ) : groupedContacts ? (
                /* HIỂN THỊ PHÂN NHÓM KHI XEM TAB "TẤT CẢ" */
                <div className="divide-y divide-slate-200">
                  {/* Nhóm 1: Admin */}
                  {groupedContacts.admins.length > 0 && (
                    <div>
                      <div className="sticky top-0 z-10 flex items-center justify-between bg-purple-50/90 px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider text-purple-700 backdrop-blur-xs border-b border-purple-100">
                        <span className="flex items-center gap-1">
                          <ShieldCheck className="h-3 w-3" /> Quản trị viên
                        </span>
                        <span className="rounded-full bg-purple-200 px-1.5 text-[9px] text-purple-800">
                          {groupedContacts.admins.length}
                        </span>
                      </div>
                      <div className="bg-white">{groupedContacts.admins.map(renderContactItem)}</div>
                    </div>
                  )}

                  {/* Nhóm 2: Gia sư */}
                  {groupedContacts.tutors.length > 0 && (
                    <div>
                      <div className="sticky top-0 z-10 flex items-center justify-between bg-emerald-50/90 px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider text-emerald-700 backdrop-blur-xs border-b border-emerald-100">
                        <span className="flex items-center gap-1">
                          <GraduationCap className="h-3.5 w-3.5" /> Đội ngũ Gia sư
                        </span>
                        <span className="rounded-full bg-emerald-200 px-1.5 text-[9px] text-emerald-800">
                          {groupedContacts.tutors.length}
                        </span>
                      </div>
                      <div className="bg-white">{groupedContacts.tutors.map(renderContactItem)}</div>
                    </div>
                  )}

                  {/* Nhóm 3: Học viên */}
                  {groupedContacts.students.length > 0 && (
                    <div>
                      <div className="sticky top-0 z-10 flex items-center justify-between bg-blue-50/90 px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider text-blue-700 backdrop-blur-xs border-b border-blue-100">
                        <span className="flex items-center gap-1">
                          <User className="h-3 w-3" /> Danh sách Học viên
                        </span>
                        <span className="rounded-full bg-blue-200 px-1.5 text-[9px] text-blue-800">
                          {groupedContacts.students.length}
                        </span>
                      </div>
                      <div className="bg-white">{groupedContacts.students.map(renderContactItem)}</div>
                    </div>
                  )}
                </div>
              ) : (
                /* HIỂN THỊ DANH SÁCH THEO TAB RIÊNG BIỆT */
                <div className="bg-white">{filteredContacts.map(renderContactItem)}</div>
              )
            ) : filteredConversations.length === 0 ? (
              <div className="p-6 text-center text-xs text-slate-400">
                <p>Chưa có cuộc trò chuyện nào.</p>
                <button
                  onClick={() => {
                    loadContacts()
                    setShowContacts(true)
                  }}
                  className="mt-3 inline-flex items-center gap-1 rounded-xl bg-indigo-50 px-3 py-1.5 text-xs font-bold text-indigo-600 hover:bg-indigo-100 transition shadow-xs"
                >
                  <Users className="h-3.5 w-3.5" /> Mở danh bạ chọn người nhắn
                </button>
              </div>
            ) : (
              filteredConversations.map((conv) => {
                const isActive = conv.id === activeConvId
                const config = getRoleBadgeConfig(conv.otherUserRole)
                return (
                  <button
                    key={conv.id}
                    onClick={() => setActiveConvId(conv.id)}
                    className={`flex w-full items-center gap-2.5 p-2.5 text-left transition ${
                      isActive ? 'bg-indigo-100/70 border-l-4 border-indigo-600' : 'hover:bg-slate-200/60'
                    }`}
                  >
                    <div className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-xs font-bold ${config.avatarBg}`}>
                      {conv.otherUserName ? conv.otherUserName.charAt(0).toUpperCase() : 'U'}
                    </div>
                    <div className="flex-1 overflow-hidden">
                      <div className="flex items-center justify-between">
                        <span className="truncate text-xs font-bold text-slate-800">{conv.otherUserName}</span>
                        {conv.unreadCount > 0 && (
                          <span className="rounded-full bg-rose-500 px-1.5 py-0.5 text-[9px] font-bold text-white shadow-xs">
                            {conv.unreadCount}
                          </span>
                        )}
                      </div>
                      <div className="flex items-center justify-between gap-1 mt-0.5">
                        <p className="truncate text-[11px] text-slate-500">
                          {conv.lastMessage || 'Bắt đầu cuộc trò chuyện...'}
                        </p>
                        <span className={`inline-flex shrink-0 items-center rounded-md px-1 py-0.2 text-[8px] font-bold border ${config.badgeBg}`}>
                          {config.shortLabel}
                        </span>
                      </div>
                    </div>
                  </button>
                )
              })
            )}
          </div>
        </div>

        {/* CỘT PHẢI: Khung nhắn tin chính */}
        <div className="flex flex-1 flex-col bg-white">
          <div className="flex items-center justify-between border-b border-slate-200 px-4 py-2.5 bg-slate-50">
            <div className="flex items-center gap-2.5">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-indigo-600 text-xs font-bold text-white shadow-xs">
                {otherPartyName ? otherPartyName.charAt(0).toUpperCase() : 'U'}
              </div>
              <div>
                <h4 className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                  {otherPartyName || 'Chọn cuộc hội thoại'}
                  {otherPartyRole && (
                    <span className="rounded-md bg-slate-200 px-1.5 py-0.5 text-[9px] text-slate-700 font-semibold">
                      {otherPartyRole}
                    </span>
                  )}
                </h4>
                <span className="text-[9px] text-emerald-600 font-semibold flex items-center gap-1">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" /> Trực tuyến
                </span>
              </div>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="rounded-lg p-1 text-slate-400 hover:bg-slate-200 hover:text-slate-700 transition"
              title="Đóng cửa sổ"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto p-3 space-y-3 bg-slate-50/30">
            {!activeConvId ? (
              <div className="flex h-full flex-col items-center justify-center text-slate-400">
                <MessageCircle className="h-10 w-10 text-slate-300 mb-2" />
                <p className="text-xs mb-2">Vui lòng chọn một cuộc trò chuyện hoặc danh bạ</p>
                <button
                  onClick={() => {
                    loadContacts()
                    setShowContacts(true)
                  }}
                  className="rounded-xl bg-indigo-600 px-3 py-1.5 text-xs font-bold text-white hover:bg-indigo-700 transition shadow-xs"
                >
                  💬 Mở danh bạ chọn người nhắn
                </button>
              </div>
            ) : loading ? (
              <div className="flex h-full items-center justify-center">
                <Loader2 className="h-5 w-5 animate-spin text-indigo-600" />
              </div>
            ) : messages.length === 0 ? (
              <div className="flex h-full flex-col items-center justify-center text-slate-400">
                <p className="text-xs">Chưa có tin nhắn nào. Hãy gửi tin nhắn đầu tiên!</p>
              </div>
            ) : (
              messages.map((msg) => {
                const isMe = msg.senderId === user.id
                const msgReactions = reactionsMap[msg.id] || []
                const myReaction = msgReactions.find((r) => r.userId === user.id)
                const isHovered = hoveredMessageId === msg.id

                const uniqueEmojis = Array.from(new Set(msgReactions.map((r) => r.emoji)))
                const reactionTooltip = msgReactions
                  .map((r) => `${r.userId === user.id ? 'Bạn' : r.userName}: ${r.emoji}`)
                  .join('\n')

                return (
                  <div
                    key={msg.id}
                    className={`group relative flex flex-col ${isMe ? 'items-end' : 'items-start'}`}
                    onMouseEnter={() => setHoveredMessageId(msg.id)}
                    onMouseLeave={() => setHoveredMessageId(null)}
                  >
                    <span className="text-[9px] text-slate-400 mb-0.5 px-1">
                      {msg.senderName} •{' '}
                      {new Date(
                        msg.sentAtUtc.endsWith('Z') ? msg.sentAtUtc : msg.sentAtUtc + 'Z',
                      ).toLocaleString('vi-VN', {
                        hour: '2-digit',
                        minute: '2-digit',
                        day: '2-digit',
                        month: '2-digit',
                      })}
                    </span>

                    <div className="relative flex items-center gap-1.5 max-w-[85%]">
                      {/* THANH THẢ CẢM XÚC LIKE, TIM NHƯ FACEBOOK (Hover xuất hiện) */}
                      <div
                        className={`absolute -top-9 z-20 flex items-center gap-1 rounded-full bg-white px-2 py-1 shadow-lg border border-slate-200 transition-all duration-200 ${
                          isHovered
                            ? 'opacity-100 scale-100 pointer-events-auto'
                            : 'opacity-0 scale-90 pointer-events-none'
                        } ${isMe ? 'right-0' : 'left-0'}`}
                      >
                        {FB_REACTIONS.map((re) => {
                          const isSelected = myReaction?.emoji === re.emoji
                          return (
                            <button
                              key={re.type}
                              type="button"
                              onClick={() => handleToggleReaction(msg.id, re.type, re.emoji)}
                              className={`cursor-pointer text-base transition-transform duration-150 hover:scale-135 p-0.5 rounded-full ${
                                isSelected ? 'bg-indigo-100 scale-110' : ''
                              }`}
                              title={re.label}
                            >
                              {re.emoji}
                            </button>
                          )
                        })}
                      </div>

                      {/* Icon Mặt cười kích hoạt reaction trên desktop */}
                      {isMe && (
                        <button
                          type="button"
                          onClick={() => setHoveredMessageId(hoveredMessageId === msg.id ? null : msg.id)}
                          className="opacity-0 group-hover:opacity-100 transition rounded-full p-1 text-slate-400 hover:text-slate-600 hover:bg-slate-100"
                          title="Thả cảm xúc"
                        >
                          <Smile className="h-3.5 w-3.5" />
                        </button>
                      )}

                      {/* Bong bóng tin nhắn */}
                      <div
                        className={`relative rounded-2xl px-3 py-2 text-xs shadow-xs ${
                          isMe
                            ? 'bg-indigo-600 text-white rounded-br-xs'
                            : 'bg-white text-slate-800 border border-slate-200 rounded-bl-xs'
                        }`}
                      >
                        {renderMessageContent(msg, isMe)}

                        {/* Huy hiệu Reaction đã thả ở góc dưới bong bóng chat */}
                        {msgReactions.length > 0 && (
                          <div
                            onClick={() =>
                              handleToggleReaction(
                                msg.id,
                                myReaction?.type || 'like',
                                myReaction?.emoji || '👍',
                              )
                            }
                            className={`absolute -bottom-2.5 flex cursor-pointer items-center gap-0.5 rounded-full border px-1.5 py-0.5 text-[10px] shadow-sm transition hover:scale-105 ${
                              isMe ? 'right-2' : 'left-2'
                            } ${
                              myReaction
                                ? 'border-indigo-300 bg-indigo-50 text-indigo-700 font-bold'
                                : 'border-slate-200 bg-white text-slate-600'
                            }`}
                            title={reactionTooltip || 'Bấm để đổi cảm xúc'}
                          >
                            <span>{uniqueEmojis.slice(0, 3).join('')}</span>
                            {msgReactions.length > 1 && (
                              <span className="ml-0.5 text-[9px]">{msgReactions.length}</span>
                            )}
                          </div>
                        )}
                      </div>

                      {!isMe && (
                        <button
                          type="button"
                          onClick={() => setHoveredMessageId(hoveredMessageId === msg.id ? null : msg.id)}
                          className="opacity-0 group-hover:opacity-100 transition rounded-full p-1 text-slate-400 hover:text-slate-600 hover:bg-slate-100"
                          title="Thả cảm xúc"
                        >
                          <Smile className="h-3.5 w-3.5" />
                        </button>
                      )}
                    </div>

                    {/* Đệm chiều cao cho huy hiệu reaction */}
                    {msgReactions.length > 0 && <div className="h-2" />}
                  </div>
                )
              })
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* KHUNG NHẬP TIN NHẮN, DÁN ẢNH & ĐÍNH KÈM TỆP */}
          {activeConvId && (
            <div className="border-t border-slate-200 bg-white">
              {/* Khay xem trước ảnh & file đính kèm trước khi gửi */}
              {attachedFiles.length > 0 && (
                <div className="flex flex-wrap gap-2 p-2 bg-slate-50 border-b border-slate-200 max-h-28 overflow-y-auto">
                  {attachedFiles.map((file) => (
                    <div
                      key={file.id}
                      className="relative flex items-center gap-2 rounded-xl border border-slate-200 bg-white p-1.5 shadow-xs"
                    >
                      {file.isImage ? (
                        <img
                          src={file.dataUrl}
                          alt={file.name}
                          className="h-10 w-10 rounded-lg object-cover border border-slate-200"
                        />
                      ) : (
                        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-indigo-50 text-indigo-600">
                          <FileText className="h-5 w-5" />
                        </div>
                      )}
                      <div className="max-w-[130px] text-left">
                        <p className="truncate text-[11px] font-semibold text-slate-700">{file.name}</p>
                        <p className="text-[9px] text-slate-400">{formatFileSize(file.size)}</p>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleRemoveAttachment(file.id)}
                        className="cursor-pointer rounded-full p-1 text-slate-400 hover:bg-slate-100 hover:text-rose-500 transition"
                        title="Hủy tệp này"
                      >
                        <X className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              )}

              <form onSubmit={handleSendMessage} className="p-2.5 flex items-center gap-2">
                {/* Input chọn file ẩn */}
                <input
                  ref={fileInputRef}
                  type="file"
                  multiple
                  onChange={handleFileInputChange}
                  className="hidden"
                  accept="image/*,.pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.txt,.zip,.rar"
                />

                {/* NÚT KẸP GHIM ĐÍNH KÈM TỆP / ẢNH */}
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="cursor-pointer flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-slate-100 text-slate-600 hover:bg-slate-200 hover:text-indigo-600 transition"
                  title="Đính kèm tệp tin hoặc hình ảnh"
                >
                  <Paperclip className="h-4 w-4" />
                </button>

                {/* Ô NHẬP TIN NHẮN (HỖ TRỢ CTRL + V DÁN ẢNH TRỰC TIẾP) */}
                <input
                  type="text"
                  placeholder="Nhập tin nhắn (hoặc dán Ctrl + V ảnh)..."
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  onPaste={handlePaste}
                  className="flex-1 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs text-slate-800 placeholder:text-slate-400 focus:border-indigo-500 focus:bg-white focus:outline-hidden transition"
                />

                {/* NÚT GỬI */}
                <button
                  type="submit"
                  disabled={(!newMessage.trim() && attachedFiles.length === 0) || sending}
                  className="cursor-pointer flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-indigo-600 text-white hover:bg-indigo-700 disabled:opacity-40 transition font-bold shadow-xs"
                  title="Gửi tin nhắn"
                >
                  {sending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                </button>
              </form>
            </div>
          )}
        </div>
      </div>
    </div>
  ) : null

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="relative flex h-9 w-9 items-center justify-center rounded-xl bg-slate-100 text-slate-700 hover:bg-slate-200 transition"
        title="Nhắn tin Messenger"
      >
        <MessageCircle className="h-4 w-4 text-indigo-600" />
        {totalUnread > 0 && (
          <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-rose-500 text-[9px] font-bold text-white shadow-xs">
            {totalUnread > 9 ? '9+' : totalUnread}
          </span>
        )}
      </button>

      {/* MODAL LIGHTBOX PHÓNG TO ẢNH FULL MÀN HÌNH */}
      {previewImageModal && (
        <div
          className="fixed inset-0 z-[100000] flex items-center justify-center bg-black/80 p-4 backdrop-blur-xs"
          onClick={() => setPreviewImageModal(null)}
        >
          <div
            className="relative max-h-[90vh] max-w-[90vw] overflow-hidden rounded-2xl bg-black shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="absolute top-3 right-3 flex items-center gap-2 z-10">
              <a
                href={previewImageModal}
                download="chat-image.png"
                className="rounded-full bg-black/60 p-2 text-white hover:bg-black/90 transition shadow-md"
                title="Tải ảnh về máy"
              >
                <Download className="h-5 w-5" />
              </a>
              <button
                onClick={() => setPreviewImageModal(null)}
                className="rounded-full bg-black/60 p-2 text-white hover:bg-black/90 transition shadow-md"
                title="Đóng ảnh"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <img
              src={previewImageModal}
              alt="Ảnh xem lớn"
              className="max-h-[85vh] max-w-[85vw] object-contain rounded-xl"
            />
          </div>
        </div>
      )}

      {createPortal(modalContent, document.body)}
    </>
  )
}