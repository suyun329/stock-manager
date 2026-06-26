import { NavLink, useNavigate } from 'react-router-dom'
import { LayoutDashboard, ArrowLeftRight, Bot, LogOut } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useAuth } from '@/contexts/AuthContext'

const navItems = [
  { to: '/', label: '대시보드', icon: LayoutDashboard },
  { to: '/trades', label: '매매 내역', icon: ArrowLeftRight },
]

export default function Sidebar() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  return (
    <aside className="w-56 min-h-screen bg-white border-r border-gray-200 flex flex-col py-6 px-3">
      <div className="flex items-center gap-2 px-3 mb-8">
        <Bot className="text-indigo-600" size={22} />
        <span className="font-semibold text-gray-900 text-base">AI Stock Manager</span>
      </div>

      <nav className="flex flex-col gap-1 flex-1">
        {navItems.map(({ to, label, icon: Icon }) => (
          <NavLink
            key={to}
            to={to}
            end
            className={({ isActive }) =>
              cn(
                'flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors',
                isActive
                  ? 'bg-indigo-50 text-indigo-700 font-medium'
                  : 'text-gray-600 hover:bg-gray-100',
              )
            }
          >
            <Icon size={17} />
            {label}
          </NavLink>
        ))}
      </nav>

      <div className="border-t border-gray-100 pt-4 mt-4 px-3">
        <p className="text-xs text-gray-400 mb-1">로그인 계정</p>
        <p className="text-sm font-medium text-gray-800 mb-3">{user?.name}</p>
        <button
          onClick={handleLogout}
          className="flex items-center gap-2 text-sm text-gray-500 hover:text-red-500 transition-colors"
        >
          <LogOut size={15} />
          로그아웃
        </button>
      </div>
    </aside>
  )
}
