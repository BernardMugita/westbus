import { useState, useEffect } from 'react'
import { 
  HiCheckCircle, 
  HiMagnifyingGlass, 
  HiXMark, 
  HiEye, 
  HiPencilSquare, 
  HiPlus, 
  HiTrash,
  HiClock,
  HiCreditCard,
  HiIdentification,
  HiArrowTrendingDown
} from 'react-icons/hi2'
import { useLoanRepaymentStore } from './loanRepaymentStore'
import { useLoanStore } from '../loans/loanStore'
import { useVehicleStore } from '../vehicles/vehicleStore'
import { useAuthStore } from '../auth/authStore'
import type { LoanRepaymentRecord } from '../../types/loanRepayment'
import './LoanRepayments.scss'

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
  loan_id: '',
  payment_date: new Date().toISOString().split('T')[0],
  amount_paid: '',
  principal_portion: '',
  interest_portion: '',
  receipt_ref: '',
}

// ─── Modal ────────────────────────────────────────────────────────────────────

interface ModalProps {
  mode: ModalMode
  record: LoanRepaymentRecord | null
  onClose: () => void
  onSave: (data: any) => void
  onDelete: (id: string) => void
  isLoading: boolean
}

function LoanRepaymentModal({ mode, record, onClose, onSave, onDelete, isLoading }: ModalProps) {
  const { records: loans } = useLoanStore()
  const { vehicles } = useVehicleStore()

  const [form, setForm] = useState(
    mode === 'edit' && record
      ? {
          loan_id: record.loan_id,
          payment_date: record.payment_date.split('T')[0],
          amount_paid: String(record.amount_paid),
          principal_portion: String(record.principal_portion),
          interest_portion: String(record.interest_portion),
          receipt_ref: record.receipt_ref ?? '',
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
      amount_paid: Number(form.amount_paid),
      principal_portion: Number(form.principal_portion),
      interest_portion: Number(form.interest_portion),
      payment_date: new Date(form.payment_date).toISOString(),
    })
  }

  const selectedLoan = loans.find(l => l.loan_id === record?.loan_id)
  const loanVehicle = selectedLoan ? vehicles.find(v => v.vehicle_id === selectedLoan.vehicle_id) : null

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div
        className={`modal modal--${mode}`}
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="modal__header">
          <div className="modal__header-left">
            <HiCreditCard className="modal__header-icon" size={24} />
            <div>
              <h2 className="modal__title">
                {mode === 'add'  && 'Make Repayment'}
                {mode === 'edit' && 'Edit Repayment Record'}
                {mode === 'view' && `Repayment Details`}
              </h2>
              <p className="modal__subtitle">
                {mode === 'add'  && 'Record a new loan installment'}
                {mode === 'edit' && `Editing ID: ${record?.repayment_id.slice(0, 8)}`}
                {mode === 'view' && `Receipt Ref: ${record?.receipt_ref || 'N/A'}`}
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
                  { label: 'Amount Paid',         value: formatCurrency(record.amount_paid) },
                  { label: 'Principal Portion',   value: formatCurrency(record.principal_portion) },
                  { label: 'Interest Portion',    value: formatCurrency(record.interest_portion) },
                  { label: 'Payment Date',        value: formatDate(record.payment_date) },
                  { label: 'Vehicle',             value: loanVehicle?.registration_number || '—' },
                  { label: 'Lender',              value: selectedLoan?.lender || '—' },
                  { label: 'New Balance',         value: formatCurrency(record.outstanding_balance) },
                  { label: 'Receipt Reference',   value: record.receipt_ref || '—' },
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
            <form className="repayment-form" onSubmit={handleSubmit} id="repayment-form">
              <div className="repayment-form__section-label">Installment Details</div>

              <div className="repayment-form__field">
                <label className="repayment-form__label">Associated Loan *</label>
                <select
                  className="repayment-form__input repayment-form__select"
                  value={form.loan_id}
                  onChange={e => handleChange('loan_id', e.target.value)}
                  required
                  disabled={isLoading}
                >
                  <option value="">Select Loan Agreement</option>
                  {loans.map(l => {
                    const v = vehicles.find(veh => veh.vehicle_id === l.vehicle_id)
                    return (
                      <option key={l.loan_id} value={l.loan_id}>
                        {v?.registration_number} - {l.lender} ({formatCurrency(l.total_payable)} bal)
                      </option>
                    )
                  })}
                </select>
              </div>

              <div className="repayment-form__row">
                <div className="repayment-form__field">
                  <label className="repayment-form__label">Total Amount Paid *</label>
                  <input
                    className="repayment-form__input"
                    type="number"
                    placeholder="0.00"
                    value={form.amount_paid}
                    onChange={e => handleChange('amount_paid', e.target.value)}
                    required
                    disabled={isLoading}
                  />
                </div>
                <div className="repayment-form__field">
                  <label className="repayment-form__label">Payment Date *</label>
                  <input
                    className="repayment-form__input"
                    type="date"
                    value={form.payment_date}
                    onChange={e => handleChange('payment_date', e.target.value)}
                    required
                    disabled={isLoading}
                  />
                </div>
              </div>

              <div className="repayment-form__row">
                <div className="repayment-form__field">
                  <label className="repayment-form__label">Principal Portion *</label>
                  <input
                    className="repayment-form__input"
                    type="number"
                    placeholder="0.00"
                    value={form.principal_portion}
                    onChange={e => handleChange('principal_portion', e.target.value)}
                    required
                    disabled={isLoading}
                  />
                </div>
                <div className="repayment-form__field">
                  <label className="repayment-form__label">Interest Portion *</label>
                  <input
                    className="repayment-form__input"
                    type="number"
                    placeholder="0.00"
                    value={form.interest_portion}
                    onChange={e => handleChange('interest_portion', e.target.value)}
                    required
                    disabled={isLoading}
                  />
                </div>
              </div>

              <div className="repayment-form__field">
                <label className="repayment-form__label">Receipt Reference</label>
                <input
                  className="repayment-form__input"
                  placeholder="e.g. TRX-12345"
                  value={form.receipt_ref}
                  onChange={e => handleChange('receipt_ref', e.target.value)}
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
                  <span>Confirm deletion? This updates loan balance.</span>
                  <button className="btn btn--danger" onClick={() => onDelete(record.repayment_id)} disabled={isLoading}>
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
              <button className="btn btn--primary" type="submit" form="repayment-form" disabled={isLoading}>
                {isLoading ? 'Processing...' : (mode === 'add' ? <HiPlus /> : '')} 
                {!isLoading && (mode === 'add' ? ' Confirm Repayment' : ' Save Changes')}
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  )
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function LoanRepayments() {
  const { records, isLoading, error, fetchRecords, addRecord, updateRecord, removeRecord } = useLoanRepaymentStore()
  const { fetchRecords: fetchLoans, records: loans } = useLoanStore()
  const { fetchVehicles, vehicles } = useVehicleStore()
  const { token } = useAuthStore()
  
  const [modal, setModal] = useState<{ mode: ModalMode; record: LoanRepaymentRecord | null }>({
    mode: null, record: null,
  })
  const [search, setSearch] = useState('')
  const [loaded] = useState(true)

  useEffect(() => {
    if (token) {
      fetchRecords(token)
      fetchLoans(token)
      fetchVehicles(token)
    }
  }, [token, fetchRecords, fetchLoans, fetchVehicles])

  const filtered = records.filter(r => {
    const loan = loans.find(l => l.loan_id === r.loan_id)
    const vehicle = loan ? vehicles.find(v => v.vehicle_id === loan.vehicle_id) : null
    
    const searchStr = `${vehicle?.registration_number} ${loan?.lender} ${r.receipt_ref}`.toLowerCase()
    return searchStr.includes(search.toLowerCase())
  })

  const openModal = (mode: ModalMode, record: LoanRepaymentRecord | null = null) =>
    setModal({ mode, record })
  const closeModal = () => setModal({ mode: null, record: null })

  const handleSave = async (data: any) => {
    if (!token) return
    
    let res;
    if (modal.mode === 'add') {
      res = await addRecord(data, token)
    } else if (modal.mode === 'edit' && modal.record) {
      res = await updateRecord(modal.record.repayment_id, data, token)
    }
    
    if (res?.success) {
      closeModal()
      fetchLoans(token) // Refresh loans as balance changes
    } else {
      alert(res?.message || 'An error occurred')
    }
  }

  const handleDelete = async (id: string) => {
    if (!token) return
    const res = await removeRecord(id, token)
    if (res.success) {
      closeModal()
      fetchLoans(token)
    } else {
      alert(res.message)
    }
  }

  // Stats
  const totalPaid      = records.reduce((acc, r) => acc + r.amount_paid, 0)
  const principalTotal = records.reduce((acc, r) => acc + r.principal_portion, 0)
  const interestTotal  = records.reduce((acc, r) => acc + r.interest_portion, 0)
  const lastRepayment  = records[0]?.amount_paid || 0

  return (
    <div className={`repayments-page ${loaded ? 'repayments-page--loaded' : ''}`}>

      {/* ── Page header ───────────────────────────────────────────────── */}
      <div className="repayments-page__header">
        <div>
          <h2 className="repayments-page__title">Loan Repayments</h2>
          <p className="repayments-page__sub">Track all installments and outstanding balances — {records.length} records</p>
        </div>
        <button className="btn btn--primary" onClick={() => openModal('add')}>
          <HiPlus /> Make Repayment
        </button>
      </div>

      {/* ── Summary strip ─────────────────────────────────────────────── */}
      <div className="repayments-page__summary">
        {[
          { label: 'Total Repaid',   value: formatCurrency(totalPaid),   cls: 'sum--green', icon: <HiCheckCircle /> },
          { label: 'Principal Paid', value: formatCurrency(principalTotal), cls: '',           icon: <HiIdentification /> },
          { label: 'Interest Paid',  value: formatCurrency(interestTotal),  cls: 'sum--grey',    icon: <HiArrowTrendingDown /> },
          { label: 'Last Payment',   value: formatCurrency(lastRepayment), cls: 'sum--orange',  icon: <HiClock /> },
        ].map((s, i) => (
          <div key={s.label} className={`sum-chip ${s.cls}`} style={{ animationDelay: `${i * 60}ms` }}>
            <span className="sum-chip__icon">{s.icon}</span>
            <span className="sum-chip__value">{s.value}</span>
            <span className="sum-chip__label">{s.label}</span>
          </div>
        ))}
      </div>

      {/* ── Controls ──────────────────────────────────────────────────── */}
      <div className="repayments-page__controls">
        <div className="search-box">
          <HiMagnifyingGlass className="search-box__icon" />
          <input
            className="search-box__input"
            placeholder="Search by vehicle, lender, or reference..."
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
          {search && (
            <button className="search-box__clear" onClick={() => setSearch('')}><HiXMark /></button>
          )}
        </div>
      </div>

      {/* ── Error State ────────────────────────────────────────────────── */}
      {error && (
        <div className="repayments-error">
          <p>Error: {error}</p>
          <button className="btn btn--outline" onClick={() => token && fetchRecords(token)}>Retry</button>
        </div>
      )}

      {/* ── Table ─────────────────────────────────────────────────────── */}
      <div className="repayments-table-wrap">
        {isLoading && records.length === 0 ? (
          <div className="repayments-loading">
            <div className="spinner" />
            <p>Loading repayment history...</p>
          </div>
        ) : filtered.length === 0 ? (
          <div className="repayments-empty">
            <HiCreditCard size={48} color="#ddd" />
            <p>{search ? 'No matches for your search' : 'No repayments recorded yet'}</p>
          </div>
        ) : (
          <table className="repayments-table">
            <thead>
              <tr>
                <th>#</th>
                <th>Vehicle & Lender</th>
                <th>Amount Paid</th>
                <th>Principal / Int</th>
                <th>New Balance</th>
                <th>Reference</th>
                <th>Date</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((r, i) => {
                const loan = loans.find(l => l.loan_id === r.loan_id)
                const vehicle = loan ? vehicles.find(v => v.vehicle_id === loan.vehicle_id) : null
                return (
                  <tr
                    key={r.repayment_id}
                    className="repayments-table__row"
                    style={{ animationDelay: `${i * 40}ms` }}
                    onClick={() => openModal('view', r)}
                  >
                    <td className="repayments-table__num">{i + 1}</td>
                    <td>
                       <div className="repayments-table__info">
                          <strong>{vehicle?.registration_number || '—'}</strong>
                          <span>{loan?.lender || '—'}</span>
                       </div>
                    </td>
                    <td>
                      <span className="repayments-table__amount">
                        {formatCurrency(r.amount_paid)}
                      </span>
                    </td>
                    <td>
                       <div className="repayments-table__split">
                          <span>P: {formatCurrency(r.principal_portion)}</span>
                          <span>I: {formatCurrency(r.interest_portion)}</span>
                       </div>
                    </td>
                    <td><strong>{formatCurrency(r.outstanding_balance)}</strong></td>
                    <td className="repayments-table__ref">{r.receipt_ref || '—'}</td>
                    <td className="repayments-table__date">{formatDate(r.payment_date)}</td>
                    <td onClick={e => e.stopPropagation()}>
                      <div className="repayments-table__actions">
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
        <div className="repayments-page__footer">
          Showing {filtered.length} of {records.length} installments
        </div>
      )}

      {/* ── Modals ────────────────────────────────────────────────────── */}
      {modal.mode && (
        <LoanRepaymentModal
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
