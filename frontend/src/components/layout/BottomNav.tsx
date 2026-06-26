import { NavLink, useNavigate } from 'react-router-dom'
import { LayoutDashboard, ArrowLeftRight, LogOut } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useAuth } from '@/contexts/AuthContext'

const navItems = [
  { to: '/', label: '대시보드', icon: LayoutDashboard },
  { to: '/trades', label: '매매 내역', icon: ArrowLeftRight },
]

export default function BottomNav() {
  const { logout } = useAuth()
  const navigate = useNavigate()

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-gray-200 flex items-center">
      {navItems.map(({ to, label, icon: Icon }) => (
        <NavLink
          key={to}
          to={to}
          end
          className={({ isActive }) =>
            cn(
              'flex-1 flex flex-col items-center justify-center py-3 gap-1 text-xs transition-colors',
              isActive ? 'text-indigo-600' : 'text-gray-400',
            )
          }
        >
          {({ isActive }) => (
            <>
              <Icon size={20} strokeWidth={isActive ? 2.5 : 1.8} />
              <span className={cn('font-medium', isActive && 'font-semibold')}>{label}</span>
            </>
          )}
        </NavLink>
      ))}
      <button
        onClick={() => { logout(); navigate('/login') }}
        className="flex-1 flex flex-col items-center justify-center py-3 gap-1 text-xs text-gray-400"
      >
        <LogOut size={20} strokeWidth={1.8} />
        <span>로그아웃</span>
      </button>
    </nav>
  )
}
