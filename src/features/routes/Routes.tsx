import { useState, useEffect } from 'react'
import { 
  HiMap, 
  HiCheckCircle, 
  HiXCircle, 
  HiMagnifyingGlass, 
  HiXMark, 
  HiEye, 
  HiPencilSquare, 
  HiPlus, 
  HiTrash,
  HiClock,
  HiMapPin
} from 'react-icons/hi2'
import { useRouteStore } from './routeStore'
import { useAuthStore } from '../auth/authStore'
import type { Route } from '../../types/route'
import './Routes.scss'

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
  route_name: '',
  stop_order: '',
  distance_km: '',
  estimated_duration_min: '',
  is_active: true,
}

// ─── Modal ────────────────────────────────────────────────────────────────────

interface ModalProps {
  mode: ModalMode
  route: Route | null
  onClose: () => void
  onSave: (data: any) => void
  onDelete: (id: string) => void
  isLoading: boolean
}

function RouteModal({ mode, route, onClose, onSave, onDelete, isLoading }: ModalProps) {
  const [form, setForm] = useState(
    mode === 'edit' && route
      ? {
          route_name: route.route_name,
          stop_order: route.stop_order ?? '',
          distance_km: String(route.distance_km ?? ''),
          estimated_duration_min: String(route.estimated_duration_min ?? ''),
          is_active: route.is_active,
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
      distance_km: form.distance_km ? Number(form.distance_km) : null,
      estimated_duration_min: form.estimated_duration_min ? Number(form.estimated_duration_min) : null,
    })
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
            <HiMap className="modal__header-icon" size={24} />
            <div>
              <h2 className="modal__title">
                {mode === 'add'  && 'Add New Route'}
                {mode === 'edit' && 'Edit Route'}
                {mode === 'view' && route?.route_name}
              </h2>
              <p className="modal__subtitle">
                {mode === 'add'  && 'Define a new transport route'}
                {mode === 'edit' && `Editing ${route?.route_name}`}
                {mode === 'view' && `Route Details`}
              </p>
            </div>
          </div>
          <button className="modal__close" onClick={onClose}><HiXMark /></button>
        </div>

        {/* Body */}
        <div className="modal__body">
          {/* VIEW mode */}
          {isView && route && (
            <>
              {/* Status banner */}
              <div className={`route-status-banner route-status-banner--${route.is_active ? 'active' : 'inactive'}`}>
                <span className={`badge ${route.is_active ? 'badge--success' : 'badge--neutral'}`}>
                  {route.is_active ? 'Active' : 'Inactive'}
                </span>
              </div>

              {/* Detail grid */}
              <div className="detail-grid">
                {[
                  { label: 'Route ID',             value: route.route_id },
                  { label: 'Route Name',           value: route.route_name },
                  { label: 'Distance',             value: route.distance_km ? `${route.distance_km} km` : '—' },
                  { label: 'Estimated Duration',   value: route.estimated_duration_min ? `${route.estimated_duration_min} min` : '—' },
                  { label: 'Created',              value: formatDate(route.created_at) },
                  { label: 'Last Updated',         value: formatDate(route.updated_at) },
                ].map(item => (
                  <div key={item.label} className="detail-grid__item">
                    <span className="detail-grid__label">{item.label}</span>
                    <span className="detail-grid__value">{item.value}</span>
                  </div>
                ))}
              </div>

              <div className="route-stops-view">
                <span className="detail-grid__label">Stop Order</span>
                <p className="route-stops-view__content">{route.stop_order || 'No stops defined'}</p>
              </div>
            </>
          )}

          {/* ADD / EDIT mode */}
          {!isView && (
            <form className="route-form" onSubmit={handleSubmit} id="route-form">
              <div className="route-form__section-label">Route Details</div>

              <div className="route-form__field">
                <label className="route-form__label">Route Name *</label>
                <input
                  className="route-form__input"
                  placeholder="e.g. Nairobi - Mombasa Express"
                  value={form.route_name}
                  onChange={e => handleChange('route_name', e.target.value)}
                  required
                  disabled={isLoading}
                />
              </div>

              <div className="route-form__row">
                <div className="route-form__field">
                  <label className="route-form__label">Distance (km)</label>
                  <input
                    className="route-form__input"
                    type="number"
                    step="0.1"
                    placeholder="e.g. 485"
                    value={form.distance_km}
                    onChange={e => handleChange('distance_km', e.target.value)}
                    disabled={isLoading}
                  />
                </div>
                <div className="route-form__field">
                  <label className="route-form__label">Duration (min)</label>
                  <input
                    className="route-form__input"
                    type="number"
                    placeholder="e.g. 480"
                    value={form.estimated_duration_min}
                    onChange={e => handleChange('estimated_duration_min', e.target.value)}
                    disabled={isLoading}
                  />
                </div>
              </div>

              <div className="route-form__field">
                <label className="route-form__label">Stop Order / Sequence</label>
                <textarea
                  className="route-form__input route-form__textarea"
                  placeholder="e.g. Nairobi -> Mtito Andei -> Voi -> Mombasa"
                  value={form.stop_order}
                  onChange={e => handleChange('stop_order', e.target.value)}
                  disabled={isLoading}
                />
              </div>

              <div className="route-form__field">
                <label className="route-form__label-checkbox">
                  <input
                    type="checkbox"
                    checked={form.is_active}
                    onChange={e => handleChange('is_active', e.target.checked)}
                    disabled={isLoading}
                  />
                  <span>Route is Active</span>
                </label>
              </div>
            </form>
          )}
        </div>

        {/* Footer */}
        <div className="modal__footer">
          {mode === 'view' && route && (
            <>
              {confirmDelete ? (
                <div className="modal__confirm-delete">
                  <span>Are you sure? This cannot be undone.</span>
                  <button className="btn btn--danger" onClick={() => onDelete(route.route_id)} disabled={isLoading}>
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
              <button className="btn btn--primary" type="submit" form="route-form" disabled={isLoading}>
                {isLoading ? 'Saving...' : (mode === 'add' ? <HiPlus /> : '')} 
                {!isLoading && (mode === 'add' ? ' Add Route' : ' Save Changes')}
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  )
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function Routes() {
  const { routes, isLoading, error, fetchRoutes, addRoute, updateRoute, removeRoute } = useRouteStore()
  const { token } = useAuthStore()
  
  const [modal, setModal] = useState<{ mode: ModalMode; route: Route | null }>({
    mode: null, route: null,
  })
  const [search, setSearch] = useState('')
  const [filterStatus, setFilterStatus] = useState<'ALL' | 'ACTIVE' | 'INACTIVE'>('ALL')
  const [loaded] = useState(true)

  useEffect(() => {
    if (token) {
      fetchRoutes(token)
    }
  }, [token, fetchRoutes])

  const filtered = routes.filter(r => {
    const matchSearch = r.route_name.toLowerCase().includes(search.toLowerCase())
    const matchStatus = filterStatus === 'ALL' || (filterStatus === 'ACTIVE' ? r.is_active : !r.is_active)
    return matchSearch && matchStatus
  })

  const openModal = (mode: ModalMode, route: Route | null = null) =>
    setModal({ mode, route })
  const closeModal = () => setModal({ mode: null, route: null })

  const handleSave = async (data: any) => {
    if (!token) return
    
    let res;
    if (modal.mode === 'add') {
      res = await addRoute(data, token)
    } else if (modal.mode === 'edit' && modal.route) {
      res = await updateRoute(modal.route.route_id, data, token)
    }
    
    if (res?.success) {
      closeModal()
    } else {
      alert(res?.message || 'An error occurred')
    }
  }

  const handleDelete = async (id: string) => {
    if (!token) return
    const res = await removeRoute(id, token)
    if (res.success) {
      closeModal()
    } else {
      alert(res.message)
    }
  }

  // Stats
  const total    = routes.length
  const active   = routes.filter(r => r.is_active).length
  const inactive = total - active

  return (
    <div className={`routes-page ${loaded ? 'routes-page--loaded' : ''}`}>

      {/* ── Page header ───────────────────────────────────────────────── */}
      <div className="routes-page__header">
        <div>
          <h2 className="routes-page__title">Transport Routes</h2>
          <p className="routes-page__sub">Manage service routes — {total} routes defined</p>
        </div>
        <button className="btn btn--primary" onClick={() => openModal('add')}>
          <HiPlus /> Add Route
        </button>
      </div>

      {/* ── Summary strip ─────────────────────────────────────────────── */}
      <div className="routes-page__summary">
        {[
          { label: 'Total Routes',  value: total,    cls: '',          icon: <HiMap /> },
          { label: 'Active',        value: active,   cls: 'sum--green', icon: <HiCheckCircle /> },
          { label: 'Inactive',      value: inactive, cls: 'sum--grey',  icon: <HiXCircle /> },
        ].map((s, i) => (
          <div key={s.label} className={`sum-chip ${s.cls}`} style={{ animationDelay: `${i * 60}ms` }}>
            <span className="sum-chip__icon">{s.icon}</span>
            <span className="sum-chip__value">{s.value}</span>
            <span className="sum-chip__label">{s.label}</span>
          </div>
        ))}
      </div>

      {/* ── Controls ──────────────────────────────────────────────────── */}
      <div className="routes-page__controls">
        <div className="search-box">
          <HiMagnifyingGlass className="search-box__icon" />
          <input
            className="search-box__input"
            placeholder="Search by route name..."
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
          {search && (
            <button className="search-box__clear" onClick={() => setSearch('')}><HiXMark /></button>
          )}
        </div>

        <div className="filter-tabs">
          {(['ALL', 'ACTIVE', 'INACTIVE'] as const).map(s => (
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
        <div className="routes-error">
          <p>Error: {error}</p>
          <button className="btn btn--outline" onClick={() => token && fetchRoutes(token)}>Retry</button>
        </div>
      )}

      {/* ── Table ─────────────────────────────────────────────────────── */}
      <div className="routes-table-wrap">
        {isLoading && routes.length === 0 ? (
          <div className="routes-loading">
            <div className="spinner" />
            <p>Loading routes...</p>
          </div>
        ) : filtered.length === 0 ? (
          <div className="routes-empty">
            <HiMap size={48} color="#ddd" />
            <p>{search ? 'No routes match your search' : 'No routes defined yet'}</p>
          </div>
        ) : (
          <table className="routes-table">
            <thead>
              <tr>
                <th>#</th>
                <th>Route Name</th>
                <th>Distance</th>
                <th>Duration</th>
                <th>Status</th>
                <th>Created</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((r, i) => (
                <tr
                  key={r.route_id}
                  className="routes-table__row"
                  style={{ animationDelay: `${i * 40}ms` }}
                  onClick={() => openModal('view', r)}
                >
                  <td className="routes-table__num">{i + 1}</td>
                  <td>
                    <div className="routes-table__name">
                      {r.route_name}
                    </div>
                  </td>
                  <td>
                    <span className="routes-table__val">
                      {r.distance_km ? `${r.distance_km} km` : '—'}
                    </span>
                  </td>
                  <td>
                    <span className="routes-table__val">
                      {r.estimated_duration_min ? `${r.estimated_duration_min} min` : '—'}
                    </span>
                  </td>
                  <td>
                    <span className={`badge ${r.is_active ? 'badge--success' : 'badge--neutral'}`}>
                      {r.is_active ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td className="routes-table__date">{formatDate(r.created_at)}</td>
                  <td onClick={e => e.stopPropagation()}>
                    <div className="routes-table__actions">
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
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* ── Footer count ──────────────────────────────────────────────── */}
      {!isLoading && (
        <div className="routes-page__footer">
          Showing {filtered.length} of {total} routes
        </div>
      )}

      {/* ── Modals ────────────────────────────────────────────────────── */}
      {modal.mode && (
        <RouteModal
          mode={modal.mode}
          route={modal.route}
          onClose={closeModal}
          onSave={handleSave}
          onDelete={handleDelete}
          isLoading={isLoading}
        />
      )}
    </div>
  )
}
