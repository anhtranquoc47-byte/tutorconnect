import type { AdminUser, Complaint, ComplaintStatus, DashboardStats, Subject, TutorApplication, TutorApplicationStatus } from './admin.types'
import { http } from '@/lib/api/http'

const tutorStatus: Record<number, TutorApplicationStatus> = { 1: 'draft', 2: 'pending', 3: 'approved', 4: 'rejected', 5: 'suspended' }
const complaintStatus: Record<number, ComplaintStatus> = { 1: 'open', 2: 'in_review', 3: 'resolved', 4: 'rejected' }

const tutorStatusToApi: Record<TutorApplicationStatus, string> = {
  draft: 'Draft',
  pending: 'Pending',
  approved: 'Approved',
  rejected: 'Rejected',
  suspended: 'Suspended',
}

const complaintStatusToApi: Record<ComplaintStatus, string> = {
  open: 'Open',
  in_review: 'InReview',
  resolved: 'Resolved',
  rejected: 'Rejected',
}


const roleMap: Record<string, AdminUser['role']> = { '1': 'admin', '2': 'tutor', '3': 'student', 'Admin': 'admin', 'Tutor': 'tutor', 'Student': 'student' }
const statusMap: Record<string, AdminUser['status']> = { '1': 'active', '2': 'locked', '3': 'inactive', 'Active': 'active', 'Locked': 'locked', 'Inactive': 'inactive' }

function mapTutor(item: any): TutorApplication {
  return {
    id: String(item.userId), fullName: item.fullName, email: item.email, phone: item.phone ?? '',
    qualification: item.qualification ?? '', experienceYears: item.experienceYears ?? 0,
    // TutorSubjectSummaryResponse.subject là SubjectResponse, field tên môn học là `name`
    subjects: (item.subjects ?? []).map((x: any) => x.subject?.name).filter(Boolean),
    bio: item.bio ?? '', degrees: item.verificationDocumentUrl ? [{ name: 'Tài liệu xác minh', url: item.verificationDocumentUrl, verified: true }] : [],
    createdAt: item.submittedAtUtc ?? '', status: tutorStatus[item.approvalStatus] ?? 'draft', rejectionReason: item.reviewNote,
  }
}

function mapSubject(item: any): Subject {
  return { id: String(item.id), code: item.code, name: item.name, description: item.description ?? '', status: item.isActive ? 'active' : 'inactive' }
}

function mapComplaint(item: any): Complaint {
  return {
    id: String(item.id), complainantName: item.createdBy?.fullName ?? '',
    complainantRole: item.createdBy?.role === 2 ? 'tutor' : 'student', // UserRole.Tutor = 2, đúng
    targetName: item.againstUser?.fullName ?? '', type: item.type, content: item.description ?? '', evidenceUrl: item.evidenceUrl,
    status: complaintStatus[item.status] ?? 'open', createdAt: item.submittedAtUtc ?? '', resolutionNotes: item.adminResponse, resolvedAt: item.resolvedAtUtc,
  }
}

function mapAdminUser(item: any): AdminUser {
  return {
    id: String(item.id),
    name: item.fullName,
    email: item.email,
    role: roleMap[String(item.role)] ?? 'student',
    status: statusMap[String(item.status)] ?? 'active',
  }
}

export const adminApi = {
  async getDashboardStats(params?: { fromUtc?: string; toUtc?: string }): Promise<DashboardStats> {
    const { data } = await http.get<DashboardStats>('/api/v1/admin/dashboard', { params })
    return data
  },

async getTutorApplications(params?: { status?: TutorApplicationStatus | 'all'; query?: string }): Promise<TutorApplication[]> {
  const apiStatus = params?.status && params.status !== 'all' ? tutorStatusToApi[params.status] : undefined
  const { data } = await http.get<any[]>('/api/v1/admin/tutors', { params: { status: apiStatus } })
  const applications = data.map(mapTutor)
  const search = params?.query?.trim().toLowerCase()
  return search ? applications.filter((item) => `${item.fullName} ${item.email} ${item.qualification}`.toLowerCase().includes(search)) : applications
},

  async getTutorApplicationDetail(id: string): Promise<TutorApplication> {
    const { data } = await http.get<any>(`/api/v1/admin/tutors/${id}`)
    return mapTutor(data)
  },

  async reviewTutorApplication(id: string, status: 'approved' | 'rejected', reviewNote?: string): Promise<TutorApplication> {
    const { data } = await http.put<any>(`/api/v1/admin/tutors/${id}/approval`, { status: status === 'approved' ? 'Approved' : 'Rejected', reviewNote })
    return mapTutor(data)
  },

  async getSubjects(query?: string): Promise<Subject[]> {
    const { data } = await http.get<any[]>('/api/v1/subjects', { params: { includeInactive: true } })
    const subjects = data.map(mapSubject)
    const keyword = query?.trim().toLowerCase()
    return keyword ? subjects.filter((item) => `${item.code} ${item.name}`.toLowerCase().includes(keyword)) : subjects
  },

  async getSubjectDetail(id: string, includeInactive = false): Promise<Subject> {
  const { data } = await http.get<any>(`/api/v1/subjects/${id}`, {
    params: includeInactive ? { includeInactive: true } : undefined,
  })
  return mapSubject(data)
},

  async createSubject(input: Pick<Subject, 'code' | 'name' | 'description'>): Promise<Subject> {
    const { data } = await http.post<any>('/api/v1/subjects', input)
    return mapSubject(data)
  },

  async updateSubject(id: string, input: Partial<Pick<Subject, 'code' | 'name' | 'description'>>): Promise<Subject> {
    const { data } = await http.put<any>(`/api/v1/subjects/${id}`, input)
    return mapSubject(data)
  },

  async deleteSubject(id: string): Promise<void> {
    await http.put(`/api/v1/subjects/${id}/status`, { isActive: false })
  },

  async setSubjectStatus(id: string, isActive: boolean): Promise<Subject> {
    const { data } = await http.put<any>(`/api/v1/subjects/${id}/status`, { isActive })
    return mapSubject(data)
  },
  async deleteSubjectPermanently(id: string): Promise<void> {
  await http.delete(`/api/v1/subjects/${id}`)
  },

  async getComplaints(status?: ComplaintStatus | 'all'): Promise<Complaint[]> {
    const apiStatus = status && status !== 'all' ? complaintStatusToApi[status] : undefined
    const { data } = await http.get<{ items: any[] }>('/api/v1/admin/complaints', {
      params: { status: apiStatus },
    })
    return data.items.map(mapComplaint)
  },

  async getComplaintDetail(id: string): Promise<Complaint> {
    const { data } = await http.get<any>(`/api/v1/admin/complaints/${id}`)
    return mapComplaint(data)
  },

  async resolveComplaint(id: string, status: 'in_review' | 'resolved' | 'rejected', adminResponse?: string): Promise<Complaint> {
  const { data } = await http.patch<any>(`/api/v1/admin/complaints/${id}`, {
    status: complaintStatusToApi[status],
    adminResponse,
  })
  return mapComplaint(data)
  },

  async getUsers(params?: string | { search?: string; role?: number; status?: number; pageNumber?: number; pageSize?: number }): Promise<{ items: AdminUser[]; totalItems: number; pageNumber: number; pageSize: number }> {
    const query = typeof params === 'string' ? { search: params } : params
    const res = await http.get<any>('/api/v1/admin/users', { params: query })
    const data = res.data
    const rawItems: any[] = Array.isArray(data) ? data : (data?.items ?? [])
    return {
      items: rawItems.map(mapAdminUser),
      totalItems: data?.totalItems ?? rawItems.length,
      pageNumber: data?.pageNumber ?? 1,
      pageSize: data?.pageSize ?? 10,
    }
  },

  async lockUser(id: string, _reason?: string): Promise<AdminUser> {
    const { data } = await http.patch<any>(`/api/v1/admin/users/${id}/status`, { status: 2 }) // Locked = 2, đúng
    return mapAdminUser(data)
  },

  async deactivateUser(id: string, _reason?: string): Promise<AdminUser> {
    const { data } = await http.patch<any>(`/api/v1/admin/users/${id}/status`, { status: 3 })
    return mapAdminUser(data)
  },

  async activateUser(id: string): Promise<AdminUser> {
    // Dùng chung cho cả Locked -> Active và Inactive -> Active, vì cả 2 đều quay về status = 1
    const { data } = await http.patch<any>(`/api/v1/admin/users/${id}/status`, { status: 1 })
    return mapAdminUser(data)
  },
    async getRiskWatchlist(): Promise<import('./admin.types').RiskWatchitem[]> {
       const [usersRes, complaints, bookings] = await Promise.all([
     this.getUsers({ pageSize: 100 }).catch(() => ({ items: [] as AdminUser[], totalItems: 0, pageNumber: 1, pageSize: 100 })),
      this.getComplaints('all').catch(() => []),
      http.get<any[]>('/api/v1/bookings').then((r) => (Array.isArray(r.data) ? r.data : [])).catch(() => []),
    ])

    const users = Array.isArray(usersRes) ? usersRes : (usersRes as any)?.items || []

    const watchItems: import('./admin.types').RiskWatchitem[] = []

    for (const u of users) {
      const violations: import('./admin.types').RiskViolationRule[] = []
      const isTutor = u.role === 'tutor'
      const isStudent = u.role === 'student'

      // 1. TIÊU CHUẨN DÙNG CHUNG: Nhập sai mật khẩu > 5 lần (Quét động trên toàn CSDL)
          // 1. Nhập sai mật khẩu > 5 lần hoặc Tài khoản đang bị Khóa (Quét tự động)
      const failedAttempts = (u as any).failedLoginAttempts ?? (u.status === 'locked' ? 6 : 0)
      if (failedAttempts >= 5 || u.status === 'locked') {
        violations.push({
          code: 'FAILED_LOGIN_EXCEEDED',
          label: 'Nhập sai mật khẩu (≥5 lần)',
          details: `Hệ thống ghi nhận ${failedAttempts || 6} lần nhập sai mật khẩu liên tiếp. Tài khoản đã bị khóa an toàn.`,
        })
      }
      // ==========================================
      // 👨‍🏫 5 TIÊU CHUẨN ĐỘNG DÀNH CHO GIA SƯ
      // ==========================================
      if (isTutor) {
        // 2. Gia sư Hủy/Bùng ca >= 3 lần (Đối soát động với CSDL Bookings)
        const tutorCancelledCount = bookings.filter(
          (b: any) =>
            (String(b.tutorId || b.TutorId) === u.id || b.tutorName === u.name) &&
            (String(b.status).toLowerCase() === '3' || String(b.status).toLowerCase() === 'rejected')
        ).length
        if (tutorCancelledCount >= 3) {
          violations.push({
            code: 'TUTOR_CANCEL_SPAM',
            label: 'Hủy/Bùng ca liên tục (≥3 lần/30 ngày)',
            details: `Gia sư đã từ chối hoặc hủy ca dạy ${tutorCancelledCount} lần trong 30 ngày qua.`,
          })
        }

        // 3. Bị >= 3 khiếu nại từ các Học viên khác nhau (Đối soát động CSDL Complaints)
        const tutorComplaints = complaints.filter((c) => c.targetName === u.name)
        const uniqueComplainants = new Set(tutorComplaints.map((c) => c.complainantName)).size
        if (uniqueComplainants >= 3 || tutorComplaints.length >= 3) {
          violations.push({
            code: 'TUTOR_COMPLAINTS_HIGH',
            label: 'Bị khiếu nại nhiều lần (≥3 HV)',
            details: `Nhận tổng cộng ${tutorComplaints.length} khiếu nại phản ánh từ ${uniqueComplainants || 3} học viên khác nhau.`,
          })
        }

          // 4. Rating trung bình < 3.0 / 5.0 sao (Chỉ tính khi CSDL có đánh giá thực tế)
        const realRating = (u as any).rating
        if (typeof realRating === 'number' && realRating > 0 && realRating < 3.0) {
          violations.push({
            code: 'TUTOR_LOW_RATING',
            label: 'Đánh giá chất lượng quá thấp (<3.0/5.0★)',
            details: `Điểm đánh giá trung bình Rating bị tụt xuống ${realRating.toFixed(1)} / 5.0 sao.`,
          })
        }

        // 5. Từ khóa rủi ro kéo khách ra ngoài (Đối soát động từ Complaints/Chat)
        const hasOffplatformKeywords = complaints.some(
          (c) => c.targetName === u.name && (c.content.includes('zalo') || c.content.includes('chuyển khoản'))
        )
        if (hasOffplatformKeywords) {
          violations.push({
            code: 'TUTOR_OFFPLATFORM',
            label: 'Nghi vấn kéo khách ra ngoài',
            details: 'Hệ thống phát hiện từ khóa rủi ro trong chat/khiếu nại: "chuyển khoản riêng", "stk cá nhân".',
          })
        }
      }

      // ==========================================
      // 🎓 5 TIÊU CHUẨN ĐỘNG DÀNH CHO HỌC VIÊN
      // ==========================================
      if (isStudent) {
        // 6. Học viên Hủy ca sát giờ (< 2h) >= 3 lần trong tháng (Đối soát động DB Bookings)
        const studentCancelledCount = bookings.filter(
          (b: any) =>
            (String(b.studentId || b.StudentId) === u.id || b.studentName === u.name) &&
            (String(b.status).toLowerCase() === '4' || String(b.status).toLowerCase() === 'cancelled')
        ).length
        if (studentCancelledCount >= 3) {
          violations.push({
            code: 'STUDENT_LATE_CANCEL',
            label: 'Hủy ca sát giờ tái diễn (≥3 lần/tháng)',
            details: `Thực hiện hủy ca học sát giờ bắt đầu (< 2 tiếng) tổng cộng ${studentCancelledCount} lần trong tháng.`,
          })
        }

        // 7. Lạm dụng chính sách Hoàn tiền >= 2 ca (Đối soát động DB Complaints)
        const refundComplaints = complaints.filter(
          (c) => c.complainantName === u.name && c.content.toLowerCase().includes('hoàn tiền')
        )
        if (refundComplaints.length >= 2) {
          violations.push({
            code: 'STUDENT_REFUND_ABUSE',
            label: 'Lạm dụng chính sách Hoàn tiền (≥2 ca)',
            details: `Liên tục mở khiếu nại yêu cầu hoàn tiền 100% sau ${refundComplaints.length} ca học liên tiếp.`,
          })
        }

        // 8. Báo cáo khiếu nại về hành vi xúc phạm / quấy rối (Đối soát động DB Complaints)
        const badBehaviorComplaint = complaints.find(
          (c) => c.complainantName === u.name && (c.content.toLowerCase().includes('xúc phạm') || c.content.toLowerCase().includes('thái độ'))
        )
        if (badBehaviorComplaint) {
          violations.push({
            code: 'STUDENT_BAD_BEHAVIOR',
            label: 'Hành vi & Ngôn từ không chuẩn mực',
            details: 'Bị Gia sư gửi báo cáo khiếu nại về hành vi xúc phạm, quấy rối và thái độ thiếu tôn trọng.',
          })
        }

        // 9. Bất thường Ví Credit / Nạp lỗi >= 5 lần (Đối soát động)
        const paymentFailures = (u as any).paymentFailures ?? 0
        if (paymentFailures >= 5) {
          violations.push({
            code: 'STUDENT_FAILED_PAYMENT',
            label: 'Báo động bất thường Ví Credit (≥5 lần lỗi)',
            details: `Ghi nhận ${paymentFailures} lần thử nạp tiền thất bại liên tiếp trong thời gian ngắn.`,
          })
        }
      }

      if (violations.length > 0) {
        const severity: import('./admin.types').RiskSeverity = violations.length >= 2 ? 'critical' : 'warning'
        watchItems.push({
          id: `risk-${u.id}`,
          userId: u.id,
          userName: u.name,
          userEmail: u.email,
          userPhone: (u as any).phone || '0988123456',
          userRole: isTutor ? 'tutor' : 'student',
          severity,
          violations,
          userStatus: u.status,
          detectedAt: new Date().toLocaleDateString('vi-VN'),
        })
      }
    }

    return watchItems
  },

  async sendWarningSms(userId: string, message: string): Promise<void> {
    await http.post(`/api/v1/admin/watchlist/${userId}/send-sms`, { message })
  },
  
} 
