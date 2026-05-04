import React, { useState, useEffect } from 'react'
import { 
  HiUsers, 
  HiCheckCircle, 
  HiXCircle, 
  HiUserMinus, 
  HiMagnifyingGlass, 
  HiXMark, 
  HiEye, 
  HiPencilSquare, 
  HiPlus, 
  HiTrash,
  HiPhone,
  HiIdentification
} from 'react-icons/hi2'
import { useDriverStore } from './driverStore'
import { useAuthStore } from '../auth/authStore'
import type { Driver, DriverStatus } from '../../types/driver'
import './Drivers.scss'

// ─── Types ────────────────────────────────────────────────────────────────────

type ModalMode = 'add' | 'edit' | 'view' | null

// ─── Helpers ─────────────────────────────────────────────────────────────────

function formatDate(iso: string | null) {
  if (!iso) return '—'
  return new Date(iso).toLocaleDateString('en-KE', {
    day: '2-digit', month: 'short', year: 'numeric',
  })
}

function statusMeta(status: DriverStatus) {
  return {
    Active:    { label: 'Active',    cls: 'badge--success', icon: <HiCheckCircle /> },
    Suspended: { label: 'Suspended', cls: 'badge--warning', icon: <HiXCircle /> },
    Left:      { label: 'Left',      cls: 'badge--neutral', icon: <HiUserMinus /> },
  }[status]
}

// ─── Empty form state ─────────────────────────────────────────────────────────

const EMPTY_FORM = {
  name: '',
  license_number: '',
  phone: '',
  hire_date: '',
  status: 'Active' as DriverStatus,
}

// ─── Modal ────────────────────────────────────────────────────────────────────

interface ModalProps {
  mode: ModalMode
  driver: Driver | null
  onClose: () => void
  onSave: (data: any) => void
  onDelete: (id: string) => void
  isLoading: boolean
}

function DriverModal({ mode, driver, onClose, onSave, onDelete, isLoading }: ModalProps) {
  const [form, setForm] = useState(
    mode === 'edit' && driver
      ? {
          name: driver.name,
          license_number: driver.license_number,
          phone: driver.phone || '',
          hire_date: driver.hire_date?.split('T')[0] ?? '',
          status: driver.status,
        }
      : EMPTY_FORM
  )
  const [confirmDelete, setConfirmDelete] = useState(false)
  const isView = mode === 'view'

  const handleChange = (field: string, value: string) => {
    setForm(p => ({ ...p, [field]: value }))
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSave(form)
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div
        className={`modal modal--${mode}`}
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="modal__header">
          <div className="modal__header-left">
            <HiUsers className="modal__header-icon" size={24} />
            <div>
              <h2 className="modal__title">
                {mode === 'add'  && 'Add New Driver'}
                {mode === 'edit' && 'Edit Driver'}
                {mode === 'view' && driver?.name}
              </h2>
              <p className="modal__subtitle">
                {mode === 'add'  && 'Register a new driver to the system'}
                {mode === 'edit' && `Editing profile of ${driver?.name}`}
                {mode === 'view' && `Driver ID: ${driver?.driver_id}`}
              </p>
            </div>
          </div>
          <button className="modal__close" onClick={onClose}><HiXMark /></button>
        </div>

        {/* Body */}
        <div className="modal__body">
          {/* VIEW mode */}
          {isView && driver && (
            <>
              {/* Status banner */}
              <div className={`driver-status-banner driver-status-banner--${driver.status.toLowerCase()}`}>
                <span className={`badge ${statusMeta(driver.status).cls}`}>
                  {statusMeta(driver.status).label}
                </span>
                <span style={{ fontSize: '13px', color: 'var(--color-grey-500)' }}>
                  Hired on {formatDate(driver.hire_date)}
                </span>
              </div>

              {/* Detail grid */}
              <div className="detail-grid">
                {[
                  { label: 'Full Name',          value: driver.name },
                  { label: 'License Number',     value: driver.license_number },
                  { label: 'Phone Number',       value: driver.phone || '—' },
                  { label: 'Hire Date',          value: formatDate(driver.hire_date) },
                  { label: 'Joined System',      value: formatDate(driver.created_at) },
                  { label: 'Last Updated',       value: formatDate(driver.updated_at) },
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
            <form className="driver-form" onSubmit={handleSubmit} id="driver-form">
              <div className="driver-form__section-label">Personal Information</div>

              <div className="driver-form__field">
                <label className="driver-form__label">Full Name *</label>
                <input
                  className="driver-form__input"
                  placeholder="e.g. John Doe"
                  value={form.name}
                  onChange={e => handleChange('name', e.target.value)}
                  required
                  disabled={isLoading}
                />
              </div>

              <div className="driver-form__row">
                <div className="driver-form__field">
                  <label className="driver-form__label">License Number *</label>
                  <input
                    className="driver-form__input"
                    placeholder="e.g. DL-123456"
                    value={form.license_number}
                    onChange={e => handleChange('license_number', e.target.value)}
                    required
                    disabled={isLoading}
                  />
                </div>
                <div className="driver-form__field">
                  <label className="driver-form__label">Phone Number</label>
                  <input
                    className="driver-form__input"
                    placeholder="e.g. +254 700 000000"
                    value={form.phone}
                    onChange={e => handleChange('phone', e.target.value)}
                    disabled={isLoading}
                  />
                </div>
              </div>

              <div className="driver-form__row">
                <div className="driver-form__field">
                  <label className="driver-form__label">Hire Date</label>
                  <input
                    className="driver-form__input"
                    type="date"
                    value={form.hire_date}
                    onChange={e => handleChange('hire_date', e.target.value)}
                    disabled={isLoading}
                  />
                </div>
                <div className="driver-form__field">
                  <label className="driver-form__label">Status *</label>
                  <select
                    className="driver-form__input driver-form__select"
                    value={form.status}
                    onChange={e => handleChange('status', e.target.value)}
                    disabled={isLoading}
                  >
                    <option value="Active">Active</option>
                    <option value="Suspended">Suspended</option>
                    <option value="Left">Left</option>
                  </select>
                </div>
              </div>
            </form>
          )}
        </div>

        {/* Footer */}
        <div className="modal__footer">
          {mode === 'view' && driver && (
            <>
              {confirmDelete ? (
                <div className="modal__confirm-delete">
                  <span>Are you sure you want to delete this driver?</span>
                  <button className="btn btn--danger" onClick={() => onDelete(driver.driver_id)} disabled={isLoading}>
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
              <button className="btn btn--primary" type="submit" form="driver-form" disabled={isLoading}>
                {isLoading ? 'Saving...' : (mode === 'add' ? <HiPlus /> : '')} 
                {!isLoading && (mode === 'add' ? ' Register Driver' : ' Save Changes')}
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  )
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function Drivers() {
  const { drivers, isLoading, error, fetchDrivers, addDriver, updateDriver, removeDriver } = useDriverStore()
  const { token } = useAuthStore()
  
  const [modal, setModal] = useState<{ mode: ModalMode; driver: Driver | null }>({
    mode: null, driver: null,
  })
  const [search, setSearch] = useState('')
  const [filterStatus, setFilterStatus] = useState<DriverStatus | 'Active'>('Active')
  const [loaded] = useState(true)

  useEffect(() => {
    if (token) {
      fetchDrivers(token)
    }
  }, [token, fetchDrivers])

  const filtered = drivers.filter(d => {
    const matchSearch =
      d.name.toLowerCase().includes(search.toLowerCase()) ||
      d.license_number.toLowerCase().includes(search.toLowerCase())
    const matchStatus = filterStatus === 'Active' || d.status === filterStatus
    return matchSearch && matchStatus
  })

  const openModal = (mode: ModalMode, driver: Driver | null = null) =>
    setModal({ mode, driver })
  const closeModal = () => setModal({ mode: null, driver: null })

  const handleSave = async (data: any) => {
    if (!token) return
    
    let res;
    if (modal.mode === 'add') {
      res = await addDriver(data, token)
    } else if (modal.mode === 'edit' && modal.driver) {
      res = await updateDriver(modal.driver.driver_id, data, token)
    }
    
    if (res?.success) {
      closeModal()
    } else {
      alert(res?.message || 'An error occurred')
    }
  }

  const handleDelete = async (id: string) => {
    if (!token) return
    const res = await removeDriver(id, token)
    if (res.success) {
      closeModal()
    } else {
      alert(res.message)
    }
  }

  // Stats
  const total     = drivers.length
  const active    = drivers.filter(d => d.status === 'Active').length
  const suspended = drivers.filter(d => d.status === 'Suspended').length
  const left      = drivers.filter(d => d.status === 'Left').length

  return (
    <div className={`drivers-page ${loaded ? 'drivers-page--loaded' : ''}`}>

      {/* ── Page header ───────────────────────────────────────────────── */}
      <div className="drivers-page__header">
        <div>
          <h2 className="drivers-page__title">Driver Management</h2>
          <p className="drivers-page__sub">Manage your team of professional drivers — {total} registered</p>
        </div>
        <button className="btn btn--primary" onClick={() => openModal('add')}>
          <HiPlus /> Add Driver
        </button>
      </div>

      {/* ── Summary strip ─────────────────────────────────────────────── */}
      <div className="drivers-page__summary">
        {[
          { label: 'Total',     value: total,     cls: '',          icon: <HiUsers /> },
          { label: 'Active',    value: active,    cls: 'sum--green', icon: <HiCheckCircle /> },
          { label: 'Suspended', value: suspended, cls: 'sum--orange', icon: <HiXCircle /> },
          { label: 'Left',      value: left,      cls: 'sum--grey',  icon: <HiUserMinus /> },
        ].map((s, i) => (
          <div key={s.label} className={`sum-chip ${s.cls}`} style={{ animationDelay: `${i * 60}ms` }}>
            <span className="sum-chip__icon">{s.icon}</span>
            <span className="sum-chip__value">{s.value}</span>
            <span className="sum-chip__label">{s.label}</span>
          </div>
        ))}
      </div>

      {/* ── Controls ──────────────────────────────────────────────────── */}
      <div className="drivers-page__controls">
        <div className="search-box">
          <HiMagnifyingGlass className="search-box__icon" />
          <input
            className="search-box__input"
            placeholder="Search by name or license number..."
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
          {search && (
            <button className="search-box__clear" onClick={() => setSearch('')}><HiXMark /></button>
          )}
        </div>

        <div className="filter-tabs">
          {(['Active', 'Suspended', 'Left'] as const).map(s => (
            <button
              key={s}
              className={`filter-tab ${filterStatus === s ? 'filter-tab--active' : ''}`}
              onClick={() => setFilterStatus(s)}
            >
              {s === 'Active' ? 'Active' : s}
            </button>
          ))}
        </div>
      </div>

      {/* ── Error State ────────────────────────────────────────────────── */}
      {error && (
        <div className="drivers-error">
          <p>Error: {error}</p>
          <button className="btn btn--outline" onClick={() => token && fetchDrivers(token)}>Retry</button>
        </div>
      )}

      {/* ── Table ─────────────────────────────────────────────────────── */}
      <div className="drivers-table-wrap">
        {isLoading && drivers.length === 0 ? (
          <div className="drivers-loading">
            <div className="spinner" />
            <p>Loading driver database...</p>
          </div>
        ) : filtered.length === 0 ? (
          <div className="drivers-empty">
            <HiUsers size={48} color="#ddd" />
            <p>{search ? 'No drivers match your search' : 'No drivers registered yet'}</p>
          </div>
        ) : (
          <table className="drivers-table">
            <thead>
              <tr>
                <th>#</th>
                <th>Name</th>
                <th>License</th>
                <th>Phone</th>
                <th>Hire Date</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((d, i) => (
                <tr
                  key={d.driver_id}
                  className="drivers-table__row"
                  style={{ animationDelay: `${i * 40}ms` }}
                  onClick={() => openModal('view', d)}
                >
                  <td className="drivers-table__num">{i + 1}</td>
                  <td className="drivers-table__name">{d.name}</td>
                  <td>
                    <span className="drivers-table__license">
                      <HiIdentification style={{ verticalAlign: 'middle', marginRight: '4px' }} />
                      {d.license_number}
                    </span>
                  </td>
                  <td className="drivers-table__phone">
                    {d.phone ? (
                      <>
                        <HiPhone style={{ verticalAlign: 'middle', marginRight: '4px' }} />
                        {d.phone}
                      </>
                    ) : '—'}
                  </td>
                  <td className="drivers-table__date">{formatDate(d.hire_date)}</td>
                  <td>
                    <span className={`badge ${statusMeta(d.status).cls}`}>
                      {d.status}
                    </span>
                  </td>
                  <td onClick={e => e.stopPropagation()}>
                    <div className="drivers-table__actions">
                      <button
                        className="action-btn action-btn--view"
                        onClick={() => openModal('view', d)}
                        title="View Profile"
                      >
                        <HiEye />
                      </button>
                      <button
                        className="action-btn action-btn--edit"
                        onClick={() => openModal('edit', d)}
                        title="Edit Profile"
                      >
                        <HiPencilSquare />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* ── Footer count ──────────────────────────────────────────────── */}
      {!isLoading && (
        <div className="drivers-page__footer">
          Showing {filtered.length} of {total} drivers
        </div>
      )}

      {/* ── Modals ────────────────────────────────────────────────────── */}
      {modal.mode && (
        <DriverModal
          mode={modal.mode}
          driver={modal.driver}
          onClose={closeModal}
          onSave={handleSave}
          onDelete={handleDelete}
          isLoading={isLoading}
        />
      )}
    </div>
  )
}
