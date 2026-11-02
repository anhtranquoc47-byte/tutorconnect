import { Link, useNavigate } from 'react-router-dom'

import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'

export function HomePage() {
  const navigate = useNavigate()

  return (
    <section className="relative overflow-hidden space-y-16 py-4 sm:py-8">
      {/* Background Orbs Decoration */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -left-32 top-10 h-96 w-96 rounded-full bg-brand-500/15 blur-3xl"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -right-32 top-0 h-96 w-96 rounded-full bg-indigo-500/15 blur-3xl"
      />

      {/* =========================================================
          HERO BANNER FOR VISITORS & GUESTS
      ========================================================= */}
      <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-brand-700 via-brand-600 to-indigo-700 px-6 py-12 text-white shadow-2xl shadow-brand-600/20 sm:px-12 sm:py-16 lg:px-16 lg:py-20">
        {/* Animated Glow */}
        <div
          aria-hidden="true"
          className="absolute -right-20 -top-20 h-80 w-80 animate-pulse rounded-full bg-white/10 blur-3xl"
        />
        <div
          aria-hidden="true"
          className="absolute -bottom-32 right-1/4 h-72 w-72 rounded-full bg-cyan-300/15 blur-3xl"
        />

        {/* Grid pattern */}
        <div
          aria-hidden="true"
          className="absolute inset-0 opacity-[0.06]"
          style={{
            backgroundImage:
              'linear-gradient(rgba(255,255,255,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.5) 1px, transparent 1px)',
            backgroundSize: '40px 40px',
          }}
        />

        <div className="relative z-10 grid items-center gap-12 lg:grid-cols-12">
          {/* Hero text & action buttons */}
          <div className="lg:col-span-7">
            <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-1.5 text-xs font-extrabold backdrop-blur-md">
              <span className="h-2.5 w-2.5 animate-pulse rounded-full bg-emerald-300" />
              Nền tảng kết nối gia sư – học viên hàng đầu
            </div>

            <h1 className="text-4xl font-black tracking-tight sm:text-5xl lg:text-6xl leading-tight">
              Tìm đúng gia sư.
              <br />
              <span className="text-white/80">Học đúng định hướng.</span>
            </h1>

            <p className="mt-5 max-w-xl text-sm leading-relaxed text-white/85 sm:text-base">
              GiaSưConnect mang đến giải pháp kết nối trực tiếp học viên với đội ngũ gia sư chất lượng cao đã qua kiểm định bằng cấp, giúp học viên tiến bộ nhanh chóng và tự tin đạt mọi mục tiêu học tập.
            </p>

            {/* PROMINENT REGISTER & LOGIN BUTTONS */}
            <div className="mt-8 flex flex-wrap items-center gap-3">
              <Button
                size="lg"
                variant="white"
                onClick={() => navigate('/register/student')}
              >
                🎓 Đăng ký Học viên →
              </Button>


              <Button
                size="lg"
                variant="outline"
                className="border-white/30 text-white hover:bg-white/15 backdrop-blur-md font-bold"
                onClick={() => navigate('/register/tutor')}
              >
                👨‍🏫 Đăng ký Gia sư
              </Button>

              <Button
                size="lg"
                variant="outline"
                className="border-white/20 bg-black/20 text-white hover:bg-black/30 backdrop-blur-md font-bold"
                onClick={() => navigate('/login')}
              >
                🔑 Đăng nhập ngay
              </Button>
            </div>
          </div>

          {/* Floating Hero Card Visual */}
          <div className="relative hidden lg:col-span-5 lg:block min-h-[340px]">
            <div className="absolute right-2 top-4 w-80 rotate-2 rounded-3xl border border-white/30 bg-white/95 p-6 text-slate-900 shadow-2xl shadow-black/25 backdrop-blur-xl transition-all duration-500 hover:rotate-0 hover:scale-105">
              <div className="flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-tr from-brand-600 to-indigo-600 text-2xl text-white shadow-md">
                  👨‍🏫
                </div>
                <div>
                  <p className="font-extrabold text-slate-900 text-sm">Gia sư đã xác thực</p>
                  <p className="text-xs font-semibold text-brand-600">Toán THPT · Đại học Sư Phạm</p>
                </div>
              </div>

              <div className="mt-5 grid grid-cols-2 gap-3 border-t border-slate-100 pt-4 text-xs">
                <div className="p-2.5 rounded-xl bg-slate-50">
                  <p className="text-[10px] font-bold text-slate-400 uppercase">Đánh giá</p>
                  <p className="font-extrabold text-slate-800 text-sm">⭐ 4.9 / 5.0</p>
                </div>
                <div className="p-2.5 rounded-xl bg-slate-50">
                  <p className="text-[10px] font-bold text-slate-400 uppercase">Bằng cấp</p>
                  <p className="font-extrabold text-emerald-600 text-sm">✓ Đã duyệt</p>
                </div>
              </div>
            </div>

            <div className="absolute bottom-4 left-0 w-64 -rotate-3 rounded-3xl border border-white/30 bg-white/90 p-4 shadow-2xl shadow-black/20 backdrop-blur-xl transition-all duration-500 hover:rotate-0 hover:scale-105">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-emerald-100 text-emerald-700 font-bold">
                  ✨
                </div>
                <div>
                  <p className="text-xs font-extrabold text-slate-900">Kết nối thành công</p>
                  <p className="text-[11px] text-slate-500 font-medium">Khớp 98% nhu cầu học tập</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* =========================================================
          LIVE STATS BAR
      ========================================================= */}
      <section className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {[
          ['100+', 'Gia sư Verified', '👨‍🏫', 'bg-brand-50 text-brand-600'],
          ['500+', 'Học viên active', '🎓', 'bg-indigo-50 text-indigo-600'],
          ['20+', 'Môn học phổ biến', '📚', 'bg-emerald-50 text-emerald-600'],
          ['4.9/5', 'Đánh giá hài lòng', '⭐', 'bg-amber-50 text-amber-600'],
        ].map(([value, label, icon, badgeBg]) => (
          <div
            key={label}
            className="rounded-3xl border border-slate-200/80 bg-white p-6 text-center shadow-sm backdrop-blur-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-xl dark:border-slate-800 dark:bg-slate-900"
          >
            <div className={`mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-2xl text-xl ${badgeBg}`}>
              {icon}
            </div>
            <p className="text-3xl font-black text-slate-900 dark:text-white">
              {value}
            </p>
            <p className="mt-1 text-xs font-bold text-slate-500 dark:text-slate-400">{label}</p>
          </div>
        ))}
      </section>

      {/* =========================================================
          SUBJECT CATEGORIES (KHÁM PHÁ MÔN HỌC)
      ========================================================= */}
      <section className="space-y-8">
        <div className="mx-auto max-w-2xl text-center">
          <span className="inline-block rounded-full bg-brand-50 px-3.5 py-1 text-xs font-extrabold text-brand-600 dark:bg-brand-950/60 dark:text-brand-300">
            DANH MỤC PHỔ BIẾN
          </span>
          <h2 className="mt-3 text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white sm:text-4xl">
            Khám phá các môn học hàng đầu
          </h2>
          <p className="mt-3 text-sm text-slate-500 dark:text-slate-400">
            Đội ngũ gia sư giỏi đáp ứng đầy đủ nhu cầu học phổ thông, ôn thi chứng chỉ và kỹ năng lập trình.
          </p>
        </div>

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {[
            {
              icon: '📐',
              title: 'Toán Học Phổ Thông',
              desc: 'Đại số & Hình học Lớp 6 - 12, Luyện thi THPT Quốc Gia',
              tutors: '42 gia sư',
              color: 'from-blue-500 to-indigo-600',
            },
            {
              icon: '🇬🇧',
              title: 'Luyện Thi IELTS & Anh Văn',
              desc: 'Luyện 4 kỹ năng Nghe - Nói - Đọc - Viết & Tiếng Anh giao tiếp',
              tutors: '35 gia sư',
              color: 'from-emerald-500 to-teal-600',
            },
            {
              icon: '🔬',
              title: 'Vật Lý & Hóa Học',
              desc: 'Lý thuyết & Bài tập nâng cao Lớp 8 - Lớp 12',
              tutors: '28 gia sư',
              color: 'from-purple-500 to-indigo-600',
            },
            {
              icon: '💻',
              title: 'Lập Trình Python & Web',
              desc: 'Tư duy thuật toán, phát triển phần mềm cho học sinh & sinh viên',
              tutors: '19 gia sư',
              color: 'from-amber-500 to-orange-600',
            },
          ].map((cat) => (
            <Card
              key={cat.title}
              className="group relative overflow-hidden p-6 transition-all duration-300 hover:-translate-y-2 hover:shadow-2xl cursor-pointer"
            >
              <div className={`mb-5 flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-tr ${cat.color} text-2xl text-white shadow-md transition-transform duration-300 group-hover:scale-110`}>
                {cat.icon}
              </div>
              <h3 className="text-base font-extrabold text-slate-900 dark:text-white">
                {cat.title}
              </h3>
              <p className="mt-2 text-xs leading-relaxed text-slate-500 dark:text-slate-400">
                {cat.desc}
              </p>
              <div className="mt-5 flex items-center justify-between border-t border-slate-100 pt-3 dark:border-slate-800">
                <span className="text-xs font-bold text-brand-600 dark:text-brand-400">{cat.tutors}</span>
                <span className="text-xs font-bold text-slate-400 transition-transform group-hover:translate-x-1">Đăng ký ngay →</span>
              </div>
            </Card>
          ))}
        </div>
      </section>

      {/* =========================================================
          HOW IT WORKS (3 BƯỚC ĐƠN GIẢN)
      ========================================================= */}
      <section className="space-y-8">
        <div className="mx-auto max-w-2xl text-center">
          <span className="inline-block rounded-full bg-emerald-50 px-3.5 py-1 text-xs font-extrabold text-emerald-600 dark:bg-emerald-950/60 dark:text-emerald-300">
            QUY TRÌNH ĐƠN GIẢN
          </span>
          <h2 className="mt-3 text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white sm:text-4xl">
            Bắt đầu kết nối chỉ với 3 bước
          </h2>
        </div>

        <div className="grid gap-6 md:grid-cols-3">
          {[
            {
              step: '01',
              title: 'Tạo tài khoản học tập',
              desc: 'Đăng ký nhanh tài khoản Học viên hoặc Gia sư chỉ trong 1 phút.',
              icon: '📝',
            },
            {
              step: '02',
              title: 'Xác thực & Kết nối',
              desc: 'Ban quản trị đối chiếu bằng cấp gia sư, học viên dễ dàng chọn lựa.',
              icon: '🤝',
            },
            {
              step: '03',
              title: 'Học tập & Đánh giá',
              desc: 'Bắt đầu quá trình dạy học và theo dõi kết quả minh bạch trên hệ thống.',
              icon: '🚀',
            },
          ].map((item) => (
            <Card
              key={item.step}
              className="group relative overflow-hidden p-8 transition-all duration-300 hover:-translate-y-2 hover:shadow-xl"
            >
              <div className="mb-6 flex items-center justify-between">
                <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-brand-50 text-2xl font-black text-brand-600 dark:bg-brand-950/60 dark:text-brand-400">
                  {item.icon}
                </span>
                <span className="font-mono text-2xl font-black text-slate-200 dark:text-slate-800">
                  {item.step}
                </span>
              </div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                {item.title}
              </h3>
              <p className="mt-2 text-xs leading-relaxed text-slate-500 dark:text-slate-400">
                {item.desc}
              </p>
            </Card>
          ))}
        </div>
      </section>

      {/* =========================================================
          BOTTOM REGISTER / LOGIN CTA BANNER
      ========================================================= */}
      <section className="relative overflow-hidden rounded-3xl bg-slate-950 px-8 py-12 text-white shadow-2xl sm:px-12 lg:px-16">
        <div
          aria-hidden="true"
          className="absolute -right-20 -top-20 h-72 w-72 rounded-full bg-brand-600/30 blur-3xl"
        />

        <div className="relative z-10 flex flex-col items-start justify-between gap-8 md:flex-row md:items-center">
          <div className="max-w-2xl">
            <span className="text-xs font-extrabold uppercase tracking-widest text-brand-400">
              TRẢI NGHIỆM HỆ THỐNG NGAY
            </span>
            <h2 className="mt-3 text-2xl font-extrabold tracking-tight sm:text-3xl">
              Sẵn sàng tìm người đồng hành trong hành trình học tập?
            </h2>
            <p className="mt-2 text-xs text-slate-400">
              Tạo tài khoản miễn phí ngay hôm nay và kết nối với cộng đồng gia sư uy tín.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3 shrink-0">
            <Link
              to="/register/student"
              className="inline-flex items-center gap-2 rounded-2xl bg-brand-600 px-6 py-3.5 text-sm font-extrabold text-white shadow-xl shadow-brand-600/30 transition-all hover:bg-brand-500"
            >
              🎓 Đăng ký Học viên →
            </Link>
            <Link
              to="/login"
              className="inline-flex items-center gap-2 rounded-2xl border border-slate-700 bg-slate-800 px-5 py-3.5 text-sm font-bold text-slate-200 transition-all hover:bg-slate-700"
            >
              🔑 Đăng nhập
            </Link>
          </div>
        </div>
      </section>
    </section>
  )
}