import React, { useState, useEffect } from 'react'
import { 
  HiLink, 
  HiCheckCircle, 
  HiXCircle, 
  HiClock, 
  HiMagnifyingGlass, 
  HiXMark, 
  HiEye, 
  HiPencilSquare, 
  HiPlus, 
  HiTrash,
  HiTruck,
  HiUser
} from 'react-icons/hi2'
import { useAssignmentStore } from './assignmentStore'
import { useDriverStore } from '../drivers/driverStore'
import { useVehicleStore } from '../vehicles/vehicleStore'
import { useAuthStore } from '../auth/authStore'
import type { DriverAssignment } from '../../types/assignment'
import './Assignments.scss'

// ─── Types ────────────────────────────────────────────────────────────────────

type ModalMode = 'add' | 'edit' | 'view' | null

// ─── Helpers ─────────────────────────────────────────────────────────────────

function formatDate(iso: string | null) {
  if (!iso) return '—'
  return new Date(iso).toLocaleDateString('en-KE', {
    day: '2-digit', month: 'short', year: 'numeric',
  })
}

// ─── Empty form state ─────────────────────────────────────────────────────────

const EMPTY_FORM = {
  driver_id: '',
  vehicle_id: '',
  start_date: new Date().toISOString().split('T')[0],
  end_date: '',
  is_current: true,
}

// ─── Modal ────────────────────────────────────────────────────────────────────

interface ModalProps {
  mode: ModalMode
  assignment: DriverAssignment | null
  onClose: () => void
  onSave: (data: any) => void
  onDelete: (id: string) => void
  isLoading: boolean
  drivers: any[]
  vehicles: any[]
}

function AssignmentModal({ mode, assignment, onClose, onSave, onDelete, isLoading, drivers, vehicles }: ModalProps) {
  const [form, setForm] = useState(
    mode === 'edit' && assignment
      ? {
          driver_id: assignment.driver_id,
          vehicle_id: assignment.vehicle_id,
          start_date: assignment.start_date.split('T')[0],
          end_date: assignment.end_date?.split('T')[0] ?? '',
          is_current: assignment.is_current,
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
    onSave(form)
  }

  const selectedDriver = drivers.find(d => d.driver_id === (assignment?.driver_id || form.driver_id))
  const selectedVehicle = vehicles.find(v => v.vehicle_id === (assignment?.vehicle_id || form.vehicle_id))

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div
        className={`modal modal--${mode}`}
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="modal__header">
          <div className="modal__header-left">
            <HiLink className="modal__header-icon" size={24} />
            <div>
              <h2 className="modal__title">
                {mode === 'add'  && 'Assign Driver'}
                {mode === 'edit' && 'Edit Assignment'}
                {mode === 'view' && 'Assignment Details'}
              </h2>
              <p className="modal__subtitle">
                {mode === 'add'  && 'Link a driver to a specific vehicle'}
                {mode === 'edit' && 'Update assignment terms'}
                {mode === 'view' && `ID: ${assignment?.assignment_id}`}
              </p>
            </div>
          </div>
          <button className="modal__close" onClick={onClose}><HiXMark /></button>
        </div>

        {/* Body */}
        <div className="modal__body">
          {/* VIEW mode */}
          {isView && assignment && (
            <>
              {/* Status banner */}
              <div className={`assignment-status-banner ${assignment.is_current ? 'assignment-status-banner--active' : 'assignment-status-banner--past'}`}>
                <span className={`badge ${assignment.is_current ? 'badge--success' : 'badge--neutral'}`}>
                  {assignment.is_current ? 'Current Assignment' : 'Past Assignment'}
                </span>
              </div>

              {/* Detail grid */}
              <div className="detail-grid">
                {[
                  { label: 'Driver',          value: selectedDriver?.name || assignment.driver_id },
                  { label: 'Vehicle',         value: selectedVehicle?.registration_number || assignment.vehicle_id },
                  { label: 'Start Date',      value: formatDate(assignment.start_date) },
                  { label: 'End Date',        value: formatDate(assignment.end_date) },
                  { label: 'Created',         value: formatDate(assignment.created_at) },
                  { label: 'Last Updated',    value: formatDate(assignment.updated_at) },
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
            <form className="assignment-form" onSubmit={handleSubmit} id="assignment-form">
              <div className="assignment-form__section-label">Assignment Details</div>

              <div className="assignment-form__field">
                <label className="assignment-form__label">Driver *</label>
                <select
                  className="assignment-form__input assignment-form__select"
                  value={form.driver_id}
                  onChange={e => handleChange('driver_id', e.target.value)}
                  required
                  disabled={isLoading}
                >
                  <option value="">Select a driver...</option>
                  {drivers.map(d => (
                    <option key={d.driver_id} value={d.driver_id}>{d.name} ({d.status})</option>
                  ))}
                </select>
              </div>

              <div className="assignment-form__field">
                <label className="assignment-form__label">Vehicle *</label>
                <select
                  className="assignment-form__input assignment-form__select"
                  value={form.vehicle_id}
                  onChange={e => handleChange('vehicle_id', e.target.value)}
                  required
                  disabled={isLoading}
                >
                  <option value="">Select a vehicle...</option>
                  {vehicles.map(v => (
                    <option key={v.vehicle_id} value={v.vehicle_id}>{v.registration_number} - {v.model}</option>
                  ))}
                </select>
              </div>

              <div className="assignment-form__row">
                <div className="assignment-form__field">
                  <label className="assignment-form__label">Start Date *</label>
                  <input
                    className="assignment-form__input"
                    type="date"
                    value={form.start_date}
                    onChange={e => handleChange('start_date', e.target.value)}
                    required
                    disabled={isLoading}
                  />
                </div>
                <div className="assignment-form__field">
                  <label className="assignment-form__label">End Date</label>
                  <input
                    className="assignment-form__input"
                    type="date"
                    value={form.end_date}
                    onChange={e => handleChange('end_date', e.target.value)}
                    disabled={isLoading}
                  />
                </div>
              </div>

              <div className="assignment-form__field">
                <label className="assignment-form__label" style={{ flexDirection: 'row', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                  <input
                    type="checkbox"
                    checked={form.is_current}
                    onChange={e => handleChange('is_current', e.target.checked)}
                    disabled={isLoading}
                  />
                  Mark as active assignment
                </label>
              </div>
            </form>
          )}
        </div>

        {/* Footer */}
        <div className="modal__footer">
          {mode === 'view' && assignment && (
            <>
              {confirmDelete ? (
                <div className="modal__confirm-delete">
                  <span>Are you sure? This will remove the assignment record.</span>
                  <button className="btn btn--danger" onClick={() => onDelete(assignment.assignment_id)} disabled={isLoading}>
                    {isLoading ? 'Removing...' : 'Yes, Remove'}
                  </button>
                  <button className="btn btn--ghost" onClick={() => setConfirmDelete(false)} disabled={isLoading}>
                    Cancel
                  </button>
                </div>
              ) : (
                <>
                  <button className="btn btn--danger-ghost" onClick={() => setConfirmDelete(true)}>
                    <HiTrash /> Unassign
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
              <button className="btn btn--primary" type="submit" form="assignment-form" disabled={isLoading}>
                {isLoading ? 'Saving...' : (mode === 'add' ? <HiPlus /> : '')} 
                {!isLoading && (mode === 'add' ? ' Assign Driver' : ' Save Changes')}
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  )
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function Assignments() {
  const { assignments, isLoading, error, fetchAssignments, assignDriver, updateAssignment, removeAssignment } = useAssignmentStore()
  const { drivers, fetchDrivers } = useDriverStore()
  const { vehicles, fetchVehicles } = useVehicleStore()
  const { token } = useAuthStore()
  
  const [modal, setModal] = useState<{ mode: ModalMode; assignment: DriverAssignment | null }>({
    mode: null, assignment: null,
  })
  const [search, setSearch] = useState('')
  const [filterType, setFilterType] = useState<'ALL' | 'CURRENT' | 'PAST'>('ALL')
  const [loaded] = useState(true)

  useEffect(() => {
    if (token) {
      fetchAssignments(token)
      fetchDrivers(token)
      fetchVehicles(token)
    }
  }, [token, fetchAssignments, fetchDrivers, fetchVehicles])

  const filtered = assignments.filter(a => {
    const driver = drivers.find(d => d.driver_id === a.driver_id)
    const vehicle = vehicles.find(v => v.vehicle_id === a.vehicle_id)
    
    const matchSearch =
      (driver?.name?.toLowerCase().includes(search.toLowerCase()) || false) ||
      (vehicle?.registration_number?.toLowerCase().includes(search.toLowerCase()) || false)
    
    const matchStatus = 
      filterType === 'ALL' || 
      (filterType === 'CURRENT' && a.is_current) || 
      (filterType === 'PAST' && !a.is_current)
      
    return matchSearch && matchStatus
  })

  const openModal = (mode: ModalMode, assignment: DriverAssignment | null = null) =>
    setModal({ mode, assignment })
  const closeModal = () => setModal({ mode: null, assignment: null })

  const handleSave = async (data: any) => {
    if (!token) return
    
    let res;
    if (modal.mode === 'add') {
      res = await assignDriver(data, token)
    } else if (modal.mode === 'edit' && modal.assignment) {
      res = await updateAssignment(modal.assignment.assignment_id, data, token)
    }
    
    if (res?.success) {
      closeModal()
    } else {
      alert(res?.message || 'An error occurred')
    }
  }

  const handleDelete = async (id: string) => {
    if (!token) return
    const res = await removeAssignment(id, token)
    if (res.success) {
      closeModal()
    } else {
      alert(res.message)
    }
  }

  // Stats
  const total   = assignments.length
  const current = assignments.filter(a => a.is_current).length
  const past    = assignments.filter(a => !a.is_current).length

  return (
    <div className={`assignments-page ${loaded ? 'assignments-page--loaded' : ''}`}>

      {/* ── Page header ───────────────────────────────────────────────── */}
      <div className="assignments-page__header">
        <div>
          <h2 className="assignments-page__title">Driver Assignments</h2>
          <p className="assignments-page__sub">Manage the link between your drivers and fleet vehicles</p>
        </div>
        <button className="btn btn--primary" onClick={() => openModal('add')}>
          <HiPlus /> Assign Driver
        </button>
      </div>

      {/* ── Summary strip ─────────────────────────────────────────────── */}
      <div className="assignments-page__summary">
        {[
          { label: 'Total Records', value: total,   cls: '',          icon: <HiLink /> },
          { label: 'Active Now',    value: current, cls: 'sum--green', icon: <HiCheckCircle /> },
          { label: 'Past Records',  value: past,    cls: 'sum--grey',  icon: <HiClock /> },
        ].map((s, i) => (
          <div key={s.label} className={`sum-chip ${s.cls}`} style={{ animationDelay: `${i * 60}ms` }}>
            <span className="sum-chip__icon">{s.icon}</span>
            <span className="sum-chip__value">{s.value}</span>
            <span className="sum-chip__label">{s.label}</span>
          </div>
        ))}
      </div>

      {/* ── Controls ──────────────────────────────────────────────────── */}
      <div className="assignments-page__controls">
        <div className="search-box">
          <HiMagnifyingGlass className="search-box__icon" />
          <input
            className="search-box__input"
            placeholder="Search by driver or vehicle plate..."
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
          {search && (
            <button className="search-box__clear" onClick={() => setSearch('')}><HiXMark /></button>
          )}
        </div>

        <div className="filter-tabs">
          {(['ALL', 'CURRENT', 'PAST'] as const).map(s => (
            <button
              key={s}
              className={`filter-tab ${filterType === s ? 'filter-tab--active' : ''}`}
              onClick={() => setFilterType(s)}
            >
              {s.charAt(0) + s.slice(1).toLowerCase()}
            </button>
          ))}
        </div>
      </div>

      {/* ── Error State ────────────────────────────────────────────────── */}
      {error && (
        <div className="assignments-error">
          <p>Error: {error}</p>
          <button className="btn btn--outline" onClick={() => token && fetchAssignments(token)}>Retry</button>
        </div>
      )}

      {/* ── Table ─────────────────────────────────────────────────────── */}
      <div className="assignments-table-wrap">
        {isLoading && assignments.length === 0 ? (
          <div className="assignments-loading">
            <div className="spinner" />
            <p>Loading assignment records...</p>
          </div>
        ) : filtered.length === 0 ? (
          <div className="assignments-empty">
            <HiLink size={48} color="#ddd" />
            <p>{search ? 'No matches found' : 'No assignments recorded yet'}</p>
          </div>
        ) : (
          <table className="assignments-table">
            <thead>
              <tr>
                <th>#</th>
                <th>Driver</th>
                <th>Vehicle</th>
                <th>Start Date</th>
                <th>End Date</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((a, i) => {
                const driver = drivers.find(d => d.driver_id === a.driver_id)
                const vehicle = vehicles.find(v => v.vehicle_id === a.vehicle_id)
                return (
                  <tr
                    key={a.assignment_id}
                    className="assignments-table__row"
                    style={{ animationDelay: `${i * 40}ms` }}
                    onClick={() => openModal('view', a)}
                  >
                    <td className="assignments-table__num">{i + 1}</td>
                    <td className="assignments-table__driver">
                      <HiUser style={{ verticalAlign: 'middle', marginRight: '6px', color: 'var(--color-grey-400)' }} />
                      {driver?.name || 'Unknown Driver'}
                    </td>
                    <td>
                      <span className="assignments-table__vehicle">
                        <HiTruck style={{ verticalAlign: 'middle', marginRight: '6px' }} />
                        {vehicle?.registration_number || 'Unknown Vehicle'}
                      </span>
                    </td>
                    <td className="assignments-table__date">{formatDate(a.start_date)}</td>
                    <td className="assignments-table__date">{formatDate(a.end_date)}</td>
                    <td>
                      <span className={`badge ${a.is_current ? 'badge--success' : 'badge--neutral'}`}>
                        {a.is_current ? 'Active' : 'Past'}
                      </span>
                    </td>
                    <td onClick={e => e.stopPropagation()}>
                      <div className="assignments-table__actions">
                        <button
                          className="action-btn action-btn--view"
                          onClick={() => openModal('view', a)}
                          title="View Details"
                        >
                          <HiEye />
                        </button>
                        <button
                          className="action-btn action-btn--edit"
                          onClick={() => openModal('edit', a)}
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
        <div className="assignments-page__footer">
          Showing {filtered.length} of {total} assignment records
        </div>
      )}

      {/* ── Modals ────────────────────────────────────────────────────── */}
      {modal.mode && (
        <AssignmentModal
          mode={modal.mode}
          assignment={modal.assignment}
          onClose={closeModal}
          onSave={handleSave}
          onDelete={handleDelete}
          isLoading={isLoading}
          drivers={drivers}
          vehicles={vehicles}
        />
      )}
    </div>
  )
}
