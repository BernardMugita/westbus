import { useState, useEffect } from 'react'
import { 
  HiBanknotes, 
  HiCheckCircle, 
  HiXCircle, 
  HiMagnifyingGlass, 
  HiXMark, 
  HiEye, 
  HiPencilSquare, 
  HiPlus, 
  HiTrash,
  HiBuildingLibrary,
  HiCalendarDays,
  HiTruck
} from 'react-icons/hi2'
import { useLoanStore } from './loanStore'
import { useVehicleStore } from '../vehicles/vehicleStore'
import { useAuthStore } from '../auth/authStore'
import type { LoanRecord, LoanStatus } from '../../types/loan'
import './Loans.scss'

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

function statusMeta(status: LoanStatus) {
  return {
    Active:    { label: 'Active',    cls: 'badge--success', icon: <HiCheckCircle /> },
    Paid:      { label: 'Paid',      cls: 'badge--neutral', icon: <HiCheckCircle /> },
    Defaulted: { label: 'Defaulted', cls: 'badge--danger',  icon: <HiXCircle /> },
  }[status]
}

// ─── Empty form state ─────────────────────────────────────────────────────────

const EMPTY_FORM = {
  vehicle_id: '',
  lender: '',
  principal_amount: '',
  interest_rate: '',
  total_payable: '',
  start_date: '',
  end_date: '',
  monthly_installment: '',
  status: 'Active' as LoanStatus,
}

// ─── Modal ────────────────────────────────────────────────────────────────────

interface ModalProps {
  mode: ModalMode
  record: LoanRecord | null
  onClose: () => void
  onSave: (data: any) => void
  onDelete: (id: string) => void
  isLoading: boolean
}

function LoanModal({ mode, record, onClose, onSave, onDelete, isLoading }: ModalProps) {
  const { vehicles } = useVehicleStore()

  const [form, setForm] = useState(
    mode === 'edit' && record
      ? {
          vehicle_id: record.vehicle_id,
          lender: record.lender,
          principal_amount: String(record.principal_amount),
          interest_rate: String(record.interest_rate),
          total_payable: String(record.total_payable),
          start_date: record.start_date.split('T')[0],
          end_date: record.end_date.split('T')[0],
          monthly_installment: String(record.monthly_installment),
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
      principal_amount: Number(form.principal_amount),
      interest_rate: Number(form.interest_rate),
      total_payable: Number(form.total_payable),
      monthly_installment: Number(form.monthly_installment),
      start_date: new Date(form.start_date).toISOString(),
      end_date: new Date(form.end_date).toISOString(),
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
            <HiBanknotes className="modal__header-icon" size={24} />
            <div>
              <h2 className="modal__title">
                {mode === 'add'  && 'New Loan Agreement'}
                {mode === 'edit' && 'Edit Loan Details'}
                {mode === 'view' && `Loan Information`}
              </h2>
              <p className="modal__subtitle">
                {mode === 'add'  && 'Record a new financing agreement'}
                {mode === 'edit' && `Editing Loan ID: ${record?.loan_id.slice(0, 8)}`}
                {mode === 'view' && `Loan ID: ${record?.loan_id}`}
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
              {/* Status banner */}
              <div className={`loan-status-banner loan-status-banner--${record.status.toLowerCase()}`}>
                <span className={`badge ${statusMeta(record.status).cls}`}>
                  {statusMeta(record.status).label}
                </span>
                <span style={{ fontSize: '13px', color: 'var(--color-grey-500)' }}>
                   Agreement from {formatDate(record.start_date)} to {formatDate(record.end_date)}
                </span>
              </div>

              {/* Detail grid */}
              <div className="detail-grid">
                {[
                  { label: 'Vehicle',            value: selectedVehicle?.registration_number || record.vehicle_id },
                  { label: 'Lender',             value: record.lender },
                  { label: 'Principal',          value: formatCurrency(record.principal_amount) },
                  { label: 'Interest Rate',      value: `${record.interest_rate}%` },
                  { label: 'Total Payable',      value: formatCurrency(record.total_payable) },
                  { label: 'Monthly Repayment',  value: formatCurrency(record.monthly_installment) },
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
            <form className="loan-form" onSubmit={handleSubmit} id="loan-form">
              <div className="loan-form__section-label">Financing Information</div>

              <div className="loan-form__row">
                <div className="loan-form__field">
                  <label className="loan-form__label">Vehicle *</label>
                  <select
                    className="loan-form__input loan-form__select"
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
                <div className="loan-form__field">
                  <label className="loan-form__label">Lender / Bank *</label>
                  <input
                    className="loan-form__input"
                    placeholder="e.g. Equity Bank"
                    value={form.lender}
                    onChange={e => handleChange('lender', e.target.value)}
                    required
                    disabled={isLoading}
                  />
                </div>
              </div>

              <div className="loan-form__row">
                <div className="loan-form__field">
                  <label className="loan-form__label">Principal Amount *</label>
                  <input
                    className="loan-form__input"
                    type="number"
                    placeholder="0.00"
                    value={form.principal_amount}
                    onChange={e => handleChange('principal_amount', e.target.value)}
                    required
                    disabled={isLoading}
                  />
                </div>
                <div className="loan-form__field">
                  <label className="loan-form__label">Interest Rate (%) *</label>
                  <input
                    className="loan-form__input"
                    type="number"
                    step="0.01"
                    placeholder="0.00"
                    value={form.interest_rate}
                    onChange={e => handleChange('interest_rate', e.target.value)}
                    required
                    disabled={isLoading}
                  />
                </div>
              </div>

              <div className="loan-form__row">
                <div className="loan-form__field">
                  <label className="loan-form__label">Total Payable *</label>
                  <input
                    className="loan-form__input"
                    type="number"
                    placeholder="0.00"
                    value={form.total_payable}
                    onChange={e => handleChange('total_payable', e.target.value)}
                    required
                    disabled={isLoading}
                  />
                </div>
                <div className="loan-form__field">
                  <label className="loan-form__label">Monthly Installment *</label>
                  <input
                    className="loan-form__input"
                    type="number"
                    placeholder="0.00"
                    value={form.monthly_installment}
                    onChange={e => handleChange('monthly_installment', e.target.value)}
                    required
                    disabled={isLoading}
                  />
                </div>
              </div>

              <div className="loan-form__row">
                <div className="loan-form__field">
                  <label className="loan-form__label">Start Date *</label>
                  <input
                    className="loan-form__input"
                    type="date"
                    value={form.start_date}
                    onChange={e => handleChange('start_date', e.target.value)}
                    required
                    disabled={isLoading}
                  />
                </div>
                <div className="loan-form__field">
                  <label className="loan-form__label">End Date *</label>
                  <input
                    className="loan-form__input"
                    type="date"
                    value={form.end_date}
                    onChange={e => handleChange('end_date', e.target.value)}
                    required
                    disabled={isLoading}
                  />
                </div>
              </div>

              <div className="loan-form__field">
                <label className="loan-form__label">Loan Status</label>
                <select
                  className="loan-form__input loan-form__select"
                  value={form.status}
                  onChange={e => handleChange('status', e.target.value)}
                  disabled={isLoading}
                >
                  <option value="Active">Active</option>
                  <option value="Paid">Paid</option>
                  <option value="Defaulted">Defaulted</option>
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
                  <button className="btn btn--danger" onClick={() => onDelete(record.loan_id)} disabled={isLoading}>
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
              <button className="btn btn--primary" type="submit" form="loan-form" disabled={isLoading}>
                {isLoading ? 'Saving...' : (mode === 'add' ? <HiPlus /> : '')} 
                {!isLoading && (mode === 'add' ? ' Record Loan' : ' Save Changes')}
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  )
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function Loans() {
  const { records, isLoading, error, fetchRecords, addRecord, updateRecord, removeRecord } = useLoanStore()
  const { fetchVehicles, vehicles } = useVehicleStore()
  const { token } = useAuthStore()
  
  const [modal, setModal] = useState<{ mode: ModalMode; record: LoanRecord | null }>({
    mode: null, record: null,
  })
  const [search, setSearch] = useState('')
  const [filterStatus, setFilterStatus] = useState<LoanStatus | 'ALL'>('ALL')
  const [loaded] = useState(true)

  useEffect(() => {
    if (token) {
      fetchRecords(token)
      fetchVehicles(token)
    }
  }, [token, fetchRecords, fetchVehicles])

  const filtered = records.filter(r => {
    const vehicle = vehicles.find(v => v.vehicle_id === r.vehicle_id)
    const searchStr = `${vehicle?.registration_number} ${r.lender}`.toLowerCase()
    const matchSearch = searchStr.includes(search.toLowerCase())
    const matchStatus = filterStatus === 'ALL' || r.status === filterStatus
    return matchSearch && matchStatus
  })

  const openModal = (mode: ModalMode, record: LoanRecord | null = null) =>
    setModal({ mode, record })
  const closeModal = () => setModal({ mode: null, record: null })

  const handleSave = async (data: any) => {
    if (!token) return
    
    let res;
    if (modal.mode === 'add') {
      res = await addRecord(data, token)
    } else if (modal.mode === 'edit' && modal.record) {
      res = await updateRecord(modal.record.loan_id, data, token)
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
  const totalPrincipal = records.reduce((acc, r) => acc + r.principal_amount, 0)
  const totalPayable   = records.reduce((acc, r) => acc + r.total_payable, 0)
  const activeCount    = records.filter(r => r.status === 'Active').length
  const totalMonthly   = records.filter(r => r.status === 'Active').reduce((acc, r) => acc + r.monthly_installment, 0)

  return (
    <div className={`loans-page ${loaded ? 'loans-page--loaded' : ''}`}>

      {/* ── Page header ───────────────────────────────────────────────── */}
      <div className="loans-page__header">
        <div>
          <h2 className="loans-page__title">Asset Financing</h2>
          <p className="loans-page__sub">Manage vehicle loans and repayment schedules — {records.length} agreements</p>
        </div>
        <button className="btn btn--primary" onClick={() => openModal('add')}>
          <HiPlus /> New Loan
        </button>
      </div>

      {/* ── Summary strip ─────────────────────────────────────────────── */}
      <div className="loans-page__summary">
        {[
          { label: 'Total Financing', value: formatCurrency(totalPrincipal), cls: 'sum--orange', icon: <HiBanknotes /> },
          { label: 'Total Payable',   value: formatCurrency(totalPayable),   cls: '',             icon: <HiBuildingLibrary /> },
          { label: 'Active Loans',    value: activeCount,                   cls: 'sum--green',   icon: <HiTruck /> },
          { label: 'Monthly Obligation', value: formatCurrency(totalMonthly), cls: 'sum--grey',    icon: <HiCalendarDays /> },
        ].map((s, i) => (
          <div key={s.label} className={`sum-chip ${s.cls}`} style={{ animationDelay: `${i * 60}ms` }}>
            <span className="sum-chip__icon">{s.icon}</span>
            <span className="sum-chip__value">{s.value}</span>
            <span className="sum-chip__label">{s.label}</span>
          </div>
        ))}
      </div>

      {/* ── Controls ──────────────────────────────────────────────────── */}
      <div className="loans-page__controls">
        <div className="search-box">
          <HiMagnifyingGlass className="search-box__icon" />
          <input
            className="search-box__input"
            placeholder="Search by vehicle or lender..."
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
          {search && (
            <button className="search-box__clear" onClick={() => setSearch('')}><HiXMark /></button>
          )}
        </div>

        <div className="filter-tabs">
          {(['ALL', 'Active', 'Paid', 'Defaulted'] as const).map(s => (
            <button
              key={s}
              className={`filter-tab ${filterStatus === s ? 'filter-tab--active' : ''}`}
              onClick={() => setFilterStatus(s)}
            >
              {s === 'ALL' ? 'All Agreements' : s}
            </button>
          ))}
        </div>
      </div>

      {/* ── Error State ────────────────────────────────────────────────── */}
      {error && (
        <div className="loans-error">
          <p>Error: {error}</p>
          <button className="btn btn--outline" onClick={() => token && fetchRecords(token)}>Retry</button>
        </div>
      )}

      {/* ── Table ─────────────────────────────────────────────────────── */}
      <div className="loans-table-wrap">
        {isLoading && records.length === 0 ? (
          <div className="loans-loading">
            <div className="spinner" />
            <p>Loading agreements...</p>
          </div>
        ) : filtered.length === 0 ? (
          <div className="loans-empty">
            <HiBanknotes size={48} color="#ddd" />
            <p>{search ? 'No agreements match your search' : 'No financing records found'}</p>
          </div>
        ) : (
          <table className="loans-table">
            <thead>
              <tr>
                <th>#</th>
                <th>Vehicle</th>
                <th>Lender</th>
                <th>Principal</th>
                <th>Total Payable</th>
                <th>Monthly</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((r, i) => {
                const vehicle = vehicles.find(v => v.vehicle_id === r.vehicle_id)
                return (
                  <tr
                    key={r.loan_id}
                    className="loans-table__row"
                    style={{ animationDelay: `${i * 40}ms` }}
                    onClick={() => openModal('view', r)}
                  >
                    <td className="loans-table__num">{i + 1}</td>
                    <td>
                       <div className="loans-table__vehicle">
                          <strong>{vehicle?.registration_number || '—'}</strong>
                          <span>{vehicle?.model}</span>
                       </div>
                    </td>
                    <td className="loans-table__lender">{r.lender}</td>
                    <td>{formatCurrency(r.principal_amount)}</td>
                    <td>{formatCurrency(r.total_payable)}</td>
                    <td>
                       <div className="loans-table__monthly">
                          <strong>{formatCurrency(r.monthly_installment)}</strong>
                       </div>
                    </td>
                    <td>
                      <span className={`badge ${statusMeta(r.status).cls}`}>
                        {r.status}
                      </span>
                    </td>
                    <td onClick={e => e.stopPropagation()}>
                      <div className="loans-table__actions">
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
        <div className="loans-page__footer">
          Showing {filtered.length} of {records.length} agreements
        </div>
      )}

      {/* ── Modals ────────────────────────────────────────────────────── */}
      {modal.mode && (
        <LoanModal
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
