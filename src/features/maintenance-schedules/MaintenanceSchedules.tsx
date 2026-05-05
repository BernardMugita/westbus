import { useState, useEffect } from 'react'
import { 
  HiCalendarDays, 
  HiCheckCircle, 
  HiMagnifyingGlass, 
  HiXMark, 
  HiEye, 
  HiPencilSquare, 
  HiPlus, 
  HiTrash,
  HiClock,
  HiTruck,
  HiBellAlert,
  HiArrowPath
} from 'react-icons/hi2'
import { useMaintenanceScheduleStore } from './maintenanceScheduleStore'
import { useVehicleStore } from '../vehicles/vehicleStore'
import { useAuthStore } from '../auth/authStore'
import type { MaintenanceScheduleRecord, MaintenanceScheduleStatus } from '../../types/maintenanceSchedule'
import './MaintenanceSchedules.scss'

// ─── Types ────────────────────────────────────────────────────────────────────

type ModalMode = 'add' | 'edit' | 'view' | null

// ─── Helpers ─────────────────────────────────────────────────────────────────

function formatDate(iso: string | null) {
  if (!iso) return '—'
  return new Date(iso).toLocaleDateString('en-KE', {
    day: '2-digit', month: 'short', year: 'numeric',
  })
}

function formatNumber(num: number | null) {
  if (num === null) return '—'
  return new Intl.NumberFormat('en-KE').format(num)
}

function statusMeta(status: MaintenanceScheduleStatus) {
  return {
    Upcoming: { label: 'Upcoming', cls: 'badge--success', icon: <HiCheckCircle /> },
    Overdue:  { label: 'Overdue',  cls: 'badge--danger',  icon: <HiBellAlert /> },
    Done:     { label: 'Done',     cls: 'badge--neutral', icon: <HiCheckCircle /> },
  }[status]
}

// ─── Empty form state ─────────────────────────────────────────────────────────

const EMPTY_FORM = {
  vehicle_id: '',
  service_type: '',
  interval_km: '',
  interval_days: '',
  last_done_km: '',
  last_done_date: '',
  status: 'Upcoming' as MaintenanceScheduleStatus,
}

// ─── Modal ────────────────────────────────────────────────────────────────────

interface ModalProps {
  mode: ModalMode
  record: MaintenanceScheduleRecord | null
  onClose: () => void
  onSave: (data: any) => void
  onDelete: (id: string) => void
  isLoading: boolean
}

function ScheduleModal({ mode, record, onClose, onSave, onDelete, isLoading }: ModalProps) {
  const { vehicles } = useVehicleStore()

  const [form, setForm] = useState(
    mode === 'edit' && record
      ? {
          vehicle_id: record.vehicle_id,
          service_type: record.service_type,
          interval_km: String(record.interval_km),
          interval_days: String(record.interval_days),
          last_done_km: record.last_done_km ? String(record.last_done_km) : '',
          last_done_date: record.last_done_date ? record.last_done_date.split('T')[0] : '',
          status: record.status,
        }
      : EMPTY_FORM
  )
  const [confirmDelete, setConfirmDelete] = useState(false)
  const isView = mode === 'view'

  const handleChange = (field: string, value: any) => {
    setForm(p => ({ ...p, [field]: value }))
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSave({
      ...form,
      interval_km: Number(form.interval_km),
      interval_days: Number(form.interval_days),
      last_done_km: form.last_done_km ? Number(form.last_done_km) : null,
      last_done_date: form.last_done_date ? new Date(form.last_done_date).toISOString() : null,
    })
  }

  const selectedVehicle = vehicles.find(v => v.vehicle_id === record?.vehicle_id)

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div
        className={`modal modal--${mode}`}
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="modal__header">
          <div className="modal__header-left">
            <HiCalendarDays className="modal__header-icon" size={24} />
            <div>
              <h2 className="modal__title">
                {mode === 'add'  && 'Create Maintenance Schedule'}
                {mode === 'edit' && 'Edit Schedule Details'}
                {mode === 'view' && `Schedule Information`}
              </h2>
              <p className="modal__subtitle">
                {mode === 'add'  && 'Set up a new recurring service plan'}
                {mode === 'edit' && `Editing Schedule ID: ${record?.schedule_id.slice(0, 8)}`}
                {mode === 'view' && `Schedule ID: ${record?.schedule_id}`}
              </p>
            </div>
          </div>
          <button className="modal__close" onClick={onClose}><HiXMark /></button>
        </div>

        {/* Body */}
        <div className="modal__body">
          {/* VIEW mode */}
          {isView && record && (
            <>
              <div className={`loan-status-banner loan-status-banner--${record.status.toLowerCase()}`}>
                <span className={`badge ${statusMeta(record.status).cls}`}>
                  {statusMeta(record.status).label}
                </span>
                <span style={{ fontSize: '13px', color: 'var(--color-grey-500)' }}>
                   Last serviced on {formatDate(record.last_done_date)} at {formatNumber(record.last_done_km)} km
                </span>
              </div>

              <div className="detail-grid">
                {[
                  { label: 'Vehicle',            value: selectedVehicle?.registration_number || record.vehicle_id },
                  { label: 'Service Type',       value: record.service_type },
                  { label: 'Interval (km)',      value: formatNumber(record.interval_km) },
                  { label: 'Interval (days)',    value: `${record.interval_days} days` },
                  { label: 'Last Service Date',  value: formatDate(record.last_done_date) },
                  { label: 'Last Service Odo',   value: formatNumber(record.last_done_km) },
                ].map(item => (
                  <div key={item.label} className="detail-grid__item">
                    <span className="detail-grid__label">{item.label}</span>
                    <span className="detail-grid__value">{item.value}</span>
                  </div>
                ))}
              </div>
            </>
          )}

          {/* ADD / EDIT mode */}
          {!isView && (
            <form className="schedule-form" onSubmit={handleSubmit} id="schedule-form">
              <div className="schedule-form__section-label">Plan Configuration</div>

              <div className="schedule-form__row">
                <div className="schedule-form__field">
                  <label className="schedule-form__label">Vehicle *</label>
                  <select
                    className="schedule-form__input schedule-form__select"
                    value={form.vehicle_id}
                    onChange={e => handleChange('vehicle_id', e.target.value)}
                    required
                    disabled={isLoading}
                  >
                    <option value="">Select Vehicle</option>
                    {vehicles.map(v => (
                      <option key={v.vehicle_id} value={v.vehicle_id}>
                        {v.registration_number} ({v.model})
                      </option>
                    ))}
                  </select>
                </div>
                <div className="schedule-form__field">
                  <label className="schedule-form__label">Service Type *</label>
                  <input
                    className="schedule-form__input"
                    placeholder="e.g. Major Service, Brake Check"
                    value={form.service_type}
                    onChange={e => handleChange('service_type', e.target.value)}
                    required
                    disabled={isLoading}
                  />
                </div>
              </div>

              <div className="schedule-form__row">
                <div className="schedule-form__field">
                  <label className="schedule-form__label">Interval (km) *</label>
                  <input
                    className="schedule-form__input"
                    type="number"
                    placeholder="e.g. 5000"
                    value={form.interval_km}
                    onChange={e => handleChange('interval_km', e.target.value)}
                    required
                    disabled={isLoading}
                  />
                </div>
                <div className="schedule-form__field">
                  <label className="schedule-form__label">Interval (days) *</label>
                  <input
                    className="schedule-form__input"
                    type="number"
                    placeholder="e.g. 90"
                    value={form.interval_days}
                    onChange={e => handleChange('interval_days', e.target.value)}
                    required
                    disabled={isLoading}
                  />
                </div>
              </div>

              <div className="schedule-form__section-label">Last Performance</div>

              <div className="schedule-form__row">
                <div className="schedule-form__field">
                  <label className="schedule-form__label">Last Done (km)</label>
                  <input
                    className="schedule-form__input"
                    type="number"
                    placeholder="Odometer at last service"
                    value={form.last_done_km}
                    onChange={e => handleChange('last_done_km', e.target.value)}
                    disabled={isLoading}
                  />
                </div>
                <div className="schedule-form__field">
                  <label className="schedule-form__label">Last Done Date</label>
                  <input
                    className="schedule-form__input"
                    type="date"
                    value={form.last_done_date}
                    onChange={e => handleChange('last_done_date', e.target.value)}
                    disabled={isLoading}
                  />
                </div>
              </div>

              <div className="schedule-form__field">
                <label className="schedule-form__label">Current Status</label>
                <select
                  className="schedule-form__input schedule-form__select"
                  value={form.status}
                  onChange={e => handleChange('status', e.target.value)}
                  disabled={isLoading}
                >
                  <option value="Upcoming">Upcoming</option>
                  <option value="Overdue">Overdue</option>
                  <option value="Done">Done</option>
                </select>
              </div>
            </form>
          )}
        </div>

        {/* Footer */}
        <div className="modal__footer">
          {isView && record && (
            <>
              {confirmDelete ? (
                <div className="modal__confirm-delete">
                  <span>Are you sure? This action is permanent.</span>
                  <button className="btn btn--danger" onClick={() => onDelete(record.schedule_id)} disabled={isLoading}>
                    {isLoading ? 'Deleting...' : 'Yes, delete'}
                  </button>
                  <button className="btn btn--ghost" onClick={() => setConfirmDelete(false)} disabled={isLoading}>
                    Cancel
                  </button>
                </div>
              ) : (
                <>
                  <button className="btn btn--danger-ghost" onClick={() => setConfirmDelete(true)}>
                    <HiTrash /> Delete
                  </button>
                  <div style={{ flex: 1 }} />
                  <button className="btn btn--outline" onClick={onClose}>Close</button>
                </>
              )}
            </>
          )}

          {(mode === 'add' || mode === 'edit') && (
            <>
              <button className="btn btn--ghost" type="button" onClick={onClose} disabled={isLoading}>Cancel</button>
              <div style={{ flex: 1 }} />
              <button className="btn btn--primary" type="submit" form="schedule-form" disabled={isLoading}>
                {isLoading ? 'Saving...' : (mode === 'add' ? <HiPlus /> : '')} 
                {!isLoading && (mode === 'add' ? ' Create Plan' : ' Save Changes')}
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  )
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function MaintenanceSchedules() {
  const { records, isLoading, error, fetchRecords, addRecord, updateRecord, removeRecord } = useMaintenanceScheduleStore()
  const { fetchVehicles, vehicles } = useVehicleStore()
  const { token } = useAuthStore()
  
  const [modal, setModal] = useState<{ mode: ModalMode; record: MaintenanceScheduleRecord | null }>({
    mode: null, record: null,
  })
  const [search, setSearch] = useState('')
  const [filterStatus, setFilterStatus] = useState<MaintenanceScheduleStatus | 'ALL'>('ALL')
  const [loaded] = useState(true)

  useEffect(() => {
    if (token) {
      fetchRecords(token)
      fetchVehicles(token)
    }
  }, [token, fetchRecords, fetchVehicles])

  const filtered = records.filter(r => {
    const vehicle = vehicles.find(v => v.vehicle_id === r.vehicle_id)
    const searchStr = `${vehicle?.registration_number} ${r.service_type}`.toLowerCase()
    const matchSearch = searchStr.includes(search.toLowerCase())
    const matchStatus = filterStatus === 'ALL' || r.status === filterStatus
    return matchSearch && matchStatus
  })

  const openModal = (mode: ModalMode, record: MaintenanceScheduleRecord | null = null) =>
    setModal({ mode, record })
  const closeModal = () => setModal({ mode: null, record: null })

  const handleSave = async (data: any) => {
    if (!token) return
    
    let res;
    if (modal.mode === 'add') {
      res = await addRecord(data, token)
    } else if (modal.mode === 'edit' && modal.record) {
      res = await updateRecord(modal.record.schedule_id, data, token)
    }
    
    if (res?.success) {
      closeModal()
    } else {
      alert(res?.message || 'An error occurred')
    }
  }

  const handleDelete = async (id: string) => {
    if (!token) return
    const res = await removeRecord(id, token)
    if (res.success) {
      closeModal()
    } else {
      alert(res.message)
    }
  }

  // Stats
  const totalSchedules = records.length
  const overdueCount   = records.filter(r => r.status === 'Overdue').length
  const upcomingCount  = records.filter(r => r.status === 'Upcoming').length
  const fleetCoverage  = new Set(records.map(r => r.vehicle_id)).size

  return (
    <div className={`schedules-page ${loaded ? 'schedules-page--loaded' : ''}`}>

      {/* ── Page header ───────────────────────────────────────────────── */}
      <div className="schedules-page__header">
        <div>
          <h2 className="schedules-page__title">Preventive Maintenance</h2>
          <p className="schedules-page__sub">Manage recurring service intervals and fleet uptime — {totalSchedules} plans</p>
        </div>
        <button className="btn btn--primary" onClick={() => openModal('add')}>
          <HiPlus /> Add Schedule
        </button>
      </div>

      {/* ── Summary strip ─────────────────────────────────────────────── */}
      <div className="schedules-page__summary">
        {[
          { label: 'Overdue Services', value: overdueCount,    cls: 'sum--danger',  icon: <HiBellAlert /> },
          { label: 'Upcoming',          value: upcomingCount,   cls: 'sum--orange',  icon: <HiArrowPath /> },
          { label: 'Vehicles Tracked',  value: fleetCoverage,   cls: 'sum--green',   icon: <HiTruck /> },
          { label: 'Total Plans',       value: totalSchedules,  cls: 'sum--grey',    icon: <HiClock /> },
        ].map((s, i) => (
          <div key={s.label} className={`sum-chip ${s.cls}`} style={{ animationDelay: `${i * 60}ms` }}>
            <span className="sum-chip__icon">{s.icon}</span>
            <span className="sum-chip__value">{s.value}</span>
            <span className="sum-chip__label">{s.label}</span>
          </div>
        ))}
      </div>

      {/* ── Controls ──────────────────────────────────────────────────── */}
      <div className="schedules-page__controls">
        <div className="search-box">
          <HiMagnifyingGlass className="search-box__icon" />
          <input
            className="search-box__input"
            placeholder="Search by vehicle or service type..."
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
          {search && (
            <button className="search-box__clear" onClick={() => setSearch('')}><HiXMark /></button>
          )}
        </div>

        <div className="filter-tabs">
          {(['ALL', 'Upcoming', 'Overdue', 'Done'] as const).map(s => (
            <button
              key={s}
              className={`filter-tab ${filterStatus === s ? 'filter-tab--active' : ''}`}
              onClick={() => setFilterStatus(s)}
            >
              {s === 'ALL' ? 'All Schedules' : s}
            </button>
          ))}
        </div>
      </div>

      {/* ── Error State ────────────────────────────────────────────────── */}
      {error && (
        <div className="schedules-error">
          <p>Error: {error}</p>
          <button className="btn btn--outline" onClick={() => token && fetchRecords(token)}>Retry</button>
        </div>
      )}

      {/* ── Table ─────────────────────────────────────────────────────── */}
      <div className="schedules-table-wrap">
        {isLoading && records.length === 0 ? (
          <div className="schedules-loading">
            <div className="spinner" />
            <p>Loading maintenance plans...</p>
          </div>
        ) : filtered.length === 0 ? (
          <div className="schedules-empty">
            <HiCalendarDays size={48} color="#ddd" />
            <p>{search ? 'No plans match your search' : 'No schedules configured yet'}</p>
          </div>
        ) : (
          <table className="schedules-table">
            <thead>
              <tr>
                <th>#</th>
                <th>Vehicle</th>
                <th>Service Type</th>
                <th>Interval (km)</th>
                <th>Interval (days)</th>
                <th>Last Done</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((r, i) => {
                const vehicle = vehicles.find(v => v.vehicle_id === r.vehicle_id)
                return (
                  <tr
                    key={r.schedule_id}
                    className="schedules-table__row"
                    style={{ animationDelay: `${i * 40}ms` }}
                    onClick={() => openModal('view', r)}
                  >
                    <td className="schedules-table__num">{i + 1}</td>
                    <td>
                       <div className="schedules-table__vehicle">
                          <strong>{vehicle?.registration_number || '—'}</strong>
                          <span>{vehicle?.model}</span>
                       </div>
                    </td>
                    <td className="schedules-table__service">
                       {r.service_type}
                    </td>
                    <td>{formatNumber(r.interval_km)} km</td>
                    <td>{r.interval_days} days</td>
                    <td>
                       <div className="schedules-table__last">
                          <strong>{formatDate(r.last_done_date)}</strong>
                          <span>{formatNumber(r.last_done_km)} km</span>
                       </div>
                    </td>
                    <td>
                      <span className={`badge ${statusMeta(r.status).cls}`}>
                        {r.status}
                      </span>
                    </td>
                    <td onClick={e => e.stopPropagation()}>
                      <div className="schedules-table__actions">
                        <button
                          className="action-btn action-btn--view"
                          onClick={() => openModal('view', r)}
                          title="View"
                        >
                          <HiEye />
                        </button>
                        <button
                          className="action-btn action-btn--edit"
                          onClick={() => openModal('edit', r)}
                          title="Edit"
                        >
                          <HiPencilSquare />
                        </button>
                      </div>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        )}
      </div>

      {/* ── Footer count ──────────────────────────────────────────────── */}
      {!isLoading && (
        <div className="schedules-page__footer">
          Showing {filtered.length} of {records.length} plans
        </div>
      )}

      {/* ── Modals ────────────────────────────────────────────────────── */}
      {modal.mode && (
        <ScheduleModal
          mode={modal.mode}
          record={modal.record}
          onClose={closeModal}
          onSave={handleSave}
          onDelete={handleDelete}
          isLoading={isLoading}
        />
      )}
    </div>
  )
}
