import { Outlet } from 'react-router-dom'
import Sidebar from './Sidebar'
import Header from './Header'

export default function AppLayout() {
  return (
    <div className="flex h-screen overflow-hidden bg-background"
      style={{
        backgroundImage:
          'radial-gradient(at 0% 0%, rgba(0, 55, 176, 0.03) 0px, transparent 50%), radial-gradient(at 100% 100%, rgba(249, 115, 22, 0.03) 0px, transparent 50%)',
      }}
    >
      <Sidebar />
      <main className="flex-1 overflow-y-auto">
        <Header />
        <div className="max-w-7xl mx-auto">
          <Outlet />
        </div>
      </main>
    </div>
  )
}
