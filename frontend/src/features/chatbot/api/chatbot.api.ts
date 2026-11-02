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

export interface KnowledgeChunk {
  id: string
  title: string
  content: string
  tags: string[]
}

// =========================================================
// 1. KNOWLEDGE BASE (CƠ SỞ DỮ LIỆU RAG TRUY XUẤT)
// =========================================================
const KNOWLEDGE_BASE: KnowledgeChunk[] = [
  {
    id: 'kb-subjects-01',
    title: 'Danh sách 6 môn học và các Gia sư tương ứng trên TutorConnect',
    content:
      'TutorConnect giảng dạy 6 nhóm môn chính với danh sách Gia sư chuẩn xác:\n' +
      '1. 📐 MÔN TOÁN: Có 2 Gia sư ➡️ Thầy Nguyễn Minh (Thạc sĩ, 9 năm KN) & Cô Nguyễn Lan (Cử nhân Toán, 4 năm KN).\n' +
      '2. 🧪 MÔN HÓA HỌC: Có 2 Gia sư ➡️ Thầy Nguyễn Gia Sư (Thạc sĩ Hóa học, 10 năm KN) & Cô Nguyễn Lan (Cử nhân, 4 năm KN).\n' +
      '3. ⚛️ MÔN VẬT LÝ: Có 1 Gia sư ➡️ Thầy Lê Minh (Cử nhân Vật lý, 5 năm KN).\n' +
      '4. 🇬🇧 MÔN TIẾNG ANH: Có 1 Gia sư ➡️ Cô Phạm Hoa (IELTS 8.0, 3 năm KN).\n' +
      '5. 🏅 MÔN IELTS: Có 1 Gia sư ➡️ Cô Phạm Hoa (IELTS 8.0, 3 năm KN).\n' +
      '6. 💻 MÔN LẬP TRÌNH: Có 1 Gia sư ➡️ Thầy Đỗ Nam (Kỹ sư CNTT, 2 năm KN).',
    tags: [
      'dạy môn gì',
      'các môn học',
      'danh sách môn',
      'môn dạy',
      'toán',
      'lý',
      'vật lý',
      'hóa',
      'hóa học',
      'tiếng anh',
      'lập trình',
      'ielts',
      'nguyễn minh',
      'nguyễn lan',
      'nguyễn gia sư',
      'lê minh',
      'phạm hoa',
      'đỗ nam',
      'ai dạy',
    ],
  },
  {
    id: 'kb-tutors-detail',
    title: 'Thông tin chi tiết các Gia sư trên TutorConnect',
    content:
      'Thông tin giảng dạy chi tiết từng Gia sư trên nền tảng TutorConnect:\n' +
      '• Thầy Nguyễn Minh: Thạc sĩ, 9 năm kinh nghiệm ➡️ Giảng dạy Môn Toán.\n' +
      '• Cô Nguyễn Lan: Cử nhân Toán, 4 năm kinh nghiệm ➡️ Giảng dạy Môn Toán & Môn Hóa Học.\n' +
      '• Thầy Nguyễn Gia Sư: Thạc sĩ Hóa học, 10 năm kinh nghiệm ➡️ Giảng dạy Môn Hóa Học.\n' +
      '• Thầy Lê Minh: Cử nhân Vật lý, 5 năm kinh nghiệm ➡️ Giảng dạy Môn Vật Lý.\n' +
      '• Cô Phạm Hoa: IELTS 8.0, 3 năm kinh nghiệm ➡️ Giảng dạy Môn Tiếng Anh & Môn IELTS.\n' +
      '• Thầy Đỗ Nam: Kỹ sư CNTT, 2 năm kinh nghiệm ➡️ Giảng dạy Môn Lập Trình.',
    tags: ['gia sư', 'thông tin gia sư', 'nguyễn minh', 'nguyễn lan', 'nguyễn gia sư', 'lê minh', 'phạm hoa', 'đỗ nam', 'ai dạy môn nào'],
  },
  {
    id: 'kb-tutor-payout',
    title: 'Chính sách thù lao 90% và Rút tiền dành cho Gia sư',
    content:
      'Gia sư nhận 90% thù lao Credit cho mỗi ca học hoàn thành tốt (10% phí vận hành nền tảng). Tỷ giá 1 Credit = 1.000 VNĐ. Thù lao cộng tự động vào Ví thu nhập ngay sau khi ca học kết thúc. Gia sư gửi yêu cầu Rút tiền về Ngân hàng tại Ví thu nhập, Kế toán sẽ duyệt và chuyển khoản trong vòng 24h làm việc.',
    tags: ['thù lao', 'rút tiền', '90%', 'phí 10%', 'ví thu nhập', 'ngân hàng', 'lương gia sư', 'nhận tiền', 'credit'],
  },
  {
    id: 'kb-usage-01',
    title: 'Hướng dẫn sử dụng website TutorConnect từ A-Z',
    content:
      'Quy trình 3 bước sử dụng TutorConnect dành cho Học viên:\n1. Nạp Credit: Vào mục Ví Credit nạp tiền để mua Credit (1 Credit = 1.000 VNĐ).\n2. Tìm & Đặt lịch: Vào Danh sách Gia sư ➡️ Lọc theo môn ➡️ Chọn khung giờ rảnh ➡️ Bấm Xác nhận Đặt lịch.\n3. Vào học: Đến giờ học, vào Lịch học của tôi ➡️ Bấm nút màu xanh "Vào Meet" để học trực tuyến 1-1.',
    tags: ['sử dụng thế nào', 'dùng thế nào', 'cách dùng', 'hướng dẫn sử dụng', 'sử dụng web', 'dùng web', 'bắt đầu thế nào'],
  },
  {
    id: 'kb-meet-01',
    title: 'Quy trình phòng học Google Meet',
    content:
      'Lớp học trực tuyến diễn ra 1-1 qua Google Meet. Học viên KHÔNG cần tự tạo link. Gia sư sẽ dán link Meet hoặc bấm tự động tạo link khi xác nhận ca học. Khi đến giờ học, nút Vào Meet màu xanh sẽ xuất hiện tại mục Lịch học của tôi.',
    tags: ['meet', 'google meet', 'link meet', 'vào lớp', 'tạo link'],
  },
  {
    id: 'kb-credit-01',
    title: 'Tỷ giá Credit và Quy định tạm giữ Escrow',
    content:
      'Credit là đơn vị thanh toán chính thức trên TutorConnect với tỷ giá 1 Credit = 1.000 VNĐ. Khi bấm Đặt lịch, Credit chưa bị mất mà được tạm giữ ở ví trung gian Escrow. Tiền chỉ chuyển cho gia sư khi ca học hoàn thành thành công.',
    tags: ['credit', 'tỷ giá', 'escrow', 'tạm giữ', 'đặt lịch', 'bị mất'],
  },
  {
    id: 'kb-credit-02',
    title: 'Thiếu Credit và Nạp tiền',
    content:
      'Nếu số dư Credit không đủ so với học phí ca học, hệ thống sẽ báo thiếu Credit và yêu cầu nạp thêm. Học viên có thể nạp bổ sung đúng số còn thiếu qua VNPay (ATM/QR) hoặc Chuyển khoản ngân hàng có mã QR tự động cộng ngay.',
    tags: ['không đủ credit', 'thiếu credit', 'nạp tiền', 'vnpay', 'ngân hàng'],
  },
  {
    id: 'kb-credit-03',
    title: 'Chính sách Hoàn tiền 100%',
    content:
      'Học viên được hoàn lại 100% Credit ngay lập tức khi: Gia sư từ chối ca học, ca học bị hủy trước giờ học quy định, hoặc học viên gửi khiếu nại ca học không diễn ra do lỗi gia sư.',
    tags: ['hoàn tiền', 'từ chối', 'hủy ca', 'hủy lớp', 'trả tiền'],
  },
  {
    id: 'kb-tutor-01',
    title: 'Uy tín và Quy trình kiểm duyệt Gia sư',
    content:
      '100% Gia sư trên TutorConnect được thẩm định kỹ lưỡng bằng cấp đại học, chứng chỉ sư phạm/IELTS và xác minh căn cước công dân bởi Admin. Học viên được xem số sao đánh giá công khai từ các học viên trước.',
    tags: ['uy tín gia sư', 'bằng cấp', 'kiểm duyệt', 'đánh giá', 'chất lượng'],
  },
]

function tokenize(text: string): string[] {
  return text
    .toLowerCase()
    .replace(/[^\w\sàáảãạăắằẳẵặâấầẩẫậèéẻẽẹêếềểễệìíỉĩịòóỏõọôốồổỗộơớờởỡợùúủũụưứừửữựỳýỷỹỵđ]/g, ' ')
    .split(/\s+/)
    .filter((w) => w.length > 0)
}

function calculateSimilarity(query: string, doc: string, tags: string[]): number {
  const queryTokens = tokenize(query)
  const docTokens = tokenize(doc)
  let score = 0

  tags.forEach((tag) => {
    if (query.toLowerCase().includes(tag)) {
      score += 3.0
    }
  })

  queryTokens.forEach((qt) => {
    if (docTokens.includes(qt)) {
      score += 1.0
    }
  })

  return score
}

function retrieveContext(query: string, topK: number = 2): KnowledgeChunk[] {
  const scored = KNOWLEDGE_BASE.map((chunk) => ({
    chunk,
    score: calculateSimilarity(query, chunk.content + ' ' + chunk.title, chunk.tags),
  }))

  scored.sort((a, b) => b.score - a.score)

  return scored
    .filter((item) => item.score > 0)
    .slice(0, topK)
    .map((item) => item.chunk)
}

async function queryRAG(query: string, apiKey: string, role: 'student' | 'tutor'): Promise<string | null> {
  if (!apiKey || apiKey.trim() === '') return null

  const relevantChunks = retrieveContext(query, 3)

  let contextText = ''
  if (relevantChunks.length > 0) {
    contextText = relevantChunks
      .map((c, i) => `[Tài liệu ${i + 1} - ${c.title}]:\n${c.content}`)
      .join('\n\n')
  } else {
    contextText = 'Không tìm thấy tài liệu tra cứu trực tiếp.'
  }

  const augmentedPrompt =
    `Bạn là Trợ lý AI thông minh của nền tảng TutorConnect dành cho ${role === 'student' ? 'Học viên' : 'Gia sư'}.\n\n` +
    `DỰ A VÀO TÀI LIỆU TRUY XUẤT THỰC TẾ CỦA HỆ THỐNG NÀY:\n` +
    `===========================================\n` +
    `${contextText}\n` +
    `===========================================\n\n` +
    `[Yêu cầu quan trọng]:\n` +
    `1. Nếu câu hỏi liên quan đến nền tảng TutorConnect (môn học, gia sư, credit, nạp tiền, đặt lịch, Google Meet, thù lao gia sư, rút tiền...), hãy trả lời chính xác, ngắn gọn và lịch sự dựa theo tài liệu.\n` +
    `2. Nếu câu hỏi KHÔNG LIÊN QUAN đến nền tảng TutorConnect (ví dụ: hỏi thời tiết, tin tức, giải trí, nấu ăn, bóng đá, chuyện cá nhân ngoài lề...), bạn PHẢI lịch sự từ chối và phản hồi: 'Xin lỗi, tôi là Trợ lý AI của TutorConnect và chỉ hỗ trợ giải đáp các vấn đề liên quan đến nền tảng TutorConnect. Câu hỏi của bạn nằm ngoài phạm vi hỗ trợ của hệ thống. Bạn có cần tôi hỗ trợ thông tin gì về việc sử dụng nền tảng không?'\n\n` +
    `[Câu hỏi từ người dùng]: ${query}`

  try {
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-flash-latest:generateContent?key=${apiKey}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ role: 'user', parts: [{ text: augmentedPrompt }] }],
        }),
      }
    )

    const data = await response.json()
    return data?.candidates?.[0]?.content?.parts?.[0]?.text || null
  } catch (err) {
    console.warn('⚠️ Lỗi kết nối RAG LLM:', err)
    return null
  }
}

export const chatbotApi = {
  async ask(req: ChatRequest): Promise<ChatResponse> {
    const textLower = req.message.toLowerCase().trim()
    const role = req.role

    const apiKey = (import.meta as any).env?.VITE_GEMINI_API_KEY || ''

    // 🌐 1. RAG ENGINE (ƯU TIÊN CHẠY NẾU CÓ KEY API)
    if (apiKey && apiKey.trim() !== '') {
      try {
        const ragReply = await queryRAG(req.message, apiKey, role)

        if (ragReply) {
          const suggestedActions: SuggestedAction[] = []
          if (role === 'student') {
            if (textLower.includes('môn') || textLower.includes('dạy') || textLower.includes('học') || textLower.includes('gia sư')) {
              suggestedActions.push({ label: '🔎 Tìm Gia Sư Theo Môn', link: '/student/tutors' })
            }
            if (textLower.includes('nạp') || textLower.includes('ví') || textLower.includes('credit')) {
              suggestedActions.push({ label: '💳 Đến Ví Credit', link: '/student/wallet' })
            }
            if (textLower.includes('lịch') || textLower.includes('ca học') || textLower.includes('đặt')) {
              suggestedActions.push({ label: '📅 Xem Lịch Học Của Tôi', link: '/student/schedule' })
            }
          } else {
            if (textLower.includes('lịch') || textLower.includes('rảnh') || textLower.includes('ca')) {
              suggestedActions.push({ label: '📅 Quản Lý Lịch Giảng Dạy', link: '/tutor/timetable' })
            }
            if (textLower.includes('rút') || textLower.includes('ví') || textLower.includes('thù lao') || textLower.includes('tiền') || textLower.includes('credit')) {
              suggestedActions.push({ label: '💰 Quản Lý Ví Thu Nhập', link: '/tutor/wallet' })
            }
          }
          return { reply: ragReply, suggestedActions }
        }
      } catch (err) {
        console.warn('⚠️ RAG Engine gặp sự cố, chuyển sang Local Intent Router:', err)
      }
    }

    // 🛡️ 2. LOCAL INTENT ROUTER (FALLBACK CHẠY OFFLINE)
    if (role === 'student') {

      // 🛑 RÀNG BUỘC CÁC CÂU HỎI HOÀN TOÀN KHÔNG LIÊN QUAN ĐẾN HỌC VIÊN / WEB
      if (
        textLower.includes('thời tiết') ||
        textLower.includes('nấu ăn') ||
        textLower.includes('món ăn') ||
        textLower.includes('bóng đá') ||
        textLower.includes('ca nhạc') ||
        textLower.includes('phim') ||
        textLower.includes('hát') ||
        textLower.includes('chủ tịch') ||
        textLower.includes('tổng thống') ||
        textLower.includes('ăn cơm') ||
        textLower.includes('chơi game') ||
        textLower.includes('kể chuyện') ||
        textLower.includes('thời sự') ||
        textLower.includes('tin tức') ||
        textLower.includes('tán gẫu') ||
        textLower.includes('tâm sự')
      ) {
        return {
          reply:
            'Xin lỗi, tôi là Trợ lý AI của TutorConnect và chỉ hỗ trợ giải đáp các vấn đề liên quan đến nền tảng gia sư TutorConnect (môn học, gia sư, nạp credit, lịch học, Google Meet...).\n\n' +
            'Câu hỏi của bạn hiện nằm ngoài phạm vi tư vấn của hệ thống. Bạn có cần hỗ trợ thông tin gì về các môn học hoặc gia sư trên TutorConnect không?',
          suggestedActions: [
            { label: '🔎 Xem Danh Sách Gia Sư', link: '/student/tutors' },
            { label: '💳 Xem Ví Credit', link: '/student/wallet' },
          ],
        }
      }

      // ---------------------------------------------------------
      // CHỦ ĐỀ 0: HƯỚNG DẪN SỬ DỤNG / CÁCH DÙNG WEB TỪ A-Z
      // ---------------------------------------------------------
      if (
        textLower.includes('sử dụng thế nào') ||
        textLower.includes('dùng thế nào') ||
        textLower.includes('sử dụng ra sao') ||
        textLower.includes('dùng ra sao') ||
        textLower.includes('dùng làm sao') ||
        textLower.includes('sử dụng làm sao') ||
        textLower.includes('cách sử dụng') ||
        textLower.includes('cách dùng') ||
        textLower.includes('hướng dẫn sử dụng') ||
        textLower.includes('hướng dẫn cách dùng') ||
        textLower.includes('sử dụng web') ||
        textLower.includes('dùng web') ||
        textLower.includes('bắt đầu thế nào') ||
        textLower.includes('bắt đầu sử dụng') ||
        textLower.includes('dùng như thế nào')
      ) {
        return {
          reply:
            'Hướng dẫn 3 bước sử dụng TutorConnect từ A-Z dành cho Học viên:\n\n' +
            '1. 💳 Bước 1 - Nạp Credit: Vào mục "Ví Credit" trên thanh Menu ➡️ Nạp số dư để mua Credit thanh toán ca học (1 Credit = 1.000 VNĐ).\n' +
            '2. 🔎 Bước 2 - Tìm Gia sư & Đặt lịch: Vào trang "Danh sách Gia sư" ➡️ Lọc môn học mong muốn ➡️ Xem lịch rảnh gia sư ➡️ Bấm "Xác nhận Đặt lịch".\n' +
            '3. 🎥 Bước 3 - Vào học Google Meet: Đến giờ học, bạn vào mục "Lịch học của tôi" ➡️ Bấm nút màu xanh "🎥 Vào Meet" để học trực tuyến 1-1 ngay!',
          suggestedActions: [
            { label: '💳 Đến Trang Nạp Credit', link: '/student/wallet' },
            { label: '🔎 Tìm Gia Sư Ngay', link: '/student/tutors' },
          ],
        }
      }

      // ---------------------------------------------------------
      // CHỦ ĐỀ NGUYÊN LÝ HOẠT ĐỘNG
      // ---------------------------------------------------------
      if (
        textLower.includes('nguyên lý') ||
        textLower.includes('nguyên lí') ||
        textLower.includes('cơ chế hoạt động') ||
        textLower.includes('vận hành thế nào') ||
        textLower.includes('vận hành ra sao') ||
        textLower.includes('hoạt động thế nào') ||
        textLower.includes('hoạt động ra sao') ||
        textLower.includes('hoạt động làm sao') ||
        textLower.includes('hoạt động nguyên lý') ||
        textLower.includes('hoạt động nguyên lí') ||
        textLower.includes('cách hoạt động') ||
        textLower.includes('mô hình') ||
        textLower.includes('vận hành')
      ) {
        return {
          reply:
            'Nguyên lý hoạt động 4 bước của TutorConnect:\n\n' +
            '1. 🤝 Kết nối trực tiếp: Học viên chọn Gia sư & Đặt lịch theo khung giờ rảnh công khai của gia sư.\n' +
            '2. 🛡️ Trung gian Escrow: Học phí Credit được giữ an toàn ở ví trung gian hệ thống (chưa chuyển cho gia sư).\n' +
            '3. 🎥 Học 1-1 trực tuyến: Đến giờ học, 2 bên bấm "Vào Meet" để tham gia phòng học trực tuyến.\n' +
            '4. 💰 Xác nhận & Giải ngân: Ca học thành công ➡️ Tiền mới chuyển cho Gia sư (nếu hủy/lỗi ➡️ Hoàn 100% cho học viên).',
          suggestedActions: [
            { label: '🔎 Tìm Gia Sư Ngay', link: '/student/tutors' },
            { label: '💳 Xem Ví Credit', link: '/student/wallet' },
          ],
        }
      }

      // ---------------------------------------------------------
      // CHỦ ĐỀ 1: MÔN HỌC & GIA SƯ TƯƠNG ỨNG (RÀNG BUỘC CHÍNH XÁC 100%)
      // ---------------------------------------------------------
      if (
        textLower.includes('môn') ||
        textLower.includes('dạy môn') ||
        textLower.includes('toán') ||
        textLower.includes('vật lý') ||
        textLower.includes('vật lí') ||
        textLower.includes('lý') ||
        textLower.includes('hóa') ||
        textLower.includes('tiếng anh') ||
        textLower.includes('ngoại ngữ') ||
        textLower.includes('lập trình') ||
        textLower.includes('python') ||
        textLower.includes('c#') ||
        textLower.includes('ielts') ||
        textLower.includes('nguyễn minh') ||
        textLower.includes('nguyễn lan') ||
        textLower.includes('nguyễn gia sư') ||
        textLower.includes('lê minh') ||
        textLower.includes('phạm hoa') ||
        textLower.includes('đỗ nam')
      ) {
        if (
          textLower.includes('uy tín') ||
          textLower.includes('chất lượng') ||
          textLower.includes('tốt không') ||
          textLower.includes('tốt ko') ||
          textLower.includes('bằng cấp') ||
          textLower.includes('đáng tin') ||
          textLower.includes('kiểm duyệt') ||
          textLower.includes('dạy dở') ||
          textLower.includes('dạy tốt')
        ) {
          return {
            reply:
              'Gia sư dạy các môn học trên ĐẦY ĐỦ UY TÍN & CHẤT LƯỢNG:\n\n' +
              '1. 🎓 Kiểm duyệt Bằng cấp: 100% Gia sư phải gửi Bằng Đại học, Chứng chỉ (IELTS 8.0, Thạc sĩ, Sư phạm, CNTT...) và CCCD cho Admin thẩm định trước khi mở lớp.\n' +
              '2. ⭐️ Đánh giá công khai: Học viên được xem số sao đánh giá và nhận xét thực tế từ các học viên trước tại Hồ sơ gia sư.\n' +
              '3. 🛡️ Đảm bảo quyền lợi: Học phí được tạm giữ qua ví Escrow. Bạn được HOÀN 100% CREDIT nếu gia sư dạy không đúng cam kết hoặc vắng mặt!',
            suggestedActions: [{ label: '🔎 Tìm Gia Sư Ngay', link: '/student/tutors' }],
          }
        }

        if (
          textLower.includes('bao nhiêu credit') ||
          textLower.includes('bao nhiêu tiền') ||
          textLower.includes('học phí') ||
          textLower.includes('giá tiền') ||
          textLower.includes('giá bao nhiêu') ||
          textLower.includes('phí') ||
          textLower.includes('tốn bao nhiêu') ||
          textLower.includes('nạp bao nhiêu')
        ) {
          return {
            reply:
              'Học phí & Giá Credit cho các Môn học:\n\n' +
              '• Mức học phí (số Credit/buổi) được niêm yết công khai trên Hồ sơ của từng gia sư tùy theo trình độ & môn học.\n' +
              '• Tỷ giá cố định: 1 Credit = 1.000 VNĐ (ví dụ: ca học 100 Credit = 100.000 VNĐ).\n' +
              '• Bạn có thể bấm vào xem Hồ sơ gia sư để kiểm tra chính xác giá từng buổi trước khi Đặt lịch!',
            suggestedActions: [
              { label: '🔎 Xem Giá & Tìm Gia Sư', link: '/student/tutors' },
              { label: '💳 Đến Trang Nạp Credit', link: '/student/wallet' },
            ],
          }
        }

        if (
          textLower.includes('qua đâu') ||
          textLower.includes('học ở đâu') ||
          textLower.includes('online') ||
          textLower.includes('trực tuyến') ||
          textLower.includes('meet') ||
          textLower.includes('phòng học') ||
          textLower.includes('thời gian') ||
          textLower.includes('bao lâu') ||
          textLower.includes('mấy tiếng')
        ) {
          return {
            reply:
              'Hình thức & Thời lượng học các Môn học:\n\n' +
              '• Hình thức: Học trực tuyến 1-1 qua Google Meet cực kỳ tiện lợi.\n' +
              '• Link phòng học: Tự động tạo và hiển thị nút "🎥 Vào Meet" tại mục Lịch học của tôi khi đến giờ học.\n' +
              '• Thời lượng: Mỗi ca học diễn ra từ 60 đến 90 phút tùy theo khung giờ bạn đặt với gia sư.',
            suggestedActions: [{ label: '📅 Xem Lịch Học Của Tôi', link: '/student/schedule' }],
          }
        }

        if (
          textLower.includes('môn khác') ||
          textLower.includes('môn sinh') ||
          textLower.includes('môn văn') ||
          textLower.includes('tiếng trung') ||
          textLower.includes('tiếng nhật') ||
          textLower.includes('tiếng hàn') ||
          textLower.includes('môn địa') ||
          textLower.includes('môn sử') ||
          textLower.includes('ngoài 6 môn')
        ) {
          return {
            reply:
              'Thông tin về các Môn học khác ngoài danh sách hiện có:\n\n' +
              '• Hiện tại TutorConnect tập trung tối ưu chất lượng cho 6 môn trọng điểm: Toán, Vật Lý, Hóa Học, Tiếng Anh, Lập Trình và IELTS.\n' +
              '• Nếu bạn muốn đề xuất mở thêm môn học mới (Văn, Sinh, Tiếng Trung, Tiếng Nhật...) ➡️ Vui lòng liên hệ Hotline/Zalo: 0901.000.001 để Admin ghi nhận và mở rộng trong thời gian sớm nhất!',
            suggestedActions: [{ label: '🔎 Xem 6 Môn Hiện Có', link: '/student/tutors' }],
          }
        }

        if (textLower.includes('nguyễn minh')) {
          return {
            reply:
              'Thông tin Gia sư Thầy Nguyễn Minh:\n\n' +
              '• Trình độ & Kinh nghiệm: Thạc sĩ, 9 năm kinh nghiệm.\n' +
              '• Môn giảng dạy: 📐 MÔN TOÁN.\n' +
              '• Bạn có thể xem lịch rảnh và đặt lịch học với Thầy Nguyễn Minh tại trang Danh sách Gia sư!',
            suggestedActions: [{ label: '🔎 Xem Hồ Sơ Thầy Nguyễn Minh', link: '/student/tutors' }],
          }
        }

        if (textLower.includes('nguyễn lan')) {
          return {
            reply:
              'Thông tin Gia sư Cô Nguyễn Lan:\n\n' +
              '• Trình độ & Kinh nghiệm: Cử nhân Toán, 4 năm kinh nghiệm.\n' +
              '• Môn giảng dạy: Cô Nguyễn Lan dạy 2 môn bao gồm 📐 MÔN TOÁN và 🧪 MÔN HÓA HỌC.\n' +
              '• Bạn có thể xem lịch rảnh và đặt lịch học với Cô Nguyễn Lan tại trang Danh sách Gia sư!',
            suggestedActions: [{ label: '🔎 Xem Hồ Sơ Cô Nguyễn Lan', link: '/student/tutors' }],
          }
        }

        if (textLower.includes('nguyễn gia sư')) {
          return {
            reply:
              'Thông tin Gia sư Thầy Nguyễn Gia Sư:\n\n' +
              '• Trình độ & Kinh nghiệm: Thạc sĩ Hóa học, 10 năm kinh nghiệm.\n' +
              '• Môn giảng dạy: 🧪 MÔN HÓA HỌC.\n' +
              '• Bạn có thể xem lịch rảnh và đặt lịch học với Thầy Nguyễn Gia Sư tại trang Danh sách Gia sư!',
            suggestedActions: [{ label: '🔎 Xem Hồ Sơ Thầy Nguyễn Gia Sư', link: '/student/tutors' }],
          }
        }

        if (textLower.includes('lê minh')) {
          return {
            reply:
              'Thông tin Gia sư Thầy Lê Minh:\n\n' +
              '• Trình độ & Kinh nghiệm: Cử nhân Vật lý, 5 năm kinh nghiệm.\n' +
              '• Môn giảng dạy: ⚛️ MÔN VẬT LÝ.\n' +
              '• Bạn có thể xem lịch rảnh và đặt lịch học với Thầy Lê Minh tại trang Danh sách Gia sư!',
            suggestedActions: [{ label: '🔎 Xem Hồ Sơ Thầy Lê Minh', link: '/student/tutors' }],
          }
        }

        if (textLower.includes('phạm hoa')) {
          return {
            reply:
              'Thông tin Gia sư Cô Phạm Hoa:\n\n' +
              '• Trình độ & Kinh nghiệm: Chứng chỉ IELTS 8.0, 3 năm kinh nghiệm.\n' +
              '• Môn giảng dạy: Cô Phạm Hoa dạy 2 môn bao gồm 🇬🇧 MÔN TIẾNG ANH và 🏅 MÔN IELTS.\n' +
              '• Bạn có thể xem lịch rảnh và đặt lịch học với Cô Phạm Hoa tại trang Danh sách Gia sư!',
            suggestedActions: [{ label: '🔎 Xem Hồ Sơ Cô Phạm Hoa', link: '/student/tutors' }],
          }
        }

        if (textLower.includes('đỗ nam')) {
          return {
            reply:
              'Thông tin Gia sư Thầy Đỗ Nam:\n\n' +
              '• Trình độ & Kinh nghiệm: Kỹ sư CNTT, 2 năm kinh nghiệm.\n' +
              '• Môn giảng dạy: 💻 MÔN LẬP TRÌNH (Python, C#, Web, React, IT).\n' +
              '• Bạn có thể xem lịch rảnh và đặt lịch học với Thầy Đỗ Nam tại trang Danh sách Gia sư!',
            suggestedActions: [{ label: '🔎 Xem Hồ Sơ Thầy Đỗ Nam', link: '/student/tutors' }],
          }
        }

        if (textLower.includes('toán')) {
          return {
            reply:
              'Danh sách Gia sư giảng dạy MÔN TOÁN trên TutorConnect:\n\n' +
              'MÔN TOÁN có 2 Gia sư:\n' +
              '1. 👨‍🏫 Thầy Nguyễn Minh (Thạc sĩ, 9 năm KN)\n' +
              '2. 👩‍🏫 Cô Nguyễn Lan (Cử nhân Toán, 4 năm KN)\n\n' +
              'Bạn có thể vào trang Danh sách Gia sư để xem lịch rảnh và đặt lịch ngay!',
            suggestedActions: [{ label: '🔎 Tìm Gia Sư Môn Toán', link: '/student/tutors' }],
          }
        }

        if (textLower.includes('hóa')) {
          return {
            reply:
              'Danh sách Gia sư giảng dạy MÔN HÓA HỌC trên TutorConnect:\n\n' +
              'MÔN HÓA HỌC có 2 Gia sư:\n' +
              '1. 👨‍🏫 Thầy Nguyễn Gia Sư (Thạc sĩ Hóa học, 10 năm KN)\n' +
              '2. 👩‍🏫 Cô Nguyễn Lan (Cử nhân, 4 năm KN)\n\n' +
              'Bạn có thể vào trang Danh sách Gia sư để xem lịch rảnh và đặt lịch ngay!',
            suggestedActions: [{ label: '🔎 Tìm Gia Sư Môn Hóa', link: '/student/tutors' }],
          }
        }

        if (textLower.includes('vật lý') || textLower.includes('vật lí') || textLower.includes('lý')) {
          return {
            reply:
              'Danh sách Gia sư giảng dạy MÔN VẬT LÝ trên TutorConnect:\n\n' +
              'MÔN VẬT LÝ có 1 Gia sư:\n' +
              '1. 👨‍🏫 Thầy Lê Minh (Cử nhân Vật lý, 5 năm KN)\n\n' +
              'Bạn có thể vào trang Danh sách Gia sư để xem lịch rảnh và đặt lịch ngay!',
            suggestedActions: [{ label: '🔎 Tìm Gia Sư Môn Vật Lý', link: '/student/tutors' }],
          }
        }

        if (textLower.includes('tiếng anh') || textLower.includes('ngoại ngữ')) {
          return {
            reply:
              'Danh sách Gia sư giảng dạy MÔN TIẾNG ANH trên TutorConnect:\n\n' +
              'MÔN TIẾNG ANH có 1 Gia sư:\n' +
              '1. 👩‍🏫 Cô Phạm Hoa (IELTS 8.0, 3 năm KN)\n\n' +
              'Bạn có thể vào trang Danh sách Gia sư để xem lịch rảnh và đặt lịch ngay!',
            suggestedActions: [{ label: '🔎 Tìm Gia Sư Môn Tiếng Anh', link: '/student/tutors' }],
          }
        }

        if (textLower.includes('ielts')) {
          return {
            reply:
              'Danh sách Gia sư giảng dạy MÔN IELTS trên TutorConnect:\n\n' +
              'MÔN IELTS có 1 Gia sư:\n' +
              '1. 👩‍🏫 Cô Phạm Hoa (IELTS 8.0, 3 năm KN)\n\n' +
              'Bạn có thể vào trang Danh sách Gia sư để xem lịch rảnh và đặt lịch ngay!',
            suggestedActions: [{ label: '🔎 Tìm Gia Sư Môn IELTS', link: '/student/tutors' }],
          }
        }

        if (textLower.includes('lập trình') || textLower.includes('python') || textLower.includes('c#')) {
          return {
            reply:
              'Danh sách Gia sư giảng dạy MÔN LẬP TRÌNH trên TutorConnect:\n\n' +
              'MÔN LẬP TRÌNH có 1 Gia sư:\n' +
              '1. 👨‍🏫 Thầy Đỗ Nam (Kỹ sư CNTT, 2 năm KN)\n\n' +
              'Bạn có thể vào trang Danh sách Gia sư để xem lịch rảnh và đặt lịch ngay!',
            suggestedActions: [{ label: '🔎 Tìm Gia Sư Môn Lập Trình', link: '/student/tutors' }],
          }
        }

        return {
          reply:
            'Danh sách 6 Môn học và Gia sư tương ứng trên TutorConnect:\n\n' +
            '• 📐 MÔN TOÁN: Có 2 Gia sư ➡️ Thầy Nguyễn Minh (Thạc sĩ, 9 năm KN) & Cô Nguyễn Lan (Cử nhân Toán, 4 năm KN).\n' +
            '• 🧪 MÔN HÓA HỌC: Có 2 Gia sư ➡️ Thầy Nguyễn Gia Sư (Thạc sĩ Hóa học, 10 năm KN) & Cô Nguyễn Lan (Cử nhân, 4 năm KN).\n' +
            '• ⚛️ MÔN VẬT LÝ: Có 1 Gia sư ➡️ Thầy Lê Minh (Cử nhân Vật lý, 5 năm KN).\n' +
            '• 🇬🇧 MÔN TIẾNG ANH: Có 1 Gia sư ➡️ Cô Phạm Hoa (IELTS 8.0, 3 năm KN).\n' +
            '• 🏅 MÔN IELTS: Có 1 Gia sư ➡️ Cô Phạm Hoa (IELTS 8.0, 3 năm KN).\n' +
            '• 💻 MÔN LẬP TRÌNH: Có 1 Gia sư ➡️ Thầy Đỗ Nam (Kỹ sư CNTT, 2 năm KN).\n\n' +
            'Bạn có thể bấm vào mục Danh Sách Gia Sư để lọc chọn gia sư theo môn học mong muốn!',
          suggestedActions: [{ label: '🔎 Tìm Gia Sư Ngay', link: '/student/tutors' }],
        }
      }

      // ---------------------------------------------------------
      // CHỦ ĐỀ 2: VẤN ĐỀ TIỀN / CREDIT / VÍ / NẠP / HOÀN TIỀN / BOOKING (DÀNH CHO HỌC VIÊN)
      // ---------------------------------------------------------
      if (
        textLower.includes('tiền') ||
        textLower.includes('credit') ||
        textLower.includes('nạp') ||
        textLower.includes('ví') ||
        textLower.includes('giá') ||
        textLower.includes('học phí') ||
        textLower.includes('hoàn tiền') ||
        textLower.includes('vnpay') ||
        textLower.includes('chuyển khoản') ||
        textLower.includes('thanh toán') ||
        textLower.includes('trừ tiền') ||
        textLower.includes('rút') ||
        textLower.includes('mất') ||
        textLower.includes('booking') ||
        textLower.includes('thiếu')
      ) {
        if (
          textLower.includes('phải đủ') ||
          textLower.includes('đủ credit mới') ||
          textLower.includes('cần đủ credit') ||
          textLower.includes('có cần đủ credit') ||
          textLower.includes('đủ credit') ||
          textLower.includes('không đủ') ||
          textLower.includes('ko đủ') ||
          textLower.includes('thiếu') ||
          textLower.includes('chưa đủ') ||
          textLower.includes('hết credit') ||
          textLower.includes('hết tiền')
        ) {
          return {
            reply:
              'ĐÚNG RỒI NHA BẠN!\n\n' +
              '• Bạn cần có số dư Credit tối thiểu bằng hoặc lớn hơn mức học phí niêm yết của ca học thì mới bấm Đặt lịch (Booking) thành công.\n' +
              '• Nếu số dư Credit không đủ ➡️ Hệ thống sẽ hiển thị thông báo thiếu Credit và yêu cầu bạn nạp thêm.\n' +
              '• Bạn chỉ cần nạp bổ sung đúng số Credit còn thiếu qua VNPay hoặc Chuyển khoản ngân hàng là có thể bấm Đặt lịch ngay!',
            suggestedActions: [{ label: '💳 Đến Trang Nạp Credit', link: '/student/wallet' }],
          }
        }

        if (
          textLower.includes('mất') ||
          textLower.includes('bị mất') ||
          textLower.includes('mất hả') ||
          textLower.includes('có mất không') ||
          textLower.includes('mất luôn') ||
          textLower.includes('mất hết') ||
          textLower.includes('mất không') ||
          textLower.includes('mất tiền') ||
          textLower.includes('mất credit')
        ) {
          return {
            reply:
              'KHÔNG BỊ MẤT NHA BẠN!\n\n' +
              '• Khi bạn bấm Đặt lịch, số Credit học phí KHÔNG BỊ MẤT mà chỉ được TẠM GIỮ an toàn ở ví Escrow của hệ thống.\n' +
              '• Tiền CHỈ chuyển cho Gia sư sau khi ca học kết thúc thành công.\n' +
              '• Nếu Gia sư từ chối nhận ca hoặc ca học bị hủy ➡️ Hệ thống tự động HOÀN LẠI 100% CREDIT vào ví của bạn ngay lập tức!',
            suggestedActions: [
              { label: '💳 Kiểm Tra Ví Credit', link: '/student/wallet' },
              { label: '📅 Xem Lịch Học Của Tôi', link: '/student/schedule' },
            ],
          }
        }

        if (
          textLower.includes('chưa có credit') ||
          textLower.includes('chưa thấy credit') ||
          textLower.includes('đã trừ tiền') ||
          textLower.includes('nạp bị lỗi') ||
          textLower.includes('không cộng') ||
          textLower.includes('chưa cộng') ||
          textLower.includes('chưa thấy cộng')
        ) {
          return {
            reply:
              'Cách xử lý khi đã trừ tiền ngân hàng nhưng chưa có Credit:\n\n' +
              '1. Vui lòng đợi từ 1-3 phút để cổng thanh toán VNPay/Ngân hàng gửi xác nhận tự động.\n' +
              '2. Thử tải lại (Refresh) trang Ví Credit.\n' +
              '3. Nếu sau 5 phút vẫn chưa thấy Credit ➡️ Bạn chụp ảnh biên lai/chuyển khoản và gửi cho Hotline/Zalo 0901.000.001 để Admin kiểm tra và cộng Credit thủ công ngay lập tức!',
            suggestedActions: [{ label: '💳 Xem Ví Credit', link: '/student/wallet' }],
          }
        }

        if (
          textLower.includes('hoàn tiền') ||
          textLower.includes('từ chối') ||
          textLower.includes('hủy ca') ||
          textLower.includes('trả lại tiền') ||
          textLower.includes('tiền đi đâu') ||
          textLower.includes('hủy lớp')
        ) {
          return {
            reply:
              'Chính sách Hoàn tiền 100% an toàn tuyệt đối:\n\n' +
              '• Bạn được HOÀN LẠI 100% CREDIT vào ví ngay lập tức khi:\n' +
              '  1. Gia sư bấm Từ chối nhận ca học.\n' +
              '  2. Ca học bị hủy trước giờ học quy định.\n' +
              '  3. Bạn gửi Khiếu nại ca học không diễn ra do lỗi gia sư.\n' +
              '• Số Credit hoàn lại có thể dùng để đặt gia sư khác hoặc giữ trong ví.',
            suggestedActions: [
              { label: '💳 Xem Ví Credit', link: '/student/wallet' },
              { label: '📅 Xem Lịch Học Của Tôi', link: '/student/schedule' },
            ],
          }
        }

        if (
          textLower.includes('trừ ngay') ||
          textLower.includes('tạm giữ') ||
          textLower.includes('escrow') ||
          textLower.includes('giữ tiền') ||
          textLower.includes('khi nào gia sư nhận')
        ) {
          return {
            reply:
              'Cơ chế Tạm giữ học phí Escrow an toàn 100%:\n\n' +
              '• Khi bạn bấm Đặt lịch, học phí sẽ được tạm giữ an toàn ở ví Escrow của hệ thống.\n' +
              '• Gia sư CHỈ nhận được tiền sau khi ca học kết thúc thành công và bạn xác nhận/chấm điểm.\n' +
              '• Nếu lớp học không diễn ra, tiền sẽ được trả về ví của bạn 100%!',
            suggestedActions: [{ label: '💳 Xem Ví Credit', link: '/student/wallet' }],
          }
        }

        if (
          textLower.includes('bao nhiêu credit') ||
          textLower.includes('bao nhiêu tiền') ||
          textLower.includes('tốn bao nhiêu') ||
          textLower.includes('phí 1 buổi')
        ) {
          return {
            reply:
              'Học phí & Số Credit cho mỗi buổi học:\n\n' +
              '• Mức học phí (số Credit) do từng Gia sư tự niêm yết công khai trên Hồ sơ gia sư (ví dụ: 100 Credit/buổi, 150 Credit/buổi).\n' +
              '• Tỷ giá quy đổi cố định: 1 Credit = 1.000 VNĐ.\n' +
              '• Bạn có thể xem chính xác học phí trước khi bấm Đặt lịch!',
            suggestedActions: [{ label: '🔎 Tìm Gia Sư Ngay', link: '/student/tutors' }],
          }
        }

        if (
          textLower.includes('là gì') ||
          textLower.includes('1 credit') ||
          textLower.includes('tỷ giá') ||
          textLower.includes('quy đổi') ||
          textLower.includes('bằng bao nhiêu')
        ) {
          return {
            reply:
              'Đơn vị thanh toán Credit trên TutorConnect:\n\n' +
              '• Credit là đơn vị tiền tệ chính thức dùng để thanh toán ca học.\n' +
              '• Tỷ giá quy đổi cố định: 1 Credit = 1.000 VNĐ (ví dụ: 100 Credit = 100.000 VNĐ).\n' +
              '• Bạn có thể nạp thêm Credit bất kỳ lúc nào qua VNPay hoặc Chuyển khoản ngân hàng.',
            suggestedActions: [{ label: '💳 Đến Trang Nạp Credit', link: '/student/wallet' }],
          }
        }

        if (
          textLower.includes('xem ở đâu') ||
          textLower.includes('ở đâu') ||
          textLower.includes('kiểm tra số dư') ||
          textLower.includes('còn bao nhiêu') ||
          textLower.includes('xem tiền')
        ) {
          return {
            reply:
              'Vị trí kiểm tra Số dư Credit:\n\n' +
              '• Số dư Credit hiển thị góc trên cùng bên phải thanh Menu (Header).\n' +
              '• Hoặc bạn vào mục Ví Credit để xem chi tiết số dư và lịch sử nạp/trừ tiền.',
            suggestedActions: [{ label: '💳 Đến Trang Nạp Credit', link: '/student/wallet' }],
          }
        }

        if (
          textLower.includes('rút tiền mặt') ||
          textLower.includes('rút về ngân hàng') ||
          textLower.includes('rút credit') ||
          textLower.includes('rút lại') ||
          textLower.includes('rút tiền')
        ) {
          return {
            reply:
              'Chính sách Rút tiền dành cho Học viên:\n\n' +
              '• Số Credit nạp dùng để đăng ký các ca học trên nền tảng.\n' +
              '• Nếu bạn nạp thừa hoặc muốn yêu cầu hoàn tiền nạp về tài khoản ngân hàng ➡️ Vui lòng liên hệ Hotline/Zalo: 0901.000.001 để được bộ phận Kế toán hỗ trợ xử lý thủ công.',
            suggestedActions: [{ label: '💳 Xem Ví Credit', link: '/student/wallet' }],
          }
        }

        return {
          reply:
            'Hướng dẫn Nạp Credit & Học phí:\n\n' +
            '• Tỷ giá nạp: 1 Credit = 1.000 VNĐ.\n' +
            '• Các phương thức hỗ trợ: VNPay (Thẻ ATM/QR/Ví) hoặc Chuyển khoản ngân hàng (có mã QR).\n' +
            '• Các bước: Vào mục Ví Credit ➡️ Chọn gói Credit ➡️ Thanh toán ➡️ Credit tự động cộng ngay lập tức!',
          suggestedActions: [{ label: '💳 Đến Trang Nạp Credit', link: '/student/wallet' }],
        }
      }

      // ---------------------------------------------------------
      // CHỦ ĐỀ 3: XỬ LÝ LỖI & SỰ CỐ CA HỌC / LINK MEET
      // ---------------------------------------------------------
      if (
        textLower.includes('không vào được meet') ||
        (textLower.includes('lỗi') && textLower.includes('meet')) ||
        (textLower.includes('bị lỗi') && textLower.includes('link')) ||
        textLower.includes('không thấy nút vào meet')
      ) {
        return {
          reply:
            'Cách xử lý khi Link học Meet gặp sự cố lỗi:\n\n' +
            '1. Đảm bảo ca học đã được Gia sư bấm "Đã xác nhận" (ca chưa duyệt sẽ chưa có link).\n' +
            '2. Đảm bảo trình duyệt máy tính/điện thoại đã đăng nhập sẵn 1 tài khoản Gmail.\n' +
            '3. Nếu quá giờ học mà link Meet lỗi hoặc Gia sư không vào ➡️ Bạn vào Lịch học của tôi ➡️ Chọn ca học ➡️ Bấm "Gửi Khiếu Nại" để hệ thống HOÀN 100% CREDIT vào ví ngay lập tức!',
          suggestedActions: [
            { label: '📅 Xem Lịch Học Của Tôi', link: '/student/schedule' },
            { label: '💳 Kiểm Tra Ví Credit', link: '/student/wallet' },
          ],
        }
      }

      // ---------------------------------------------------------
      // CHỦ ĐỀ 4: CÁC TÌNH HUỐNG GOOGLE MEET
      // ---------------------------------------------------------
      if (
        textLower.includes('meet') ||
        textLower.includes('trực tuyến') ||
        textLower.includes('online') ||
        textLower.includes('phòng học') ||
        textLower.includes('link') ||
        textLower.includes('vào học') ||
        textLower.includes('vào lớp') ||
        textLower.includes('lớp học')
      ) {
        if (
          textLower.includes('không cần') ||
          textLower.includes('có cần tạo') ||
          textLower.includes('ai tạo') ||
          textLower.includes('tự tạo') ||
          textLower.includes('do ai') ||
          textLower.includes('tạo link hả') ||
          textLower.includes('tạo link không')
        ) {
          return {
            reply:
              'KHÔNG CẦN NHA BẠN!\n\n' +
              '• Học viên KHÔNG cần tự tạo link Google Meet.\n' +
              '• Link phòng học sẽ do Gia sư dán hoặc hệ thống tự động tạo ngay khi Gia sư bấm "Xác nhận ca học".\n' +
              '• Đến giờ học, bạn chỉ cần vào mục Lịch học của tôi ➡️ Bấm nút "🎥 Vào Meet" là vào học ngay!',
            suggestedActions: [{ label: '📅 Xem Lịch Học Của Tôi', link: '/student/schedule' }],
          }
        }

        if (
          textLower.includes('ở đâu') ||
          textLower.includes('chỗ nào') ||
          textLower.includes('tìm ở') ||
          textLower.includes('xem ở') ||
          textLower.includes('lấy ở') ||
          textLower.includes('nằm ở')
        ) {
          return {
            reply:
              'Vị trí xem & lấy Link Google Meet:\n\n' +
              '1. Bạn vào mục Lịch học của tôi trên thanh Menu.\n' +
              '2. Bấm chọn ca học đã được duyệt (trạng thái Đã xác nhận).\n' +
              '3. Nút bấm màu xanh "🎥 Vào Meet" sẽ xuất hiện trực tiếp tại chi tiết ca học.',
            suggestedActions: [{ label: '📅 Xem Lịch Học Của Tôi', link: '/student/schedule' }],
          }
        }

        if (
          textLower.includes('không vào') ||
          textLower.includes('trễ') ||
          textLower.includes('vắng') ||
          textLower.includes('bỏ giờ') ||
          textLower.includes('không thấy gia sư') ||
          textLower.includes('đợi')
        ) {
          return {
            reply:
              'Xử lý khi Gia sư trễ hoặc không vào phòng Meet:\n\n' +
              '• Bạn vui lòng đợi khoảng 5-10 phút phòng trường hợp Gia sư gặp sự cố mạng đột xuất.\n' +
              '• Nếu quá 10 phút mà Gia sư không vào lớp ➡️ Bạn bấm nút "Gửi Khiếu Nại / Báo Cáo" tại chi tiết ca học.\n' +
              '• Hệ thống sẽ xác minh và HOÀN 100% CREDIT lại cho bạn!',
            suggestedActions: [{ label: '📅 Xem Lịch Học Của Tôi', link: '/student/schedule' }],
          }
        }

        if (
          textLower.includes('khi nào') ||
          textLower.includes('bao lâu') ||
          textLower.includes('mấy giờ') ||
          textLower.includes('mới có') ||
          textLower.includes('chưa thấy')
        ) {
          return {
            reply:
              'Thời điểm xuất hiện Link Google Meet:\n\n' +
              '• Link Meet xuất hiện ngay sau khi Gia sư bấm nút "Xác nhận ca học".\n' +
              '• Bạn có thể bấm nút "🎥 Vào Meet" trước giờ học 5-10 phút để kiểm tra camera & micro sẵn sàng.',
            suggestedActions: [{ label: '📅 Xem Lịch Học Của Tôi', link: '/student/schedule' }],
          }
        }

        if (
          textLower.includes('chuẩn bị') ||
          textLower.includes('cần gmail') ||
          textLower.includes('cần tải') ||
          textLower.includes('cần app') ||
          textLower.includes('điện thoại') ||
          textLower.includes('máy tính')
        ) {
          return {
            reply:
              'Yêu cầu chuẩn bị trước khi vào lớp Google Meet:\n\n' +
              '• Thiết bị: Học được trên cả Máy tính lẫn Điện thoại thông minh.\n' +
              '• Trình duyệt: Đăng nhập sẵn 1 tài khoản Gmail bất kỳ trên Chrome/Edge/Safari.\n' +
              '• Thiết bị ngoại vi: Cho phép trình duyệt truy cập Micro & Camera.',
            suggestedActions: [{ label: '📅 Xem Lịch Học Của Tôi', link: '/student/schedule' }],
          }
        }

        return {
          reply:
            'Google Meet là phòng học video trực tuyến 1-1 chính thức của TutorConnect!\n\n' +
            '• Link Meet là đường dẫn phòng học kết nối trực tiếp Video/Âm thanh giữa Học viên và Gia sư.\n' +
            '• Khi ca học được duyệt, hệ thống tự cấp link Meet và hiển thị nút "🎥 Vào Meet" để bạn bấm vào học.',
          suggestedActions: [{ label: '📅 Xem Lịch Học Của Tôi', link: '/student/schedule' }],
        }
      }

      // ---------------------------------------------------------
      // CHỦ ĐỀ 5: UY TÍN GIA SƯ & CHẤT LƯỢNG GIẢNG DẠY
      // ---------------------------------------------------------
      if (
        (textLower.includes('gia sư') && (textLower.includes('uy tín') || textLower.includes('chất lượng') || textLower.includes('tốt không') || textLower.includes('dạy dở') || textLower.includes('dạy không tốt'))) ||
        textLower.includes('gia sư có uy tín ko') ||
        textLower.includes('gia sư có uy tín không') ||
        textLower.includes('bằng cấp gia sư') ||
        textLower.includes('duyệt gia sư')
      ) {
        return {
          reply:
            'Gia sư trên TutorConnect ĐẦY ĐỦ UY TÍN & CHẤT LƯỢNG:\n\n' +
            '1. 🎓 Kiểm duyệt Bằng cấp: 100% Gia sư phải gửi Bằng Đại học, Chứng chỉ (IELTS 8.0, Thạc sĩ, Sư phạm...) và CCCD cho Admin thẩm định trước khi được nhận lớp.\n' +
            '2. ⭐️ Đánh giá công khai: Học viên được xem số sao và nhận xét thực tế từ các học viên trước tại Hồ sơ gia sư.\n' +
            '3. 🛡️ Đảm bảo quyền lợi: Học phí được tạm giữ qua ví Escrow. Nếu gia sư dạy không đúng cam kết hoặc vắng mặt ➡️ Bạn được HOÀN 100% CREDIT vào ví!',
          suggestedActions: [{ label: '🔎 Xem Danh Sách Gia Sư', link: '/student/tutors' }],
        }
      }

      // ---------------------------------------------------------
      // CHỦ ĐỀ 7: HỌC THỬ / CA HỌC MIỄN PHÍ
      // ---------------------------------------------------------
      if (
        textLower.includes('học thử') ||
        textLower.includes('dạy thử') ||
        textLower.includes('ca miễn phí') ||
        textLower.includes('free')
      ) {
        return {
          reply:
            'Chính sách Học thử & Ca học đầu tiên:\n\n' +
            '• Nhiều Gia sư trên TutorConnect có mở các khung giờ tư vấn / học thử 15-30 phút miễn phí hoặc học phí ưu đãi.\n' +
            '• Bạn có thể mở Hồ sơ gia sư để xem chi tiết mức học phí từng ca học trước khi bấm Đặt lịch!',
          suggestedActions: [{ label: '🔎 Tìm Gia Sư Ngay', link: '/student/tutors' }],
        }
      }

      // ---------------------------------------------------------
      // CHỦ ĐỀ 8: BẬN VIỆC / HỦY CA / NGHỈ ĐỘT XUẤT
      // ---------------------------------------------------------
      if (
        textLower.includes('tôi bận') ||
        textLower.includes('bận đột xuất') ||
        textLower.includes('không học được') ||
        textLower.includes('bận việc') ||
        textLower.includes('xin nghỉ')
      ) {
        return {
          reply:
            'Cách xử lý khi Học viên bận không học được:\n\n' +
            '1. Bạn vào mục Lịch học của tôi ➡️ Chọn ca học sắp diễn ra.\n' +
            '2. Bấm nút "Gửi yêu cầu đổi lịch" (chọn khung giờ mới) hoặc bấm "Hủy ca học".\n' +
            '3. Hủy ca trước giờ học quy định ➡️ 100% Credit học phí sẽ được hoàn trả về Ví của bạn ngay lập tức!',
          suggestedActions: [{ label: '📅 Xem Lịch Học Của Tôi', link: '/student/schedule' }],
        }
      }

      // ---------------------------------------------------------
      // CHỦ ĐỀ 9: ĐĂNG KÝ / TẠO TÀI KHOẢN / QUÊN MẬT KHẨU
      // ---------------------------------------------------------
      if (
        textLower.includes('đăng ký') ||
        textLower.includes('tạo tài khoản') ||
        textLower.includes('lập tài khoản') ||
        textLower.includes('tạo nick') ||
        textLower.includes('quên mật khẩu') ||
        textLower.includes('đổi mật khẩu') ||
        textLower.includes('đăng nhập')
      ) {
        return {
          reply:
            'Hướng dẫn Đăng ký & Tài khoản trên TutorConnect:\n\n' +
            '• 🎓 Đăng ký Học viên: Bấm nút "Đăng ký" góc trên màn hình ➡️ Chọn "Học viên" ➡️ Nhập Email & Mật khẩu ➡️ Nạp Credit & Đặt lịch học ngay.\n' +
            '• 👨‍🏫 Đăng ký Gia sư: Bấm nút "Đăng ký" ➡️ Chọn "Gia sư" ➡️ Điền Bằng cấp & Lịch rảnh ➡️ Admin duyệt hồ sơ trong 24h.\n' +
            '• 🔑 Quên mật khẩu: Tại trang Đăng nhập ➡️ Bấm "Quên mật khẩu" ➡️ Nhập Email để nhận link đặt lại mật khẩu mới.',
          suggestedActions: [{ label: '🔎 Tìm Gia Sư Ngay', link: '/student/tutors' }],
        }
      }

      // ---------------------------------------------------------
      // CHỦ ĐỀ 10: UY TÍN WEB / AN TOÀN / BẢO MẬT / LỪA ĐẢO CHUNG
      // ---------------------------------------------------------
      if (
        textLower.includes('uy tín') ||
        textLower.includes('an toàn') ||
        textLower.includes('lừa đảo') ||
        textLower.includes('bảo mật') ||
        textLower.includes('tin tưởng') ||
        textLower.includes('bị lừa') ||
        textLower.includes('có uy tín') ||
        textLower.includes('đáng tin')
      ) {
        return {
          reply:
            'TutorConnect cam kết Uy tín & An toàn 100%:\n\n' +
            '• 🛡️ Cơ chế Tạm giữ Escrow: Tiền học phí được giữ ở hệ thống trung gian, CHỈ chuyển cho Gia sư khi ca học hoàn thành tốt.\n' +
            '• 💵 Hoàn tiền 100%: Nếu ca học không diễn ra hoặc Gia sư từ chối ca học, bạn được hoàn lại 100% Credit ngay lập tức.\n' +
            '• 🎓 Kiểm duyệt Bằng cấp: Mọi Gia sư đều phải trải qua quy trình duyệt bằng cấp & chứng chỉ nghiêm ngặt từ Admin.\n' +
            '• 🔒 Bảo mật tuyệt đối: Thông tin cá nhân và giao dịch tài chính được mã hóa an toàn.',
          suggestedActions: [
            { label: '💳 Xem Ví Credit', link: '/student/wallet' },
            { label: '🔎 Danh Sách Gia Sư', link: '/student/tutors' },
          ],
        }
      }

      // ---------------------------------------------------------
      // CHỦ ĐỀ 11: THIẾT BỊ / APP DI ĐỘNG / TRÌNH DUYỆT / HỌC TRÊN ĐIỆN THOẠI
      // ---------------------------------------------------------
      if (
        textLower.includes('app') ||
        textLower.includes('điện thoại') ||
        textLower.includes('máy tính') ||
        textLower.includes('ipad') ||
        textLower.includes('iphone') ||
        textLower.includes('android') ||
        textLower.includes('tải app') ||
        textLower.includes('trình duyệt') ||
        textLower.includes('chrome')
      ) {
        return {
          reply:
            'Hướng dẫn Thiết bị & Trình duyệt hỗ trợ:\n\n' +
            '• 📱 Không cần tải App: TutorConnect hoạt động mượt mà trực tiếp trên trình duyệt web của Điện thoại (iOS/Android), Máy tính bảng và Laptop.\n' +
            '• 🌐 Trình duyệt khuyên dùng: Google Chrome, Microsoft Edge hoặc Safari để học Google Meet ổn định nhất.',
          suggestedActions: [{ label: '🔎 Tìm Gia Sư Ngay', link: '/student/tutors' }],
        }
      }

      // ---------------------------------------------------------
      // CHỦ ĐỀ 12: TÌM GIA SƯ / CÁCH CHỌN GIA SƯ
      // ---------------------------------------------------------
      if (textLower.includes('tìm') || textLower.includes('chọn') || textLower.includes('gia sư') || textLower.includes('danh sách')) {
        return {
          reply:
            'Hướng dẫn tìm & chọn Gia sư phù hợp:\n\n' +
            '1. Vào trang Danh Sách Gia Sư.\n' +
            '2. Lọc theo Môn học mong muốn và xem mức phí niêm yết.\n' +
            '3. Bấm xem Hồ sơ chi tiết để biết bằng cấp, kinh nghiệm và lịch rảnh của gia sư.',
          suggestedActions: [{ label: '🔎 Tìm Gia Sư Ngay', link: '/student/tutors' }],
        }
      }

      // ---------------------------------------------------------
      // CHỦ ĐỀ 13: ĐẶT LỊCH / ĐĂNG KÝ CA HỌC
      // ---------------------------------------------------------
      if (textLower.includes('đặt') || textLower.includes('đăng ký') || textLower.includes('thuê') || textLower.includes('lịch học')) {
        return {
          reply:
            'Quy trình Đặt lịch ca học 3 bước:\n\n' +
            '1. Chọn Gia sư yêu thích và mở xem Hồ sơ chi tiết.\n' +
            '2. Chọn khung giờ rảnh phù hợp trong Lịch giảng dạy của gia sư.\n' +
            '3. Bấm "Xác nhận Đặt lịch". Học phí sẽ được giữ an toàn qua ví Escrow cho đến khi ca học hoàn thành.',
          suggestedActions: [
            { label: '🔎 Tìm Gia Sư', link: '/student/tutors' },
            { label: '📅 Xem Lịch Học Của Tôi', link: '/student/schedule' },
          ],
        }
      }

      // ---------------------------------------------------------
      // CHỦ ĐỀ 14: ĐỔI LỊCH HỌC / DỜI LỊCH
      // ---------------------------------------------------------
      if (textLower.includes('đổi lịch') || textLower.includes('dời lịch') || textLower.includes('đổi giờ')) {
        return {
          reply:
            'Cách gửi Yêu cầu Đổi lịch học:\n\n' +
            '• Nếu bạn bận đột xuất, hãy vào mục Lịch học của tôi ➡️ Chọn ca học ➡️ Bấm "Gửi yêu cầu đổi lịch".\n' +
            '• Gia sư sẽ nhận được thông báo và duyệt khung giờ mới cho bạn.',
          suggestedActions: [{ label: '📅 Xem Lịch Học Của Tôi', link: '/student/schedule' }],
        }
      }

      // ---------------------------------------------------------
      // CHỦ ĐỀ 15: KHIẾU NẠI / BÁO CÁO SỰ CỐ
      // ---------------------------------------------------------
      if (textLower.includes('khiếu nại') || textLower.includes('báo cáo') || textLower.includes('tố cáo')) {
        return {
          reply:
            'Quy trình Báo cáo sự cố / Khiếu nại:\n\n' +
            '• Nếu gia sư không vào lớp hoặc ca học gặp sự cố, bạn vào Chi tiết ca học ➡️ Bấm "Gửi Khiếu nại".\n' +
            '• Đội ngũ Admin sẽ kiểm tra và tạm dừng chuyển tiền cho gia sư để hoàn lại Credit cho bạn.',
          suggestedActions: [{ label: '📅 Xem Lịch Học Của Tôi', link: '/student/schedule' }],
        }
      }

      // ---------------------------------------------------------
      // CHỦ ĐỀ 16: GIỚI THIỆU WEBSITE / WEB NÀY LÀ GÌ
      // ---------------------------------------------------------
      if (textLower.includes('web') || textLower.includes('trang') || textLower.includes('website') || textLower.includes('tutorconnect') || textLower.includes('giới thiệu') || textLower.includes('nền tảng') || textLower.includes('đây là') || textLower.includes('app')) {
        return {
          reply:
            'TutorConnect là nền tảng trực tuyến kết nối giữa Học viên và Gia sư chất lượng cao!\n\n' +
            '• 🎯 Mục tiêu: Giúp bạn dễ dàng tìm gia sư giỏi theo môn học, mức phí và xem lịch rảnh.\n' +
            '• 🎥 Hình thức học: Học 1-1 trực tuyến qua phòng Google Meet tiện lợi.\n' +
            '• 🛡️ An toàn 100%: Thanh toán qua Ví Credit với chính sách hoàn tiền 100% nếu gia sư từ chối ca học.',
          suggestedActions: [
            { label: '🔎 Tìm Gia Sư Ngay', link: '/student/tutors' },
            { label: '📚 Môn Học Hiện Có', link: '/student/tutors' },
          ],
        }
      }

      // ---------------------------------------------------------
      // CHỦ ĐỀ 17: CSKH / HOTLINE / LIÊN HỆ
      // ---------------------------------------------------------
      if (textLower.includes('liên hệ') || textLower.includes('hotline') || textLower.includes('sđt') || textLower.includes('hỗ trợ') || textLower.includes('zalo')) {
        return {
          reply:
            'Đội ngũ Hỗ trợ CSKH TutorConnect sẵn sàng trợ giúp bạn:\n\n' +
            '• 📞 Hotline / Zalo: 0901.000.001\n' +
            '• 📧 Email: support@tutorconnect.com\n' +
            '• ⏰ Thời gian làm việc: 8:00 - 22:00 (Hàng ngày)',
          suggestedActions: [{ label: '🔎 Tìm Gia Sư Ngay', link: '/student/tutors' }],
        }
      }
    } else {
      // =========================================================
      // 👨‍🏫 DÀNH CHO GIA SƯ (TUTOR INTENTS - RÀNG BUỘC CHI TIẾT TẤT CẢ TỪ NGỮ)
      // =========================================================

      // 🛑 1. RÀNG BUỘC CÁC CÂU HỎI HOÀN TOÀN KHÔNG LIÊN QUAN ĐẾN GIA SƯ / WEB
      if (
        textLower.includes('thời tiết') ||
        textLower.includes('nấu ăn') ||
        textLower.includes('món ăn') ||
        textLower.includes('bóng đá') ||
        textLower.includes('ca nhạc') ||
        textLower.includes('phim') ||
        textLower.includes('hát') ||
        textLower.includes('chủ tịch') ||
        textLower.includes('tổng thống') ||
        textLower.includes('ăn cơm') ||
        textLower.includes('chơi game') ||
        textLower.includes('kể chuyện') ||
        textLower.includes('thời sự') ||
        textLower.includes('tin tức') ||
        textLower.includes('tán gẫu') ||
        textLower.includes('tâm sự')
      ) {
        return {
          reply:
            'Xin lỗi Gia sư, tôi là Trợ lý AI của TutorConnect và chỉ hỗ trợ giải đáp các câu hỏi dành cho Gia sư trên nền tảng TutorConnect (lịch giảng dạy, duyệt ca học, link Meet, thù lao 90%, rút tiền về ngân hàng...).\n\n' +
            'Câu hỏi của bạn hiện nằm ngoài phạm vi tư vấn của hệ thống. Bạn có cần hỗ trợ thông tin gì về việc quản lý lịch dạy hoặc thu nhập trên TutorConnect không?',
          suggestedActions: [
            { label: '📅 Lịch Giảng Dạy', link: '/tutor/timetable' },
            { label: '💰 Quản Lý Thu Nhập', link: '/tutor/wallet' },
          ],
        }
      }

      // ---------------------------------------------------------
      // CHỦ ĐỀ 1: THÙ LAO 90%, PHÍ NỀN TẢNG, VÍ THU NHẬP, CREDIT, HOÀN TIỀN & RÚT TIỀN (ƯU TIÊN ROUTE TRƯỚC)
      // ---------------------------------------------------------
      if (
        textLower.includes('phí') ||
        textLower.includes('thù lao') ||
        textLower.includes('rút') ||
        textLower.includes('lương') ||
        textLower.includes('tiền') ||
        textLower.includes('credit') ||
        textLower.includes('90%') ||
        textLower.includes('10%') ||
        textLower.includes('hoa hồng') ||
        textLower.includes('thu nhập') ||
        textLower.includes('ví') ||
        textLower.includes('chuyển khoản') ||
        textLower.includes('ngân hàng') ||
        textLower.includes('stk') ||
        textLower.includes('tài khoản') ||
        textLower.includes('lấy tiền') ||
        textLower.includes('phần trăm') ||
        textLower.includes('chiết khấu') ||
        textLower.includes('tỷ giá') ||
        textLower.includes('quy đổi') ||
        textLower.includes('hoàn tiền') ||
        textLower.includes('hủy ca') ||
        textLower.includes('hủy lớp') ||
        textLower.includes('hủy buổi') ||
        textLower.includes('hoàn') ||
        textLower.includes('dạy xong')
      ) {
        // 1.0. RÀNG BUỘC CÁC CÂU HỎI VỀ QUY TRÌNH / HƯỚNG DẪN RÚT TIỀN VỀ NGÂN HÀNG (ƯU TIÊN HÀNG ĐẦU)
        if (
          textLower.includes('quy trình rút') ||
          textLower.includes('thủ tục rút') ||
          textLower.includes('các bước rút') ||
          textLower.includes('hướng dẫn rút') ||
          textLower.includes('cách rút') ||
          textLower.includes('muốn rút') ||
          textLower.includes('tôi muốn rút') ||
          textLower.includes('rút tiền thì sao') ||
          textLower.includes('rút tiền thế nào') ||
          textLower.includes('rút tiền ra sao') ||
          textLower.includes('rút tiền làm sao') ||
          textLower.includes('rút tiền kiểu gì') ||
          textLower.includes('rút tiền ở đâu') ||
          textLower.includes('rút thù lao') ||
          textLower.includes('bấm rút tiền') ||
          textLower.includes('rút credit') ||
          textLower.includes('lấy tiền về ngân hàng') ||
          textLower.includes('chuyển tiền về ngân hàng') ||
          textLower.includes('chuyển tiền về tài khoản') ||
          textLower.includes('chuyển tiền về tk') ||
          textLower.includes('rút về stk') ||
          textLower.includes('chuyển về stk')
        ) {
          return {
            reply:
              'Hướng dẫn 4 bước Rút tiền thù lao về Tài khoản Ngân hàng:\n\n' +
              '1. 💰 Vào mục "Ví thu nhập" trên thanh Menu của Gia sư.\n' +
              '2. 🏦 Bấm nút "Rút tiền về ngân hàng".\n' +
              '3. 📝 Điền Số Credit muốn rút, Tên Ngân hàng & Số tài khoản (STK) chính chủ.\n' +
              '4. ⏱️ Bấm "Xác nhận". Kế toán sẽ kiểm tra và duyệt chuyển tiền về ngân hàng của bạn trong vòng 24h làm việc!',
            suggestedActions: [{ label: '💰 Đến Ví Thu Nhập Ngay', link: '/tutor/wallet' }],
          }
        }

        // 1.1. Hỏi về THỜI ĐIỂM NHẬN CREDIT / DẠY XONG CÓ NHẬN ĐƯỢC CREDIT KHÔNG
        if (
          textLower.includes('dạy xong') ||
          textLower.includes('sau khi dạy') ||
          textLower.includes('kết thúc ca') ||
          textLower.includes('khi nào cộng') ||
          textLower.includes('khi nào nhận') ||
          textLower.includes('bao giờ có tiền') ||
          textLower.includes('bao giờ cộng') ||
          textLower.includes('khi nào có tiền') ||
          textLower.includes('thời điểm') ||
          textLower.includes('nhận đc credit') ||
          textLower.includes('nhận credit')
        ) {
          return {
            reply:
              'ĐÚNG RỒI NHA GIA SƯ!\n\n' +
              '• Ngay sau khi ca học kết thúc thành công, 90% thù lao Credit sẽ được TỰ ĐỘNG CỘNG VÀO VÍ THU NHẬP của bạn ngay lập tức.\n' +
              '• Bạn không cần phải chờ đợi lâu hay làm thêm thủ tục xác nhận thủ công.\n' +
              '• Số Credit trong Ví thu nhập bạn có thể tích lũy hoặc gửi yêu cầu "Rút tiền về Ngân hàng" bất kỳ lúc nào (Kế toán chuyển khoản trong 24h làm việc, 1 Credit = 1.000 VNĐ, hoàn toàn MIỄN PHÍ rút tiền!).',
            suggestedActions: [
              { label: '💰 Đến Ví Thu Nhập', link: '/tutor/wallet' },
              { label: '📅 Quản Lý Ca Học', link: '/tutor/timetable' },
            ],
          }
        }

        // 1.2. Học viên hủy ca học ➡️ Gia sư có được hoàn tiền / nhận thù lao không?
        if (
          textLower.includes('học viên hủy') ||
          textLower.includes('học sinh hủy') ||
          (textLower.includes('hủy') && textLower.includes('học viên')) ||
          (textLower.includes('hoàn tiền') && textLower.includes('hủy'))
        ) {
          return {
            reply:
              'Chính sách xử lý Thù lao & Hoàn tiền khi Học viên Hủy ca học:\n\n' +
              '• Nếu Học viên hủy ca học trước giờ quy định ➡️ Ca học bị hủy, số Credit học phí được hoàn trả 100% cho Học viên (Gia sư chưa nhận thù lao ca này).\n' +
              '• Nếu Học viên hủy ca sát giờ hoặc vắng mặt không báo trước ➡️ Gia sư vào Chi tiết ca học bấm "Báo cáo sự cố / Học viên vắng mặt" ➡️ Đội ngũ Admin sẽ kiểm tra và giải ngân 100% thù lao (90% giá trị ca học) cho Gia sư!',
            suggestedActions: [
              { label: '💰 Xem Ví Thu Nhập', link: '/tutor/wallet' },
              { label: '📅 Xem Lịch Giảng Dạy', link: '/tutor/timetable' },
            ],
          }
        }

        // 1.3. Gia sư hủy ca học / Gia sư có bị phạt không
        if (
          textLower.includes('gia sư hủy') ||
          textLower.includes('tôi hủy') ||
          textLower.includes('từ chối ca') ||
          textLower.includes('hủy ca có bị phạt')
        ) {
          return {
            reply:
              'Chính sách khi Gia sư Hủy / Từ chối ca học:\n\n' +
              '• Khi Gia sư bấm Từ chối hoặc Hủy ca học ➡️ Hệ thống tự động HOÀN LẠI 100% CREDIT cho Học viên ngay lập tức.\n' +
              '• Gia sư không bị trừ tiền hay phạt phí, tuy nhiên việc hủy ca thường xuyên có thể làm giảm Điểm uy tín hiển thị trên Hồ sơ!',
            suggestedActions: [{ label: '📅 Xem Lịch Giảng Dạy', link: '/tutor/timetable' }],
          }
        }

        // 1.4. Gia sư có cần Nạp Credit / Nạp tiền không
        if (
          textLower.includes('gia sư nạp') ||
          textLower.includes('có cần nạp') ||
          textLower.includes('nạp credit ở đâu') ||
          textLower.includes('nạp tiền ở đâu')
        ) {
          return {
            reply:
              'Quy định Nạp Credit dành cho Gia sư:\n\n' +
              '• Gia sư KHÔNG CẦN NẠP CREDIT hay đóng bất kỳ khoản phí đầu vào nào để giảng dạy trên TutorConnect!\n' +
              '• Gia sư chỉ nhận thù lao Credit từ các ca học do Học viên hoàn thành và rút tiền mặt về Ngân hàng bất kỳ lúc nào (1 Credit = 1.000 VNĐ).',
            suggestedActions: [{ label: '💰 Đến Ví Thu Nhập', link: '/tutor/wallet' }],
          }
        }

        // 1.5. Hỏi về Phí Rút tiền (Có mất phí không / Phí chuyển khoản)
        if (
          textLower.includes('mất phí') ||
          textLower.includes('tốn phí') ||
          textLower.includes('có tốn') ||
          textLower.includes('có mất') ||
          textLower.includes('phí rút') ||
          textLower.includes('miễn phí')
        ) {
          return {
            reply:
              'Chính sách Phí Rút tiền dành cho Gia sư:\n\n' +
              '• HOÀN TOÀN MIỄN PHÍ RÚT TIỀN! TutorConnect không thu thêm bất kỳ chi phí chuyển khoản hay phí dịch vụ nào khi bạn gửi yêu cầu rút thù lao.\n' +
              '• Số tiền Credit trong ví sẽ được quy đổi 100% ra tiền mặt (1 Credit = 1.000 VNĐ) và chuyển thẳng vào tài khoản ngân hàng của bạn!',
            suggestedActions: [{ label: '💰 Rút Tiền Ngay', link: '/tutor/wallet' }],
          }
        }

        // 1.6. Hỏi về Thời gian tiền về tài khoản (Bao lâu tiền về / Duyệt trong bao lâu)
        if (
          textLower.includes('mất bao lâu') ||
          textLower.includes('mất mấy ngày') ||
          textLower.includes('thời gian rút') ||
          textLower.includes('bao lâu tiền về') ||
          textLower.includes('khi nào tiền về') ||
          textLower.includes('duyệt rút bao lâu')
        ) {
          return {
            reply:
              'Thời gian xử lý Yêu cầu Rút tiền về Ngân hàng:\n\n' +
              '• Sau khi bạn gửi yêu cầu rút tiền tại Ví thu nhập, bộ phận Kế toán sẽ kiểm tra và chuyển khoản vào ngân hàng của bạn trong vòng 24H LÀM VIỆC (thường từ 1-4 tiếng trong giờ hành chính).\n' +
              '• Bạn có thể kiểm tra trạng thái lệnh rút tiền (Chờ duyệt / Đã thanh toán) ngay tại mục Lịch sử rút tiền trong Ví!',
            suggestedActions: [{ label: '💰 Đến Ví Thu Nhập', link: '/tutor/wallet' }],
          }
        }

        // 1.7. Hỏi về Cách rút tiền tổng quát / Rút thù lao về ngân hàng
        if (
          textLower.includes('rút') ||
          textLower.includes('lấy tiền') ||
          textLower.includes('về ngân hàng') ||
          textLower.includes('về tài khoản') ||
          textLower.includes('về tk') ||
          textLower.includes('stk') ||
          textLower.includes('nhập stk') ||
          textLower.includes('rút thù lao') ||
          textLower.includes('bấm rút ở đâu')
        ) {
          return {
            reply:
              'Hướng dẫn 4 bước Rút tiền thù lao về Tài khoản Ngân hàng:\n\n' +
              '1. 💰 Vào mục "Ví thu nhập" trên thanh Menu của Gia sư.\n' +
              '2. 🏦 Bấm nút "Rút tiền về ngân hàng".\n' +
              '3. 📝 Điền Số Credit muốn rút, Tên Ngân hàng & Số tài khoản (STK) chính chủ.\n' +
              '4. ⏱️ Bấm "Xác nhận". Kế toán sẽ kiểm tra và duyệt chuyển tiền về ngân hàng của bạn trong vòng 24h làm việc!',
            suggestedActions: [{ label: '💰 Đến Ví Thu Nhập Ngay', link: '/tutor/wallet' }],
          }
        }

        // 1.8. Hỏi về Tỷ lệ % thù lao gia sư nhận được (90% & 10% phí hoa hồng)
        if (
          textLower.includes('bao nhiêu %') ||
          textLower.includes('bao nhiêu phần trăm') ||
          textLower.includes('tỷ lệ') ||
          textLower.includes('phần trăm') ||
          textLower.includes('90%') ||
          textLower.includes('10%') ||
          textLower.includes('hoa hồng') ||
          textLower.includes('chiết khấu') ||
          textLower.includes('phí nền tảng') ||
          textLower.includes('thu bao nhiêu') ||
          textLower.includes('giữ bao nhiêu')
        ) {
          return {
            reply:
              'Chính sách Tỷ lệ Thù lao 90% dành cho Gia sư:\n\n' +
              '• Gia sư nhận 90% THÙ LAO Credit của mỗi ca học (ví dụ: ca học 100 Credit ➡️ Gia sư nhận 90 Credit = 90.000 VNĐ).\n' +
              '• TutorConnect thu 10% phí vận hành nền tảng, duy trì hệ thống máy chủ & phòng học trực tuyến Google Meet.\n' +
              '• Mức thù lao 90% này được tính tự động và hiển thị minh bạch tại mỗi ca học!',
            suggestedActions: [{ label: '💰 Kiểm Tra Ví Thu Nhập', link: '/tutor/wallet' }],
          }
        }

        // 1.9. Hỏi vị trí xem Ví thu nhập / Xem số dư thù lao ở đâu
        if (
          textLower.includes('ở đâu') ||
          textLower.includes('chỗ nào') ||
          textLower.includes('xem ở') ||
          textLower.includes('tìm ở') ||
          textLower.includes('xem số dư') ||
          textLower.includes('kiểm tra số dư') ||
          textLower.includes('xem tiền')
        ) {
          return {
            reply:
              'Vị trí kiểm tra Số dư Thù lao & Ví thu nhập:\n\n' +
              '• Số dư thù lao hiển thị góc trên cùng bên phải thanh Header (ví dụ: 1.733 CR).\n' +
              '• Bạn cũng có thể bấm vào mục "Ví thu nhập" trên thanh Menu bên trái để xem chi tiết lịch sử từng ca học và gửi lệnh rút tiền.',
            suggestedActions: [{ label: '💰 Đến Trang Ví Thu Nhập', link: '/tutor/wallet' }],
          }
        }

        // 1.10. Hỏi chung về Credit / Tỷ giá Credit / Quy đổi Credit cho Gia sư
        if (
          textLower.includes('credit') ||
          textLower.includes('tỷ giá') ||
          textLower.includes('quy đổi') ||
          textLower.includes('1 credit')
        ) {
          return {
            reply:
              'Chính sách Tỷ giá Credit & Thù lao dành cho Gia sư:\n\n' +
              '• Tỷ giá cố định: 1 Credit = 1.000 VNĐ (ví dụ: ca học 100 Credit ➡️ Học phí 100.000 VNĐ).\n' +
              '• Tỷ lệ thù lao gia sư: Gia sư nhận 90% số Credit của ca học (ví dụ: 100 Credit ➡️ Gia sư nhận 90 Credit = 90.000 VNĐ).\n' +
              '• Khi gửi yêu cầu rút tiền về ngân hàng, số Credit trong ví sẽ được quy đổi 100% ra tiền mặt tương ứng và chuyển khoản trong 24h (Hoàn toàn MIỄN PHÍ rút tiền!).',
            suggestedActions: [{ label: '💰 Đến Ví Thu Nhập', link: '/tutor/wallet' }],
          }
        }

        // 1.11. Tổng quan Thù lao & Ví thu nhập dành cho Gia sư (Default)
        return {
          reply:
            'Tổng quan Chính sách Thù lao & Ví thu nhập Gia sư:\n\n' +
            '• Tỷ lệ thù lao: Gia sư nhận 90% thù lao ca học (10% phí vận hành nền tảng).\n' +
            '• Thời điểm nhận: Cộng tự động vào Ví thu nhập ngay sau ca học kết thúc.\n' +
            '• Rút tiền ngân hàng: Bạn bấm "Rút tiền" tại Ví thu nhập ➡️ Nhập STK ➡️ Kế toán duyệt và chuyển khoản trong 24h (Hoàn toàn MIỄN PHÍ rút tiền!).',
          suggestedActions: [{ label: '💰 Quản Lý Ví Thu Nhập', link: '/tutor/wallet' }],
        }
      }

      // ---------------------------------------------------------
      // CHỦ ĐỀ 0: HƯỚNG DẪN DÀNH CHO GIA SƯ MỚI TỪ A-Z (CHỈ BẮT KHI KHÔNG CÓ CÂU HỎI VỀ TIỀN/RÚT TIỀN)
      // ---------------------------------------------------------
      if (
        (textLower.includes('bắt đầu thế nào') ||
          textLower.includes('dùng thế nào') ||
          textLower.includes('sử dụng thế nào') ||
          textLower.includes('cách dùng') ||
          textLower.includes('hướng dẫn') ||
          textLower.includes('quy trình') ||
          textLower.includes('bắt đầu dạy') ||
          textLower.includes('mới tham gia')) &&
        !textLower.includes('rút') &&
        !textLower.includes('tiền') &&
        !textLower.includes('thù lao') &&
        !textLower.includes('ví')
      ) {
        return {
          reply:
            'Quy trình 3 bước dành cho Gia sư giảng dạy trên TutorConnect:\n\n' +
            '1. 📅 Cài đặt Lịch giảng dạy: Vào mục "Lịch giảng dạy" ➡️ Thêm các khung giờ rảnh trong tuần để Học viên tìm thấy và đặt lịch.\n' +
            '2. 🎥 Duyệt ca học & Cấp Link Meet: Khi có ca học mới ➡️ Bấm "Xác nhận" (dán link Meet của bạn hoặc bấm "Tự động tạo link Meet").\n' +
            '3. 💰 Nhận 90% thù lao & Rút tiền: Ca học kết thúc thành công ➡️ Thù lao cộng tự động vào Ví thu nhập ➡️ Rút tiền về Ngân hàng trong 24h!',
          suggestedActions: [
            { label: '📅 Cài Đặt Lịch Rảnh', link: '/tutor/timetable' },
            { label: '💰 Xem Ví Thu Nhập', link: '/tutor/wallet' },
          ],
        }
      }

      // ---------------------------------------------------------
      // CHỦ ĐỀ 2: CÀI ĐẶT & QUẢN LÝ LỊCH GIẢNG DẠY (SLOT / KHUNG GIỜ RẢNH) (RÀNG BUỘC CHI TIẾT 100%)
      // ---------------------------------------------------------
      if (
        textLower.includes('lịch') ||
        textLower.includes('khung giờ') ||
        textLower.includes('rảnh') ||
        textLower.includes('tạo lịch') ||
        textLower.includes('mở slot') ||
        textLower.includes('đổi lịch') ||
        textLower.includes('xóa slot') ||
        textLower.includes('cài đặt lịch') ||
        textLower.includes('slot') ||
        textLower.includes('lịch dạy') ||
        textLower.includes('giờ rảnh') ||
        textLower.includes('mở lịch') ||
        textLower.includes('thêm slot') ||
        textLower.includes('tạo slot')
      ) {
        // 2.1. Hỏi về Thời điểm hiển thị (Mở slot xong Học viên có nhìn thấy ngay không / Khi nào hiển thị)
        if (
          textLower.includes('thấy ngay') ||
          textLower.includes('nhìn thấy ngay') ||
          textLower.includes('thấy luôn') ||
          textLower.includes('hiển thị ngay') ||
          textLower.includes('bao lâu học viên thấy') ||
          textLower.includes('khi nào học viên thấy') ||
          textLower.includes('mở slot xong') ||
          textLower.includes('tạo slot xong') ||
          textLower.includes('thời điểm hiển thị') ||
          textLower.includes('có thấy liền không') ||
          textLower.includes('thấy liền không')
        ) {
          return {
            reply:
              'HIỂN THỊ NGAY LẬP TỨC NHA GIA SƯ!\n\n' +
              '• Ngay sau khi bạn bấm tạo/thêm khung giờ rảnh thành công ➡️ Khung giờ đó sẽ NGAY LẬP TỨC HIỂN THỊ công khai trên Hồ sơ của bạn.\n' +
              '• Học viên truy cập trang Danh sách Gia sư sẽ nhìn thấy ngay và có thể bấm Đặt lịch học lập tức.\n' +
              '• Lưu ý: Hồ sơ của Gia sư phải ở trạng thái "Đã kiểm duyệt" (Bằng cấp đã được Admin duyệt trong 24h) thì Lịch rảnh mới hiển thị công khai cho Học viên!',
            suggestedActions: [{ label: '📅 Đến Lịch Giảng Dạy', link: '/tutor/timetable' }],
          }
        }

        // 2.2. Hỏi về Chỉnh sửa / Xóa slot rảnh đã tạo
        if (
          textLower.includes('xóa') ||
          textLower.includes('hủy slot') ||
          textLower.includes('sửa slot') ||
          textLower.includes('đổi khung giờ') ||
          textLower.includes('xóa khung giờ') ||
          textLower.includes('đổi giờ') ||
          textLower.includes('sửa giờ') ||
          textLower.includes('sửa lịch') ||
          textLower.includes('xóa lịch') ||
          textLower.includes('bỏ slot') ||
          textLower.includes('bỏ khung giờ')
        ) {
          return {
            reply:
              'Cách Chỉnh sửa hoặc Xóa khung giờ rảnh (Slot đã tạo):\n\n' +
              '1. 📅 Vào mục "Lịch giảng dạy" trên thanh Menu.\n' +
              '2. 📆 Chọn Thứ trong tuần có khung giờ rảnh cần chỉnh sửa.\n' +
              '3. 🗑️ Bấm vào biểu tượng Thùng rác (Xóa) để xóa khung giờ hoặc bấm Cây bút (Chỉnh sửa giờ).\n' +
              'Lưu ý quan trọng: Gia sư chỉ xóa/sửa được các khung giờ rảnh CHƯA CÓ Học viên đặt lịch. Nếu ca học đã được Học viên đặt, bạn cần dùng chức năng Từ chối/Hủy ca học!',
            suggestedActions: [{ label: '📅 Quản Lý Lịch Giảng Dạy', link: '/tutor/timetable' }],
          }
        }

        // 2.3. Hỏi về Thêm khung giờ rảnh / Mở slot mới thế nào
        if (
          textLower.includes('làm sao để mở') ||
          textLower.includes('cách mở') ||
          textLower.includes('mở slot') ||
          textLower.includes('thêm giờ rảnh') ||
          textLower.includes('thêm khung giờ') ||
          textLower.includes('tạo slot') ||
          textLower.includes('tạo lịch rảnh') ||
          textLower.includes('cài đặt lịch rảnh') ||
          textLower.includes('mở lịch rảnh') ||
          textLower.includes('thêm ca dạy') ||
          textLower.includes('đăng lịch rảnh') ||
          textLower.includes('tạo lịch dạy') ||
          textLower.includes('mở ca rảnh')
        ) {
          return {
            reply:
              'Hướng dẫn 4 bước Thêm khung giờ rảnh (Mở Slot) cho Học viên đặt lịch:\n\n' +
              '1. 📅 Vào mục "Lịch giảng dạy" trên thanh Menu bên trái.\n' +
              '2. 📆 Chọn Thứ trong tuần mà bạn muốn mở slot dạy.\n' +
              '3. ➕ Bấm nút "+ Thêm khung giờ rảnh" (hoặc Tạo slot mới).\n' +
              '4. ⏰ Chọn Giờ bắt đầu và Giờ kết thúc ➡️ Bấm "Xác nhận". Khung giờ này sẽ ngay lập tức công khai trên Hồ sơ gia sư để Học viên tìm thấy và Đặt lịch!',
            suggestedActions: [{ label: '📅 Cài Đặt Lịch Rảnh Ngay', link: '/tutor/timetable' }],
          }
        }

        // 2.4. Hỏi tại sao Học viên không xem được / Không thấy lịch
        if (
          textLower.includes('không thấy') ||
          textLower.includes('không đặt được') ||
          textLower.includes('không hiển thị') ||
          textLower.includes('tại sao') ||
          textLower.includes('không xem được')
        ) {
          return {
            reply:
              'Nguyên nhân & Cách xử lý khi Học viên không thấy Lịch rảnh của bạn:\n\n' +
              '1. ⏳ Hồ sơ đang Chờ duyệt: Nếu Bằng cấp/Hồ sơ chưa được Admin duyệt ➡️ Lịch rảnh sẽ tạm ẩn cho đến khi được duyệt (trong 24h).\n' +
              '2. ⏰ Khung giờ đã qua: Khung giờ rảnh trong quá khứ sẽ tự động ẩn đi.\n' +
              '3. 🔄 Kiểm tra lại: Thử kiểm tra lại mục Lịch giảng dạy và đảm bảo đã bấm Xác nhận lưu khung giờ!',
            suggestedActions: [{ label: '📅 Kiểm Tra Lịch Giảng Dạy', link: '/tutor/timetable' }],
          }
        }

        // 2.5. Default / Tổng quan Lịch giảng dạy
        return {
          reply:
            'Tổng quan Cài đặt & Quản lý Lịch giảng dạy (Khung giờ rảnh):\n\n' +
            '• Thêm giờ rảnh: Vào Lịch giảng dạy ➡️ Chọn Thứ ➡️ Bấm "+ Thêm khung giờ rảnh" ➡️ Nhập thời gian.\n' +
            '• Thời điểm hiển thị: Học viên nhìn thấy NGAY LẬP TỨC trên Hồ sơ gia sư để bấm Đặt lịch.\n' +
            '• Xóa/Sửa slot: Bấm biểu tượng Thùng rác hoặc Chỉnh sửa tại khung giờ chưa có Học viên đặt.',
          suggestedActions: [{ label: '📅 Quản Lý Lịch Giảng Dạy', link: '/tutor/timetable' }],
        }
      }

      // ---------------------------------------------------------
      // CHỦ ĐỀ 3: DUYỆT CA HỌC, TẠO LINK GOOGLE MEET & TỪ CHỐI NHẬN LỚP (RÀNG BUỘC CHI TIẾT 100%)
      // ---------------------------------------------------------
      if (
        textLower.includes('xác nhận') ||
        textLower.includes('từ chối') ||
        textLower.includes('duyệt') ||
        textLower.includes('nhận lớp') ||
        textLower.includes('meet') ||
        textLower.includes('link') ||
        textLower.includes('tạo link') ||
        textLower.includes('dán link') ||
        textLower.includes('ca học') ||
        textLower.includes('thông báo') ||
        textLower.includes('lớp mới') ||
        textLower.includes('ca mới')
      ) {
        // 3.1. Hỏi về Nhận thông báo lớp mới / Học viên đặt lịch thông báo ở đâu
        if (
          textLower.includes('nhận thông báo') ||
          textLower.includes('thông báo ở đâu') ||
          textLower.includes('thông báo lớp mới') ||
          textLower.includes('thông báo ca mới') ||
          textLower.includes('xem thông báo') ||
          textLower.includes('xem ca mới ở đâu') ||
          textLower.includes('đặt lịch thông báo') ||
          textLower.includes('thông báo ca học')
        ) {
          return {
            reply:
              'Vị trí nhận Thông báo khi có Ca học mới / Học viên đặt lịch:\n\n' +
              '1. 🔔 Biểu tượng Chuông thông báo: Góc trên cùng bên phải thanh Header (sẽ hiển thị chấm đỏ và thông báo ngay khi Học viên bấm Đặt lịch).\n' +
              '2. 📅 Mục "Lịch giảng dạy": Ca học mới sẽ xuất hiện ngay tại trang Lịch giảng dạy ở trạng thái "Chờ xác nhận".\n' +
              '3. 📧 Email cá nhân: Hệ thống tự động gửi 1 Email thông báo chi tiết ca học mới đến Email đăng ký của bạn!',
            suggestedActions: [{ label: '📅 Đến Lịch Giảng Dạy', link: '/tutor/timetable' }],
          }
        }

        // 3.2. Hỏi về Cách bấm "Xác nhận ca học" / Duyệt ca học của học viên
        if (
          textLower.includes('bấm xác nhận') ||
          textLower.includes('xác nhận ca') ||
          textLower.includes('xác nhận lớp') ||
          textLower.includes('duyệt ca') ||
          textLower.includes('duyệt lớp') ||
          textLower.includes('chấp nhận ca') ||
          textLower.includes('chấp nhận lớp') ||
          textLower.includes('nhận ca học') ||
          textLower.includes('cách duyệt') ||
          textLower.includes('cách nhận ca') ||
          textLower.includes('xác nhận thế nào')
        ) {
          return {
            reply:
              'Hướng dẫn 3 bước Duyệt & Xác nhận ca học của Học viên:\n\n' +
              '1. 📅 Vào mục "Lịch giảng dạy" trên thanh Menu ➡️ Tìm ca học ở trạng thái "Chờ xác nhận".\n' +
              '2. 📝 Bấm nút "Xác nhận ca học".\n' +
              '3. 🎥 Cấp link Google Meet (bấm "✨ Tự động tạo link Meet" hoặc dán link Meet cá nhân) ➡️ Bấm "Lưu/Xác nhận" để chuyển trạng thái ca học thành "Đã xác nhận"!',
            suggestedActions: [{ label: '📅 Danh Sách Ca Học', link: '/tutor/timetable' }],
          }
        }

        // 3.3. Hỏi về Cấp & Tạo Link Google Meet (Tự động tạo hoặc dán link cá nhân)
        if (
          textLower.includes('link meet') ||
          textLower.includes('tạo link') ||
          textLower.includes('dán link') ||
          textLower.includes('tự động tạo') ||
          textLower.includes('cấp link') ||
          textLower.includes('google meet') ||
          textLower.includes('phòng meet') ||
          textLower.includes('gửi link') ||
          textLower.includes('làm sao có link')
        ) {
          return {
            reply:
              'Hướng dẫn Cấp & Tạo Link phòng Google Meet cho ca học:\n\n' +
              '• Có 2 cách cấp link Google Meet cực kỳ tiện lợi khi Gia sư duyệt ca:\n' +
              '  1. ✨ Tự động tạo: Khi bấm Xác nhận ca học, bạn bấm nút "✨ Tự động tạo link Meet" ➡️ Hệ thống sẽ tự cấp 1 đường link phòng Google Meet riêng cho ca học.\n' +
              '  2. 🔗 Dán link cá nhân: Bạn copy đường dẫn phòng Google Meet cố định của bạn ➡️ Dán vào ô "Link Meet".\n' +
              '• Ngay khi dán/tạo link thành công, Học viên sẽ nhìn thấy nút "🎥 Vào Meet" trên giao diện Lịch học để vào học đúng giờ!',
            suggestedActions: [{ label: '📅 Quản Lý Ca Học', link: '/tutor/timetable' }],
          }
        }

        // 3.4. Hỏi về Từ chối nhận ca / Hủy ca khi bận đột xuất
        if (
          textLower.includes('từ chối') ||
          textLower.includes('không nhận') ||
          textLower.includes('bận không dạy') ||
          textLower.includes('hủy ca') ||
          textLower.includes('từ chối lớp') ||
          textLower.includes('từ chối nhận') ||
          textLower.includes('bận đột xuất')
        ) {
          return {
            reply:
              'Hướng dẫn Từ chối ca học khi Gia sư bận đột xuất:\n\n' +
              '1. 📅 Vào mục "Lịch giảng dạy" trên thanh Menu ➡️ Chọn ca học bạn không thể tham gia giảng dạy.\n' +
              '2. ❌ Bấm nút "Từ chối nhận lớp" (hoặc Hủy ca).\n' +
              '3. 📝 Nhập Lý do từ chối ➡️ Bấm "Xác nhận".\n' +
              '• Hệ thống sẽ tự động HOÀN LẠI 100% CREDIT cho Học viên ngay lập tức và gửi thông báo đến Học viên để bạn yên tâm!',
            suggestedActions: [{ label: '📅 Danh Sách Ca Học', link: '/tutor/timetable' }],
          }
        }

        // 3.5. Default / Tổng quan Chủ đề 3
        return {
          reply:
            'Tổng quan Duyệt ca học & Link Google Meet:\n\n' +
            '• Nhận thông báo ca mới: Kiểm tra Chuông 🔔 góc trên Header, mục Lịch giảng dạy & Email.\n' +
            '• Duyệt ca học: Vào Lịch giảng dạy ➡️ Bấm "Xác nhận ca học" ➡️ Cấp link Meet.\n' +
            '• Cấp link Meet: Bấm "✨ Tự động tạo link Meet" hoặc dán link Meet cá nhân.\n' +
            '• Từ chối ca học: Bấm "Từ chối nhận lớp" + Nhập lý do (Hệ thống tự hoàn 100% Credit cho Học viên).',
          suggestedActions: [{ label: '📅 Danh Sách Ca Học', link: '/tutor/timetable' }],
        }
      }

      // ---------------------------------------------------------
      // CHỦ ĐỀ 4: XỬ LÝ SỰ CỐ LỚP HỌC & HỌC VIÊN VẮNG MẶT
      // ---------------------------------------------------------
      if (
        textLower.includes('vắng') ||
        textLower.includes('không vào') ||
        textLower.includes('trễ') ||
        textLower.includes('bị lỗi') ||
        textLower.includes('sự cố') ||
        textLower.includes('báo cáo') ||
        textLower.includes('bùng') ||
        textLower.includes('muộn')
      ) {
        if (
          textLower.includes('lỗi meet') ||
          textLower.includes('lỗi link') ||
          textLower.includes('không vào được phòng')
        ) {
          return {
            reply:
              'Cách xử lý Sự cố Kỹ thuật phòng học Meet:\n\n' +
              '1. Gia sư kiểm tra lại link Google Meet đã dán đúng định dạng chưa.\n' +
              '2. Đảm bảo trình duyệt đã cấp quyền cho Camera & Micro.\n' +
              '3. Nếu link Meet bị lỗi ➡️ Mở chi tiết ca học ➡️ Bấm "Cập nhật Link Meet mới" để Học viên nhận được link mới ngay!',
            suggestedActions: [{ label: '📅 Xem Lịch Giảng Dạy', link: '/tutor/timetable' }],
          }
        }

        return {
          reply:
            'Xử lý khi Học viên trễ hoặc không vào phòng Google Meet:\n\n' +
            '1. Vui lòng nhắn tin/đợi Học viên khoảng 10 phút đầu ca học.\n' +
            '2. Nếu quá 10 phút Học viên vẫn vắng mặt ➡️ Bạn vào Chi tiết ca học ➡️ Bấm "Báo cáo Học viên vắng mặt".\n' +
            '3. Đội ngũ Admin sẽ kiểm tra log phòng học và giải ngân thù lao cho Gia sư theo đúng quy định!',
          suggestedActions: [{ label: '📅 Danh Sách Ca Học', link: '/tutor/timetable' }],
        }
      }

      // ---------------------------------------------------------
      // CHỦ ĐỀ 5: ĐÁNH GIÁ SAO & UY TÍN GIA SƯ
      // ---------------------------------------------------------
      if (
        textLower.includes('đánh giá') ||
        textLower.includes('sao') ||
        textLower.includes('nhận xét') ||
        textLower.includes('uy tín') ||
        textLower.includes('1 sao') ||
        textLower.includes('top')
      ) {
        if (
          textLower.includes('xem ở đâu') ||
          textLower.includes('xem nhận xét') ||
          textLower.includes('ở đâu')
        ) {
          return {
            reply:
              'Vị trí xem Nhận xét & Đánh giá của Học viên:\n\n' +
              '• Bạn bấm vào mục "Hồ sơ cá nhân" ➡️ Xem mục "Đánh giá từ học viên".\n' +
              '• Mọi bình luận, nhận xét và số sao sẽ hiển thị chi tiết theo từng ca học!',
            suggestedActions: [{ label: '📅 Lịch Giảng Dạy', link: '/tutor/timetable' }],
          }
        }

        if (textLower.includes('lên top') || textLower.includes('tăng uy tín')) {
          return {
            reply:
              'Bí quyết tăng Điểm uy tín & Đẩy Hồ sơ lên Top đầu tìm kiếm:\n\n' +
              '1. ⭐️ Duy trì số sao đánh giá cao từ 4.8 đến 5.0 sao.\n' +
              '2. ⏰ Luôn vào lớp đúng giờ và duy trì tỷ lệ duyệt ca 100%.\n' +
              '3. 📅 Cập nhật lịch rảnh đều đặn mỗi tuần!',
            suggestedActions: [{ label: '📅 Lịch Giảng Dạy', link: '/tutor/timetable' }],
          }
        }

        return {
          reply:
            'Quản lý Đánh giá & Điểm uy tín Gia sư:\n\n' +
            '• Sau mỗi ca học hoàn thành, Học viên sẽ chấm số sao (1-5 sao) và để lại nhận xét.\n' +
            '• Đánh giá trung bình cao (4.5 - 5.0 sao) giúp hồ sơ của bạn được đẩy lên vị trí ưu tiên khi học viên tìm kiếm.\n' +
            '• Bạn có thể xem danh sách nhận xét công khai tại trang Hồ sơ cá nhân của mình.',
          suggestedActions: [{ label: '📅 Lịch Giảng Dạy', link: '/tutor/timetable' }],
        }
      }

      // ---------------------------------------------------------
      // CHỦ ĐỀ 6: BẰNG CẤP, CHỨNG CHỈ & KIỂM DUYỆT HỒ SƠ
      // ---------------------------------------------------------
      if (
        textLower.includes('bằng cấp') ||
        textLower.includes('chứng chỉ') ||
        textLower.includes('hồ sơ') ||
        textLower.includes('duyệt') ||
        textLower.includes('admin') ||
        textLower.includes('cập nhật') ||
        textLower.includes('thẩm định') ||
        textLower.includes('bằng đại học')
      ) {
        if (
          textLower.includes('bao lâu') ||
          textLower.includes('khi nào duyệt') ||
          textLower.includes('duyệt lâu')
        ) {
          return {
            reply:
              'Thời gian Admin duyệt Bằng cấp & Thẩm định Hồ sơ Gia sư:\n\n' +
              '• Đội ngũ Admin xử lý duyệt bằng cấp và chứng chỉ trong vòng 24H LÀM VIỆC.\n' +
              '• Ngay khi hồ sơ được duyệt, trạng thái sẽ đổi thành "Đã kiểm duyệt" và hiển thị công khai trên danh sách Gia sư!',
            suggestedActions: [{ label: '📅 Lịch Giảng Dạy', link: '/tutor/timetable' }],
          }
        }

        return {
          reply:
            'Quy trình Thẩm định & Cập nhật Bằng cấp Gia sư:\n\n' +
            '• Để bổ sung bằng cấp mới (Bằng Đại học, IELTS 8.0, Chứng chỉ Sư phạm...) ➡️ Bạn vào mục Hồ sơ cá nhân ➡️ Tải ảnh bằng cấp lên.\n' +
            '• Đội ngũ Admin sẽ thẩm định bằng cấp và duyệt hồ sơ hiển thị công khai cho học viên trong vòng 24h làm việc.',
          suggestedActions: [{ label: '📅 Lịch Giảng Dạy', link: '/tutor/timetable' }],
        }
      }
    }

    // 🛑 KHI CÂU HỎI KHÔNG KHỚP BẤT KỲ CHỦ ĐỀ NÀO ➡️ TỪ CHỐI LỊCH SỰ
    return {
      reply:
        role === 'student'
          ? `Xin lỗi, tôi là Trợ lý AI của TutorConnect và chỉ hỗ trợ giải đáp các câu hỏi liên quan đến nền tảng gia sư TutorConnect (môn học, gia sư, nạp credit, lịch học, Google Meet...).\n\n` +
            `Câu hỏi của bạn hiện nằm ngoài phạm vi tư vấn của hệ thống.\n\n` +
            `Bạn có cần tôi hỗ trợ thông tin gì về các môn học hoặc gia sư trên TutorConnect không?`
          : `Xin lỗi Gia sư, tôi là Trợ lý AI của TutorConnect và chỉ hỗ trợ các câu hỏi liên quan đến công việc giảng dạy trên TutorConnect (lịch rảnh, duyệt ca học, link Meet, thù lao 90%, rút tiền về ngân hàng...).\n\n` +
            `Câu hỏi của bạn hiện nằm ngoài phạm vi tư vấn của hệ thống.\n\n` +
            `Bạn có cần tôi hỗ trợ thông tin gì về Lịch giảng dạy hoặc Ví thu nhập không?`,
      suggestedActions: [
        { label: role === 'student' ? '🔎 Danh Sách Gia Sư' : '📅 Lịch Giảng Dạy', link: role === 'student' ? '/student/tutors' : '/tutor/timetable' },
        { label: role === 'student' ? '💳 Ví Credit' : '💰 Ví Thu Nhập', link: role === 'student' ? '/student/wallet' : '/tutor/wallet' },
      ],
    }
  },
}