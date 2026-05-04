import React from 'react'
import { NavLink, useLocation } from 'react-router-dom'
import { 
  HiSquares2X2, 
  HiTruck, 
  HiUsers, 
  HiLink, 
  HiStar, 
  HiMap, 
  HiGlobeAlt, 
  HiChartBar, 
  HiReceiptRefund, 
  HiBanknotes, 
  HiCurrencyDollar, 
  HiWrenchScrewdriver, 
  HiCalendar, 
  HiShieldCheck, 
  HiClipboardDocumentCheck, 
  HiUserGroup,
  HiChevronLeft,
  HiChevronRight
} from 'react-icons/hi2'
import { useAuthStore } from '../../features/auth/authStore'
import './sidenav.scss'

interface NavItem {
  label: string
  path: string
  icon: React.ElementType
  group?: string
}

const NAV_ITEMS: NavItem[] = [
  { label: 'Dashboard',          path: '/',                        icon: HiSquares2X2, group: 'Overview' },
  { label: 'Vehicles',           path: '/vehicles',                icon: HiTruck,      group: 'Fleet' },
  { label: 'Drivers',            path: '/drivers',                 icon: HiUsers,      group: 'Fleet' },
  { label: 'Driver Assignments', path: '/driver-assignments',      icon: HiLink,       group: 'Fleet' },
  { label: 'Driver Scores',      path: '/driver-scores',           icon: HiStar,       group: 'Fleet' },
  { label: 'Routes',             path: '/routes',                  icon: HiMap,        group: 'Operations' },
  { label: 'Trips',              path: '/trips',                   icon: HiGlobeAlt,   group: 'Operations' },
  { label: 'Revenue Ledger',     path: '/revenue-ledger',          icon: HiChartBar,   group: 'Finance' },
  { label: 'Expenses',           path: '/expenses',                icon: HiReceiptRefund, group: 'Finance' },
  { label: 'Loans',              path: '/loans',                   icon: HiBanknotes,  group: 'Finance' },
  { label: 'Loan Repayments',    path: '/loan-repayments',         icon: HiCurrencyDollar, group: 'Finance' },
  { label: 'Maintenance',        path: '/maintenance-records',     icon: HiWrenchScrewdriver, group: 'Maintenance' },
  { label: 'Schedules',          path: '/maintenance-schedules',   icon: HiCalendar,   group: 'Maintenance' },
  { label: 'Insurance',          path: '/insurance-policies',      icon: HiShieldCheck, group: 'Insurance' },
  { label: 'Claims',             path: '/insurance-claims',        icon: HiClipboardDocumentCheck, group: 'Insurance' },
  { label: 'Users',              path: '/users',                   icon: HiUserGroup,  group: 'Admin' },
]

const GROUPS = ['Overview', 'Fleet', 'Operations', 'Finance', 'Maintenance', 'Insurance', 'Admin']

interface SidenavProps {
  collapsed: boolean
  onToggle: () => void
}

export default function SideNav({ collapsed, onToggle }: SidenavProps) {
  const location = useLocation()
  const { user } = useAuthStore()

  return (
    <aside className={`sidenav ${collapsed ? 'sidenav--collapsed' : ''}`}>
      {/* Logo */}
      <div className="sidenav__logo">
        <div className="sidenav__logo-mark">
          <span>W</span>
        </div>
        {!collapsed && (
          <div className="sidenav__logo-text">
            <span className="sidenav__logo-name">WestBus</span>
            <span className="sidenav__logo-sub">Admin Portal</span>
          </div>
        )}
      </div>

      {/* Nav */}
      <nav className="sidenav__nav">
        {GROUPS.map(group => {
          const items = NAV_ITEMS.filter(i => i.group === group)
          return (
            <div key={group} className="sidenav__group">
              {!collapsed && (
                <span className="sidenav__group-label">{group}</span>
              )}
              {items.map(item => (
                <NavLink
                  key={item.path}
                  to={item.path}
                  end={item.path === '/'}
                  className={({ isActive }) =>
                    `sidenav__item ${isActive ? 'sidenav__item--active' : ''}`
                  }
                  title={collapsed ? item.label : undefined}
                >
                  <span className="sidenav__item-icon">
                    <item.icon size={20} />
                  </span>
                  {!collapsed && (
                    <span className="sidenav__item-label">{item.label}</span>
                  )}
                  {!collapsed && location.pathname === item.path && (
                    <span className="sidenav__item-pip" />
                  )}
                </NavLink>
              ))}
            </div>
          )
        })}
      </nav>

      {/* Toggle */}
      <button className="sidenav__toggle" onClick={onToggle} aria-label="Toggle sidenav">
        <span className="sidenav__toggle-icon">
          {collapsed ? <HiChevronRight /> : <HiChevronLeft />}
        </span>
      </button>

      {/* Footer */}
      {!collapsed && (
        <div className="sidenav__footer">
          <div className="sidenav__footer-avatar">
            {user?.full_name?.charAt(0) || user?.username?.charAt(0) || 'U'}
          </div>
          <div className="sidenav__footer-info">
            <span className="sidenav__footer-name">{user?.full_name || user?.username || 'User'}</span>
            <span className="sidenav__footer-role">Admin</span>
          </div>
        </div>
      )}
    </aside>
  )
}
