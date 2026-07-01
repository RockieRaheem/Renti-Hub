import { Routes, Route } from 'react-router-dom'
import ErrorBoundary from './components/ErrorBoundary'
import AppLayout from './components/layout/AppLayout'
import Home from './pages/Home'
import Dashboard from './pages/Dashboard'
import Properties from './pages/Properties'
import FloorDetails from './pages/FloorDetails'
import UnitDetails from './pages/UnitDetails'
import RentCollection from './pages/RentCollection'
import FinancialReports from './pages/FinancialReports'
import MaintenanceBoard from './pages/MaintenanceBoard'
import MaintenanceRequests from './pages/MaintenanceRequests'
import Login from './pages/Login'
import Register from './pages/Register'

export default function App() {
  return (
    <ErrorBoundary>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route element={<AppLayout />}>
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/properties" element={<Properties />} />
          <Route path="/properties/floor/:floorName" element={<FloorDetails />} />
          <Route path="/properties/floor/:floorName/unit/:unitId" element={<UnitDetails />} />
          <Route path="/rent-collection" element={<RentCollection />} />
          <Route path="/financial-reports" element={<FinancialReports />} />
          <Route path="/maintenance-board" element={<MaintenanceBoard />} />
          <Route path="/maintenance-requests" element={<MaintenanceRequests />} />
        </Route>
      </Routes>
    </ErrorBoundary>
  )
}
