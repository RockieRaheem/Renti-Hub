import { Routes, Route } from 'react-router-dom'
import AppLayout from './components/layout/AppLayout'
import Home from './pages/Home'
import Dashboard from './pages/Dashboard'
import Properties from './pages/Properties'
import Tenants from './pages/Tenants'
import RentCollection from './pages/RentCollection'
import FinancialReports from './pages/FinancialReports'
import MaintenanceBoard from './pages/MaintenanceBoard'
import MaintenanceRequests from './pages/MaintenanceRequests'
import Login from './pages/Login'
import Register from './pages/Register'

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route element={<AppLayout />}>
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/properties" element={<Properties />} />
        <Route path="/tenants" element={<Tenants />} />
        <Route path="/rent-collection" element={<RentCollection />} />
        <Route path="/financial-reports" element={<FinancialReports />} />
        <Route path="/maintenance-board" element={<MaintenanceBoard />} />
        <Route path="/maintenance-requests" element={<MaintenanceRequests />} />
      </Route>
    </Routes>
  )
}
