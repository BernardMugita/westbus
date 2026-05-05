import { useState, useEffect } from 'react'
import {
  HiShieldCheck,
  HiCheckCircle,
  HiXCircle,
  HiMagnifyingGlass,
  HiXMark,
  HiEye,
  HiPencilSquare,
  HiPlus,
  HiTrash,
  HiTruck,
  HiCurrencyDollar,
  HiExclamationTriangle,
} from 'react-icons/hi2'
import { useInsuranceStore } from './insuranceStore'
import { useVehicleStore } from '../vehicles/vehicleStore'
import { useAuthStore } from '../auth/authStore'
import type { InsuranceRecord, InsuranceStatus, PolicyType } from '../../types/insurance'
import './Insurance.scss'

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

function statusMeta(status: InsuranceStatus) {
  return {
    Active:    { label: 'Active',    cls: 'badge--success', icon: <HiCheckCircle /> },
    Expired:   { label: 'Expired',   cls: 'badge--danger',  icon: <HiXCircle /> },
    Cancelled: { label: 'Cancelled', cls: 'badge--neutral', icon: <HiXCircle /> },
  }[status]
}

/** Returns days until expiry (negative = already expired) */
function daysUntilExpiry(endDate: string) {
  const diff = new Date(endDate).getTime() - Date.now()
  return Math.ceil(diff / (1000 * 60 * 60 * 24))
}

function ExpiryTag({ endDate }: { endDate: string }) {
  const days = daysUntilExpiry(endDate)
  if (days < 0)   return <span className="expiry-tag expiry-tag--past">Expired</span>
  if (days <= 30) return <span className="expiry-tag expiry-tag--soon">{days}d left</span>
  return <span className="expiry-tag expiry-tag--ok">{days}d left</span>
}

// ─── Empty form state ─────────────────────────────────────────────────────────

const EMPTY_FORM = {
  vehicle_id: '',
  provider: '',
  policy_type: 'Comprehensive' as PolicyType,
  start_date: '',
  end_date: '',
  premium_amount: '',
  status: 'Active' as InsuranceStatus,
}

// ─── Modal ────────────────────────────────────────────────────────────────────

interface ModalProps {
  mode: ModalMode
  record: InsuranceRecord | null
  onClose: () => void
  onSave: (data: any) => void
  onDelete: (id: string) => void
  isLoading: boolean
}

function InsuranceModal({ mode, record, onClose, onSave, onDelete, isLoading }: ModalProps) {
  const { vehicles } = useVehicleStore()

  const [form, setForm] = useState(
    mode === 'edit' && record
      ? {
          vehicle_id:     record.vehicle_id,
          provider:       record.provider,
          policy_type:    record.policy_type,
          start_date:     record.start_date.split('T')[0],
          end_date:       record.end_date.split('T')[0],
          premium_amount: String(record.premium_amount),
          status:         record.status,
        }
      : EMPTY_FORM
  )
  const [confirmDelete, setConfirmDelete] = useState(false)
  const isView = mode === 'view'

  const handleChange = (field: string, value: any) =>
    setForm(p => ({ ...p, [field]: value }))

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSave({
      ...form,
      premium_amount: Number(form.premium_amount),
      start_date: new Date(form.start_date).toISOString(),
      end_date:   new Date(form.end_date).toISOString(),
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
            <HiShieldCheck className="modal__header-icon" size={24} />
            <div>
              <h2 className="modal__title">
                {mode === 'add'  && 'New Insurance Policy'}
                {mode === 'edit' && 'Edit Policy Details'}
                {mode === 'view' && 'Policy Information'}
              </h2>
              <p className="modal__subtitle">
                {mode === 'add'  && 'Add a new vehicle insurance policy'}
                {mode === 'edit' && `Editing Policy ID: ${record?.insurance_id.slice(0, 8)}`}
                {mode === 'view' && `Policy ID: ${record?.insurance_id}`}
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
              <div className={`insurance-status-banner insurance-status-banner--${record.status.toLowerCase()}`}>
                <span className={`badge ${statusMeta(record.status).cls}`}>
                  {statusMeta(record.status).label}
                </span>
                <span style={{ fontSize: '13px', color: 'var(--color-grey-500)' }}>
                  Coverage from {formatDate(record.start_date)} to {formatDate(record.end_date)}
                </span>
                <ExpiryTag endDate={record.end_date} />
              </div>

              <div className="detail-grid">
                {[
                  { label: 'Vehicle',        value: selectedVehicle?.registration_number || record.vehicle_id },
                  { label: 'Provider',       value: record.provider },
                  { label: 'Policy Type',    value: record.policy_type },
                  { label: 'Premium Amount', value: formatCurrency(record.premium_amount) },
                  { label: 'Start Date',     value: formatDate(record.start_date) },
                  { label: 'End Date',       value: formatDate(record.end_date) },
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
            <form className="insurance-form" onSubmit={handleSubmit} id="insurance-form">
              <div className="insurance-form__section-label">Policy Information</div>

              <div className="insurance-form__row">
                <div className="insurance-form__field">
                  <label className="insurance-form__label">Vehicle *</label>
                  <select
                    className="insurance-form__input insurance-form__select"
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
                <div className="insurance-form__field">
                  <label className="insurance-form__label">Provider / Insurer *</label>
                  <input
                    className="insurance-form__input"
                    placeholder="e.g. Jubilee Insurance"
                    value={form.provider}
                    onChange={e => handleChange('provider', e.target.value)}
                    required
                    disabled={isLoading}
                  />
                </div>
              </div>

              <div className="insurance-form__row">
                <div className="insurance-form__field">
                  <label className="insurance-form__label">Policy Type *</label>
                  <select
                    className="insurance-form__input insurance-form__select"
                    value={form.policy_type}
                    onChange={e => handleChange('policy_type', e.target.value)}
                    required
                    disabled={isLoading}
                  >
                    <option value="Comprehensive">Comprehensive</option>
                    <option value="Third-party">Third-party</option>
                    <option value="PSV">PSV</option>
                  </select>
                </div>
                <div className="insurance-form__field">
                  <label className="insurance-form__label">Premium Amount *</label>
                  <input
                    className="insurance-form__input"
                    type="number"
                    step="0.01"
                    placeholder="0.00"
                    value={form.premium_amount}
                    onChange={e => handleChange('premium_amount', e.target.value)}
                    required
                    disabled={isLoading}
                  />
                </div>
              </div>

              <div className="insurance-form__row">
                <div className="insurance-form__field">
                  <label className="insurance-form__label">Start Date *</label>
                  <input
                    className="insurance-form__input"
                    type="date"
                    value={form.start_date}
                    onChange={e => handleChange('start_date', e.target.value)}
                    required
                    disabled={isLoading}
                  />
                </div>
                <div className="insurance-form__field">
                  <label className="insurance-form__label">End Date *</label>
                  <input
                    className="insurance-form__input"
                    type="date"
                    value={form.end_date}
                    onChange={e => handleChange('end_date', e.target.value)}
                    required
                    disabled={isLoading}
                  />
                </div>
              </div>

              <div className="insurance-form__field">
                <label className="insurance-form__label">Policy Status</label>
                <select
                  className="insurance-form__input insurance-form__select"
                  value={form.status}
                  onChange={e => handleChange('status', e.target.value)}
                  disabled={isLoading}
                >
                  <option value="Active">Active</option>
                  <option value="Expired">Expired</option>
                  <option value="Cancelled">Cancelled</option>
                </select>
              </div>
            </form>
          )}
        </div>

        {/* Footer */}
        <div className="modal__footer">
          {mode === 'view' && record && (
            <>
              {confirmDelete ? (
                <div className="modal__confirm-delete">
                  <span>Are you sure? This action is permanent.</span>
                  <button className="btn btn--danger" onClick={() => onDelete(record.insurance_id)} disabled={isLoading}>
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
              <button className="btn btn--primary" type="submit" form="insurance-form" disabled={isLoading}>
                {isLoading
                  ? 'Saving...'
                  : mode === 'add'
                    ? <><HiPlus /> Add Policy</>
                    : 'Save Changes'
                }
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  )
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function Insurance() {
  const { records, isLoading, error, fetchRecords, addRecord, updateRecord, removeRecord } = useInsuranceStore()
  const { fetchVehicles, vehicles } = useVehicleStore()
  const { token } = useAuthStore()

  const [modal, setModal] = useState<{ mode: ModalMode; record: InsuranceRecord | null }>({
    mode: null, record: null,
  })
  const [search, setSearch] = useState('')
  const [filterStatus, setFilterStatus] = useState<InsuranceStatus | 'ALL'>('ALL')
  const [loaded] = useState(true)

  useEffect(() => {
    if (token) {
      fetchRecords(token)
      fetchVehicles(token)
    }
  }, [token, fetchRecords, fetchVehicles])

  const filtered = records.filter(r => {
    const vehicle = vehicles.find(v => v.vehicle_id === r.vehicle_id)
    const searchStr = `${vehicle?.registration_number} ${r.provider} ${r.policy_type}`.toLowerCase()
    const matchSearch = searchStr.includes(search.toLowerCase())
    const matchStatus = filterStatus === 'ALL' || r.status === filterStatus
    return matchSearch && matchStatus
  })

  const openModal = (mode: ModalMode, record: InsuranceRecord | null = null) =>
    setModal({ mode, record })
  const closeModal = () => setModal({ mode: null, record: null })

  const handleSave = async (data: any) => {
    if (!token) return
    let res
    if (modal.mode === 'add') {
      res = await addRecord(data, token)
    } else if (modal.mode === 'edit' && modal.record) {
      res = await updateRecord(modal.record.insurance_id, data, token)
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
  const activeCount     = records.filter(r => r.status === 'Active').length
  const expiringSoon    = records.filter(r => r.status === 'Active' && daysUntilExpiry(r.end_date) <= 30).length
  const totalPremium    = records.reduce((acc, r) => acc + r.premium_amount, 0)
  const expiredCount    = records.filter(r => r.status === 'Expired').length

  return (
    <div className={`insurance-page ${loaded ? 'insurance-page--loaded' : ''}`}>

      {/* ── Page header ───────────────────────────────────────────────── */}
      <div className="insurance-page__header">
        <div>
          <h2 className="insurance-page__title">Insurance Policies</h2>
          <p className="insurance-page__sub">
            Track vehicle insurance coverage and renewals — {records.length} policies
          </p>
        </div>
        <button className="btn btn--primary" onClick={() => openModal('add')}>
          <HiPlus /> New Policy
        </button>
      </div>

      {/* ── Summary strip ─────────────────────────────────────────────── */}
      <div className="insurance-page__summary">
        {[
          { label: 'Total Policies',   value: records.length,              cls: 'ins--grey',   icon: <HiShieldCheck /> },
          { label: 'Active',           value: activeCount,                 cls: 'ins--green',  icon: <HiTruck /> },
          { label: 'Expiring Soon',    value: expiringSoon,                cls: 'ins--orange', icon: <HiExclamationTriangle /> },
          { label: 'Annual Premium',   value: formatCurrency(totalPremium), cls: 'ins--blue',   icon: <HiCurrencyDollar /> },
        ].map((s, i) => (
          <div key={s.label} className={`ins-chip ${s.cls}`} style={{ animationDelay: `${i * 60}ms` }}>
            <span className="ins-chip__icon">{s.icon}</span>
            <span className="ins-chip__value">{s.value}</span>
            <span className="ins-chip__label">{s.label}</span>
          </div>
        ))}
      </div>

      {/* ── Controls ──────────────────────────────────────────────────── */}
      <div className="insurance-page__controls">
        <div className="search-box">
          <HiMagnifyingGlass className="search-box__icon" />
          <input
            className="search-box__input"
            placeholder="Search by vehicle, provider or type..."
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
          {search && (
            <button className="search-box__clear" onClick={() => setSearch('')}><HiXMark /></button>
          )}
        </div>

        <div className="filter-tabs">
          {(['ALL', 'Active', 'Expired', 'Cancelled'] as const).map(s => (
            <button
              key={s}
              className={`filter-tab ${filterStatus === s ? 'filter-tab--active' : ''}`}
              onClick={() => setFilterStatus(s)}
            >
              {s === 'ALL' ? 'All Policies' : s}
            </button>
          ))}
        </div>
      </div>

      {/* ── Error State ───────────────────────────────────────────────── */}
      {error && (
        <div className="insurance-error">
          <p>Error: {error}</p>
          <button className="btn btn--outline" onClick={() => token && fetchRecords(token)}>Retry</button>
        </div>
      )}

      {/* ── Table ─────────────────────────────────────────────────────── */}
      <div className="insurance-table-wrap">
        {isLoading && records.length === 0 ? (
          <div className="insurance-loading">
            <div className="spinner" />
            <p>Loading policies...</p>
          </div>
        ) : filtered.length === 0 ? (
          <div className="insurance-empty">
            <HiShieldCheck size={48} color="#ddd" />
            <p>{search ? 'No policies match your search' : 'No insurance policies found'}</p>
          </div>
        ) : (
          <table className="insurance-table">
            <thead>
              <tr>
                <th>#</th>
                <th>Vehicle</th>
                <th>Provider</th>
                <th>Type</th>
                <th>Premium</th>
                <th>End Date</th>
                <th>Expiry</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((r, i) => {
                const vehicle = vehicles.find(v => v.vehicle_id === r.vehicle_id)
                return (
                  <tr
                    key={r.insurance_id}
                    className="insurance-table__row"
                    style={{ animationDelay: `${i * 40}ms` }}
                    onClick={() => openModal('view', r)}
                  >
                    <td className="insurance-table__num">{i + 1}</td>
                    <td>
                      <div className="insurance-table__vehicle">
                        <strong>{vehicle?.registration_number || '—'}</strong>
                        <span>{vehicle?.model}</span>
                      </div>
                    </td>
                    <td className="insurance-table__provider">{r.provider}</td>
                    <td>
                      <span className="badge badge--neutral">{r.policy_type}</span>
                    </td>
                    <td>
                      <div className="insurance-table__premium">
                        <strong>{formatCurrency(r.premium_amount)}</strong>
                      </div>
                    </td>
                    <td>{formatDate(r.end_date)}</td>
                    <td><ExpiryTag endDate={r.end_date} /></td>
                    <td>
                      <span className={`badge ${statusMeta(r.status).cls}`}>
                        {r.status}
                      </span>
                    </td>
                    <td onClick={e => e.stopPropagation()}>
                      <div className="insurance-table__actions">
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
        <div className="insurance-page__footer">
          Showing {filtered.length} of {records.length} policies
        </div>
      )}

      {/* ── Modal ─────────────────────────────────────────────────────── */}
      {modal.mode && (
        <InsuranceModal
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