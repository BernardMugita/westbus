import { useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { HiMagnifyingGlass, HiBell, HiArrowRightOnRectangle } from 'react-icons/hi2'
import { useAuthStore } from '../../features/auth/authStore'
import './navbar.scss'

const ROUTE_LABELS: Record<string, string> = {
  '/':                       'Dashboard',
  '/vehicles':               'Vehicles',
  '/drivers':                'Drivers',
  '/driver-assignments':     'Driver Assignments',
  '/driver-scores':          'Driver Score History',
  '/routes':                 'Routes',
  '/trips':                  'Trips',
  '/revenue-ledger':         'Revenue Ledger',
  '/expenses':               'Expenses',
  '/loans':                  'Loans',
  '/loan-repayments':        'Loan Repayments',
  '/maintenance-records':    'Maintenance Records',
  '/maintenance-schedules':  'Maintenance Schedules',
  '/insurance-policies':     'Insurance Policies',
  '/insurance-claims':       'Insurance Claims',
  '/users':                  'Users',
}

interface NavbarProps {
  collapsed: boolean
}

export default function Navbar({ collapsed }: NavbarProps) {
  const location = useLocation()
  const navigate = useNavigate()
  const [searchValue, setSearchValue] = useState('')
  const [notifOpen, setNotifOpen] = useState(false)
  const { user, logout } = useAuthStore()

  const pageTitle = ROUTE_LABELS[location.pathname] ?? 'WestBus'
  const now = new Date()
  const dateStr = now.toLocaleDateString('en-KE', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })

  const handleLogout = () => {
    logout()
    navigate('/auth')
  }

  return (
    <header className={`navbar ${collapsed ? 'navbar--collapsed' : ''}`}>
      {/* Left: Page title */}
      <div className="navbar__left">
        <div className="navbar__breadcrumb">
          <span className="navbar__breadcrumb-root">WestBus</span>
          <span className="navbar__breadcrumb-sep">/</span>
          <span className="navbar__breadcrumb-current">{pageTitle}</span>
        </div>
        <h1 className="navbar__title">{pageTitle}</h1>
      </div>

      {/* Center: Search */}
      <div className="navbar__search">
        <HiMagnifyingGlass className="navbar__search-icon" />
        <input
          type="text"
          className="navbar__search-input"
          placeholder="Search vehicles, drivers, trips..."
          value={searchValue}
          onChange={e => setSearchValue(e.target.value)}
        />
        <span className="navbar__search-kbd">⌘K</span>
      </div>

      {/* Right: Actions */}
      <div className="navbar__right">
        <span className="navbar__date">{dateStr}</span>

        {/* Notifications */}
        <button
          className={`navbar__icon-btn ${notifOpen ? 'navbar__icon-btn--active' : ''}`}
          onClick={() => setNotifOpen(!notifOpen)}
          aria-label="Notifications"
        >
          <HiBell size={20} />
          <span className="navbar__notif-badge">3</span>
        </button>

        {/* Divider */}
        <div className="navbar__divider" />

        {/* Profile */}
        <button className="navbar__profile" onClick={handleLogout} title="Click to Logout">
          <div className="navbar__profile-avatar">
            {user?.full_name?.charAt(0) || user?.username?.charAt(0) || 'U'}
          </div>
          <div className="navbar__profile-info">
            <span className="navbar__profile-name">{user?.full_name || user?.username || 'User'}</span>
            <span className="navbar__profile-role">Admin</span>
          </div>
          <div className="navbar__profile-logout" style={{ display: 'flex', alignItems: 'center', gap: '4px', marginLeft: '12px' }}>
            <HiArrowRightOnRectangle size={16} color="#FF6B1A" />
            <span className="navbar__profile-logout-text" style={{ fontSize: '10px', color: '#FF6B1A', fontWeight: 'bold' }}>LOGOUT</span>
          </div>
        </button>
      </div>
    </header>
  )
}