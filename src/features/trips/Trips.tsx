import { useState, useEffect } from 'react'
import { 
  HiGlobeAlt, 
  HiCheckCircle, 
  HiXCircle, 
  HiMagnifyingGlass, 
  HiXMark, 
  HiEye, 
  HiPencilSquare, 
  HiPlus, 
  HiTrash,
  HiClock,
  HiTruck,
  HiUser,
  HiMap
} from 'react-icons/hi2'
import { useTripStore } from './tripStore'
import { useVehicleStore } from '../vehicles/vehicleStore'
import { useDriverStore } from '../drivers/driverStore'
import { useRouteStore } from '../routes/routeStore'
import { useAuthStore } from '../auth/authStore'
import type { Trip, TripStatus } from '../../types/trip'
import './Trips.scss'

// ─── Types ────────────────────────────────────────────────────────────────────

type ModalMode = 'add' | 'edit' | 'view' | null

// ─── Helpers ─────────────────────────────────────────────────────────────────

function formatDateTime(iso: string | null) {
  if (!iso) return '—'
  return new Date(iso).toLocaleString('en-KE', {
    day: '2-digit', month: 'short', year: 'numeric',
    hour: '2-digit', minute: '2-digit'
  })
}

function statusMeta(status: TripStatus) {
  return {
    Completed: { label: 'Completed', cls: 'badge--success' },
    Cancelled: { label: 'Cancelled', cls: 'badge--danger' },
    Ongoing:   { label: 'Ongoing',   cls: 'badge--warning' },
  }[status]
}

// ─── Empty form state ─────────────────────────────────────────────────────────

const EMPTY_FORM = {
  vehicle_id: '',
  driver_id: '',
  route_id: '',
  start_time: new Date().toISOString().slice(0, 16),
  end_time: '',
  expected_duration_min: '',
  distance_km: '',
  status: 'Ongoing' as TripStatus,
}

// ─── Modal ────────────────────────────────────────────────────────────────────

interface ModalProps {
  mode: ModalMode
  trip: Trip | null
  onClose: () => void
  onSave: (data: any) => void
  onDelete: (id: string) => void
  isLoading: boolean
}

function TripModal({ mode, trip, onClose, onSave, onDelete, isLoading }: ModalProps) {
  const { vehicles } = useVehicleStore()
  const { drivers } = useDriverStore()
  const { routes } = useRouteStore()

  const [form, setForm] = useState(
    mode === 'edit' && trip
      ? {
          vehicle_id: trip.vehicle_id,
          driver_id: trip.driver_id,
          route_id: trip.route_id,
          start_time: trip.start_time.slice(0, 16),
          end_time: trip.end_time?.slice(0, 16) ?? '',
          expected_duration_min: String(trip.expected_duration_min ?? ''),
          distance_km: String(trip.distance_km ?? ''),
          status: trip.status,
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
      expected_duration_min: form.expected_duration_min ? Number(form.expected_duration_min) : null,
      distance_km: form.distance_km ? Number(form.distance_km) : null,
      end_time: form.end_time || null,
    })
  }

  const selectedVehicle = vehicles.find(v => v.vehicle_id === trip?.vehicle_id)
  const selectedDriver = drivers.find(d => d.driver_id === trip?.driver_id)
  const selectedRoute = routes.find(r => r.route_id === trip?.route_id)

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div
        className={`modal modal--${mode}`}
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="modal__header">
          <div className="modal__header-left">
            <HiGlobeAlt className="modal__header-icon" size={24} />
            <div>
              <h2 className="modal__title">
                {mode === 'add'  && 'Create New Trip'}
                {mode === 'edit' && 'Edit Trip'}
                {mode === 'view' && `Trip Details`}
              </h2>
              <p className="modal__subtitle">
                {mode === 'add'  && 'Schedule a new trip record'}
                {mode === 'edit' && `Editing Trip ID: ${trip?.trip_id.slice(0, 8)}`}
                {mode === 'view' && `Trip ID: ${trip?.trip_id}`}
              </p>
            </div>
          </div>
          <button className="modal__close" onClick={onClose}><HiXMark /></button>
        </div>

        {/* Body */}
        <div className="modal__body">
          {/* VIEW mode */}
          {isView && trip && (
            <>
              {/* Status banner */}
              <div className={`trip-status-banner trip-status-banner--${trip.status.toLowerCase()}`}>
                <span className={`badge ${statusMeta(trip.status).cls}`}>
                  {statusMeta(trip.status).label}
                </span>
              </div>

              {/* Detail grid */}
              <div className="detail-grid">
                {[
                  { label: 'Vehicle',          value: selectedVehicle ? `${selectedVehicle.registration_number} (${selectedVehicle.model})` : trip.vehicle_id, icon: <HiTruck /> },
                  { label: 'Driver',           value: selectedDriver ? selectedDriver.full_name : trip.driver_id, icon: <HiUser /> },
                  { label: 'Route',            value: selectedRoute ? selectedRoute.route_name : trip.route_id, icon: <HiMap /> },
                  { label: 'Start Time',       value: formatDateTime(trip.start_time), icon: <HiClock /> },
                  { label: 'End Time',         value: formatDateTime(trip.end_time), icon: <HiClock /> },
                  { label: 'Expected Duration', value: trip.expected_duration_min ? `${trip.expected_duration_min} min` : '—' },
                  { label: 'Distance',         value: trip.distance_km ? `${trip.distance_km} km` : '—' },
                  { label: 'Created',          value: formatDateTime(trip.created_at) },
                ].map(item => (
                  <div key={item.label} className="detail-grid__item">
                    <span className="detail-grid__label">{item.label}</span>
                    <span className="detail-grid__value">
                      {item.icon && <span style={{ marginRight: '6px', opacity: 0.6 }}>{item.icon}</span>}
                      {item.value}
                    </span>
                  </div>
                ))}
              </div>
            </>
          )}

          {/* ADD / EDIT mode */}
          {!isView && (
            <form className="trip-form" onSubmit={handleSubmit} id="trip-form">
              <div className="trip-form__section-label">Assignments</div>

              <div className="trip-form__row">
                <div className="trip-form__field">
                  <label className="trip-form__label">Vehicle *</label>
                  <select
                    className="trip-form__input trip-form__select"
                    value={form.vehicle_id}
                    onChange={e => handleChange('vehicle_id', e.target.value)}
                    required
                    disabled={isLoading}
                  >
                    <option value="">Select Vehicle</option>
                    {vehicles.map(v => (
                      <option key={v.vehicle_id} value={v.vehicle_id}>
                        {v.registration_number} - {v.model}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="trip-form__field">
                  <label className="trip-form__label">Driver *</label>
                  <select
                    className="trip-form__input trip-form__select"
                    value={form.driver_id}
                    onChange={e => handleChange('driver_id', e.target.value)}
                    required
                    disabled={isLoading}
                  >
                    <option value="">Select Driver</option>
                    {drivers.map(d => (
                      <option key={d.driver_id} value={d.driver_id}>
                        {d.full_name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="trip-form__field">
                <label className="trip-form__label">Route *</label>
                <select
                  className="trip-form__input trip-form__select"
                  value={form.route_id}
                  onChange={e => handleChange('route_id', e.target.value)}
                  required
                  disabled={isLoading}
                >
                  <option value="">Select Route</option>
                  {routes.map(r => (
                    <option key={r.route_id} value={r.route_id}>
                      {r.route_name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="trip-form__section-label">Schedule & Metrics</div>

              <div className="trip-form__row">
                <div className="trip-form__field">
                  <label className="trip-form__label">Start Time *</label>
                  <input
                    className="trip-form__input"
                    type="datetime-local"
                    value={form.start_time}
                    onChange={e => handleChange('start_time', e.target.value)}
                    required
                    disabled={isLoading}
                  />
                </div>
                <div className="trip-form__field">
                  <label className="trip-form__label">End Time</label>
                  <input
                    className="trip-form__input"
                    type="datetime-local"
                    value={form.end_time}
                    onChange={e => handleChange('end_time', e.target.value)}
                    disabled={isLoading}
                  />
                </div>
              </div>

              <div className="trip-form__row">
                <div className="trip-form__field">
                  <label className="trip-form__label">Expected Duration (min)</label>
                  <input
                    className="trip-form__input"
                    type="number"
                    placeholder="e.g. 120"
                    value={form.expected_duration_min}
                    onChange={e => handleChange('expected_duration_min', e.target.value)}
                    disabled={isLoading}
                  />
                </div>
                <div className="trip-form__field">
                  <label className="trip-form__label">Distance (km)</label>
                  <input
                    className="trip-form__input"
                    type="number"
                    step="0.1"
                    placeholder="e.g. 15.5"
                    value={form.distance_km}
                    onChange={e => handleChange('distance_km', e.target.value)}
                    disabled={isLoading}
                  />
                </div>
              </div>

              <div className="trip-form__field">
                <label className="trip-form__label">Status</label>
                <select
                  className="trip-form__input trip-form__select"
                  value={form.status}
                  onChange={e => handleChange('status', e.target.value)}
                  disabled={isLoading}
                >
                  <option value="Ongoing">Ongoing</option>
                  <option value="Completed">Completed</option>
                  <option value="Cancelled">Cancelled</option>
                </select>
              </div>
            </form>
          )}
        </div>

        {/* Footer */}
        <div className="modal__footer">
          {mode === 'view' && trip && (
            <>
              {confirmDelete ? (
                <div className="modal__confirm-delete">
                  <span>Are you sure? This cannot be undone.</span>
                  <button className="btn btn--danger" onClick={() => onDelete(trip.trip_id)} disabled={isLoading}>
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
              <button className="btn btn--primary" type="submit" form="trip-form" disabled={isLoading}>
                {isLoading ? 'Saving...' : (mode === 'add' ? <HiPlus /> : '')} 
                {!isLoading && (mode === 'add' ? ' Create Trip' : ' Save Changes')}
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  )
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function Trips() {
  const { trips, isLoading, error, fetchTrips, addTrip, updateTrip, removeTrip } = useTripStore()
  const { fetchVehicles, vehicles } = useVehicleStore()
  const { fetchDrivers, drivers } = useDriverStore()
  const { fetchRoutes, routes } = useRouteStore()
  const { token } = useAuthStore()
  
  const [modal, setModal] = useState<{ mode: ModalMode; trip: Trip | null }>({
    mode: null, trip: null,
  })
  const [search, setSearch] = useState('')
  const [filterStatus, setFilterStatus] = useState<TripStatus | 'ALL'>('ALL')
  const [loaded] = useState(true)

  useEffect(() => {
    if (token) {
      fetchTrips(token)
      fetchVehicles(token)
      fetchDrivers(token)
      fetchRoutes(token)
    }
  }, [token, fetchTrips, fetchVehicles, fetchDrivers, fetchRoutes])

  const filtered = trips.filter(t => {
    const vehicle = vehicles.find(v => v.vehicle_id === t.vehicle_id)
    const driver = drivers.find(d => d.driver_id === t.driver_id)
    const route = routes.find(r => r.route_id === t.route_id)
    
    const searchStr = `${vehicle?.registration_number} ${driver?.full_name} ${route?.route_name}`.toLowerCase()
    const matchSearch = searchStr.includes(search.toLowerCase())
    const matchStatus = filterStatus === 'ALL' || t.status === filterStatus
    return matchSearch && matchStatus
  })

  const openModal = (mode: ModalMode, trip: Trip | null = null) =>
    setModal({ mode, trip })
  const closeModal = () => setModal({ mode: null, trip: null })

  const handleSave = async (data: any) => {
    if (!token) return
    
    let res;
    if (modal.mode === 'add') {
      res = await addTrip(data, token)
    } else if (modal.mode === 'edit' && modal.trip) {
      res = await updateTrip(modal.trip.trip_id, data, token)
    }
    
    if (res?.success) {
      closeModal()
    } else {
      alert(res?.message || 'An error occurred')
    }
  }

  const handleDelete = async (id: string) => {
    if (!token) return
    const res = await removeTrip(id, token)
    if (res.success) {
      closeModal()
    } else {
      alert(res.message)
    }
  }

  // Stats
  const total     = trips.length
  const ongoing   = trips.filter(t => t.status === 'Ongoing').length
  const completed = trips.filter(t => t.status === 'Completed').length
  const cancelled = trips.filter(t => t.status === 'Cancelled').length

  return (
    <div className={`trips-page ${loaded ? 'trips-page--loaded' : ''}`}>

      {/* ── Page header ───────────────────────────────────────────────── */}
      <div className="trips-page__header">
        <div>
          <h2 className="trips-page__title">Trip Records</h2>
          <p className="trips-page__sub">Manage vehicle trips and schedules — {total} trips logged</p>
        </div>
        <button className="btn btn--primary" onClick={() => openModal('add')}>
          <HiPlus /> Create Trip
        </button>
      </div>

      {/* ── Summary strip ─────────────────────────────────────────────── */}
      <div className="trips-page__summary">
        {[
          { label: 'Total Trips', value: total,     cls: '',          icon: <HiGlobeAlt /> },
          { label: 'Ongoing',     value: ongoing,   cls: 'sum--orange', icon: <HiClock /> },
          { label: 'Completed',   value: completed, cls: 'sum--green', icon: <HiCheckCircle /> },
          { label: 'Cancelled',   value: cancelled, cls: 'sum--danger', icon: <HiXCircle /> },
        ].map((s, i) => (
          <div key={s.label} className={`sum-chip ${s.cls}`} style={{ animationDelay: `${i * 60}ms` }}>
            <span className="sum-chip__icon">{s.icon}</span>
            <span className="sum-chip__value">{s.value}</span>
            <span className="sum-chip__label">{s.label}</span>
          </div>
        ))}
      </div>

      {/* ── Controls ──────────────────────────────────────────────────── */}
      <div className="trips-page__controls">
        <div className="search-box">
          <HiMagnifyingGlass className="search-box__icon" />
          <input
            className="search-box__input"
            placeholder="Search by vehicle, driver or route..."
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
          {search && (
            <button className="search-box__clear" onClick={() => setSearch('')}><HiXMark /></button>
          )}
        </div>

        <div className="filter-tabs">
          {(['ALL', 'Ongoing', 'Completed', 'Cancelled'] as const).map(s => (
            <button
              key={s}
              className={`filter-tab ${filterStatus === s ? 'filter-tab--active' : ''}`}
              onClick={() => setFilterStatus(s)}
            >
              {s === 'ALL' ? 'All' : s}
            </button>
          ))}
        </div>
      </div>

      {/* ── Error State ────────────────────────────────────────────────── */}
      {error && (
        <div className="trips-error">
          <p>Error: {error}</p>
          <button className="btn btn--outline" onClick={() => token && fetchTrips(token)}>Retry</button>
        </div>
      )}

      {/* ── Table ─────────────────────────────────────────────────────── */}
      <div className="trips-table-wrap">
        {isLoading && trips.length === 0 ? (
          <div className="trips-loading">
            <div className="spinner" />
            <p>Loading trips...</p>
          </div>
        ) : filtered.length === 0 ? (
          <div className="trips-empty">
            <HiGlobeAlt size={48} color="#ddd" />
            <p>{search ? 'No trips match your search' : 'No trips recorded yet'}</p>
          </div>
        ) : (
          <table className="trips-table">
            <thead>
              <tr>
                <th>#</th>
                <th>Vehicle</th>
                <th>Driver</th>
                <th>Route</th>
                <th>Start Time</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((t, i) => {
                const vehicle = vehicles.find(v => v.vehicle_id === t.vehicle_id)
                const driver = drivers.find(d => d.driver_id === t.driver_id)
                const route = routes.find(r => r.route_id === t.route_id)
                return (
                  <tr
                    key={t.trip_id}
                    className="trips-table__row"
                    style={{ animationDelay: `${i * 40}ms` }}
                    onClick={() => openModal('view', t)}
                  >
                    <td className="trips-table__num">{i + 1}</td>
                    <td>
                      <div className="trips-table__info">
                        <strong>{vehicle?.registration_number || '—'}</strong>
                        <span>{vehicle?.model}</span>
                      </div>
                    </td>
                    <td>{driver?.full_name || '—'}</td>
                    <td>{route?.route_name || '—'}</td>
                    <td className="trips-table__date">{formatDateTime(t.start_time)}</td>
                    <td>
                      <span className={`badge ${statusMeta(t.status).cls}`}>
                        {statusMeta(t.status).label}
                      </span>
                    </td>
                    <td onClick={e => e.stopPropagation()}>
                      <div className="trips-table__actions">
                        <button
                          className="action-btn action-btn--view"
                          onClick={() => openModal('view', t)}
                          title="View"
                        >
                          <HiEye />
                        </button>
                        <button
                          className="action-btn action-btn--edit"
                          onClick={() => openModal('edit', t)}
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
        <div className="trips-page__footer">
          Showing {filtered.length} of {total} trips
        </div>
      )}

      {/* ── Modals ────────────────────────────────────────────────────── */}
      {modal.mode && (
        <TripModal
          mode={modal.mode}
          trip={modal.trip}
          onClose={closeModal}
          onSave={handleSave}
          onDelete={handleDelete}
          isLoading={isLoading}
        />
      )}
    </div>
  )
}
