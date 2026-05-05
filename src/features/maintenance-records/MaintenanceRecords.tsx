import { useState, useEffect } from 'react'
import { 
  HiWrenchScrewdriver, 
  HiCheckCircle, 
  HiMagnifyingGlass, 
  HiXMark, 
  HiEye, 
  HiPencilSquare, 
  HiPlus, 
  HiTrash,
  HiTruck,
  HiBuildingStorefront
} from 'react-icons/hi2'
import { useMaintenanceStore } from './maintenanceStore'
import { useVehicleStore } from '../vehicles/vehicleStore'
import { useDriverStore } from '../drivers/driverStore'
import { useAuthStore } from '../auth/authStore'
import type { MaintenanceRecord, MaintenanceType } from '../../types/maintenance'
import './MaintenanceRecords.scss'

// ─── Types ────────────────────────────────────────────────────────────────────

type ModalMode = 'add' | 'edit' | 'view' | null

// ─── Helpers ─────────────────────────────────────────────────────────────────

function formatDate(iso: string | null) {
  if (!iso) return '—'
  return new Date(iso).toLocaleDateString('en-KE', {
    day: '2-digit', month: 'short', year: 'numeric',
  })
}

function formatCurrency(amount: number) {
  return new Intl.NumberFormat('en-KE', {
    style: 'currency',
    currency: 'KES',
  }).format(amount)
}

function formatNumber(num: number | null) {
  if (num === null) return '—'
  return new Intl.NumberFormat('en-KE').format(num)
}

// ─── Empty form state ─────────────────────────────────────────────────────────

const EMPTY_FORM = {
  vehicle_id: '',
  driver_id: '',
  maintenance_date: new Date().toISOString().split('T')[0],
  type: 'Oil change' as MaintenanceType,
  cost: '',
  odometer_km: '',
  garage_name: '',
  next_due_km: '',
}

// ─── Modal ────────────────────────────────────────────────────────────────────

interface ModalProps {
  mode: ModalMode
  record: MaintenanceRecord | null
  onClose: () => void
  onSave: (data: any) => void
  onDelete: (id: string) => void
  isLoading: boolean
}

function MaintenanceModal({ mode, record, onClose, onSave, onDelete, isLoading }: ModalProps) {
  const { vehicles } = useVehicleStore()
  const { drivers } = useDriverStore()

  const [form, setForm] = useState(
    mode === 'edit' && record
      ? {
          vehicle_id: record.vehicle_id,
          driver_id: record.driver_id ?? '',
          maintenance_date: record.maintenance_date.split('T')[0],
          type: record.type,
          cost: String(record.cost),
          odometer_km: record.odometer_km ? String(record.odometer_km) : '',
          garage_name: record.garage_name ?? '',
          next_due_km: record.next_due_km ? String(record.next_due_km) : '',
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
      cost: Number(form.cost),
      odometer_km: form.odometer_km ? Number(form.odometer_km) : null,
      next_due_km: form.next_due_km ? Number(form.next_due_km) : null,
      driver_id: form.driver_id || null,
      maintenance_date: new Date(form.maintenance_date).toISOString(),
    })
  }

  const selectedVehicle = vehicles.find(v => v.vehicle_id === record?.vehicle_id)
  const selectedDriver = drivers.find(d => d.driver_id === record?.driver_id)

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div
        className={`modal modal--${mode}`}
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="modal__header">
          <div className="modal__header-left">
            <HiWrenchScrewdriver className="modal__header-icon" size={24} />
            <div>
              <h2 className="modal__title">
                {mode === 'add'  && 'Record Maintenance'}
                {mode === 'edit' && 'Edit Maintenance Record'}
                {mode === 'view' && `Maintenance Details`}
              </h2>
              <p className="modal__subtitle">
                {mode === 'add'  && 'Log a new service or repair'}
                {mode === 'edit' && `Editing Record ID: ${record?.maintenance_id.slice(0, 8)}`}
                {mode === 'view' && `Record ID: ${record?.maintenance_id}`}
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
              <div className="detail-grid">
                {[
                  { label: 'Vehicle',            value: selectedVehicle?.registration_number || record.vehicle_id },
                  { label: 'Driver (Assigned)',  value: selectedDriver?.name || '—' },
                  { label: 'Service Type',       value: record.type },
                  { label: 'Cost',               value: formatCurrency(record.cost) },
                  { label: 'Odometer (km)',      value: formatNumber(record.odometer_km) },
                  { label: 'Next Due (km)',      value: formatNumber(record.next_due_km) },
                  { label: 'Garage / Workshop',  value: record.garage_name || '—' },
                  { label: 'Service Date',       value: formatDate(record.maintenance_date) },
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
            <form className="maintenance-form" onSubmit={handleSubmit} id="maintenance-form">
              <div className="maintenance-form__section-label">Service Information</div>

              <div className="maintenance-form__row">
                <div className="maintenance-form__field">
                  <label className="maintenance-form__label">Vehicle *</label>
                  <select
                    className="maintenance-form__input maintenance-form__select"
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
                <div className="maintenance-form__field">
                  <label className="maintenance-form__label">Service Type *</label>
                  <select
                    className="maintenance-form__input maintenance-form__select"
                    value={form.type}
                    onChange={e => handleChange('type', e.target.value)}
                    required
                    disabled={isLoading}
                  >
                    <option value="Oil change">Oil change</option>
                    <option value="Brake pad">Brake pad</option>
                    <option value="Tyre">Tyre</option>
                    <option value="Engine">Engine</option>
                    <option value="Electrical">Electrical</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
              </div>

              <div className="maintenance-form__row">
                <div className="maintenance-form__field">
                  <label className="maintenance-form__label">Total Cost (KES) *</label>
                  <input
                    className="maintenance-form__input"
                    type="number"
                    placeholder="0.00"
                    value={form.cost}
                    onChange={e => handleChange('cost', e.target.value)}
                    required
                    disabled={isLoading}
                  />
                </div>
                <div className="maintenance-form__field">
                  <label className="maintenance-form__label">Service Date *</label>
                  <input
                    className="maintenance-form__input"
                    type="date"
                    value={form.maintenance_date}
                    onChange={e => handleChange('maintenance_date', e.target.value)}
                    required
                    disabled={isLoading}
                  />
                </div>
              </div>

              <div className="maintenance-form__row">
                <div className="maintenance-form__field">
                  <label className="maintenance-form__label">Odometer Reading (km)</label>
                  <input
                    className="maintenance-form__input"
                    type="number"
                    placeholder="Current km"
                    value={form.odometer_km}
                    onChange={e => handleChange('odometer_km', e.target.value)}
                    disabled={isLoading}
                  />
                </div>
                <div className="maintenance-form__field">
                  <label className="maintenance-form__label">Next Service Due (km)</label>
                  <input
                    className="maintenance-form__input"
                    type="number"
                    placeholder="Next due km"
                    value={form.next_due_km}
                    onChange={e => handleChange('next_due_km', e.target.value)}
                    disabled={isLoading}
                  />
                </div>
              </div>

              <div className="maintenance-form__row">
                <div className="maintenance-form__field">
                  <label className="maintenance-form__label">Garage / Workshop Name</label>
                  <input
                    className="maintenance-form__input"
                    placeholder="e.g. Master Garage"
                    value={form.garage_name}
                    onChange={e => handleChange('garage_name', e.target.value)}
                    disabled={isLoading}
                  />
                </div>
                <div className="maintenance-form__field">
                  <label className="maintenance-form__label">Reporting Driver (Optional)</label>
                  <select
                    className="maintenance-form__input maintenance-form__select"
                    value={form.driver_id}
                    onChange={e => handleChange('driver_id', e.target.value)}
                    disabled={isLoading}
                  >
                    <option value="">Select Driver</option>
                    {drivers.map(d => (
                      <option key={d.driver_id} value={d.driver_id}>
                        {d.name}
                      </option>
                    ))}
                  </select>
                </div>
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
                  <button className="btn btn--danger" onClick={() => onDelete(record.maintenance_id)} disabled={isLoading}>
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
              <button className="btn btn--primary" type="submit" form="maintenance-form" disabled={isLoading}>
                {isLoading ? 'Saving...' : (mode === 'add' ? <HiPlus /> : '')} 
                {!isLoading && (mode === 'add' ? ' Record Service' : ' Save Changes')}
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  )
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function MaintenanceRecords() {
  const { records, isLoading, error, fetchRecords, addRecord, updateRecord, removeRecord } = useMaintenanceStore()
  const { fetchVehicles, vehicles } = useVehicleStore()
  const { fetchDrivers } = useDriverStore()
  const { token } = useAuthStore()
  
  const [modal, setModal] = useState<{ mode: ModalMode; record: MaintenanceRecord | null }>({
    mode: null, record: null,
  })
  const [search, setSearch] = useState('')
  const [filterType, setFilterType] = useState<MaintenanceType | 'ALL'>('ALL')
  const [loaded] = useState(true)

  useEffect(() => {
    if (token) {
      fetchRecords(token)
      fetchVehicles(token)
      fetchDrivers(token)
    }
  }, [token, fetchRecords, fetchVehicles, fetchDrivers])

  const filtered = records.filter(r => {
    const vehicle = vehicles.find(v => v.vehicle_id === r.vehicle_id)
    const garageSearch = (r.garage_name || '').toLowerCase()
    const searchStr = `${vehicle?.registration_number} ${garageSearch} ${r.type}`.toLowerCase()
    const matchSearch = searchStr.includes(search.toLowerCase())
    const matchType = filterType === 'ALL' || r.type === filterType
    return matchSearch && matchType
  })

  const openModal = (mode: ModalMode, record: MaintenanceRecord | null = null) =>
    setModal({ mode, record })
  const closeModal = () => setModal({ mode: null, record: null })

  const handleSave = async (data: any) => {
    if (!token) return
    
    let res;
    if (modal.mode === 'add') {
      res = await addRecord(data, token)
    } else if (modal.mode === 'edit' && modal.record) {
      res = await updateRecord(modal.record.maintenance_id, data, token)
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
  const totalCost = records.reduce((acc, r) => acc + r.cost, 0)
  const currentMonth = new Date().getMonth()
  const currentYear = new Date().getFullYear()
  const monthlyCost = records
    .filter(r => {
      const d = new Date(r.maintenance_date)
      return d.getMonth() === currentMonth && d.getFullYear() === currentYear
    })
    .reduce((acc, r) => acc + r.cost, 0)
  const engineServices = records.filter(r => r.type === 'Engine').length

  return (
    <div className={`maintenance-page ${loaded ? 'maintenance-page--loaded' : ''}`}>

      {/* ── Page header ───────────────────────────────────────────────── */}
      <div className="maintenance-page__header">
        <div>
          <h2 className="maintenance-page__title">Maintenance Logs</h2>
          <p className="maintenance-page__sub">Monitor fleet health and service history — {records.length} records</p>
        </div>
        <button className="btn btn--primary" onClick={() => openModal('add')}>
          <HiPlus /> Record Maintenance
        </button>
      </div>

      {/* ── Summary strip ─────────────────────────────────────────────── */}
      <div className="maintenance-page__summary">
        {[
          { label: 'Cumulative Cost', value: formatCurrency(totalCost), cls: 'sum--orange', icon: <HiWrenchScrewdriver /> },
          { label: 'This Month',       value: formatCurrency(monthlyCost), cls: '', icon: <HiCheckCircle /> },
          { label: 'Engine Repairs',   value: engineServices,               cls: 'sum--grey', icon: <HiTruck /> },
          { label: 'Active Fleet',     value: vehicles.length,              cls: 'sum--green', icon: <HiCheckCircle /> },
        ].map((s, i) => (
          <div key={s.label} className={`sum-chip ${s.cls}`} style={{ animationDelay: `${i * 60}ms` }}>
            <span className="sum-chip__icon">{s.icon}</span>
            <span className="sum-chip__value">{s.value}</span>
            <span className="sum-chip__label">{s.label}</span>
          </div>
        ))}
      </div>

      {/* ── Controls ──────────────────────────────────────────────────── */}
      <div className="maintenance-page__controls">
        <div className="search-box">
          <HiMagnifyingGlass className="search-box__icon" />
          <input
            className="search-box__input"
            placeholder="Search by vehicle or garage..."
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
          {search && (
            <button className="search-box__clear" onClick={() => setSearch('')}><HiXMark /></button>
          )}
        </div>

        <div className="filter-tabs">
          {(['ALL', 'Oil change', 'Brake pad', 'Tyre', 'Engine', 'Electrical', 'Other'] as const).map(s => (
            <button
              key={s}
              className={`filter-tab ${filterType === s ? 'filter-tab--active' : ''}`}
              onClick={() => setFilterType(s)}
            >
              {s === 'ALL' ? 'All Types' : s}
            </button>
          ))}
        </div>
      </div>

      {/* ── Error State ────────────────────────────────────────────────── */}
      {error && (
        <div className="maintenance-error">
          <p>Error: {error}</p>
          <button className="btn btn--outline" onClick={() => token && fetchRecords(token)}>Retry</button>
        </div>
      )}

      {/* ── Table ─────────────────────────────────────────────────────── */}
      <div className="maintenance-table-wrap">
        {isLoading && records.length === 0 ? (
          <div className="maintenance-loading">
            <div className="spinner" />
            <p>Loading maintenance logs...</p>
          </div>
        ) : filtered.length === 0 ? (
          <div className="maintenance-empty">
            <HiWrenchScrewdriver size={48} color="#ddd" />
            <p>{search ? 'No records match your search' : 'No maintenance recorded yet'}</p>
          </div>
        ) : (
          <table className="maintenance-table">
            <thead>
              <tr>
                <th>#</th>
                <th>Vehicle</th>
                <th>Service Type</th>
                <th>Cost</th>
                <th>Garage / Workshop</th>
                <th>Date</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((r, i) => {
                const vehicle = vehicles.find(v => v.vehicle_id === r.vehicle_id)
                return (
                  <tr
                    key={r.maintenance_id}
                    className="maintenance-table__row"
                    style={{ animationDelay: `${i * 40}ms` }}
                    onClick={() => openModal('view', r)}
                  >
                    <td className="maintenance-table__num">{i + 1}</td>
                    <td>
                       <div className="maintenance-table__vehicle">
                          <strong>{vehicle?.registration_number || '—'}</strong>
                          <span>{vehicle?.model}</span>
                       </div>
                    </td>
                    <td>
                      <span className="badge badge--neutral">
                        {r.type}
                      </span>
                    </td>
                    <td>
                      <span className="maintenance-table__cost">
                        {formatCurrency(r.cost)}
                      </span>
                    </td>
                    <td className="maintenance-table__garage">
                       <HiBuildingStorefront size={14} style={{ verticalAlign: 'middle', marginRight: '6px' }} />
                       {r.garage_name || '—'}
                    </td>
                    <td className="maintenance-table__date">{formatDate(r.maintenance_date)}</td>
                    <td onClick={e => e.stopPropagation()}>
                      <div className="maintenance-table__actions">
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
        <div className="maintenance-page__footer">
          Showing {filtered.length} of {records.length} records
        </div>
      )}

      {/* ── Modals ────────────────────────────────────────────────────── */}
      {modal.mode && (
        <MaintenanceModal
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
