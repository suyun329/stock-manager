import { Outlet } from 'react-router-dom'
import Sidebar from './Sidebar'
import BottomNav from './BottomNav'

export default function Layout() {
  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* 데스크탑 사이드바 */}
      <div className="hidden md:block">
        <Sidebar />
      </div>

      {/* 메인 콘텐츠 */}
      <main className="flex-1 p-4 md:p-8 overflow-y-auto pb-20 md:pb-8">
        <Outlet />
      </main>

      {/* 모바일 하단 네비 */}
      <div className="md:hidden">
        <BottomNav />
      </div>
    </div>
  )
}
