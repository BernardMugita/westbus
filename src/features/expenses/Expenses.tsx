import { useState, useEffect } from 'react'
import { 
  HiReceiptRefund, 
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
  HiWrenchScrewdriver,
  HiTicket
} from 'react-icons/hi2'
import { useExpenseStore } from './expenseStore'
import { useTripStore } from '../trips/tripStore'
import { useVehicleStore } from '../vehicles/vehicleStore'
import { useRouteStore } from '../routes/routeStore'
import { useAuthStore } from '../auth/authStore'
import type { ExpenseRecord, ExpenseType } from '../../types/expense'
import './Expenses.scss'

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
  type: 'Fuel' as ExpenseType,
  amount: '',
  receipt_image: '',
  incident_type: '',
}

// ─── Modal ────────────────────────────────────────────────────────────────────

interface ModalProps {
  mode: ModalMode
  record: ExpenseRecord | null
  onClose: () => void
  onSave: (data: any) => void
  onDelete: (id: string) => void
  isLoading: boolean
}

function ExpenseModal({ mode, record, onClose, onSave, onDelete, isLoading }: ModalProps) {
  const { trips } = useTripStore()
  const { vehicles } = useVehicleStore()
  const { routes } = useRouteStore()

  const [form, setForm] = useState(
    mode === 'edit' && record
      ? {
          trip_id: record.trip_id,
          type: record.type,
          amount: String(record.amount),
          receipt_image: record.receipt_image ?? '',
          incident_type: record.incident_type ?? '',
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
            <HiReceiptRefund className="modal__header-icon" size={24} />
            <div>
              <h2 className="modal__title">
                {mode === 'add'  && 'Record Expense'}
                {mode === 'edit' && 'Edit Expense Entry'}
                {mode === 'view' && `Expense Details`}
              </h2>
              <p className="modal__subtitle">
                {mode === 'add'  && 'Add a new expense to the ledger'}
                {mode === 'edit' && `Editing Entry: ${record?.expense_id.slice(0, 8)}`}
                {mode === 'view' && `Entry ID: ${record?.expense_id}`}
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
                  { label: 'Type',               value: record.type },
                  { label: 'Trip',               value: tripRoute ? `${tripRoute.route_name} (${tripVehicle?.registration_number})` : record.trip_id },
                  { label: 'Incident Type',      value: record.incident_type || '—' },
                  { label: 'Recorded At',        value: formatDate(record.created_at) },
                ].map(item => (
                  <div key={item.label} className="detail-grid__item">
                    <span className="detail-grid__label">{item.label}</span>
                    <span className="detail-grid__value">{item.value}</span>
                  </div>
                ))}
              </div>

              {record.receipt_image && (
                <div className="receipt-view">
                   <span className="detail-grid__label">Receipt Image</span>
                   <div className="receipt-image-wrap">
                      <img src={record.receipt_image} alt="Receipt" />
                   </div>
                </div>
              )}
            </>
          )}

          {/* ADD / EDIT mode */}
          {!isView && (
            <form className="expense-form" onSubmit={handleSubmit} id="expense-form">
              <div className="expense-form__section-label">Expense Details</div>

              <div className="expense-form__row">
                <div className="expense-form__field">
                  <label className="expense-form__label">Trip *</label>
                  <select
                    className="expense-form__input expense-form__select"
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
                <div className="expense-form__field">
                  <label className="expense-form__label">Amount (KES) *</label>
                  <input
                    className="expense-form__input"
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

              <div className="expense-form__row">
                <div className="expense-form__field">
                  <label className="expense-form__label">Expense Type *</label>
                  <select
                    className="expense-form__input expense-form__select"
                    value={form.type}
                    onChange={e => handleChange('type', e.target.value)}
                    required
                    disabled={isLoading}
                  >
                    <option value="Fuel">Fuel</option>
                    <option value="Toll">Toll</option>
                    <option value="Maintenance">Maintenance</option>
                    <option value="Food">Food</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
                <div className="expense-form__field">
                  <label className="expense-form__label">Incident Type</label>
                  <input
                    className="expense-form__input"
                    placeholder="e.g. Breakdown, Fine"
                    value={form.incident_type}
                    onChange={e => handleChange('incident_type', e.target.value)}
                    disabled={isLoading}
                  />
                </div>
              </div>

              <div className="expense-form__field">
                <label className="expense-form__label">Receipt Image URL</label>
                <input
                  className="expense-form__input"
                  placeholder="https://..."
                  value={form.receipt_image}
                  onChange={e => handleChange('receipt_image', e.target.value)}
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
                  <button className="btn btn--danger" onClick={() => onDelete(record.expense_id)} disabled={isLoading}>
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
              <button className="btn btn--primary" type="submit" form="expense-form" disabled={isLoading}>
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

export default function Expenses() {
  const { records, isLoading, error, fetchRecords, addRecord, updateRecord, removeRecord } = useExpenseStore()
  const { fetchTrips, trips } = useTripStore()
  const { fetchVehicles, vehicles } = useVehicleStore()
  const { fetchRoutes, routes } = useRouteStore()
  const { token } = useAuthStore()
  
  const [modal, setModal] = useState<{ mode: ModalMode; record: ExpenseRecord | null }>({
    mode: null, record: null,
  })
  const [search, setSearch] = useState('')
  const [filterType, setFilterType] = useState<ExpenseType | 'ALL'>('ALL')
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
    
    const searchStr = `${vehicle?.registration_number} ${route?.route_name} ${r.incident_type}`.toLowerCase()
    const matchSearch = searchStr.includes(search.toLowerCase())
    const matchType = filterType === 'ALL' || r.type === filterType
    return matchSearch && matchType
  })

  const openModal = (mode: ModalMode, record: ExpenseRecord | null = null) =>
    setModal({ mode, record })
  const closeModal = () => setModal({ mode: null, record: null })

  const handleSave = async (data: any) => {
    if (!token) return
    
    let res;
    if (modal.mode === 'add') {
      res = await addRecord(data, token)
    } else if (modal.mode === 'edit' && modal.record) {
      res = await updateRecord(modal.record.expense_id, data, token)
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
  const totalAmount = records.reduce((acc, r) => acc + r.amount, 0)
  const fuelExp = records.filter(r => r.type === 'Fuel').reduce((acc, r) => acc + r.amount, 0)
  const maintenanceExp = records.filter(r => r.type === 'Maintenance').reduce((acc, r) => acc + r.amount, 0)
  const otherExp = records.filter(r => r.type !== 'Fuel' && r.type !== 'Maintenance').reduce((acc, r) => acc + r.amount, 0)

  return (
    <div className={`expenses-page ${loaded ? 'expenses-page--loaded' : ''}`}>

      {/* ── Page header ───────────────────────────────────────────────── */}
      <div className="expenses-page__header">
        <div>
          <h2 className="expenses-page__title">Expense Ledger</h2>
          <p className="expenses-page__sub">Track all fleet and operational costs — {records.length} entries</p>
        </div>
        <button className="btn btn--primary" onClick={() => openModal('add')}>
          <HiPlus /> Record Expense
        </button>
      </div>

      {/* ── Summary strip ─────────────────────────────────────────────── */}
      <div className="expenses-page__summary">
        {[
          { label: 'Total Expenses', value: formatCurrency(totalAmount), cls: 'sum--orange', icon: <HiReceiptRefund /> },
          { label: 'Fuel Costs', value: formatCurrency(fuelExp), cls: '', icon: <HiTruck /> },
          { label: 'Maintenance', value: formatCurrency(maintenanceExp), cls: '', icon: <HiWrenchScrewdriver /> },
          { label: 'Others', value: formatCurrency(otherExp), cls: 'sum--grey', icon: <HiClock /> },
        ].map((s, i) => (
          <div key={s.label} className={`sum-chip ${s.cls}`} style={{ animationDelay: `${i * 60}ms` }}>
            <span className="sum-chip__icon">{s.icon}</span>
            <span className="sum-chip__value">{s.value}</span>
            <span className="sum-chip__label">{s.label}</span>
          </div>
        ))}
      </div>

      {/* ── Controls ──────────────────────────────────────────────────── */}
      <div className="expenses-page__controls">
        <div className="search-box">
          <HiMagnifyingGlass className="search-box__icon" />
          <input
            className="search-box__input"
            placeholder="Search by vehicle, route, or incident..."
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
          {search && (
            <button className="search-box__clear" onClick={() => setSearch('')}><HiXMark /></button>
          )}
        </div>

        <div className="filter-tabs">
          {(['ALL', 'Fuel', 'Toll', 'Maintenance', 'Food', 'Other'] as const).map(s => (
            <button
              key={s}
              className={`filter-tab ${filterType === s ? 'filter-tab--active' : ''}`}
              onClick={() => setFilterType(s)}
            >
              {s === 'ALL' ? 'All' : s}
            </button>
          ))}
        </div>
      </div>

      {/* ── Error State ────────────────────────────────────────────────── */}
      {error && (
        <div className="expenses-error">
          <p>Error: {error}</p>
          <button className="btn btn--outline" onClick={() => token && fetchRecords(token)}>Retry</button>
        </div>
      )}

      {/* ── Table ─────────────────────────────────────────────────────── */}
      <div className="expenses-table-wrap">
        {isLoading && records.length === 0 ? (
          <div className="expenses-loading">
            <div className="spinner" />
            <p>Loading expenses...</p>
          </div>
        ) : filtered.length === 0 ? (
          <div className="expenses-empty">
            <HiReceiptRefund size={48} color="#ddd" />
            <p>{search ? 'No records match your search' : 'No expenses recorded yet'}</p>
          </div>
        ) : (
          <table className="expenses-table">
            <thead>
              <tr>
                <th>#</th>
                <th>Trip Details</th>
                <th>Amount</th>
                <th>Type</th>
                <th>Incident</th>
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
                    key={r.expense_id}
                    className="expenses-table__row"
                    style={{ animationDelay: `${i * 40}ms` }}
                    onClick={() => openModal('view', r)}
                  >
                    <td className="expenses-table__num">{i + 1}</td>
                    <td>
                      <div className="expenses-table__trip">
                        <strong>{route?.route_name || '—'}</strong>
                        <span>{vehicle?.registration_number}</span>
                      </div>
                    </td>
                    <td>
                      <span className="expenses-table__amount">
                        {formatCurrency(r.amount)}
                      </span>
                    </td>
                    <td>
                      <span className="badge badge--neutral">
                        {r.type}
                      </span>
                    </td>
                    <td>{r.incident_type || '—'}</td>
                    <td className="expenses-table__date">{formatDate(r.created_at)}</td>
                    <td onClick={e => e.stopPropagation()}>
                      <div className="expenses-table__actions">
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
        <div className="expenses-page__footer">
          Showing {filtered.length} of {records.length} entries
        </div>
      )}

      {/* ── Modals ────────────────────────────────────────────────────── */}
      {modal.mode && (
        <ExpenseModal
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
