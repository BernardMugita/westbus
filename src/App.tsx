import React, { useState } from 'react'
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom'
import Sidebar from './components/SideNav/sidenav'
import Navbar from './components/Navbar/navbar'
import Dashboard from './features/dashboard/Dashboard'
import Home from './features/home/Home'
import AuthForm from './features/auth/AuthForm'
import Vehicles from './features/vehicles/Vehicles'
import { Drivers } from './features/drivers'
import { Assignments } from './features/assignments'
import { Routes as TransportRoutes } from './features/routes'
import { useAuthStore } from './features/auth/authStore'

const AppContent: React.FC = () => {
  const [collapsed, setCollapsed] = useState(false)
  const { isAuthenticated } = useAuthStore()
  const location = useLocation()
  const isAuthPage = location.pathname === '/auth'

  // Redirect to login if not authenticated and not on auth page
  if (!isAuthenticated && !isAuthPage) {
    return <Navigate to="/auth" state={{ from: location }} replace />
  }

  // Redirect to dashboard if authenticated and on auth page
  if (isAuthenticated && isAuthPage) {
    return <Navigate to="/" replace />
  }

  return (
    <div className="app-layout">
      {isAuthenticated && (
        <Sidebar collapsed={collapsed} onToggle={() => setCollapsed(p => !p)} />
      )}
      <div 
        className={`main-content ${
          (collapsed && isAuthenticated) ? 'collapsed' : ''
        } ${!isAuthenticated ? 'full-width' : ''}`}
        style={!isAuthenticated ? { marginLeft: 0 } : {}}
      >
        {isAuthenticated && <Navbar collapsed={collapsed} />}
        <main className={!isAuthenticated ? '' : 'page-body'}>
          <Routes>
            {/* Protected Routes */}
            <Route path="/" element={<Dashboard />} />
            <Route path="/home" element={<Home />} />
            <Route path="/vehicles" element={<Vehicles />} />
            <Route path="/routes" element={<TransportRoutes />} />
            <Route path="/drivers" element={<Drivers />} />
            <Route path="/driver-assignments" element={<Assignments />} />
            
            {/* Public Auth Route */}
            <Route path="/auth" element={<AuthForm />} />
            
            {/* Catch-all Redirect */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </main>
      </div>
    </div>
  )
}

export default function App() {
  return (
    <BrowserRouter>
      <AppContent />
    </BrowserRouter>
  )
}