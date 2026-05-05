import { useState, useEffect } from 'react'
import {
    HiDocumentText,
    HiCheckCircle,
    HiXCircle,
    HiClock,
    HiMagnifyingGlass,
    HiXMark,
    HiEye,
    HiPencilSquare,
    HiPlus,
    HiTrash,
    HiCurrencyDollar,
    HiExclamationTriangle,
} from 'react-icons/hi2'
import { useInsuranceClaimStore } from './insuranceClaimStore'
import { useInsuranceStore } from '../insurance/insuranceStore'
import { useAuthStore } from '../auth/authStore'
import type { InsuranceClaimRecord, ClaimStatus } from '../../types/insuranceClaims'
import './InsuranceClaims.scss'

// ─── Types ────────────────────────────────────────────────────────────────────

type ModalMode = 'add' | 'edit' | 'view' | null

// ─── Helpers ─────────────────────────────────────────────────────────────────

function formatDate(iso: string | null) {
    if (!iso) return '—'
    return new Date(iso).toLocaleDateString('en-KE', {
        day: '2-digit', month: 'short', year: 'numeric',
    })
}

function formatCurrency(amount: number | null) {
    if (amount === null || amount === undefined) return '—'
    return new Intl.NumberFormat('en-KE', {
        style: 'currency',
        currency: 'KES',
    }).format(amount)
}

function statusMeta(status: ClaimStatus) {
    return {
        Pending: { label: 'Pending', cls: 'badge--warning', icon: <HiClock /> },
        Approved: { label: 'Approved', cls: 'badge--success', icon: <HiCheckCircle /> },
        Rejected: { label: 'Rejected', cls: 'badge--danger', icon: <HiXCircle /> },
    }[status]
}

// ─── Empty form state ─────────────────────────────────────────────────────────

const EMPTY_FORM = {
    insurance_id: '',
    incident_date: '',
    claim_date: '',
    amount_claimed: '',
    amount_approved: '',
    repair_estimate: '',
    status: 'Pending' as ClaimStatus,
}

// ─── Modal ────────────────────────────────────────────────────────────────────

interface ModalProps {
    mode: ModalMode
    record: InsuranceClaimRecord | null
    onClose: () => void
    onSave: (data: any) => void
    onDelete: (id: string) => void
    isLoading: boolean
}

function ClaimModal({ mode, record, onClose, onSave, onDelete, isLoading }: ModalProps) {
    const { records: policies } = useInsuranceStore()

    const [form, setForm] = useState(
        mode === 'edit' && record
            ? {
                insurance_id: record.insurance_id,
                incident_date: record.incident_date.split('T')[0],
                claim_date: record.claim_date.split('T')[0],
                amount_claimed: String(record.amount_claimed),
                amount_approved: record.amount_approved !== null ? String(record.amount_approved) : '',
                repair_estimate: record.repair_estimate !== null ? String(record.repair_estimate) : '',
                status: record.status,
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
            insurance_id: form.insurance_id,
            incident_date: new Date(form.incident_date).toISOString(),
            claim_date: new Date(form.claim_date).toISOString(),
            amount_claimed: Number(form.amount_claimed),
            amount_approved: form.amount_approved !== '' ? Number(form.amount_approved) : null,
            repair_estimate: form.repair_estimate !== '' ? Number(form.repair_estimate) : null,
            status: form.status,
        })
    }

    // Resolve which policy this claim belongs to (for display)
    const linkedPolicy = policies.find(p => p.insurance_id === (record?.insurance_id ?? form.insurance_id))

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div
                className={`modal modal--${mode}`}
                onClick={e => e.stopPropagation()}
            >
                {/* Header */}
                <div className="modal__header">
                    <div className="modal__header-left">
                        <HiDocumentText className="modal__header-icon" size={24} />
                        <div>
                            <h2 className="modal__title">
                                {mode === 'add' && 'New Insurance Claim'}
                                {mode === 'edit' && 'Edit Claim Details'}
                                {mode === 'view' && 'Claim Information'}
                            </h2>
                            <p className="modal__subtitle">
                                {mode === 'add' && 'File a new insurance claim'}
                                {mode === 'edit' && `Editing Claim ID: ${record?.claim_id.slice(0, 8)}`}
                                {mode === 'view' && `Claim ID: ${record?.claim_id}`}
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
                            <div className={`claim-status-banner claim-status-banner--${record.status.toLowerCase()}`}>
                                <span className={`badge ${statusMeta(record.status).cls}`}>
                                    {statusMeta(record.status).label}
                                </span>
                                <span style={{ fontSize: '13px', color: 'var(--color-grey-500)' }}>
                                    Incident on {formatDate(record.incident_date)} · Filed {formatDate(record.claim_date)}
                                </span>
                            </div>

                            <div className="detail-grid">
                                {[
                                    { label: 'Policy ID', value: linkedPolicy ? `${record.insurance_id.slice(0, 8)}… (${linkedPolicy.provider})` : record.insurance_id },
                                    { label: 'Incident Date', value: formatDate(record.incident_date) },
                                    { label: 'Claim Date', value: formatDate(record.claim_date) },
                                    { label: 'Amount Claimed', value: formatCurrency(record.amount_claimed) },
                                    { label: 'Amount Approved', value: formatCurrency(record.amount_approved) },
                                    { label: 'Repair Estimate', value: formatCurrency(record.repair_estimate) },
                                    { label: 'Filed On', value: formatDate(record.created_at) },
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
                        <form className="claim-form" onSubmit={handleSubmit} id="claim-form">
                            <div className="claim-form__section-label">Claim Details</div>

                            <div className="claim-form__field">
                                <label className="claim-form__label">Insurance Policy *</label>
                                <select
                                    className="claim-form__input claim-form__select"
                                    value={form.insurance_id}
                                    onChange={e => handleChange('insurance_id', e.target.value)}
                                    required
                                    disabled={isLoading}
                                >
                                    <option value="">Select Policy</option>
                                    {policies.map(p => (
                                        <option key={p.insurance_id} value={p.insurance_id}>
                                            {p.insurance_id.slice(0, 8)}… — {p.provider} ({p.policy_type})
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div className="claim-form__row">
                                <div className="claim-form__field">
                                    <label className="claim-form__label">Incident Date *</label>
                                    <input
                                        className="claim-form__input"
                                        type="date"
                                        value={form.incident_date}
                                        onChange={e => handleChange('incident_date', e.target.value)}
                                        required
                                        disabled={isLoading}
                                    />
                                </div>
                                <div className="claim-form__field">
                                    <label className="claim-form__label">Claim Date *</label>
                                    <input
                                        className="claim-form__input"
                                        type="date"
                                        value={form.claim_date}
                                        onChange={e => handleChange('claim_date', e.target.value)}
                                        required
                                        disabled={isLoading}
                                    />
                                </div>
                            </div>

                            <div className="claim-form__section-label">Financials</div>

                            <div className="claim-form__row">
                                <div className="claim-form__field">
                                    <label className="claim-form__label">Amount Claimed *</label>
                                    <input
                                        className="claim-form__input"
                                        type="number"
                                        step="0.01"
                                        placeholder="0.00"
                                        value={form.amount_claimed}
                                        onChange={e => handleChange('amount_claimed', e.target.value)}
                                        required
                                        disabled={isLoading}
                                    />
                                </div>
                                <div className="claim-form__field">
                                    <label className="claim-form__label">Repair Estimate</label>
                                    <input
                                        className="claim-form__input"
                                        type="number"
                                        step="0.01"
                                        placeholder="0.00"
                                        value={form.repair_estimate}
                                        onChange={e => handleChange('repair_estimate', e.target.value)}
                                        disabled={isLoading}
                                    />
                                </div>
                            </div>

                            <div className="claim-form__row">
                                <div className="claim-form__field">
                                    <label className="claim-form__label">Amount Approved</label>
                                    <input
                                        className="claim-form__input"
                                        type="number"
                                        step="0.01"
                                        placeholder="0.00"
                                        value={form.amount_approved}
                                        onChange={e => handleChange('amount_approved', e.target.value)}
                                        disabled={isLoading}
                                    />
                                </div>
                                <div className="claim-form__field">
                                    <label className="claim-form__label">Claim Status</label>
                                    <select
                                        className="claim-form__input claim-form__select"
                                        value={form.status}
                                        onChange={e => handleChange('status', e.target.value)}
                                        disabled={isLoading}
                                    >
                                        <option value="Pending">Pending</option>
                                        <option value="Approved">Approved</option>
                                        <option value="Rejected">Rejected</option>
                                    </select>
                                </div>
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
                                    <button
                                        className="btn btn--danger"
                                        onClick={() => onDelete(record.claim_id)}
                                        disabled={isLoading}
                                    >
                                        {isLoading ? 'Deleting...' : 'Yes, delete'}
                                    </button>
                                    <button
                                        className="btn btn--ghost"
                                        onClick={() => setConfirmDelete(false)}
                                        disabled={isLoading}
                                    >
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
                            <button className="btn btn--ghost" type="button" onClick={onClose} disabled={isLoading}>
                                Cancel
                            </button>
                            <div style={{ flex: 1 }} />
                            <button className="btn btn--primary" type="submit" form="claim-form" disabled={isLoading}>
                                {isLoading
                                    ? 'Saving...'
                                    : mode === 'add'
                                        ? <><HiPlus /> File Claim</>
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

export default function InsuranceClaims() {
    const { claims, isLoading, error, fetchClaims, addClaim, updateClaim, removeClaim } =
        useInsuranceClaimStore()
    const { records: policies, fetchRecords: fetchPolicies } = useInsuranceStore()
    const { token } = useAuthStore()

    const [modal, setModal] = useState<{ mode: ModalMode; record: InsuranceClaimRecord | null }>({
        mode: null, record: null,
    })
    const [search, setSearch] = useState('')
    const [filterStatus, setFilterStatus] = useState<ClaimStatus | 'ALL'>('ALL')
    const [loaded] = useState(true)

    useEffect(() => {
        if (token) {
            fetchClaims(token)
            fetchPolicies(token)
        }
    }, [token, fetchClaims, fetchPolicies])

    const filtered = claims.filter(c => {
        const policy = policies.find(p => p.insurance_id === c.insurance_id)
        const searchStr = `${policy?.provider} ${policy?.policy_type} ${c.claim_id}`.toLowerCase()
        const matchSearch = searchStr.includes(search.toLowerCase())
        const matchStatus = filterStatus === 'ALL' || c.status === filterStatus
        return matchSearch && matchStatus
    })

    const openModal = (mode: ModalMode, record: InsuranceClaimRecord | null = null) =>
        setModal({ mode, record })
    const closeModal = () => setModal({ mode: null, record: null })

    const handleSave = async (data: any) => {
        if (!token) return
        let res
        if (modal.mode === 'add') {
            res = await addClaim(data, token)
        } else if (modal.mode === 'edit' && modal.record) {
            res = await updateClaim(modal.record.claim_id, data, token)
        }
        if (res?.success) {
            closeModal()
        } else {
            alert(res?.message || 'An error occurred')
        }
    }

    const handleDelete = async (id: string) => {
        if (!token) return
        const res = await removeClaim(id, token)
        if (res.success) {
            closeModal()
        } else {
            alert(res.message)
        }
    }

    // ── Stats ────────────────────────────────────────────────────────────────────
    const pendingCount = claims.filter(c => c.status === 'Pending').length
    const approvedCount = claims.filter(c => c.status === 'Approved').length
    const rejectedCount = claims.filter(c => c.status === 'Rejected').length
    const totalClaimed = claims.reduce((acc, c) => acc + c.amount_claimed, 0)

    return (
        <div className={`claims-page ${loaded ? 'claims-page--loaded' : ''}`}>

            {/* ── Page header ───────────────────────────────────────────────── */}
            <div className="claims-page__header">
                <div>
                    <h2 className="claims-page__title">Insurance Claims</h2>
                    <p className="claims-page__sub">
                        Track and manage vehicle insurance claims — {claims.length} total
                    </p>
                </div>
                <button className="btn btn--primary" onClick={() => openModal('add')}>
                    <HiPlus /> File Claim
                </button>
            </div>

            {/* ── Summary strip ─────────────────────────────────────────────── */}
            <div className="claims-page__summary">
                {[
                    { label: 'Total Claims', value: claims.length, cls: 'claim--grey', icon: <HiDocumentText /> },
                    { label: 'Pending', value: pendingCount, cls: 'claim--orange', icon: <HiExclamationTriangle /> },
                    { label: 'Approved', value: approvedCount, cls: 'claim--green', icon: <HiCheckCircle /> },
                    { label: 'Total Claimed', value: formatCurrency(totalClaimed), cls: 'claim--blue', icon: <HiCurrencyDollar /> },
                ].map((s, i) => (
                    <div key={s.label} className={`claim-chip ${s.cls}`} style={{ animationDelay: `${i * 60}ms` }}>
                        <span className="claim-chip__icon">{s.icon}</span>
                        <span className="claim-chip__value">{s.value}</span>
                        <span className="claim-chip__label">{s.label}</span>
                    </div>
                ))}
            </div>

            {/* ── Controls ──────────────────────────────────────────────────── */}
            <div className="claims-page__controls">
                <div className="search-box">
                    <HiMagnifyingGlass className="search-box__icon" />
                    <input
                        className="search-box__input"
                        placeholder="Search by provider, type or claim ID..."
                        value={search}
                        onChange={e => setSearch(e.target.value)}
                    />
                    {search && (
                        <button className="search-box__clear" onClick={() => setSearch('')}><HiXMark /></button>
                    )}
                </div>

                <div className="filter-tabs">
                    {(['ALL', 'Pending', 'Approved', 'Rejected'] as const).map(s => (
                        <button
                            key={s}
                            className={`filter-tab ${filterStatus === s ? 'filter-tab--active' : ''}`}
                            onClick={() => setFilterStatus(s)}
                        >
                            {s === 'ALL' ? 'All Claims' : s}
                        </button>
                    ))}
                </div>
            </div>

            {/* ── Error ─────────────────────────────────────────────────────── */}
            {error && (
                <div className="claims-error">
                    <p>Error: {error}</p>
                    <button className="btn btn--outline" onClick={() => token && fetchClaims(token)}>
                        Retry
                    </button>
                </div>
            )}

            {/* ── Table ─────────────────────────────────────────────────────── */}
            <div className="claims-table-wrap">
                {isLoading && claims.length === 0 ? (
                    <div className="claims-loading">
                        <div className="spinner" />
                        <p>Loading claims...</p>
                    </div>
                ) : filtered.length === 0 ? (
                    <div className="claims-empty">
                        <HiDocumentText size={48} color="#ddd" />
                        <p>{search ? 'No claims match your search' : 'No insurance claims found'}</p>
                    </div>
                ) : (
                    <table className="claims-table">
                        <thead>
                            <tr>
                                <th>#</th>
                                <th>Policy</th>
                                <th>Incident Date</th>
                                <th>Claim Date</th>
                                <th>Amount Claimed</th>
                                <th>Amount Approved</th>
                                <th>Repair Estimate</th>
                                <th>Status</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filtered.map((c, i) => {
                                const policy = policies.find(p => p.insurance_id === c.insurance_id)
                                return (
                                    <tr
                                        key={c.claim_id}
                                        className="claims-table__row"
                                        style={{ animationDelay: `${i * 40}ms` }}
                                        onClick={() => openModal('view', c)}
                                    >
                                        <td className="claims-table__num">{i + 1}</td>
                                        <td>
                                            <div className="claims-table__policy">
                                                <strong>{c.insurance_id.slice(0, 8)}…</strong>
                                                <span>{policy ? `${policy.provider} · ${policy.policy_type}` : '—'}</span>
                                            </div>
                                        </td>
                                        <td>{formatDate(c.incident_date)}</td>
                                        <td>{formatDate(c.claim_date)}</td>
                                        <td className="claims-table__amount">{formatCurrency(c.amount_claimed)}</td>
                                        <td>
                                            {c.amount_approved !== null ? (
                                                <span className="claims-table__amount-approved">
                                                    {formatCurrency(c.amount_approved)}
                                                </span>
                                            ) : (
                                                <span className="claims-table__amount-approved claims-table__amount-approved--none">—</span>
                                            )}
                                        </td>
                                        <td className="claims-table__amount">
                                            {c.repair_estimate !== null ? formatCurrency(c.repair_estimate) : '—'}
                                        </td>
                                        <td>
                                            <span className={`badge ${statusMeta(c.status).cls}`}>
                                                {c.status}
                                            </span>
                                        </td>
                                        <td onClick={e => e.stopPropagation()}>
                                            <div className="claims-table__actions">
                                                <button
                                                    className="action-btn action-btn--view"
                                                    onClick={() => openModal('view', c)}
                                                    title="View"
                                                >
                                                    <HiEye />
                                                </button>
                                                <button
                                                    className="action-btn action-btn--edit"
                                                    onClick={() => openModal('edit', c)}
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
                <div className="claims-page__footer">
                    Showing {filtered.length} of {claims.length} claims
                </div>
            )}

            {/* ── Modal ─────────────────────────────────────────────────────── */}
            {modal.mode && (
                <ClaimModal
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