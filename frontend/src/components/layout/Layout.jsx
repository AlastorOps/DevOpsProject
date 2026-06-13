import { useState } from 'react'
import { Outlet } from 'react-router-dom'
import Sidebar from './Sidebar'
import Header from './Header'
import FloatingCheckout from '../ui/FloatingCheckout'
import { useAuth } from '../../context/AuthContext'
import { useAttendance } from '../../context/useAttendance.js'

export default function Layout() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)
  const { user } = useAuth()
  const { todayAtt } = useAttendance()

  const showBar = user?.role === 'Employee' && !!todayAtt?.check_in && !todayAtt?.check_out

  return (
    <div className="min-h-screen bg-background">
      <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />
      <Header onMenuClick={() => setIsSidebarOpen(true)} />
      <main className={`pt-16 min-h-screen lg:ml-sidebar-width${showBar ? ' pb-14' : ''}`}>
        <Outlet />
      </main>
      <FloatingCheckout />
    </div>
  )
}
