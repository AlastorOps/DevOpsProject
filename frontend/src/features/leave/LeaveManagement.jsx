import { useState, useEffect, useCallback } from 'react'
import { leaveService } from '../../api/leave.js'

const statusStyle = {
  Pending:  'bg-tertiary-fixed text-on-tertiary-fixed-variant',
  Approved: 'bg-secondary-container text-on-secondary-container',
  Rejected: 'bg-error-container text-on-error-container',
}

export default function LeaveManagement() {
  const [requests, setRequests]       = useState([])
  const [total, setTotal]             = useState(0)
  const [totalCount, setTotalCount]   = useState(0)
  const [approvedCount, setApprovedCount] = useState(0)
  const [pendingCount, setPendingCount]   = useState(0)
  const [rejectedCount, setRejectedCount] = useState(0)
  const [loading, setLoading]         = useState(true)
  const [toast, setToast]             = useState(null)
  const [search, setSearch]           = useState('')
  const [filterType, setFilterType]   = useState('')
  const [filterStatus, setFilterStatus] = useState('')
  const [page, setPage]               = useState(1)
  const limit = 20

  const showToast = (message, type = 'success') => { setToast({ message, type }); setTimeout(() => setToast(null), 3000) }

  const fetchRequests = useCallback(async () => {
    setLoading(true)
    try {
      const res = await leaveService.list({ page, limit, leaveType: filterType, status: filterStatus })
      if (res.ok) { const d = await res.json(); setRequests(d.requests || []); setTotal(d.total || 0) }
    } catch { /* ignore */ }
    setLoading(false)
  }, [page, filterType, filterStatus])

  const fetchCounts = useCallback(async () => {
    try {
      const [allRes, aRes, pRes, rRes] = await Promise.all([
        leaveService.list({ limit: 1 }),
        leaveService.list({ limit: 1, status: 'Approved' }),
        leaveService.list({ limit: 1, status: 'Pending' }),
        leaveService.list({ limit: 1, status: 'Rejected' }),
      ])
      if (allRes.ok) { const d = await allRes.json(); setTotalCount(d.total || 0) }
      if (aRes.ok)   { const d = await aRes.json();   setApprovedCount(d.total || 0) }
      if (pRes.ok)   { const d = await pRes.json();   setPendingCount(d.total || 0) }
      if (rRes.ok)   { const d = await rRes.json();   setRejectedCount(d.total || 0) }
    } catch { /* ignore */ }
  }, [])

  useEffect(() => { fetchCounts() }, [fetchCounts])
  useEffect(() => { fetchRequests() }, [fetchRequests])

  const handleAction = async (req, action) => {
    try {
      const res = await (action === 'approve' ? leaveService.approve(req.id) : leaveService.reject(req.id))
      if (res.ok) {
        const newStatus = action === 'approve' ? 'Approved' : 'Rejected'
        showToast(`Leave for ${req.employee?.name} ${newStatus.toLowerCase()}.`, action === 'reject' ? 'error' : 'success')
        fetchRequests(); fetchCounts()
      } else {
        const err = await res.json().catch(() => ({}))
        showToast(err.detail || 'Action failed.', 'error')
      }
    } catch { showToast('Network error.', 'error') }
  }

  const filtered = requests.filter(r => !search || `${r.employee?.name ?? ''} ${r.employee?.emp_id ?? ''}`.toLowerCase().includes(search.toLowerCase()))

  const totalPages = Math.max(1, Math.ceil(total / limit))

  return (
    <div className="p-margin-mobile md:p-margin-desktop">
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-xl gap-md">
        <div>
          <h2 className="text-headline-lg text-on-surface">Leave Management</h2>
          <p className="text-body-md text-on-surface-variant">Review, approve, or reject employee leave requests</p>
        </div>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-gutter mb-lg">
        {[
          { label: 'Total Requests', val: totalCount,    icon: 'event_note',     style: 'bg-primary text-on-primary' },
          { label: 'Approved',       val: approvedCount, icon: 'event_available', style: 'bg-secondary-container/30' },
          { label: 'Pending',        val: pendingCount,  icon: 'pending_actions', style: 'bg-tertiary-fixed/30' },
          { label: 'Rejected',       val: rejectedCount, icon: 'event_busy',      style: 'bg-error-container/30' },
        ].map(s => (
          <div key={s.label} className={`p-lg rounded-xl border border-outline-variant shadow-sm ${s.style}`}>
            <div className="flex items-center justify-between mb-md"><span className="material-symbols-outlined">{s.icon}</span></div>
            <p className="text-label-sm uppercase tracking-wider opacity-70">{s.label}</p>
            <h3 className="text-headline-lg font-bold mt-xs">{s.val}</h3>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="bg-surface-container-lowest border border-outline-variant rounded-xl p-md mb-lg flex flex-wrap gap-md shadow-sm">
        <div className="flex-1 min-w-[200px] relative">
          <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-outline text-[18px]">search</span>
          <input className="w-full bg-background border border-outline-variant rounded-lg py-2 pl-10 pr-4 text-body-md focus:ring-2 focus:ring-primary outline-none" placeholder="Search employee..." value={search} onChange={e => setSearch(e.target.value)} />
        </div>
        <select className="bg-background border border-outline-variant rounded-lg py-2 px-3 text-body-md" value={filterType} onChange={e => { setFilterType(e.target.value); setPage(1) }}>
          <option value="">All Leave Types</option>
          <option>Annual Leave</option><option>Sick Leave</option><option>Personal Leave</option>
          <option>Maternity / Paternity Leave</option><option>Emergency Leave</option>
        </select>
        <select className="bg-background border border-outline-variant rounded-lg py-2 px-3 text-body-md" value={filterStatus} onChange={e => { setFilterStatus(e.target.value); setPage(1) }}>
          <option value="">All Status</option>
          <option>Pending</option><option>Approved</option><option>Rejected</option>
        </select>
      </div>

      {/* Table */}
      <div className="bg-surface-container-lowest border border-outline-variant rounded-xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-surface-container-low text-on-surface-variant text-label-md uppercase tracking-wider">
                {['Employee', 'Leave Type', 'Duration', 'Days', 'Reason', 'Status', 'Actions'].map(h => (
                  <th key={h} className={`px-lg py-md font-bold${h === 'Actions' ? ' w-44 text-center' : ''}`}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-outline-variant text-body-md">
              {loading ? (
                <tr><td colSpan={7} className="px-lg py-xl text-center text-on-surface-variant">Loading…</td></tr>
              ) : filtered.length === 0 ? (
                <tr><td colSpan={7} className="px-lg py-xl text-center text-on-surface-variant">No leave requests found.</td></tr>
              ) : filtered.map(req => (
                <tr key={req.id} className="hover:bg-surface-container-low transition-colors">
                  <td className="px-lg py-md">
                    <div className="flex items-center gap-sm">
                      {req.employee?.photo_path
                        ? <img src={`/uploads/${req.employee.photo_path}`} alt={req.employee.name} className="w-9 h-9 rounded-full object-cover border border-outline-variant shrink-0" />
                        : <div className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-sm shrink-0">{(req.employee?.name ?? '?').split(' ').map(n => n[0]).join('')}</div>
                      }
                      <div><p className="font-bold">{req.employee?.name ?? '—'}</p><p className="text-label-sm text-on-surface-variant">{req.employee?.department?.name ?? '—'}</p></div>
                    </div>
                  </td>
                  <td className="px-lg py-md">{req.leave_type}</td>
                  <td className="px-lg py-md text-on-surface-variant">{req.from_date} – {req.to_date}</td>
                  <td className="px-lg py-md font-bold">{req.days}</td>
                  <td className="px-lg py-md text-on-surface-variant max-w-[12rem]"><p className="truncate" title={req.reason}>{req.reason}</p></td>
                  <td className="px-lg py-md"><span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-label-sm font-bold ${statusStyle[req.status] ?? ''}`}>{req.status}</span></td>
                  <td className="px-lg py-md whitespace-nowrap w-44">
                    <div className="flex items-center justify-center gap-sm">
                      {req.status === 'Pending' ? (
                        <>
                          <button onClick={() => handleAction(req, 'approve')} className="px-md py-xs bg-secondary-container text-on-secondary-container rounded-lg text-label-md font-bold hover:opacity-90 active:scale-95 transition-all">Approve</button>
                          <button onClick={() => handleAction(req, 'reject')} className="px-md py-xs bg-error-container text-on-error-container rounded-lg text-label-md font-bold hover:opacity-90 active:scale-95 transition-all">Reject</button>
                        </>
                      ) : (
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-label-sm font-bold ${statusStyle[req.status] ?? ''}`}>{req.status}</span>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="p-md bg-surface-container-low flex flex-col gap-md sm:flex-row sm:items-center sm:justify-between border-t border-outline-variant">
          <p className="text-label-sm text-on-surface-variant">Showing {filtered.length} of {total} requests</p>
          <div className="flex space-x-sm">
            <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1} className="p-1 rounded hover:bg-surface-container disabled:opacity-30"><span className="material-symbols-outlined">chevron_left</span></button>
            {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => i + 1).map(p => (
              <button key={p} onClick={() => setPage(p)} className={`px-3 py-1 rounded text-label-sm ${p === page ? 'bg-primary text-on-primary' : 'hover:bg-surface-container'}`}>{p}</button>
            ))}
            <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page >= totalPages} className="p-1 rounded hover:bg-surface-container disabled:opacity-30"><span className="material-symbols-outlined">chevron_right</span></button>
          </div>
        </div>
      </div>

      {toast && (
        <div className={`fixed bottom-lg right-lg px-lg py-md rounded-xl shadow-xl flex items-center gap-md z-50 ${toast.type === 'error' ? 'bg-error-container text-on-error-container' : 'bg-inverse-surface text-inverse-on-surface'}`}>
          <span className="material-symbols-outlined text-[18px]">{toast.type === 'error' ? 'cancel' : 'check_circle'}</span>
          <span className="text-body-md">{toast.message}</span>
          <button onClick={() => setToast(null)} className="ml-md opacity-60 hover:opacity-100"><span className="material-symbols-outlined text-[18px]">close</span></button>
        </div>
      )}
    </div>
  )
}
