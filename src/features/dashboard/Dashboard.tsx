import React, { useEffect, useState } from 'react'
import { 
  HiTruck, 
  HiUsers, 
  HiGlobeAlt, 
  HiChartBar, 
  HiArrowTrendingUp, 
  HiArrowTrendingDown 
} from 'react-icons/hi2'
import './Dashboard.scss'

// ─── Types ────────────────────────────────────────────────────────────────────

interface StatCard {
  id: string
  label: string
  value: string | number
  sub: string
  icon: React.ElementType
  trend: number       // positive = up, negative = down
  trendLabel: string
  accent: 'orange' | 'black' | 'grey' | 'success'
}

interface RecentTrip {
  trip_id: string
  route: string
  driver: string
  vehicle: string
  status: 'Completed' | 'Ongoing' | 'Cancelled'
  start_time: string
  distance_km: number
}

interface RecentBooking {
  booking_id: string
  passenger_name: string
  route: string
  seats_booked: number
  booking_status: 'Reserved' | 'Confirmed' | 'Cancelled' | 'Completed'
  total_amount: number
}

// ─── Mock Data ────────────────────────────────────────────────────────────────

const STAT_CARDS: StatCard[] = [
  {
    id: 'vehicles',
    label: 'Total Vehicles',
    value: 24,
    sub: '18 Active · 4 Maintenance · 2 Retired',
    icon: HiTruck,
    trend: 4.2,
    trendLabel: 'vs last month',
    accent: 'orange',
  },
  {
    id: 'drivers',
    label: 'Active Drivers',
    value: 31,
    sub: '28 Active · 2 Suspended · 1 Left',
    icon: HiUsers,
    trend: 2.1,
    trendLabel: 'vs last month',
    accent: 'black',
  },
  {
    id: 'trips',
    label: "Today's Trips",
    value: 47,
    sub: '12 Ongoing · 35 Completed · 0 Cancelled',
    icon: HiGlobeAlt,
    trend: -1.8,
    trendLabel: 'vs yesterday',
    accent: 'grey',
  },
  {
    id: 'revenue',
    label: 'Monthly Revenue',
    value: 'KES 1.24M',
    sub: 'KES 4,800 avg per trip',
    icon: HiChartBar,
    trend: 11.3,
    trendLabel: 'vs last month',
    accent: 'success',
  },
]

const RECENT_TRIPS: RecentTrip[] = [
  { trip_id: 'T-001', route: 'Nairobi → Kisumu',    driver: 'James Otieno',  vehicle: 'KCA 123A', status: 'Completed', start_time: '06:00 AM', distance_km: 348 },
  { trip_id: 'T-002', route: 'Nairobi → Mombasa',   driver: 'Peter Mwangi',  vehicle: 'KBZ 456B', status: 'Ongoing',   start_time: '07:30 AM', distance_km: 490 },
  { trip_id: 'T-003', route: 'Kisumu → Eldoret',    driver: 'Alice Wanjiku', vehicle: 'KDB 789C', status: 'Completed', start_time: '05:45 AM', distance_km: 110 },
  { trip_id: 'T-004', route: 'Nairobi → Nakuru',    driver: 'David Kamau',   vehicle: 'KCC 321D', status: 'Ongoing',   start_time: '08:15 AM', distance_km: 158 },
  { trip_id: 'T-005', route: 'Mombasa → Malindi',   driver: 'Grace Achieng', vehicle: 'KDA 654E', status: 'Cancelled', start_time: '09:00 AM', distance_km: 120 },
]

const RECENT_BOOKINGS: RecentBooking[] = [
  { booking_id: 'B-001', passenger_name: 'Sarah Kimani',    route: 'Nairobi → Kisumu',  seats_booked: 2, booking_status: 'Confirmed',  total_amount: 3200 },
  { booking_id: 'B-002', passenger_name: 'John Odhiambo',   route: 'Nairobi → Mombasa', seats_booked: 1, booking_status: 'Reserved',   total_amount: 1800 },
  { booking_id: 'B-003', passenger_name: 'Mary Njoroge',    route: 'Kisumu → Eldoret',  seats_booked: 3, booking_status: 'Completed',  total_amount: 2700 },
  { booking_id: 'B-004', passenger_name: 'Paul Mutua',      route: 'Nairobi → Nakuru',  seats_booked: 1, booking_status: 'Confirmed',  total_amount: 900  },
  { booking_id: 'B-005', passenger_name: 'Esther Wambui',   route: 'Mombasa → Malindi', seats_booked: 4, booking_status: 'Cancelled', total_amount: 0    },
]

// ─── Revenue mini chart data (7 days) ─────────────────────────────────────────

const REVENUE_BARS = [65, 82, 74, 91, 68, 110, 98]
const BAR_DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']

// ─── Helpers ─────────────────────────────────────────────────────────────────

function statusClass(status: string) {
  const map: Record<string, string> = {
    Completed: 'badge--success',
    Confirmed: 'badge--success',
    Ongoing:   'badge--warning',
    Reserved:  'badge--info',
    Cancelled: 'badge--danger',
  }
  return map[status] ?? ''
}

// ─── Component ───────────────────────────────────────────────────────────────

export default function Dashboard() {
  const [loaded, setLoaded] = useState(false)

  useEffect(() => {
    const t = setTimeout(() => setLoaded(true), 60)
    return () => clearTimeout(t)
  }, [])

  const maxBar = Math.max(...REVENUE_BARS)

  return (
    <div className={`dashboard ${loaded ? 'dashboard--loaded' : ''}`}>

      {/* ── Header ──────────────────────────────────────────────────────── */}
      <div className="dashboard__header">
        <div className="dashboard__header-text">
          <h2 className="dashboard__greeting">Good morning, Admin 👋</h2>
          <p className="dashboard__sub">Here's what's happening with WestBus today.</p>
        </div>
        <div className="dashboard__header-actions">
          <button className="btn btn--outline">Export Report</button>
          <button className="btn btn--primary">+ New Trip</button>
        </div>
      </div>

      {/* ── Stat Cards ──────────────────────────────────────────────────── */}
      <div className="dashboard__stats">
        {STAT_CARDS.map((card, i) => (
          <div
            key={card.id}
            className={`stat-card stat-card--${card.accent}`}
            style={{ animationDelay: `${i * 80}ms` }}
          >
            <div className="stat-card__top">
              <div className="stat-card__icon-wrap">
                <card.icon className="stat-card__icon" size={24} />
              </div>
              <span className={`stat-card__trend ${card.trend >= 0 ? 'stat-card__trend--up' : 'stat-card__trend--down'}`}>
                {card.trend >= 0 ? <HiArrowTrendingUp /> : <HiArrowTrendingDown />} {Math.abs(card.trend)}%
              </span>
            </div>
            <div className="stat-card__value">{card.value}</div>
            <div className="stat-card__label">{card.label}</div>
            <div className="stat-card__sub">{card.sub}</div>
            <div className="stat-card__trend-label">{card.trendLabel}</div>
          </div>
        ))}
      </div>

      {/* ── Main Grid ───────────────────────────────────────────────────── */}
      <div className="dashboard__grid">

        {/* Revenue Chart */}
        <div className="dashboard__card dashboard__card--wide">
          <div className="dashboard__card-header">
            <div>
              <h3 className="dashboard__card-title">Revenue Overview</h3>
              <p className="dashboard__card-sub">Last 7 days · in thousands KES</p>
            </div>
            <div className="dashboard__card-actions">
              <button className="tab tab--active">7 Days</button>
              <button className="tab">30 Days</button>
              <button className="tab">90 Days</button>
            </div>
          </div>
          <div className="revenue-chart">
            {REVENUE_BARS.map((val, i) => (
              <div key={i} className="revenue-chart__col">
                <div className="revenue-chart__bar-wrap">
                  <div
                    className="revenue-chart__bar"
                    style={{ height: `${(val / maxBar) * 100}%` }}
                  >
                    <span className="revenue-chart__bar-tip">KES {val}K</span>
                  </div>
                </div>
                <span className="revenue-chart__label">{BAR_DAYS[i]}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Fleet Status */}
        <div className="dashboard__card">
          <div className="dashboard__card-header">
            <h3 className="dashboard__card-title">Fleet Status</h3>
          </div>
          <div className="fleet-status">
            {[
              { label: 'Active',      count: 18, pct: 75, color: '#22C55E' },
              { label: 'Maintenance', count: 4,  pct: 17, color: '#FF6B1A' },
              { label: 'Retired',     count: 2,  pct: 8,  color: '#9A9A95' },
            ].map(item => (
              <div key={item.label} className="fleet-status__row">
                <div className="fleet-status__meta">
                  <span className="fleet-status__dot" style={{ background: item.color }} />
                  <span className="fleet-status__label">{item.label}</span>
                  <span className="fleet-status__count">{item.count}</span>
                </div>
                <div className="fleet-status__bar-track">
                  <div
                    className="fleet-status__bar-fill"
                    style={{ width: `${item.pct}%`, background: item.color }}
                  />
                </div>
              </div>
            ))}

            <div className="fleet-status__divider" />

            <div className="fleet-status__kpis">
              <div className="fleet-kpi">
                <span className="fleet-kpi__value">94%</span>
                <span className="fleet-kpi__label">Utilisation</span>
              </div>
              <div className="fleet-kpi">
                <span className="fleet-kpi__value">7.2</span>
                <span className="fleet-kpi__label">Avg Score</span>
              </div>
              <div className="fleet-kpi">
                <span className="fleet-kpi__value">2</span>
                <span className="fleet-kpi__label">Due Service</span>
              </div>
            </div>
          </div>
        </div>

        {/* Recent Trips */}
        <div className="dashboard__card dashboard__card--wide">
          <div className="dashboard__card-header">
            <h3 className="dashboard__card-title">Recent Trips</h3>
            <button className="link-btn">View all →</button>
          </div>
          <div className="data-table">
            <div className="data-table__head">
              <span>Trip ID</span>
              <span>Route</span>
              <span>Driver</span>
              <span>Vehicle</span>
              <span>Depart</span>
              <span>KM</span>
              <span>Status</span>
            </div>
            {RECENT_TRIPS.map(trip => (
              <div key={trip.trip_id} className="data-table__row">
                <span className="data-table__id">{trip.trip_id}</span>
                <span className="data-table__primary">{trip.route}</span>
                <span>{trip.driver}</span>
                <span className="data-table__mono">{trip.vehicle}</span>
                <span>{trip.start_time}</span>
                <span className="data-table__mono">{trip.distance_km}</span>
                <span>
                  <span className={`badge ${statusClass(trip.status)}`}>{trip.status}</span>
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Bookings */}
        <div className="dashboard__card dashboard__card--wide">
          <div className="dashboard__card-header">
            <h3 className="dashboard__card-title">Recent Bookings</h3>
            <button className="link-btn">View all →</button>
          </div>
          <div className="data-table">
            <div className="data-table__head">
              <span>Booking ID</span>
              <span>Passenger</span>
              <span>Route</span>
              <span>Seats</span>
              <span>Amount (KES)</span>
              <span>Status</span>
            </div>
            {RECENT_BOOKINGS.map(b => (
              <div key={b.booking_id} className="data-table__row">
                <span className="data-table__id">{b.booking_id}</span>
                <span className="data-table__primary">{b.passenger_name}</span>
                <span>{b.route}</span>
                <span className="data-table__mono">{b.seats_booked}</span>
                <span className="data-table__mono">
                  {b.total_amount > 0 ? b.total_amount.toLocaleString() : '—'}
                </span>
                <span>
                  <span className={`badge ${statusClass(b.booking_status)}`}>{b.booking_status}</span>
                </span>
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  )
}
