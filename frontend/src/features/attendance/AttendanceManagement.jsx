import { useState, useEffect, useCallback } from 'react'
import { api } from '../../lib/api.js'
import EmployeeCombobox from '../../components/ui/EmployeeCombobox.jsx'

const statusStyle = {
  Present:   'bg-secondary-container text-on-secondary-container',
  Late:      'bg-tertiary-fixed text-on-tertiary-fixed-variant',
  Absent:    'bg-error-container text-on-error-container',
  'On Leave':'bg-surface-variant text-on-surface-variant',
}

export default function AttendanceManagement() {
  const [records, setRecords]         = useState([])
  const [stats, setStats]             = useState({ present: 0, late: 0, absent: 0, on_leave: 0, total: 0 })
  const [employees, setEmployees]     = useState([])
  const [empLoading, setEmpLoading]   = useState(false)
  const [markedIds, setMarkedIds]     = useState(new Set())
  const [loading, setLoading]         = useState(true)
  const [showModal, setShowModal]     = useState(false)
  const [form, setForm]               = useState({ employee_id: '', status: 'Present', check_in: '', check_out: '' })
  const [formErrors, setFormErrors]   = useState({})
  const [toast, setToast]             = useState(null)
  const [search, setSearch]           = useState('')
  const [filterDept, setFilterDept]   = useState('')
  const [filterStatus, setFilterStatus] = useState('')
  const [date, setDate]               = useState(new Date().toISOString().split('T')[0])
  const [departments, setDepartments] = useState([])
  const [page, setPage]               = useState(1)
  const [total, setTotal]             = useState(0)
  const [saving, setSaving]           = useState(false)
  const limit = 20

  const showToast = (message, type = 'success') => { setToast({ message, type }); setTimeout(() => setToast(null), 3000) }

  const fetchStats = useCallback(async () => {
    try {
      const res = await api.get(`/attendance/stats?target_date=${date}`)
      if (res.ok) setStats(await res.json())
    } catch { /* ignore */ }
  }, [date])

  const fetchRecords = useCallback(async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams({ page, limit, target_date: date, ...(filterDept && { dept: filterDept }), ...(filterStatus && { status: filterStatus }) })
      const res = await api.get(`/attendance?${params}`)
      if (res.ok) { const d = await res.json(); setRecords(d.records || []); setTotal(d.total || 0) }
    } catch { /* ignore */ }
    setLoading(false)
  }, [page, date, filterDept, filterStatus])

  const fetchEmployees = useCallback(async () => {
    setEmpLoading(true)
    try {
      const [eRes, dRes] = await Promise.all([api.get('/employees?limit=500'), api.get('/departments?limit=100')])
      if (eRes.ok) { const d = await eRes.json(); setEmployees(d.employees || []) }
      else showToast('Failed to load employee list.', 'error')
      if (dRes.ok) { const d = await dRes.json(); setDepartments(d.departments || []) }
    } catch {
      showToast('Could not reach the server.', 'error')
    } finally {
      setEmpLoading(false)
    }
  }, [])

  useEffect(() => { fetchEmployees() }, [fetchEmployees])
  useEffect(() => { fetchStats(); fetchRecords() }, [fetchStats, fetchRecords])

  // Clear marked IDs immediately when the date changes so stale data never bleeds into the new day
  useEffect(() => { setMarkedIds(new Set()) }, [date])

  // When modal opens: ensure employee list is loaded and build the set of already-marked IDs for the selected date
  useEffect(() => {
    if (!showModal) return
    if (employees.length === 0) fetchEmployees()
    const fetchMarked = async () => {
      try {
        const res = await api.get(`/attendance?target_date=${date}&limit=500&page=1`)
        if (res.ok) {
          const d = await res.json()
          setMarkedIds(new Set((d.records || []).map(r => r.employee_id)))
        }
      } catch { /* ignore */ }
    }
    fetchMarked()
  }, [showModal, date]) // eslint-disable-line react-hooks/exhaustive-deps

  const filteredRecords = records.filter(r => {
    if (!search) return true
    return `${r.employee?.name ?? ''} ${r.employee?.emp_id ?? ''}`.toLowerCase().includes(search.toLowerCase())
  })

  const closeModal = () => { setShowModal(false); setForm({ employee_id: '', status: 'Present', check_in: '', check_out: '' }); setFormErrors({}) }

  const validate = () => {
    const errs = {}
    if (!form.employee_id) errs.employee_id = 'Please select an employee.'
    if ((form.status === 'Present' || form.status === 'Late') && !form.check_in) errs.check_in = 'Check-in required.'
    return errs
  }

  const handleMarkAttendance = async () => {
    const errs = validate()
    if (Object.keys(errs).length) { setFormErrors(errs); return }
    setSaving(true)
    try {
      const payload = {
        employee_id: form.employee_id,
        date,
        status: form.status,
        check_in: form.check_in || null,
        check_out: form.check_out || null,
      }
      const res = await api.post('/attendance', payload)
      if (res.ok || res.status === 201) {
        showToast('Attendance marked.')
        closeModal(); fetchStats(); fetchRecords()
      } else {
        const err = await res.json().catch(() => ({}))
        showToast(err.detail || 'Failed to mark attendance.', 'error')
      }
    } catch { showToast('Network error.', 'error') }
    setSaving(false)
  }

  const needsTimes = form.status === 'Present' || form.status === 'Late'
  const totalPages = Math.max(1, Math.ceil(total / limit))
  const availableEmployees = employees.filter(e => !markedIds.has(e.id))

  return (
    <div className="p-margin-mobile md:p-margin-desktop">
      {toast && (
        <div className={`fixed top-20 right-6 z-50 flex items-center gap-md px-lg py-md rounded-xl shadow-lg border text-label-md font-bold transition-all ${toast.type === 'error' ? 'bg-error-container text-on-error-container border-error/30' : 'bg-secondary-container text-on-secondary-container border-secondary/30'}`}>
          <span className="material-symbols-outlined text-[20px]">{toast.type === 'error' ? 'error' : 'check_circle'}</span>
          {toast.message}
        </div>
      )}

      {showModal && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-margin-mobile">
          <div className="absolute inset-0 bg-on-background/40 backdrop-blur-sm" onClick={closeModal}></div>
          <div className="relative bg-surface-container-lowest w-full max-w-md p-xl rounded-xl shadow-2xl border border-outline-variant space-y-lg">
            <div className="flex items-center justify-between">
              <h3 className="text-headline-md font-bold">Mark Attendance</h3>
              <button onClick={closeModal} className="p-2 hover:bg-surface-container rounded-full"><span className="material-symbols-outlined">close</span></button>
            </div>
            <div className="space-y-md">
              <div className="space-y-xs">
                <label className="text-label-md text-on-surface">Employee <span className="text-error">*</span></label>
                <EmployeeCombobox
                  employees={availableEmployees}
                  value={form.employee_id}
                  onChange={id => { setForm(p => ({ ...p, employee_id: id })); setFormErrors(p => ({ ...p, employee_id: '' })) }}
                  error={formErrors.employee_id}
                  loading={empLoading}
                />
                {formErrors.employee_id && <p className="text-label-sm text-error">{formErrors.employee_id}</p>}
              </div>
              <div className="space-y-xs">
                <label className="text-label-md text-on-surface">Status</label>
                <select className="w-full border border-outline-variant rounded-lg py-md px-md text-body-md focus:ring-1 focus:ring-primary outline-none" value={form.status} onChange={e => setForm(p => ({ ...p, status: e.target.value }))}>
                  <option>Present</option><option>Late</option><option>Absent</option><option>On Leave</option>
                </select>
              </div>
              {needsTimes && (
                <div className="grid grid-cols-2 gap-md">
                  <div className="space-y-xs">
                    <label className="text-label-md text-on-surface">Check In <span className="text-error">*</span></label>
                    <input type="time" className={`w-full border rounded-lg py-md px-md text-body-md focus:ring-1 outline-none ${formErrors.check_in ? 'border-error focus:ring-error' : 'border-outline-variant focus:ring-primary'}`} value={form.check_in} onChange={e => { setForm(p => ({ ...p, check_in: e.target.value })); setFormErrors(p => ({ ...p, check_in: '' })) }} />
                    {formErrors.check_in && <p className="text-label-sm text-error">{formErrors.check_in}</p>}
                  </div>
                  <div className="space-y-xs">
                    <label className="text-label-md text-on-surface">Check Out</label>
                    <input type="time" className="w-full border border-outline-variant rounded-lg py-md px-md text-body-md focus:ring-1 focus:ring-primary outline-none" value={form.check_out} onChange={e => setForm(p => ({ ...p, check_out: e.target.value }))} />
                  </div>
                </div>
              )}
            </div>
            <div className="flex justify-end gap-md pt-sm">
              <button onClick={closeModal} className="px-lg py-md text-on-surface-variant hover:bg-surface-container rounded-lg text-label-md">Cancel</button>
              <button onClick={handleMarkAttendance} disabled={saving} className="px-xl py-md bg-primary text-on-primary text-label-md rounded-lg shadow-md hover:opacity-90 disabled:opacity-50">{saving ? 'Saving…' : 'Save'}</button>
            </div>
          </div>
        </div>
      )}

      <div className="flex flex-col md:flex-row md:items-center justify-between mb-md gap-md">
        <div>
          <h2 className="text-headline-lg text-on-surface">Attendance Management</h2>
          <p className="text-body-md text-on-surface-variant">Track daily check-ins, exceptions, and attendance trends</p>
        </div>
        <div className="flex flex-wrap gap-sm">
          <button onClick={() => setShowModal(true)} className="flex items-center gap-xs px-lg py-sm bg-primary text-on-primary rounded-lg text-label-md hover:brightness-110 active:scale-95 transition-all shadow-md">
            <span className="material-symbols-outlined text-[18px]">how_to_reg</span>
            Mark Attendance
          </button>
        </div>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-gutter mb-lg">
        {[
          { label: 'Present',  val: stats.present,  icon: 'person_check', accent: 'bg-secondary',  soft: 'bg-secondary/10',           text: 'text-secondary' },
          { label: 'Late',     val: stats.late,     icon: 'schedule',     accent: 'bg-tertiary',   soft: 'bg-tertiary/10',            text: 'text-tertiary' },
          { label: 'Absent',   val: stats.absent,   icon: 'person_off',   accent: 'bg-error',      soft: 'bg-error/10',               text: 'text-error' },
          { label: 'On Leave', val: stats.on_leave, icon: 'event_busy',   accent: 'bg-outline',    soft: 'bg-surface-container-high', text: 'text-on-surface-variant' },
        ].map(s => {
          const pct = stats.total > 0 ? Math.round((s.val / stats.total) * 100) : 0
          return (
            <div key={s.label} className="bg-surface-container-lowest border border-outline-variant rounded-2xl shadow-sm overflow-hidden hover:shadow-md transition-shadow">
              <div className={`h-1 w-full ${s.accent}`} />
              <div className="p-lg flex flex-col gap-md">
                <div className="flex items-start justify-between">
                  <div className={`w-11 h-11 rounded-xl flex items-center justify-center ${s.soft}`}>
                    <span className={`material-symbols-outlined ${s.text}`} style={{ fontVariationSettings: "'FILL' 1" }}>{s.icon}</span>
                  </div>
                  <span className={`text-label-sm font-bold px-sm py-0.5 rounded-full ${s.soft} ${s.text}`}>{pct}%</span>
                </div>
                <div><p className="text-display font-black text-on-surface leading-none">{s.val}</p><p className="text-label-sm text-on-surface-variant uppercase tracking-widest mt-xs">{s.label}</p></div>
                <div className="h-1.5 bg-surface-container rounded-full overflow-hidden"><div className={`h-full ${s.accent} rounded-full transition-all duration-700`} style={{ width: `${pct}%` }} /></div>
              </div>
            </div>
          )
        })}
      </div>

      {/* Filter Bar */}
      <div className="bg-surface-container-lowest border border-outline-variant rounded-xl p-md mb-lg shadow-sm">
        <div className="flex flex-wrap items-end gap-md">
          <div className="flex-1 min-w-[200px]">
            <label className="text-label-sm text-on-surface-variant block mb-1">Search Employee</label>
            <div className="relative">
              <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-outline text-[18px]">search</span>
              <input className="w-full bg-background border border-outline-variant rounded-lg py-2 pl-10 pr-4 text-body-md focus:ring-2 focus:ring-primary outline-none" placeholder="Name or ID..." value={search} onChange={e => setSearch(e.target.value)} />
            </div>
          </div>
          <div>
            <label className="text-label-sm text-on-surface-variant block mb-1">Date</label>
            <input className="bg-background border border-outline-variant rounded-lg py-2 px-md text-body-md outline-none" type="date" value={date} onChange={e => { setDate(e.target.value); setPage(1) }} />
          </div>
          <div>
            <label className="text-label-sm text-on-surface-variant block mb-1">Department</label>
            <select className="bg-background border border-outline-variant rounded-lg py-2 px-3 text-body-md" value={filterDept} onChange={e => { setFilterDept(e.target.value); setPage(1) }}>
              <option value="">All Departments</option>
              {departments.map(d => <option key={d.id} value={d.name}>{d.name}</option>)}
            </select>
          </div>
          <div>
            <label className="text-label-sm text-on-surface-variant block mb-1">Status</label>
            <select className="bg-background border border-outline-variant rounded-lg py-2 px-3 text-body-md" value={filterStatus} onChange={e => { setFilterStatus(e.target.value); setPage(1) }}>
              <option value="">All Status</option>
              <option>Present</option><option>Late</option><option>Absent</option><option>On Leave</option>
            </select>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-gutter">
        <div className="lg:col-span-2 bg-surface-container-lowest border border-outline-variant rounded-xl overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-surface-container-low text-on-surface-variant text-label-md uppercase tracking-wider">
                  {['Employee', 'Check In', 'Check Out', 'Hours', 'Status'].map(h => <th key={h} className="px-lg py-md font-bold">{h}</th>)}
                </tr>
              </thead>
              <tbody className="divide-y divide-outline-variant text-body-md">
                {loading ? (
                  <tr><td colSpan={5} className="px-lg py-xl text-center text-on-surface-variant">Loading…</td></tr>
                ) : filteredRecords.length === 0 ? (
                  <tr><td colSpan={5} className="px-lg py-xl text-center text-on-surface-variant">No attendance records for this date.</td></tr>
                ) : filteredRecords.map(rec => (
                  <tr key={rec.id} className="hover:bg-surface-container-low transition-colors">
                    <td className="px-lg py-md">
                      <div className="flex items-center gap-sm">
                        <div className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-sm">{(rec.employee?.name ?? '?').split(' ').map(n => n[0]).join('')}</div>
                        <div><p className="font-bold">{rec.employee?.name ?? '—'}</p><p className="text-label-sm text-on-surface-variant">{rec.employee?.emp_id ?? '—'}</p></div>
                      </div>
                    </td>
                    <td className="px-lg py-md">{rec.check_in ?? '—'}</td>
                    <td className="px-lg py-md">{rec.check_out ?? '—'}</td>
                    <td className="px-lg py-md">{rec.hours ?? '—'}</td>
                    <td className="px-lg py-md"><span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-label-sm font-bold ${statusStyle[rec.status] ?? 'bg-surface-container text-on-surface-variant'}`}>{rec.status}</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="p-md bg-surface-container-low flex flex-col gap-md sm:flex-row sm:items-center sm:justify-between border-t border-outline-variant">
            <p className="text-label-sm text-on-surface-variant">Showing {filteredRecords.length} of {total} records</p>
            <div className="flex space-x-sm">
              <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1} className="p-1 rounded hover:bg-surface-container disabled:opacity-30"><span className="material-symbols-outlined">chevron_left</span></button>
              {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => i + 1).map(p => (
                <button key={p} onClick={() => setPage(p)} className={`px-3 py-1 rounded text-label-sm ${p === page ? 'bg-primary text-on-primary' : 'hover:bg-surface-container'}`}>{p}</button>
              ))}
              <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page >= totalPages} className="p-1 rounded hover:bg-surface-container disabled:opacity-30"><span className="material-symbols-outlined">chevron_right</span></button>
            </div>
          </div>
        </div>

        {/* Exceptions Panel */}
        <div className="bg-surface-container-lowest border border-outline-variant rounded-xl p-lg shadow-sm">
          <h4 className="text-headline-md font-bold mb-xs">Attendance Summary</h4>
          <p className="text-label-sm text-outline mb-lg">{date}</p>
          <div className="space-y-sm">
            {[
              { label: 'Present', val: stats.present, color: 'bg-secondary' },
              { label: 'Late', val: stats.late, color: 'bg-tertiary' },
              { label: 'Absent', val: stats.absent, color: 'bg-error' },
              { label: 'On Leave', val: stats.on_leave, color: 'bg-outline' },
            ].map(({ label, val, color }) => {
              const pct = stats.total > 0 ? Math.round((val / stats.total) * 100) : 0
              return (
                <div key={label}>
                  <div className="flex justify-between text-label-sm mb-xs"><span>{label}</span><span className="font-bold">{val} ({pct}%)</span></div>
                  <div className="w-full h-2 bg-surface-container rounded-full overflow-hidden"><div className={`h-full ${color} rounded-full transition-all`} style={{ width: `${pct}%` }}></div></div>
                </div>
              )
            })}
          </div>
          <div className="mt-xl p-md bg-error-container/20 border border-error/20 rounded-lg">
            <h5 className="font-bold text-error text-body-md mb-xs">Exceptions</h5>
            <div className="space-y-sm text-label-sm">
              <div className="flex items-center gap-xs text-on-surface-variant"><span className="w-2 h-2 rounded-full bg-error"></span>{stats.absent} absent</div>
              <div className="flex items-center gap-xs text-on-surface-variant"><span className="w-2 h-2 rounded-full bg-tertiary"></span>{stats.late} late arrival{stats.late !== 1 ? 's' : ''}</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
