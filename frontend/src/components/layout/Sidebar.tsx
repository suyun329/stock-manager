import { NavLink } from 'react-router-dom'
import { LayoutDashboard, ArrowLeftRight, Bot } from 'lucide-react'
import { cn } from '@/lib/utils'

const navItems = [
  { to: '/', label: '대시보드', icon: LayoutDashboard },
  { to: '/trades', label: '매매 내역', icon: ArrowLeftRight },
]

export default function Sidebar() {
  return (
    <aside className="w-56 min-h-screen bg-white border-r border-gray-200 flex flex-col py-6 px-3">
      <div className="flex items-center gap-2 px-3 mb-8">
        <Bot className="text-indigo-600" size={22} />
        <span className="font-semibold text-gray-900 text-base">StockAI</span>
      </div>

      <nav className="flex flex-col gap-1">
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
    </aside>
  )
}
