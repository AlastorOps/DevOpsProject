import { useState, useEffect, useCallback } from 'react'
import { getUploadUrl } from '../../api/client.js'
import { performanceService } from '../../api/performance.js'
import { employeeService } from '../../api/employees.js'
import { departmentService } from '../../api/departments.js'
import { useAuth } from '../../context/AuthContext.jsx'
import EmployeeCombobox from '../../components/ui/EmployeeCombobox.jsx'

const ratingStyle = {
  Excellent: 'bg-secondary-container text-on-secondary-container',
  Good:      'bg-surface-variant text-primary',
  Average:   'bg-tertiary-fixed text-on-tertiary-fixed-variant',
  Poor:      'bg-error-container text-on-error-container',
}

export default function PerformanceReviews() {
  const { user } = useAuth()
  const [reviews, setReviews]         = useState([])
  const [stats, setStats]             = useState(null)
  const [employees, setEmployees]     = useState([])
  const [departments, setDepartments] = useState([])
  const [total, setTotal]             = useState(0)
  const [loading, setLoading]         = useState(true)
  const [showModal, setShowModal]     = useState(false)
  const [form, setForm]               = useState({ employee_id: '', cycle: 'Annual Review 2025', stars: 4, comments: '' })
  const [hoverStar, setHoverStar]     = useState(0)
  const [toast, setToast]             = useState(null)
  const [search, setSearch]           = useState('')
  const [filterDept, setFilterDept]   = useState('')
  const [imgErrors, setImgErrors]     = useState(() => new Set())
  const markImgError = (id) => setImgErrors(prev => new Set(prev).add(id))
  const [filterRating, setFilterRating] = useState('')
  const [page, setPage]               = useState(1)
  const [saving, setSaving]           = useState(false)
  const limit = 10

  const showToast = (message) => { setToast(message); setTimeout(() => setToast(null), 3000) }

  const fetchData = useCallback(async () => {
    setLoading(true)
    try {
      const [rRes, sRes] = await Promise.all([
        performanceService.list({ page, limit, search, dept: filterDept, rating: filterRating }),
        performanceService.stats(),
      ])
      if (rRes.ok) { const d = await rRes.json(); setReviews(d.reviews || []); setTotal(d.total || 0) }
      if (sRes.ok) setStats(await sRes.json())
    } catch { /* ignore */ }
    setLoading(false)
  }, [page, search, filterDept, filterRating])

  const fetchMeta = useCallback(async () => {
    try {
      const [eRes, dRes] = await Promise.all([employeeService.list({ limit: 500 }), departmentService.list({ limit: 100 })])
      if (eRes.ok) { const d = await eRes.json(); setEmployees(d.employees || []) }
      if (dRes.ok) { const d = await dRes.json(); setDepartments(d.departments || []) }
    } catch { /* ignore */ }
  }, [])

  useEffect(() => { fetchMeta() }, [fetchMeta])
  useEffect(() => { const t = setTimeout(fetchData, search ? 300 : 0); return () => clearTimeout(t) }, [fetchData, search])

  const closeModal = () => { setShowModal(false); setForm({ employee_id: '', cycle: 'Annual Review 2025', stars: 4, comments: '' }) }

  const handleCreate = async () => {
    if (!form.employee_id) { showToast('Please select an employee.'); return }
    if (!form.cycle.trim()) { showToast('Review cycle is required.'); return }
    setSaving(true)
    try {
      const res = await performanceService.create({
        employee_id: form.employee_id,
        cycle: form.cycle,
        stars: Number(form.stars),
        comments: form.comments || null,
      })
      if (res.ok || res.status === 201) {
        showToast('Review submitted.')
        closeModal(); fetchData()
      } else {
        const err = await res.json().catch(() => ({}))
        showToast(err.detail || 'Failed to submit review.')
      }
    } catch { showToast('Network error.') }
    setSaving(false)
  }

  const totalPages = Math.max(1, Math.ceil(total / limit))
  const canReview = user?.role && ['Admin', 'HR Manager', 'Manager'].includes(user.role)

  return (
    <div className="p-margin-mobile md:p-margin-desktop">
      {toast && (
        <div className="fixed top-20 right-6 z-50 flex items-center gap-md px-lg py-md rounded-xl shadow-lg border text-label-md font-bold transition-all bg-secondary-container text-on-secondary-container border-secondary/30">
          <span className="material-symbols-outlined text-[20px]">check_circle</span>
          {toast}
        </div>
      )}

      {showModal && (
        <div className="fixed inset-0 z-50 bg-on-background/40 backdrop-blur-sm flex items-center justify-center p-margin-mobile">
          <div className="bg-surface-container-lowest border border-outline-variant rounded-2xl p-xl shadow-2xl w-full max-w-md">
            <h3 className="text-headline-md mb-lg">Add Performance Review</h3>
            <div className="space-y-md">
              <div className="flex flex-col gap-xs">
                <label className="text-label-md text-on-surface-variant">Employee <span className="text-error">*</span></label>
                <EmployeeCombobox
                  employees={employees}
                  value={form.employee_id}
                  onChange={id => setForm(p => ({ ...p, employee_id: id }))}
                />
              </div>
              <div className="flex flex-col gap-xs">
                <label className="text-label-md text-on-surface-variant">Review Cycle</label>
                <input className="bg-surface border border-outline-variant rounded-lg p-md text-body-md focus:ring-1 focus:ring-primary outline-none" value={form.cycle} onChange={e => setForm(p => ({ ...p, cycle: e.target.value }))} />
              </div>
              <div className="flex flex-col gap-xs">
                <label className="text-label-md text-on-surface-variant">Rating</label>
                <div className="flex gap-xs">
                  {[1,2,3,4,5].map(s => (
                    <button key={s} type="button" onMouseEnter={() => setHoverStar(s)} onMouseLeave={() => setHoverStar(0)} onClick={() => setForm(p => ({ ...p, stars: s }))}>
                      <span className={`material-symbols-outlined text-[28px] ${(hoverStar || form.stars) >= s ? 'text-primary' : 'text-outline-variant'}`} style={{ fontVariationSettings: (hoverStar || form.stars) >= s ? "'FILL' 1" : "'FILL' 0" }}>star</span>
                    </button>
                  ))}
                </div>
              </div>
              <div className="flex flex-col gap-xs">
                <label className="text-label-md text-on-surface-variant">Comments</label>
                <textarea className="bg-surface border border-outline-variant rounded-lg p-md text-body-md focus:ring-1 focus:ring-primary outline-none resize-none" rows={3} placeholder="Optional comments…" value={form.comments} onChange={e => setForm(p => ({ ...p, comments: e.target.value }))} />
              </div>
            </div>
            <div className="flex gap-sm justify-end mt-xl">
              <button onClick={closeModal} className="px-lg py-sm bg-surface-container border border-outline-variant text-on-surface rounded-lg text-label-md">Cancel</button>
              <button onClick={handleCreate} disabled={saving} className="px-lg py-sm bg-primary text-on-primary rounded-lg text-label-md disabled:opacity-50">{saving ? 'Submitting…' : 'Submit Review'}</button>
            </div>
          </div>
        </div>
      )}

      <div className="flex flex-col md:flex-row md:items-center justify-between mb-xl gap-md">
        <div>
          <h2 className="text-headline-lg text-on-surface">Performance Reviews</h2>
          <p className="text-body-md text-on-surface-variant">Track and manage employee performance evaluations</p>
        </div>
        {canReview && (
          <button onClick={() => setShowModal(true)} className="flex items-center gap-xs px-lg py-sm bg-primary text-on-primary rounded-lg text-label-md hover:brightness-110 active:scale-95 transition-all shadow-md">
            <span className="material-symbols-outlined text-[18px]">add</span>
            Add Review
          </button>
        )}
      </div>

      {/* Stats */}
      {stats && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-gutter mb-lg">
          {[
            { label: 'Avg Rating', val: `${stats.average_stars}/5.0`, icon: 'star' },
            { label: 'Total Reviews', val: stats.total_reviews, icon: 'rate_review' },
            { label: 'Excellent', val: stats.excellent_count, icon: 'emoji_events' },
            { label: 'Needs Review', val: stats.pending_count, icon: 'pending_actions' },
          ].map(s => (
            <div key={s.label} className="bg-surface-container-lowest border border-outline-variant p-lg rounded-xl flex items-center gap-md shadow-sm">
              <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary"><span className="material-symbols-outlined">{s.icon}</span></div>
              <div><p className="text-label-sm text-on-surface-variant uppercase tracking-wider">{s.label}</p><p className="text-headline-md font-bold mt-xs">{s.val}</p></div>
            </div>
          ))}
        </div>
      )}

      {/* Filters */}
      <div className="bg-surface-container-lowest border border-outline-variant rounded-xl p-md mb-lg flex flex-wrap gap-md shadow-sm">
        <div className="flex-1 min-w-[200px] relative">
          <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-outline text-[18px]">search</span>
          <input className="w-full bg-background border border-outline-variant rounded-lg py-2 pl-10 pr-4 text-body-md focus:ring-2 focus:ring-primary outline-none" placeholder="Search employee…" value={search} onChange={e => { setSearch(e.target.value); setPage(1) }} />
        </div>
        <select className="bg-background border border-outline-variant rounded-lg py-2 px-3 text-body-md" value={filterDept} onChange={e => { setFilterDept(e.target.value); setPage(1) }}>
          <option value="">All Departments</option>
          {departments.map(d => <option key={d.id} value={d.name}>{d.name}</option>)}
        </select>
        <select className="bg-background border border-outline-variant rounded-lg py-2 px-3 text-body-md" value={filterRating} onChange={e => { setFilterRating(e.target.value); setPage(1) }}>
          <option value="">All Ratings</option>
          <option>Excellent</option><option>Good</option><option>Average</option><option>Poor</option>
        </select>
      </div>

      {/* Table */}
      <div className="bg-surface-container-lowest border border-outline-variant rounded-xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-surface-container text-on-surface-variant text-label-md uppercase tracking-wider">
                {['Employee', 'Department', 'Cycle', 'Rating', 'Stars', 'Reviewer', 'Date'].map(h => <th key={h} className="px-lg py-md font-bold">{h}</th>)}
              </tr>
            </thead>
            <tbody className="divide-y divide-outline-variant text-body-md">
              {loading ? (
                <tr><td colSpan={7} className="px-lg py-xl text-center text-on-surface-variant">Loading…</td></tr>
              ) : reviews.length === 0 ? (
                <tr><td colSpan={7} className="px-lg py-xl text-center text-on-surface-variant">No reviews found.</td></tr>
              ) : reviews.map(rev => (
                <tr key={rev.id} className="hover:bg-surface-container-low transition-colors">
                  <td className="px-lg py-md">
                    <div className="flex items-center gap-sm">
                      {rev.employee?.photo_path && !imgErrors.has(rev.id)
                        ? <img src={getUploadUrl(rev.employee.photo_path)} alt={rev.employee.name} className="w-9 h-9 rounded-full object-cover border border-outline-variant shrink-0" onError={() => markImgError(rev.id)} />
                        : <div className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-sm shrink-0">{(rev.employee?.name ?? '?').split(' ').map(n => n[0]).join('')}</div>
                      }
                      <div><p className="font-bold">{rev.employee?.name ?? '—'}</p><p className="text-label-sm text-on-surface-variant">{rev.employee?.position?.title ?? '—'}</p></div>
                    </div>
                  </td>
                  <td className="px-lg py-md">{rev.employee?.department?.name ?? '—'}</td>
                  <td className="px-lg py-md">{rev.cycle}</td>
                  <td className="px-lg py-md"><span className={`inline-flex px-2.5 py-0.5 rounded-full text-label-sm font-bold ${ratingStyle[rev.rating] ?? ''}`}>{rev.rating}</span></td>
                  <td className="px-lg py-md">
                    <div className="flex gap-xs">{[1,2,3,4,5].map(i => <span key={i} className={`material-symbols-outlined text-[16px] ${i <= rev.stars ? 'text-primary' : 'text-outline-variant'}`} style={{ fontVariationSettings: i <= rev.stars ? "'FILL' 1" : "'FILL' 0" }}>star</span>)}</div>
                  </td>
                  <td className="px-lg py-md">{rev.reviewer_name ?? '—'}</td>
                  <td className="px-lg py-md">{rev.review_date}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="p-md bg-surface-container-low flex flex-col gap-md sm:flex-row sm:items-center sm:justify-between border-t border-outline-variant">
          <p className="text-label-sm text-on-surface-variant">Showing {reviews.length} of {total} reviews</p>
          <div className="flex space-x-sm">
            <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1} className="p-1 rounded hover:bg-surface-container disabled:opacity-30"><span className="material-symbols-outlined">chevron_left</span></button>
            {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => i + 1).map(p => (
              <button key={p} onClick={() => setPage(p)} className={`px-3 py-1 rounded text-label-sm ${p === page ? 'bg-primary text-on-primary' : 'hover:bg-surface-container'}`}>{p}</button>
            ))}
            <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page >= totalPages} className="p-1 rounded hover:bg-surface-container disabled:opacity-30"><span className="material-symbols-outlined">chevron_right</span></button>
          </div>
        </div>
      </div>
    </div>
  )
}
