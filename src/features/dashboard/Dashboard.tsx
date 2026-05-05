import { useEffect, useState, useRef } from 'react'
import { 
  HiTruck,
  HiGlobeAlt, 
  HiChartBar, 
  HiArrowTrendingUp, 
  HiArrowTrendingDown,
  HiShieldCheck,
  HiExclamationTriangle,
  HiWrenchScrewdriver,
  HiBanknotes,
  HiSparkles,
  HiArrowUpRight
} from 'react-icons/hi2'
import './Dashboard.scss'
import { useDashboardStore } from './dashboardStore'
import { useAuthStore } from '../auth/authStore'

// ─── Helpers ─────────────────────────────────────────────────────────────────

function statusClass(status: string) {
  const map: Record<string, string> = {
    Completed: 'badge--success',
    Active:    'badge--success',
    Confirmed: 'badge--success',
    Ongoing:   'badge--warning',
    Reserved:  'badge--info',
    Cancelled: 'badge--danger',
    Pending:   'badge--warning',
  }
  return map[status] ?? ''
}

function formatCurrency(amount: number) {
  return new Intl.NumberFormat('en-KE', {
    style: 'currency',
    currency: 'KES',
    minimumFractionDigits: 0,
  }).format(amount)
}

// ─── Line Chart Component ─────────────────────────────────────────────────────

interface LineChartPoint {
  label: string
  revenue: number
  expense: number
}

function LineChart({ data }: { data: LineChartPoint[] }) {
  const [hovered, setHovered] = useState<number | null>(null)
  const [animated, setAnimated] = useState(false)
  const [isMobile, setIsMobile] = useState(window.innerWidth < 600)
  const svgRef = useRef<SVGSVGElement>(null)

  useEffect(() => {
    const t = setTimeout(() => setAnimated(true), 100)
    
    const handleResize = () => {
      setIsMobile(window.innerWidth < 600)
    }
    window.addEventListener('resize', handleResize)
    
    return () => {
      clearTimeout(t)
      window.removeEventListener('resize', handleResize)
    }
  }, [])

  const W = 800
  const H = isMobile ? 280 : 220 // Increased height for mobile to allow more room for rotated labels if needed, or just more breathing room
  const PAD = { 
    top: 20, 
    right: 20, 
    bottom: isMobile ? 44 : 36, 
    left: isMobile ? 48 : 56 
  }
  const innerW = W - PAD.left - PAD.right
  const innerH = H - PAD.top - PAD.bottom

  const maxVal = Math.max(...data.flatMap(d => [d.revenue, d.expense]), 1)
  const minVal = 0

  const xScale = (i: number) => PAD.left + (i / (data.length - 1)) * innerW
  const yScale = (v: number) => PAD.top + innerH - ((v - minVal) / (maxVal - minVal)) * innerH

  const toPath = (values: number[]) =>
    values
      .map((v, i) => `${i === 0 ? 'M' : 'L'} ${xScale(i).toFixed(1)} ${yScale(v).toFixed(1)}`)
      .join(' ')

  const toArea = (values: number[]) => {
    const line = toPath(values)
    const last = `L ${xScale(values.length - 1).toFixed(1)} ${(PAD.top + innerH).toFixed(1)}`
    const first = `L ${xScale(0).toFixed(1)} ${(PAD.top + innerH).toFixed(1)} Z`
    return `${line} ${last} ${first}`
  }

  const revPath = toPath(data.map(d => d.revenue))
  const expPath = toPath(data.map(d => d.expense))
  const revArea = toArea(data.map(d => d.revenue))
  const expArea = toArea(data.map(d => d.expense))

  // Y-axis ticks
  const ticks = [0, 0.25, 0.5, 0.75, 1].map(t => Math.round(minVal + t * maxVal))

  return (
    <div className="line-chart">
      <div className="line-chart__legend">
        <span className="line-chart__legend-item line-chart__legend-item--revenue">Revenue</span>
        <span className="line-chart__legend-item line-chart__legend-item--expense">Expenses</span>
      </div>
      <div className="line-chart__svg-wrap" style={{ position: 'relative' }}>
        <svg
          ref={svgRef}
          viewBox={`0 0 ${W} ${H}`}
          preserveAspectRatio="xMidYMid meet"
          className={`line-chart__svg ${animated ? 'line-chart__svg--animated' : ''}`}
          style={{ width: '100%', height: isMobile ? '180px' : '220px', display: 'block' }}
          onMouseLeave={() => setHovered(null)}
        >
          <defs>
            <linearGradient id="revGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#22C55E" stopOpacity="0.25" />
              <stop offset="100%" stopColor="#22C55E" stopOpacity="0.02" />
            </linearGradient>
            <linearGradient id="expGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#EF4444" stopOpacity="0.18" />
              <stop offset="100%" stopColor="#EF4444" stopOpacity="0.01" />
            </linearGradient>
            <filter id="glow-rev">
              <feGaussianBlur stdDeviation="2" result="blur" />
              <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
            </filter>
            <filter id="glow-exp">
              <feGaussianBlur stdDeviation="1.5" result="blur" />
              <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
            </filter>
            <clipPath id="chart-clip">
              <rect x={PAD.left} y={PAD.top} width={innerW} height={innerH} />
            </clipPath>
          </defs>

          {/* Grid lines */}
          {ticks.map((tick, i) => (
            <g key={i}>
              <line
                x1={PAD.left}
                x2={PAD.left + innerW}
                y1={yScale(tick)}
                y2={yScale(tick)}
                stroke="#F1F5F9"
                strokeWidth="1"
                strokeDasharray="4 6"
              />
              <text
                x={PAD.left - 10}
                y={yScale(tick) + 4}
                textAnchor="end"
                fontSize={isMobile ? "11" : "10"}
                fill="#94A3B8"
                fontFamily="'Geist Mono', monospace"
              >
                {tick >= 1000000 ? `${(tick / 1000000).toFixed(1)}M` : tick >= 1000 ? `${(tick / 1000).toFixed(0)}K` : tick}
              </text>
            </g>
          ))}

          {/* Area fills */}
          <g clipPath="url(#chart-clip)">
            <path d={revArea} fill="url(#revGrad)" className="line-chart__area line-chart__area--revenue" />
            <path d={expArea} fill="url(#expGrad)" className="line-chart__area line-chart__area--expense" />

            {/* Lines */}
            <path
              d={revPath}
              fill="none"
              stroke="#22C55E"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              filter="url(#glow-rev)"
              className="line-chart__line line-chart__line--revenue"
            />
            <path
              d={expPath}
              fill="none"
              stroke="#EF4444"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeDasharray="6 4"
              filter="url(#glow-exp)"
              className="line-chart__line line-chart__line--expense"
            />
          </g>

          {/* Hover interaction overlay */}
          {data.map((point, i) => (
            <g key={i}>
              <rect
                x={xScale(i) - innerW / (data.length * 2)}
                y={PAD.top}
                width={innerW / data.length}
                height={innerH}
                fill="transparent"
                onMouseEnter={() => setHovered(i)}
              />
              {hovered === i && (
                <g>
                  {/* Vertical guide */}
                  <line
                    x1={xScale(i)} y1={PAD.top}
                    x2={xScale(i)} y2={PAD.top + innerH}
                    stroke="#CBD5E1"
                    strokeWidth="1"
                    strokeDasharray="3 4"
                  />
                  {/* Revenue dot */}
                  <circle
                    cx={xScale(i)} cy={yScale(point.revenue)}
                    r="5" fill="#22C55E" stroke="#fff" strokeWidth="2"
                  />
                  {/* Expense dot */}
                  <circle
                    cx={xScale(i)} cy={yScale(point.expense)}
                    r="4.5" fill="#EF4444" stroke="#fff" strokeWidth="2"
                  />
                  {/* Tooltip */}
                  <g transform={`translate(${Math.min(xScale(i) + 12, W - 160)}, ${PAD.top + 4})`}>
                    <rect rx="6" ry="6" width="150" height="58" fill="#0F172A" opacity="0.93" />
                    <text x="10" y="18" fontSize="10" fill="#94A3B8" fontFamily="'Geist Mono', monospace">{point.label}</text>
                    <text x="10" y="34" fontSize="11" fill="#22C55E" fontFamily="'Geist Mono', monospace">
                      Rev: {formatCurrency(point.revenue)}
                    </text>
                    <text x="10" y="50" fontSize="11" fill="#EF4444" fontFamily="'Geist Mono', monospace">
                      Exp: {formatCurrency(point.expense)}
                    </text>
                  </g>
                </g>
              )}
            </g>
          ))}

          {/* X-axis labels */}
          {data.map((point, i) => {
            // On mobile, only show every other label if there are more than 4
            if (isMobile && data.length > 4 && i % 2 !== 0) return null;
            
            return (
              <text
                key={i}
                x={xScale(i)}
                y={H - 12}
                textAnchor="middle"
                fontSize={isMobile ? "12" : "11"}
                fill={hovered === i ? '#64748B' : '#94A3B8'}
                fontFamily="'Geist Mono', monospace"
                fontWeight={hovered === i ? '600' : '400'}
              >
                {point.label}
              </text>
            )
          })}
        </svg>
      </div>
    </div>
  )
}

// ─── Component ───────────────────────────────────────────────────────────────

export default function Dashboard() {
  const [loaded, setLoaded] = useState(false)
  const { token } = useAuthStore()
  const { data, isLoading, fetchDashboardData } = useDashboardStore()

  useEffect(() => {
    if (token) {
      fetchDashboardData(token)
    }
  }, [token, fetchDashboardData])

  useEffect(() => {
    if (!isLoading && data) {
      const t = setTimeout(() => setLoaded(true), 60)
      return () => clearTimeout(t)
    }
  }, [isLoading, data])

  if (isLoading || !data) {
    return (
      <div className="dashboard-loading">
        <div className="spinner" />
        <p>Loading fleet insights…</p>
      </div>
    )
  }

  const STAT_CARDS = [
    {
      id: 'vehicles',
      label: 'Fleet Availability',
      value: `${data.operational_kpis.fleet_availability.toFixed(1)}%`,
      sub: `${data.fleet_status.active} Active · ${data.fleet_status.maintenance} Maintenance`,
      icon: HiTruck,
      trend: 0,
      trendLabel: 'current status',
      gradient: 'gradient--amber',
    },
    {
      id: 'compliance',
      label: 'Compliance Alerts',
      value: data.compliance_alerts.length,
      sub: `${data.fleet_status.expired_docs} Expired Documents`,
      icon: HiShieldCheck,
      trend: data.compliance_alerts.length > 0 ? -5 : 0,
      trendLabel: 'actions required',
      gradient: data.compliance_alerts.length > 0 ? 'gradient--rose' : 'gradient--emerald',
    },
    {
      id: 'revenue',
      label: 'Total Revenue',
      value: formatCurrency(data.financial_summary.total_revenue),
      sub: `Net: ${formatCurrency(data.financial_summary.net_profit)}`,
      icon: HiChartBar,
      trend: 12.5,
      trendLabel: 'vs last month',
      gradient: 'gradient--emerald',
    },
    {
      id: 'efficiency',
      label: 'Fuel Efficiency',
      value: `${data.operational_kpis.fuel_efficiency.toFixed(2)}`,
      sub: 'KM per KES spent',
      icon: HiArrowTrendingUp,
      trend: 2.4,
      trendLabel: 'vs last week',
      gradient: 'gradient--indigo',
    },
  ]

  return (
    <div className={`dashboard ${loaded ? 'dashboard--loaded' : ''}`}>

      {/* ── Header ──────────────────────────────────────────────────────── */}
      <div className="dashboard__header">
        <div className="dashboard__header-text">
          <div className="dashboard__eyebrow">
            <HiSparkles className="dashboard__eyebrow-icon" />
            <span>Fleet Intelligence</span>
          </div>
          <h2 className="dashboard__greeting">Fleet Overview</h2>
          <p className="dashboard__sub">Real-time data from across all modules.</p>
        </div>
        <div className="dashboard__header-actions">
          <button className="btn btn--outline">Export Report</button>
          <button className="btn btn--primary">
            <span>+ New Trip</span>
          </button>
        </div>
      </div>

      {/* ── Stat Cards ──────────────────────────────────────────────────── */}
      <div className="dashboard__stats">
        {STAT_CARDS.map((card, i) => (
          <div
            key={card.id}
            className={`stat-card ${card.gradient}`}
            style={{ animationDelay: `${i * 90}ms` }}
          >
            <div className="stat-card__glow" />
            <div className="stat-card__top">
              <div className="stat-card__icon-wrap">
                <card.icon className="stat-card__icon" />
              </div>
              {card.trend !== 0 && (
                <span className={`stat-card__trend ${card.trend >= 0 ? 'stat-card__trend--up' : 'stat-card__trend--down'}`}>
                  {card.trend >= 0 ? <HiArrowTrendingUp /> : <HiArrowTrendingDown />}
                  {Math.abs(card.trend)}%
                </span>
              )}
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

        {/* Revenue Line Chart */}
        <div className="dashboard__card dashboard__card--wide">
          <div className="dashboard__card-header">
            <div>
              <h3 className="dashboard__card-title">Financial Performance</h3>
              <p className="dashboard__card-sub">Revenue vs Expenses · Last 6 months</p>
            </div>
            <div className="card-badge card-badge--positive">
              <HiArrowUpRight />
              +12.5% vs prior period
            </div>
          </div>
          <LineChart data={data.revenue_vs_expense} />
        </div>

        {/* Compliance & Alerts */}
        <div className="dashboard__card">
          <div className="dashboard__card-header">
            <div>
              <h3 className="dashboard__card-title">Compliance & Safety</h3>
              <p className="dashboard__card-sub">Active alerts requiring attention</p>
            </div>
          </div>
          <div className="alerts-list">
            {data.compliance_alerts.length === 0 && data.active_claims.length === 0 ? (
              <div className="empty-state">
                <HiShieldCheck size={36} />
                <p>All vehicles compliant</p>
                <span>No action required</span>
              </div>
            ) : (
              <>
                {data.compliance_alerts.map((alert, i) => (
                  <div key={i} className="alert-item alert-item--danger">
                    <div className="alert-item__icon-wrap alert-item__icon-wrap--danger">
                      <HiExclamationTriangle className="alert-item__icon" />
                    </div>
                    <div className="alert-item__content">
                      <span className="alert-item__title">{alert.type} Expiry: {alert.registration_number}</span>
                      <span className="alert-item__sub">Expires {new Date(alert.expiry_date).toLocaleDateString()}</span>
                    </div>
                    <span className="alert-item__tag alert-item__tag--danger">Urgent</span>
                  </div>
                ))}
                {data.active_claims.map((claim, i) => (
                  <div key={i} className="alert-item alert-item--warning">
                    <div className="alert-item__icon-wrap alert-item__icon-wrap--warning">
                      <HiExclamationTriangle className="alert-item__icon" />
                    </div>
                    <div className="alert-item__content">
                      <span className="alert-item__title">Claim: {claim.registration_number}</span>
                      <span className="alert-item__sub">{claim.status} · {formatCurrency(claim.amount_claimed)}</span>
                    </div>
                    <span className="alert-item__tag alert-item__tag--warning">Review</span>
                  </div>
                ))}
              </>
            )}
          </div>
        </div>

        {/* Loan & Financial Health */}
        <div className="dashboard__card dashboard__card--financial">
          <div className="dashboard__card-header">
            <div>
              <h3 className="dashboard__card-title">Financial Health</h3>
              <p className="dashboard__card-sub">Loans & repayments</p>
            </div>
          </div>
          <div className="loan-health">
            <div className="loan-health__main">
              <span className="loan-health__label">Total Outstanding</span>
              <span className="loan-health__value">{formatCurrency(data.loan_health.total_outstanding)}</span>
            </div>
            <div className="loan-health__divider" />
            <div className="loan-health__details">
              <div className="loan-detail">
                <div className="loan-detail__icon-wrap">
                  <HiBanknotes className="loan-detail__icon" />
                </div>
                <div>
                  <span className="loan-detail__label">Next Repayment</span>
                  <span className="loan-detail__value">
                    {data.loan_health.next_repayment_amount
                      ? formatCurrency(data.loan_health.next_repayment_amount)
                      : 'None'}
                  </span>
                </div>
              </div>
              <div className="loan-detail">
                <div className="loan-detail__icon-wrap">
                  <HiGlobeAlt className="loan-detail__icon" />
                </div>
                <div>
                  <span className="loan-detail__label">Due Date</span>
                  <span className="loan-detail__value">
                    {data.loan_health.next_repayment_date
                      ? new Date(data.loan_health.next_repayment_date).toLocaleDateString()
                      : '—'}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Maintenance Insights */}
        <div className="dashboard__card dashboard__card--wide">
          <div className="dashboard__card-header">
            <div>
              <h3 className="dashboard__card-title">Maintenance Insights</h3>
              <p className="dashboard__card-sub">Upcoming service & high-cost vehicles</p>
            </div>
          </div>
          <div className="maintenance-grid">
            <div className="maintenance-section">
              <h4 className="maintenance-section__title">
                <span className="maintenance-section__dot maintenance-section__dot--warning" />
                Upcoming Service
              </h4>
              <div className="maintenance-list">
                {data.maintenance_insights.slice(0, 4).map((m, i) => (
                  <div key={i} className="maintenance-item">
                    <div className="maintenance-item__meta">
                      <span className="maintenance-item__reg">{m.registration_number}</span>
                      <span className="maintenance-item__type">{m.service_type}</span>
                    </div>
                    <span className={`badge ${m.due_in_days && m.due_in_days < 7 ? 'badge--danger' : 'badge--warning'}`}>
                      {m.due_in_days ? `${m.due_in_days}d` : 'Overdue'}
                    </span>
                  </div>
                ))}
              </div>
            </div>
            <div className="maintenance-section">
              <h4 className="maintenance-section__title">
                <span className="maintenance-section__dot maintenance-section__dot--rose" />
                High-Cost Vehicles
              </h4>
              <div className="maintenance-list">
                {data.top_maintenance_costs.map((m, i) => (
                  <div key={i} className="maintenance-item">
                    <div className="maintenance-item__meta">
                      <span className="maintenance-item__reg">{m.registration_number}</span>
                      <span className="maintenance-item__cost">{formatCurrency(m.total_cost)}</span>
                    </div>
                    <HiWrenchScrewdriver className="maintenance-item__icon" />
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Recent Trips */}
        <div className="dashboard__card dashboard__card--wide">
          <div className="dashboard__card-header">
            <div>
              <h3 className="dashboard__card-title">Recent Trips</h3>
              <p className="dashboard__card-sub">Latest dispatches across the fleet</p>
            </div>
            <button className="link-btn">View all <HiArrowUpRight /></button>
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
            {data.recent_trips.map(trip => (
              <div key={trip.trip_id} className="data-table__row">
                <span className="data-table__id">{trip.trip_id.slice(0, 8)}</span>
                <span className="data-table__primary">{trip.route}</span>
                <span>{trip.driver}</span>
                <span className="data-table__mono">{trip.vehicle}</span>
                <span>{new Date(trip.start_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                <span className="data-table__mono">{trip.distance_km || '—'}</span>
                <span><span className={`badge ${statusClass(trip.status)}`}>{trip.status}</span></span>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Revenue */}
        <div className="dashboard__card dashboard__card--wide">
          <div className="dashboard__card-header">
            <div>
              <h3 className="dashboard__card-title">Recent Revenue</h3>
              <p className="dashboard__card-sub">Recorded earnings by source</p>
            </div>
            <button className="link-btn">View all <HiArrowUpRight /></button>
          </div>
          <div className="data-table data-table--revenue">
            <div className="data-table__head">
              <span>Revenue ID</span>
              <span>Trip ID</span>
              <span>Source</span>
              <span>Amount</span>
              <span>Date</span>
            </div>
            {data.recent_revenue.map(r => (
              <div key={r.revenue_id} className="data-table__row">
                <span className="data-table__id">{r.revenue_id.slice(0, 8)}</span>
                <span className="data-table__mono">{r.trip_id.slice(0, 8)}</span>
                <span>{r.source}</span>
                <span className="data-table__mono data-table__amount">{formatCurrency(r.amount)}</span>
                <span>{new Date(r.recorded_at).toLocaleDateString()}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Route Profitability */}
        <div className="dashboard__card dashboard__card--wide">
          <div className="dashboard__card-header">
            <div>
              <h3 className="dashboard__card-title">Route Profitability</h3>
              <p className="dashboard__card-sub">Revenue, costs & margins by route</p>
            </div>
          </div>
          <div className="data-table data-table--routes">
            <div className="data-table__head">
              <span>Route</span>
              <span>Revenue</span>
              <span>Expenses</span>
              <span>Net Profit</span>
              <span>Margin</span>
            </div>
            {data.route_profitability.map((rp, i) => (
              <div key={i} className="data-table__row">
                <span className="data-table__primary">{rp.route_name}</span>
                <span className="data-table__mono">{formatCurrency(rp.revenue)}</span>
                <span className="data-table__mono">{formatCurrency(rp.expenses)}</span>
                <span className={`data-table__mono ${rp.profit >= 0 ? 'text-success' : 'text-danger'}`}>
                  {formatCurrency(rp.profit)}
                </span>
                <span>
                  <span className={`badge ${rp.profit > 0 ? 'badge--success' : 'badge--danger'}`}>
                    {rp.revenue > 0 ? ((rp.profit / rp.revenue) * 100).toFixed(1) : 0}%
                  </span>
                </span>
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  )
}