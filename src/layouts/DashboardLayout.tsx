import { useState } from 'react'
import { Outlet } from 'react-router-dom'
import DashboardSidebar, { MenuButton } from '../components/DashboardSidebar'
import './DashboardLayout.css'

export default function DashboardLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [collapsed, setCollapsed] = useState(false)
  return <div className="dashboard-shell"><DashboardSidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} collapsed={collapsed} onToggle={() => setCollapsed((current) => !current)} /><div className={`dashboard-shell-content ${collapsed ? 'collapsed' : ''}`}><div className="dashboard-mobile-bar"><MenuButton onClick={() => setSidebarOpen(true)} /><span>BhuDrishti</span></div><Outlet /></div></div>
}
