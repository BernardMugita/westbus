import { useState, useEffect } from 'react'
import { 
  HiBanknotes, 
  HiCheckCircle,
  HiMagnifyingGlass, 
  HiXMark, 
  HiEye, 
  HiPencilSquare, 
  HiPlus, 
  HiTrash,
  HiClock,
  HiUser
} from 'react-icons/hi2'
import { useRevenueStore } from './revenueStore'
import { useTripStore } from '../trips/tripStore'
import { useVehicleStore } from '../vehicles/vehicleStore'
import { useRouteStore } from '../routes/routeStore'
import { useAuthStore } from '../auth/authStore'
import type { RevenueRecord, RevenueSource, RevenueType } from '../../types/revenue'
import './Revenue.scss'

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

// ─── Empty form state ─────────────────────────────────────────────────────────

const EMPTY_FORM = {
  trip_id: '',
  revenue_source: 'Manual' as RevenueSource,
  amount: '',
  revenue_type: 'Ticket' as RevenueType,
  recorded_at: new Date().toISOString().slice(0, 16),
  recorded_by: '',
  notes: '',
}

// ─── Modal ────────────────────────────────────────────────────────────────────

interface ModalProps {
  mode: ModalMode
  record: RevenueRecord | null
  onClose: () => void
  onSave: (data: any) => void
  onDelete: (id: string) => void
  isLoading: boolean
}

function RevenueModal({ mode, record, onClose, onSave, onDelete, isLoading }: ModalProps) {
  const { trips } = useTripStore()
  const { vehicles } = useVehicleStore()
  const { routes } = useRouteStore()

  const [form, setForm] = useState(
    mode === 'edit' && record
      ? {
          trip_id: record.trip_id,
          revenue_source: record.revenue_source,
          amount: String(record.amount),
          revenue_type: record.revenue_type,
          recorded_at: record.recorded_at.slice(0, 16),
          recorded_by: record.recorded_by ?? '',
          notes: record.notes ?? '',
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
      amount: Number(form.amount),
      recorded_at: new Date(form.recorded_at).toISOString(),
    })
  }

  const selectedTrip = trips.find(t => t.trip_id === record?.trip_id)
  const tripVehicle = selectedTrip ? vehicles.find(v => v.vehicle_id === selectedTrip.vehicle_id) : null
  const tripRoute = selectedTrip ? routes.find(r => r.route_id === selectedTrip.route_id) : null

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div
        className={`modal modal--${mode}`}
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="modal__header">
          <div className="modal__header-left">
            <HiBanknotes className="modal__header-icon" size={24} />
            <div>
              <h2 className="modal__title">
                {mode === 'add'  && 'Record Revenue'}
                {mode === 'edit' && 'Edit Revenue Entry'}
                {mode === 'view' && `Revenue Details`}
              </h2>
              <p className="modal__subtitle">
                {mode === 'add'  && 'Add a new transaction to the ledger'}
                {mode === 'edit' && `Editing Entry: ${record?.revenue_id.slice(0, 8)}`}
                {mode === 'view' && `Entry ID: ${record?.revenue_id}`}
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
              {/* Detail grid */}
              <div className="detail-grid">
                {[
                  { label: 'Amount',             value: formatCurrency(record.amount) },
                  { label: 'Source',             value: record.revenue_source },
                  { label: 'Type',               value: record.revenue_type },
                  { label: 'Trip',               value: tripRoute ? `${tripRoute.route_name} (${tripVehicle?.registration_number})` : record.trip_id },
                  { label: 'Recorded At',        value: formatDate(record.recorded_at) },
                  { label: 'Recorded By',        value: record.recorded_by || '—' },
                ].map(item => (
                  <div key={item.label} className="detail-grid__item">
                    <span className="detail-grid__label">{item.label}</span>
                    <span className="detail-grid__value">{item.value}</span>
                  </div>
                ))}
              </div>

              <div className="notes-view">
                <span className="detail-grid__label">Notes</span>
                <p className="notes-view__content">{record.notes || 'No notes added'}</p>
              </div>
            </>
          )}

          {/* ADD / EDIT mode */}
          {!isView && (
            <form className="revenue-form" onSubmit={handleSubmit} id="revenue-form">
              <div className="revenue-form__section-label">Transaction Details</div>

              <div className="revenue-form__row">
                <div className="revenue-form__field">
                  <label className="revenue-form__label">Trip *</label>
                  <select
                    className="revenue-form__input revenue-form__select"
                    value={form.trip_id}
                    onChange={e => handleChange('trip_id', e.target.value)}
                    required
                    disabled={isLoading}
                  >
                    <option value="">Select Trip</option>
                    {trips.map(t => {
                      const v = vehicles.find(veh => veh.vehicle_id === t.vehicle_id)
                      const r = routes.find(rot => rot.route_id === t.route_id)
                      return (
                        <option key={t.trip_id} value={t.trip_id}>
                          {v?.registration_number} - {r?.route_name} ({new Date(t.start_time).toLocaleDateString()})
                        </option>
                      )
                    })}
                  </select>
                </div>
                <div className="revenue-form__field">
                  <label className="revenue-form__label">Amount (KES) *</label>
                  <input
                    className="revenue-form__input"
                    type="number"
                    step="0.01"
                    placeholder="0.00"
                    value={form.amount}
                    onChange={e => handleChange('amount', e.target.value)}
                    required
                    disabled={isLoading}
                  />
                </div>
              </div>

              <div className="revenue-form__row">
                <div className="revenue-form__field">
                  <label className="revenue-form__label">Revenue Source *</label>
                  <select
                    className="revenue-form__input revenue-form__select"
                    value={form.revenue_source}
                    onChange={e => handleChange('revenue_source', e.target.value)}
                    required
                    disabled={isLoading}
                  >
                    <option value="Booking">Booking</option>
                    <option value="Manual">Manual</option>
                    <option value="Adjustment">Adjustment</option>
                    <option value="Refund">Refund</option>
                  </select>
                </div>
                <div className="revenue-form__field">
                  <label className="revenue-form__label">Revenue Type *</label>
                  <select
                    className="revenue-form__input revenue-form__select"
                    value={form.revenue_type}
                    onChange={e => handleChange('revenue_type', e.target.value)}
                    required
                    disabled={isLoading}
                  >
                    <option value="Ticket">Ticket</option>
                    <option value="Charter">Charter</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
              </div>

              <div className="revenue-form__row">
                <div className="revenue-form__field">
                  <label className="revenue-form__label">Recorded At</label>
                  <input
                    className="revenue-form__input"
                    type="datetime-local"
                    value={form.recorded_at}
                    onChange={e => handleChange('recorded_at', e.target.value)}
                    disabled={isLoading}
                  />
                </div>
                <div className="revenue-form__field">
                  <label className="revenue-form__label">Recorded By</label>
                  <input
                    className="revenue-form__input"
                    placeholder="Enter name"
                    value={form.recorded_by}
                    onChange={e => handleChange('recorded_by', e.target.value)}
                    disabled={isLoading}
                  />
                </div>
              </div>

              <div className="revenue-form__field">
                <label className="revenue-form__label">Notes</label>
                <textarea
                  className="revenue-form__input revenue-form__textarea"
                  placeholder="Additional details..."
                  value={form.notes}
                  onChange={e => handleChange('notes', e.target.value)}
                  disabled={isLoading}
                />
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
                  <span>Are you sure? This cannot be undone.</span>
                  <button className="btn btn--danger" onClick={() => onDelete(record.revenue_id)} disabled={isLoading}>
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
              <button className="btn btn--primary" type="submit" form="revenue-form" disabled={isLoading}>
                {isLoading ? 'Saving...' : (mode === 'add' ? <HiPlus /> : '')} 
                {!isLoading && (mode === 'add' ? ' Save Entry' : ' Save Changes')}
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  )
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function Revenue() {
  const { records, isLoading, error, fetchRecords, addRecord, updateRecord, removeRecord } = useRevenueStore()
  const { fetchTrips, trips } = useTripStore()
  const { fetchVehicles, vehicles } = useVehicleStore()
  const { fetchRoutes, routes } = useRouteStore()
  const { token } = useAuthStore()
  
  const [modal, setModal] = useState<{ mode: ModalMode; record: RevenueRecord | null }>({
    mode: null, record: null,
  })
  const [search, setSearch] = useState('')
  const [filterSource, setFilterSource] = useState<RevenueSource | 'ALL'>('ALL')
  const [loaded] = useState(true)

  useEffect(() => {
    if (token) {
      fetchRecords(token)
      fetchTrips(token)
      fetchVehicles(token)
      fetchRoutes(token)
    }
  }, [token, fetchRecords, fetchTrips, fetchVehicles, fetchRoutes])

  const filtered = records.filter(r => {
    const trip = trips.find(t => t.trip_id === r.trip_id)
    const vehicle = trip ? vehicles.find(v => v.vehicle_id === trip.vehicle_id) : null
    const route = trip ? routes.find(rot => rot.route_id === trip.route_id) : null
    
    const searchStr = `${vehicle?.registration_number} ${route?.route_name} ${r.recorded_by} ${r.notes}`.toLowerCase()
    const matchSearch = searchStr.includes(search.toLowerCase())
    const matchSource = filterSource === 'ALL' || r.revenue_source === filterSource
    return matchSearch && matchSource
  })

  const openModal = (mode: ModalMode, record: RevenueRecord | null = null) =>
    setModal({ mode, record })
  const closeModal = () => setModal({ mode: null, record: null })

  const handleSave = async (data: any) => {
    if (!token) return
    
    let res;
    if (modal.mode === 'add') {
      res = await addRecord(data, token)
    } else if (modal.mode === 'edit' && modal.record) {
      res = await updateRecord(modal.record.revenue_id, data, token)
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
  const totalAmount = records.reduce((acc, r) => acc + (r.revenue_source === 'Refund' ? -r.amount : r.amount), 0)
  const totalEntries = records.length
  const bookingRev = records.filter(r => r.revenue_source === 'Booking').reduce((acc, r) => acc + r.amount, 0)
  const manualRev = records.filter(r => r.revenue_source === 'Manual').reduce((acc, r) => acc + r.amount, 0)

  return (
    <div className={`revenue-page ${loaded ? 'revenue-page--loaded' : ''}`}>

      {/* ── Page header ───────────────────────────────────────────────── */}
      <div className="revenue-page__header">
        <div>
          <h2 className="revenue-page__title">Revenue Ledger</h2>
          <p className="revenue-page__sub">Track all income and transactions — {totalEntries} entries</p>
        </div>
        <button className="btn btn--primary" onClick={() => openModal('add')}>
          <HiPlus /> Record Revenue
        </button>
      </div>

      {/* ── Summary strip ─────────────────────────────────────────────── */}
      <div className="revenue-page__summary">
        {[
          { label: 'Net Revenue', value: formatCurrency(totalAmount), cls: 'sum--green', icon: <HiBanknotes /> },
          { label: 'Booking Income', value: formatCurrency(bookingRev), cls: '', icon: <HiCheckCircle /> },
          { label: 'Manual/Other', value: formatCurrency(manualRev), cls: '', icon: <HiUser /> },
          { label: 'Total Entries', value: totalEntries, cls: 'sum--grey', icon: <HiClock /> },
        ].map((s, i) => (
          <div key={s.label} className={`sum-chip ${s.cls}`} style={{ animationDelay: `${i * 60}ms` }}>
            <span className="sum-chip__icon">{s.icon}</span>
            <span className="sum-chip__value">{s.value}</span>
            <span className="sum-chip__label">{s.label}</span>
          </div>
        ))}
      </div>

      {/* ── Controls ──────────────────────────────────────────────────── */}
      <div className="revenue-page__controls">
        <div className="search-box">
          <HiMagnifyingGlass className="search-box__icon" />
          <input
            className="search-box__input"
            placeholder="Search by vehicle, route, or notes..."
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
          {search && (
            <button className="search-box__clear" onClick={() => setSearch('')}><HiXMark /></button>
          )}
        </div>

        <div className="filter-tabs">
          {(['ALL', 'Booking', 'Manual', 'Adjustment', 'Refund'] as const).map(s => (
            <button
              key={s}
              className={`filter-tab ${filterSource === s ? 'filter-tab--active' : ''}`}
              onClick={() => setFilterSource(s)}
            >
              {s === 'ALL' ? 'All' : s}
            </button>
          ))}
        </div>
      </div>

      {/* ── Error State ────────────────────────────────────────────────── */}
      {error && (
        <div className="revenue-error">
          <p>Error: {error}</p>
          <button className="btn btn--outline" onClick={() => token && fetchRecords(token)}>Retry</button>
        </div>
      )}

      {/* ── Table ─────────────────────────────────────────────────────── */}
      <div className="revenue-table-wrap">
        {isLoading && records.length === 0 ? (
          <div className="revenue-loading">
            <div className="spinner" />
            <p>Loading ledger...</p>
          </div>
        ) : filtered.length === 0 ? (
          <div className="revenue-empty">
            <HiBanknotes size={48} color="#ddd" />
            <p>{search ? 'No records match your search' : 'No revenue recorded yet'}</p>
          </div>
        ) : (
          <table className="revenue-table">
            <thead>
              <tr>
                <th>#</th>
                <th>Trip Details</th>
                <th>Amount</th>
                <th>Source</th>
                <th>Type</th>
                <th>Recorded By</th>
                <th>Date</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((r, i) => {
                const trip = trips.find(t => t.trip_id === r.trip_id)
                const vehicle = trip ? vehicles.find(v => v.vehicle_id === trip.vehicle_id) : null
                const route = trip ? routes.find(rot => rot.route_id === trip.route_id) : null
                return (
                  <tr
                    key={r.revenue_id}
                    className="revenue-table__row"
                    style={{ animationDelay: `${i * 40}ms` }}
                    onClick={() => openModal('view', r)}
                  >
                    <td className="revenue-table__num">{i + 1}</td>
                    <td>
                      <div className="revenue-table__trip">
                        <strong>{route?.route_name || '—'}</strong>
                        <span>{vehicle?.registration_number}</span>
                      </div>
                    </td>
                    <td>
                      <span className={`revenue-table__amount ${r.revenue_source === 'Refund' ? 'revenue-table__amount--neg' : ''}`}>
                        {formatCurrency(r.amount)}
                      </span>
                    </td>
                    <td>
                      <span className={`badge ${r.revenue_source === 'Refund' ? 'badge--danger' : 'badge--neutral'}`}>
                        {r.revenue_source}
                      </span>
                    </td>
                    <td>{r.revenue_type}</td>
                    <td>{r.recorded_by || '—'}</td>
                    <td className="revenue-table__date">{formatDate(r.recorded_at)}</td>
                    <td onClick={e => e.stopPropagation()}>
                      <div className="revenue-table__actions">
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
        <div className="revenue-page__footer">
          Showing {filtered.length} of {totalEntries} entries
        </div>
      )}

      {/* ── Modals ────────────────────────────────────────────────────── */}
      {modal.mode && (
        <RevenueModal
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
