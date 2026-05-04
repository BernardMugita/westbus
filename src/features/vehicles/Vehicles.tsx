import { useState, useRef, useCallback, useEffect } from 'react'
import { 
  HiTruck, 
  HiCheckCircle, 
  HiWrenchScrewdriver, 
  HiArchiveBox, 
  HiClock, 
  HiMagnifyingGlass, 
  HiXMark, 
  HiEye, 
  HiPencilSquare, 
  HiPlus, 
  HiCamera,
  HiTrash
} from 'react-icons/hi2'
import { useVehicleStore } from './vehicleStore'
import { useAuthStore } from '../auth/authStore'
import type { Vehicle, VehicleStatus } from '../../types/vehicle'
import './Vehicles.scss'

// ─── Types ────────────────────────────────────────────────────────────────────

type ModalMode = 'add' | 'edit' | 'view' | null

// ─── Helpers ─────────────────────────────────────────────────────────────────

function formatDate(iso: string | null) {
  if (!iso) return '—'
  return new Date(iso).toLocaleDateString('en-KE', {
    day: '2-digit', month: 'short', year: 'numeric',
  })
}

function statusMeta(status: VehicleStatus) {
  return {
    ACTIVE:      { label: 'Active',      cls: 'badge--success' },
    MAINTENANCE: { label: 'Maintenance', cls: 'badge--warning' },
    RETIRED:     { label: 'Retired',     cls: 'badge--neutral' },
  }[status]
}

function isExpiringSoon(iso: string | null): boolean {
  if (!iso) return false
  const diff = new Date(iso).getTime() - Date.now()
  return diff > 0 && diff < 90 * 24 * 60 * 60 * 1000
}

function isExpired(iso: string | null): boolean {
  if (!iso) return false
  return new Date(iso).getTime() < Date.now()
}

// ─── Empty form state ─────────────────────────────────────────────────────────

const EMPTY_FORM = {
  registration_number: '',
  model: '',
  capacity: '',
  status: 'ACTIVE' as VehicleStatus,
  purchase_date: '',
  license_expiry: '',
}

// ─── Image Upload Zone ────────────────────────────────────────────────────────

interface ImageUploadProps {
  images: string[]
  onChange: (images: string[]) => void
}

function ImageUploadZone({ images, onChange }: ImageUploadProps) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [dragging, setDragging] = useState(false)

  const handleFiles = useCallback((files: FileList | null) => {
    if (!files) return
    Array.from(files).forEach(file => {
      if (!file.type.startsWith('image/')) return
      const reader = new FileReader()
      reader.onload = e => {
        const result = e.target?.result as string
        onChange([...images, result])
      }
      reader.readAsDataURL(file)
    })
  }, [images, onChange])

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setDragging(false)
    handleFiles(e.dataTransfer.files)
  }

  const removeImage = (idx: number) => {
    onChange(images.filter((_, i) => i !== idx))
  }

  return (
    <div className="image-upload">
      {/* Existing images */}
      {images.length > 0 && (
        <div className="image-upload__grid">
          {images.map((src, i) => (
            <div key={i} className="image-upload__thumb">
              <img src={src} alt={`Vehicle image ${i + 1}`} />
              <button
                className="image-upload__remove"
                onClick={() => removeImage(i)}
                type="button"
                aria-label="Remove image"
              >
                <HiXMark />
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Drop zone */}
      <div
        className={`image-upload__zone ${dragging ? 'image-upload__zone--dragging' : ''}`}
        onDragOver={e => { e.preventDefault(); setDragging(true) }}
        onDragLeave={() => setDragging(false)}
        onDrop={handleDrop}
        onClick={() => inputRef.current?.click()}
      >
        <HiCamera className="image-upload__zone-icon" />
        <p className="image-upload__zone-text">
          Drop images here or <span>click to browse</span>
        </p>
        <p className="image-upload__zone-hint">PNG, JPG, WEBP up to 5MB each</p>
        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          multiple
          style={{ display: 'none' }}
          onChange={e => handleFiles(e.target.files)}
        />
      </div>
    </div>
  )
}

// ─── Modal ────────────────────────────────────────────────────────────────────

interface ModalProps {
  mode: ModalMode
  vehicle: Vehicle | null
  onClose: () => void
  onSave: (data: Partial<Vehicle>) => void
  onDelete: (id: string) => void
  isLoading: boolean
}

function VehicleModal({ mode, vehicle, onClose, onSave, onDelete, isLoading }: ModalProps) {
  const [form, setForm] = useState(
    mode === 'edit' && vehicle
      ? {
          registration_number: vehicle.registration_number,
          model: vehicle.model,
          capacity: String(vehicle.capacity),
          status: vehicle.status,
          purchase_date: vehicle.purchase_date?.split('T')[0] ?? '',
          license_expiry: vehicle.license_expiry?.split('T')[0] ?? '',
        }
      : EMPTY_FORM
  )
  const [images, setImages] = useState<string[]>(vehicle?.images ?? [])
  const [confirmDelete, setConfirmDelete] = useState(false)
  const isView = mode === 'view'

  const handleChange = (field: string, value: string) => {
    setForm(p => ({ ...p, [field]: value }))
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSave({
      ...form,
      capacity: Number(form.capacity),
      images,
      purchase_date: form.purchase_date || null,
      license_expiry: form.license_expiry || null,
    })
  }

  const licenseExpired = isExpired(vehicle?.license_expiry ?? null)
  const licenseWarn = isExpiringSoon(vehicle?.license_expiry ?? null)

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div
        className={`modal modal--${mode}`}
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="modal__header">
          <div className="modal__header-left">
            <HiTruck className="modal__header-icon" size={24} />
            <div>
              <h2 className="modal__title">
                {mode === 'add'  && 'Add New Vehicle'}
                {mode === 'edit' && 'Edit Vehicle'}
                {mode === 'view' && vehicle?.registration_number}
              </h2>
              <p className="modal__subtitle">
                {mode === 'add'  && 'Register a new vehicle to the fleet'}
                {mode === 'edit' && `Editing ${vehicle?.registration_number}`}
                {mode === 'view' && vehicle?.model}
              </p>
            </div>
          </div>
          <button className="modal__close" onClick={onClose}><HiXMark /></button>
        </div>

        {/* Body */}
        <div className="modal__body">
          {/* VIEW mode */}
          {isView && vehicle && (
            <>
              {/* Image gallery */}
              {vehicle.images.length > 0 && (
                <div className="vehicle-gallery">
                  {vehicle.images.map((src, i) => (
                    <img key={i} src={src} alt={`Vehicle ${i + 1}`} className="vehicle-gallery__img" />
                  ))}
                </div>
              )}
              {vehicle.images.length === 0 && (
                <div className="vehicle-gallery vehicle-gallery--empty">
                  <HiTruck size={48} color="#ddd" />
                  <p>No images uploaded</p>
                </div>
              )}

              {/* Status banner */}
              <div className={`vehicle-status-banner vehicle-status-banner--${vehicle.status.toLowerCase()}`}>
                <span className={`badge ${statusMeta(vehicle.status).cls}`}>
                  {statusMeta(vehicle.status).label}
                </span>
                {licenseExpired && (
                  <span className="vehicle-status-banner__alert vehicle-status-banner__alert--danger">
                    <HiClock /> License expired {formatDate(vehicle.license_expiry)}
                  </span>
                )}
                {!licenseExpired && licenseWarn && (
                  <span className="vehicle-status-banner__alert vehicle-status-banner__alert--warn">
                    <HiClock /> License expires {formatDate(vehicle.license_expiry)}
                  </span>
                )}
              </div>

              {/* Detail grid */}
              <div className="detail-grid">
                {[
                  { label: 'Vehicle ID',           value: vehicle.vehicle_id },
                  { label: 'Registration No.',     value: vehicle.registration_number },
                  { label: 'Model',                value: vehicle.model },
                  { label: 'Capacity',             value: `${vehicle.capacity} seats` },
                  { label: 'Purchase Date',        value: formatDate(vehicle.purchase_date) },
                  { label: 'License Expiry',       value: formatDate(vehicle.license_expiry) },
                  { label: 'Created',              value: formatDate(vehicle.created_at) },
                  { label: 'Last Updated',         value: formatDate(vehicle.updated_at) },
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
            <form className="vehicle-form" onSubmit={handleSubmit} id="vehicle-form">
              <div className="vehicle-form__section-label">Vehicle Details</div>

              <div className="vehicle-form__row">
                <div className="vehicle-form__field">
                  <label className="vehicle-form__label">Registration Number *</label>
                  <input
                    className="vehicle-form__input"
                    placeholder="e.g. KCA 123A"
                    value={form.registration_number}
                    onChange={e => handleChange('registration_number', e.target.value)}
                    required
                    disabled={isView || isLoading}
                  />
                </div>
                <div className="vehicle-form__field">
                  <label className="vehicle-form__label">Model *</label>
                  <input
                    className="vehicle-form__input"
                    placeholder="e.g. Toyota Coaster 2022"
                    value={form.model}
                    onChange={e => handleChange('model', e.target.value)}
                    required
                    disabled={isView || isLoading}
                  />
                </div>
              </div>

              <div className="vehicle-form__row">
                <div className="vehicle-form__field">
                  <label className="vehicle-form__label">Capacity (seats) *</label>
                  <input
                    className="vehicle-form__input"
                    type="number"
                    min={1}
                    max={100}
                    placeholder="e.g. 30"
                    value={form.capacity}
                    onChange={e => handleChange('capacity', e.target.value)}
                    required
                    disabled={isView || isLoading}
                  />
                </div>
                <div className="vehicle-form__field">
                  <label className="vehicle-form__label">Status *</label>
                  <select
                    className="vehicle-form__input vehicle-form__select"
                    value={form.status}
                    onChange={e => handleChange('status', e.target.value)}
                    disabled={isView || isLoading}
                  >
                    <option value="ACTIVE">Active</option>
                    <option value="MAINTENANCE">Maintenance</option>
                    <option value="RETIRED">Retired</option>
                  </select>
                </div>
              </div>

              <div className="vehicle-form__row">
                <div className="vehicle-form__field">
                  <label className="vehicle-form__label">Purchase Date</label>
                  <input
                    className="vehicle-form__input"
                    type="date"
                    value={form.purchase_date}
                    onChange={e => handleChange('purchase_date', e.target.value)}
                    disabled={isView || isLoading}
                  />
                </div>
                <div className="vehicle-form__field">
                  <label className="vehicle-form__label">License Expiry</label>
                  <input
                    className="vehicle-form__input"
                    type="date"
                    value={form.license_expiry}
                    onChange={e => handleChange('license_expiry', e.target.value)}
                    disabled={isView || isLoading}
                  />
                </div>
              </div>

              <div className="vehicle-form__section-label">Vehicle Images</div>
              <ImageUploadZone images={images} onChange={setImages} />
            </form>
          )}
        </div>

        {/* Footer */}
        <div className="modal__footer">
          {mode === 'view' && vehicle && (
            <>
              {confirmDelete ? (
                <div className="modal__confirm-delete">
                  <span>Are you sure? This cannot be undone.</span>
                  <button className="btn btn--danger" onClick={() => onDelete(vehicle.vehicle_id)} disabled={isLoading}>
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
              <button className="btn btn--primary" type="submit" form="vehicle-form" disabled={isLoading}>
                {isLoading ? 'Saving...' : (mode === 'add' ? <HiPlus /> : '')} 
                {!isLoading && (mode === 'add' ? ' Add Vehicle' : ' Save Changes')}
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  )
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function Vehicles() {
  const { vehicles, isLoading, error, fetchVehicles, addVehicle, updateVehicle, removeVehicle } = useVehicleStore()
  const { token } = useAuthStore()
  
  const [modal, setModal] = useState<{ mode: ModalMode; vehicle: Vehicle | null }>({
    mode: null, vehicle: null,
  })
  const [search, setSearch] = useState('')
  const [filterStatus, setFilterStatus] = useState<VehicleStatus | 'ALL'>('ALL')
  const [loaded] = useState(true)

  useEffect(() => {
    if (token) {
      fetchVehicles(token)
    }
  }, [token, fetchVehicles])

  const filtered = vehicles.filter(v => {
    const matchSearch =
      v.registration_number.toLowerCase().includes(search.toLowerCase()) ||
      v.model.toLowerCase().includes(search.toLowerCase())
    const matchStatus = filterStatus === 'ALL' || v.status === filterStatus
    return matchSearch && matchStatus
  })

  const openModal = (mode: ModalMode, vehicle: Vehicle | null = null) =>
    setModal({ mode, vehicle })
  const closeModal = () => setModal({ mode: null, vehicle: null })

  const handleSave = async (data: Partial<Vehicle>) => {
    if (!token) return
    
    let res;
    if (modal.mode === 'add') {
      res = await addVehicle(data, token)
    } else if (modal.mode === 'edit' && modal.vehicle) {
      res = await updateVehicle(modal.vehicle.vehicle_id, data, token)
    }
    
    if (res?.success) {
      closeModal()
    } else {
      alert(res?.message || 'An error occurred')
    }
  }

  const handleDelete = async (id: string) => {
    if (!token) return
    const res = await removeVehicle(id, token)
    if (res.success) {
      closeModal()
    } else {
      alert(res.message)
    }
  }

  // Stats
  const total       = vehicles.length
  const active      = vehicles.filter(v => v.status === 'ACTIVE').length
  const maintenance = vehicles.filter(v => v.status === 'MAINTENANCE').length
  const retired     = vehicles.filter(v => v.status === 'RETIRED').length
  const expiring    = vehicles.filter(v => isExpiringSoon(v.license_expiry)).length

  return (
    <div className={`vehicles-page ${loaded ? 'vehicles-page--loaded' : ''}`}>

      {/* ── Page header ───────────────────────────────────────────────── */}
      <div className="vehicles-page__header">
        <div>
          <h2 className="vehicles-page__title">Fleet Vehicles</h2>
          <p className="vehicles-page__sub">Manage your fleet — {total} vehicles registered</p>
        </div>
        <button className="btn btn--primary" onClick={() => openModal('add')}>
          <HiPlus /> Add Vehicle
        </button>
      </div>

      {/* ── Summary strip ─────────────────────────────────────────────── */}
      <div className="vehicles-page__summary">
        {[
          { label: 'Total',       value: total,       cls: '',          icon: <HiTruck /> },
          { label: 'Active',      value: active,      cls: 'sum--green', icon: <HiCheckCircle /> },
          { label: 'Maintenance', value: maintenance, cls: 'sum--orange', icon: <HiWrenchScrewdriver /> },
          { label: 'Retired',     value: retired,     cls: 'sum--grey',  icon: <HiArchiveBox /> },
          { label: 'Expiring',    value: expiring,    cls: expiring > 0 ? 'sum--warn' : '', icon: <HiClock /> },
        ].map((s, i) => (
          <div key={s.label} className={`sum-chip ${s.cls}`} style={{ animationDelay: `${i * 60}ms` }}>
            <span className="sum-chip__icon">{s.icon}</span>
            <span className="sum-chip__value">{s.value}</span>
            <span className="sum-chip__label">{s.label}</span>
          </div>
        ))}
      </div>

      {/* ── Controls ──────────────────────────────────────────────────── */}
      <div className="vehicles-page__controls">
        <div className="search-box">
          <HiMagnifyingGlass className="search-box__icon" />
          <input
            className="search-box__input"
            placeholder="Search by registration or model..."
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
          {search && (
            <button className="search-box__clear" onClick={() => setSearch('')}><HiXMark /></button>
          )}
        </div>

        <div className="filter-tabs">
          {(['ALL', 'ACTIVE', 'MAINTENANCE', 'RETIRED'] as const).map(s => (
            <button
              key={s}
              className={`filter-tab ${filterStatus === s ? 'filter-tab--active' : ''}`}
              onClick={() => setFilterStatus(s)}
            >
              {s === 'ALL' ? 'All' : s.charAt(0) + s.slice(1).toLowerCase()}
            </button>
          ))}
        </div>
      </div>

      {/* ── Error State ────────────────────────────────────────────────── */}
      {error && (
        <div className="vehicles-error">
          <p>Error: {error}</p>
          <button className="btn btn--outline" onClick={() => token && fetchVehicles(token)}>Retry</button>
        </div>
      )}

      {/* ── Table ─────────────────────────────────────────────────────── */}
      <div className="vehicles-table-wrap">
        {isLoading && vehicles.length === 0 ? (
          <div className="vehicles-loading">
            <div className="spinner" />
            <p>Loading fleet data...</p>
          </div>
        ) : filtered.length === 0 ? (
          <div className="vehicles-empty">
            <HiTruck size={48} color="#ddd" />
            <p>{search ? 'No vehicles match your search' : 'No vehicles registered yet'}</p>
          </div>
        ) : (
          <table className="vehicles-table">
            <thead>
              <tr>
                <th>#</th>
                <th>Registration</th>
                <th>Model</th>
                <th>Capacity</th>
                <th>Status</th>
                <th>Purchase Date</th>
                <th>License Expiry</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((v, i) => {
                const expired = isExpired(v.license_expiry)
                const expiring = isExpiringSoon(v.license_expiry)
                return (
                  <tr
                    key={v.vehicle_id}
                    className="vehicles-table__row"
                    style={{ animationDelay: `${i * 40}ms` }}
                    onClick={() => openModal('view', v)}
                  >
                    <td className="vehicles-table__num">{i + 1}</td>
                    <td>
                      <div className="vehicles-table__reg">
                        <div className="vehicles-table__reg-plate">
                          {v.registration_number}
                        </div>
                      </div>
                    </td>
                    <td className="vehicles-table__model">{v.model}</td>
                    <td>
                      <span className="vehicles-table__capacity">
                        {v.capacity} <span>seats</span>
                      </span>
                    </td>
                    <td>
                      <span className={`badge ${statusMeta(v.status).cls}`}>
                        {statusMeta(v.status).label}
                      </span>
                    </td>
                    <td className="vehicles-table__date">{formatDate(v.purchase_date)}</td>
                    <td>
                      <span className={`vehicles-table__expiry ${expired ? 'vehicles-table__expiry--expired' : expiring ? 'vehicles-table__expiry--warn' : ''}`}>
                        {expired && <HiClock style={{ verticalAlign: 'middle', marginRight: '4px' }} />}
                        {!expired && expiring && <HiClock style={{ verticalAlign: 'middle', marginRight: '4px' }} />}
                        {formatDate(v.license_expiry)}
                      </span>
                    </td>
                    <td onClick={e => e.stopPropagation()}>
                      <div className="vehicles-table__actions">
                        <button
                          className="action-btn action-btn--view"
                          onClick={() => openModal('view', v)}
                          title="View"
                        >
                          <HiEye />
                        </button>
                        <button
                          className="action-btn action-btn--edit"
                          onClick={() => openModal('edit', v)}
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
        <div className="vehicles-page__footer">
          Showing {filtered.length} of {total} vehicles
        </div>
      )}

      {/* ── Modals ────────────────────────────────────────────────────── */}
      {modal.mode && (
        <VehicleModal
          mode={modal.mode}
          vehicle={modal.vehicle}
          onClose={closeModal}
          onSave={handleSave}
          onDelete={handleDelete}
          isLoading={isLoading}
        />
      )}
    </div>
  )
}
