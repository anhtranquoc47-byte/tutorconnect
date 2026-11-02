import { Calendar, Search, Target, User } from 'lucide-react'
import { Link } from 'react-router-dom'

const actions = [
  {
    to: '/student/tutors',
    label: 'Tìm Gia Sư',
    icon: Search,
    iconClass:
      'bg-indigo-50 text-indigo-600 group-hover:bg-indigo-600 group-hover:text-white dark:bg-indigo-950/60 dark:text-indigo-400 dark:group-hover:bg-indigo-600 dark:group-hover:text-white',
  },
  {
    to: '/student/schedule',
    label: 'Lịch Học',
    icon: Calendar,
    iconClass:
      'bg-emerald-50 text-emerald-600 group-hover:bg-emerald-600 group-hover:text-white dark:bg-emerald-950/60 dark:text-emerald-400 dark:group-hover:bg-emerald-600 dark:group-hover:text-white',
  },
  {
    to: '/student/progress',
    label: 'Mục Tiêu',
    icon: Target,
    iconClass:
      'bg-purple-50 text-purple-600 group-hover:bg-purple-600 group-hover:text-white dark:bg-purple-950/60 dark:text-purple-400 dark:group-hover:bg-purple-600 dark:group-hover:text-white',
  },
  {
    to: '/student/profile',
    label: 'Hồ Sơ',
    icon: User,
    iconClass:
      'bg-amber-50 text-amber-600 group-hover:bg-amber-600 group-hover:text-white dark:bg-amber-950/60 dark:text-amber-400 dark:group-hover:bg-amber-600 dark:group-hover:text-white',
  },
]

export function QuickActions() {
  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 lg:grid-cols-2">
      {actions.map(({ to, label, icon: Icon, iconClass }) => (
        <Link
          key={to}
          to={to}
          className="group flex aspect-square flex-col items-center justify-center rounded-2xl border border-gray-200 bg-white p-3 text-center shadow-sm transition-all duration-200 hover:-translate-y-1 hover:border-gray-300 hover:shadow-md dark:border-gray-800 dark:bg-gray-900 dark:hover:border-gray-700"
        >
          <div
            className={`mb-3 flex h-11 w-11 items-center justify-center rounded-xl transition-all duration-200 ${iconClass}`}
          >
            <Icon className="h-5 w-5 transition-transform duration-200 group-hover:scale-110" />
          </div>

          <p className="text-xs font-bold text-gray-900 dark:text-gray-100">{label}</p>

          <span className="mt-1 text-[10px] text-gray-400 opacity-0 transition-opacity duration-200 group-hover:opacity-100">
            Truy cập →
          </span>
        </Link>
      ))}
    </div>
  )
}

export default QuickActions
