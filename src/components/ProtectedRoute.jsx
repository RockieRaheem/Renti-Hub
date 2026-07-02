import { Navigate, Outlet } from 'react-router-dom'
import { useBuilding } from '../context/BuildingContext'

export default function ProtectedRoute() {
  const { auth } = useBuilding()
  if (!auth) return <Navigate to="/login" replace />
  return <Outlet />
}
