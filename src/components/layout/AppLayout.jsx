import { useState } from 'react'
import { Outlet } from 'react-router-dom'
import { useBuilding } from '../../context/BuildingContext'
import Sidebar from './Sidebar'
import Header from './Header'
import Onboarding from '../../pages/Onboarding'

export default function AppLayout() {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
  const { hasBuilding, loading } = useBuilding()

  if (!loading && !hasBuilding) {
    return (
      <div className="min-h-screen bg-surface-container">
        <Onboarding />
      </div>
    )
  }

  return (
    <div className="flex h-screen bg-surface-container">
      <Sidebar collapsed={sidebarCollapsed} onToggle={() => setSidebarCollapsed(v => !v)} />
      <main className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <Header />
        <div className="flex-1 overflow-y-auto scroll-smooth">
          <div className="max-w-7xl mx-auto">
            <Outlet />
          </div>
        </div>
      </main>
    </div>
  )
}
