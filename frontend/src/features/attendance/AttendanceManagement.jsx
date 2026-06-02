import { useState } from 'react'

const initialData = [
  { id: '#EMP-001', name: 'John Doe',      dept: 'HR',          checkIn: '08:54 AM', checkOut: '05:10 PM', hours: '8h 16m', status: 'Present' },
  { id: '#EMP-002', name: 'Sarah Jenkins', dept: 'Engineering', checkIn: '09:22 AM', checkOut: '06:05 PM', hours: '8h 43m', status: 'Late' },
  { id: '#EMP-003', name: 'Michael Ross',  dept: 'Marketing',   checkIn: '—',        checkOut: '—',        hours: '—',      status: 'Absent' },
  { id: '#EMP-004', name: 'Alicia Lee',    dept: 'Finance',     checkIn: '—',        checkOut: '—',        hours: '—',      status: 'On Leave' },
  { id: '#EMP-005', name: 'David Kim',     dept: 'Engineering', checkIn: '08:30 AM', checkOut: '05:00 PM', hours: '8h 30m', status: 'Present' },
]

const statusStyle = {
  Present:   'bg-secondary-container text-on-secondary-container',
  Late:      'bg-tertiary-fixed text-on-tertiary-fixed-variant',
  Absent:    'bg-error-container text-on-error-container',
  'On Leave':'bg-surface-variant text-on-surface-variant',
}

const fmtTime = (t) => {
  if (!t) return '—'
  const [h, m] = t.split(':').map(Number)
  const ampm = h >= 12 ? 'PM' : 'AM'
  return `${h % 12 || 12}:${String(m).padStart(2, '0')} ${ampm}`
}

const calcHours = (checkIn, checkOut) => {
  if (!checkIn || !checkOut) return '—'
  const toMin = (t) => { const [h, m] = t.split(':').map(Number); return h * 60 + m }
  const diff = toMin(checkOut) - toMin(checkIn)
  if (diff <= 0) return '—'
  return `${Math.floor(diff / 60)}h ${diff % 60}m`
}

const emptyForm = { empId: '', status: 'Present', checkIn: '', checkOut: '' }

export default function AttendanceManagement() {
  const [attendance, setAttendance]   = useState(initialData)
  const [showModal, setShowModal]     = useState(false)
  const [form, setForm]               = useState(emptyForm)
  const [toast, setToast]             = useState(null)
  const [search, setSearch]           = useState('')
  const [filterDept, setFilterDept]   = useState('All Departments')
  const [filterStatus, setFilterStatus] = useState('All Status')
  const [date, setDate]               = useState('2024-10-24')

  const showToast = (message, type = 'success') => {
    setToast({ message, type })
    setTimeout(() => setToast(null), 3000)
  }

  const filtered = attendance.filter(emp => {
    const matchSearch  = `${emp.name} ${emp.id}`.toLowerCase().includes(search.toLowerCase())
    const matchDept    = filterDept   === 'All Departments' || emp.dept   === filterDept
    const matchStatus  = filterStatus === 'All Status'      || emp.status === filterStatus
    return matchSearch && matchDept && matchStatus
  })

  const handleMarkAttendance = () => {
    if (!form.empId) return
    const needsTimes = form.status === 'Present' || form.status === 'Late'
    const checkIn  = needsTimes && form.checkIn  ? fmtTime(form.checkIn)  : '—'
    const checkOut = needsTimes && form.checkOut ? fmtTime(form.checkOut) : '—'
    const hours    = needsTimes && form.checkIn && form.checkOut ? calcHours(form.checkIn, form.checkOut) : '—'

    setAttendance(prev => prev.map(emp =>
      emp.id === form.empId ? { ...emp, status: form.status, checkIn, checkOut, hours } : emp
    ))
    setShowModal(false)
    setForm(emptyForm)
    const emp = attendance.find(e => e.id === form.empId)
    showToast(`Attendance marked for ${emp?.name}.`)
  }

  const counts = {
    Present:   attendance.filter(e => e.status === 'Present').length,
    Late:      attendance.filter(e => e.status === 'Late').length,
    Absent:    attendance.filter(e => e.status === 'Absent').length,
    'On Leave':attendance.filter(e => e.status === 'On Leave').length,
  }

  const needsTimes = form.status === 'Present' || form.status === 'Late'

  return (
    <div className="p-margin-mobile md:p-margin-desktop">
      {/* Toast */}
      {toast && (
        <div className={`fixed top-20 right-6 z-50 flex items-center gap-md px-lg py-md rounded-xl shadow-lg border text-label-md font-bold transition-all ${
          toast.type === 'error'
            ? 'bg-error-container text-on-error-container border-error/30'
            : 'bg-secondary-container text-on-secondary-container border-secondary/30'
        }`}>
          <span className="material-symbols-outlined text-[20px]">check_circle</span>
          {toast.message}
        </div>
      )}

      {/* Mark Attendance Modal */}
      {showModal && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-margin-mobile">
          <div className="absolute inset-0 bg-on-background/40 backdrop-blur-sm" onClick={() => setShowModal(false)}></div>
          <div className="relative bg-surface-container-lowest w-full max-w-md p-xl rounded-xl shadow-2xl border border-outline-variant space-y-lg">
            <div className="flex items-center justify-between">
              <h3 className="text-headline-md font-bold">Mark Attendance</h3>
              <button onClick={() => setShowModal(false)} className="p-2 hover:bg-surface-container rounded-full">
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>
            <div className="space-y-md">
              <div className="space-y-xs">
                <label className="text-label-md text-on-surface">Employee</label>
                <select
                  className="w-full border border-outline-variant rounded-lg py-md px-md text-body-md focus:ring-1 focus:ring-primary outline-none"
                  value={form.empId}
                  onChange={e => setForm(prev => ({ ...prev, empId: e.target.value }))}
                >
                  <option value="">Select employee…</option>
                  {attendance.map(emp => (
                    <option key={emp.id} value={emp.id}>{emp.name} ({emp.id})</option>
                  ))}
                </select>
              </div>
              <div className="space-y-xs">
                <label className="text-label-md text-on-surface">Status</label>
                <select
                  className="w-full border border-outline-variant rounded-lg py-md px-md text-body-md focus:ring-1 focus:ring-primary outline-none"
                  value={form.status}
                  onChange={e => setForm(prev => ({ ...prev, status: e.target.value }))}
                >
                  <option>Present</option>
                  <option>Late</option>
                  <option>Absent</option>
                  <option>On Leave</option>
                </select>
              </div>
              {needsTimes && (
                <div className="grid grid-cols-2 gap-md">
                  <div className="space-y-xs">
                    <label className="text-label-md text-on-surface">Check In</label>
                    <input
                      type="time"
                      className="w-full border border-outline-variant rounded-lg py-md px-md text-body-md focus:ring-1 focus:ring-primary outline-none"
                      value={form.checkIn}
                      onChange={e => setForm(prev => ({ ...prev, checkIn: e.target.value }))}
                    />
                  </div>
                  <div className="space-y-xs">
                    <label className="text-label-md text-on-surface">Check Out</label>
                    <input
                      type="time"
                      className="w-full border border-outline-variant rounded-lg py-md px-md text-body-md focus:ring-1 focus:ring-primary outline-none"
                      value={form.checkOut}
                      onChange={e => setForm(prev => ({ ...prev, checkOut: e.target.value }))}
                    />
                  </div>
                </div>
              )}
              {needsTimes && form.checkIn && form.checkOut && (
                <p className="text-label-md text-primary font-bold">
                  Total: {calcHours(form.checkIn, form.checkOut)}
                </p>
              )}
            </div>
            <div className="flex justify-end gap-md pt-sm">
              <button onClick={() => setShowModal(false)} className="px-lg py-md text-on-surface-variant hover:bg-surface-container rounded-lg text-label-md">Cancel</button>
              <button
                onClick={handleMarkAttendance}
                disabled={!form.empId}
                className="px-xl py-md bg-primary text-on-primary text-label-md rounded-lg shadow-md hover:opacity-90 disabled:opacity-40 disabled:cursor-not-allowed"
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="flex flex-col md:flex-row md:items-center justify-between mb-xl gap-md">
        <div>
          <h2 className="text-headline-lg text-on-surface">Attendance Management</h2>
          <p className="text-body-md text-on-surface-variant">Track daily check-ins, exceptions, and attendance trends</p>
        </div>
        <div className="flex flex-wrap gap-sm">
          <button
            onClick={() => showToast('Exporting attendance report…')}
            className="flex items-center gap-xs px-md py-sm border border-outline-variant rounded-lg text-label-md hover:bg-surface-container transition-all"
          >
            <span className="material-symbols-outlined text-[18px]">download</span>
            Export Report
          </button>
          <button
            onClick={() => setShowModal(true)}
            className="flex items-center gap-xs px-lg py-sm bg-primary text-on-primary rounded-lg text-label-md hover:brightness-110 active:scale-95 transition-all shadow-md"
          >
            <span className="material-symbols-outlined text-[18px]">how_to_reg</span>
            Mark Attendance
          </button>
        </div>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-gutter mb-lg">
        {[
          { label: 'Present',  val: counts['Present'],   icon: 'person_check', color: 'bg-secondary/10 text-secondary' },
          { label: 'Late',     val: counts['Late'],      icon: 'schedule',     color: 'bg-tertiary/10 text-tertiary' },
          { label: 'Absent',   val: counts['Absent'],    icon: 'person_off',   color: 'bg-error/10 text-error' },
          { label: 'On Leave', val: counts['On Leave'],  icon: 'event_busy',   color: 'bg-outline-variant text-on-surface-variant' },
        ].map(s => (
          <div key={s.label} className="bg-surface-container-lowest border border-outline-variant p-lg rounded-xl shadow-sm">
            <div className="flex items-center justify-between mb-md">
              <div className={`w-10 h-10 rounded-full flex items-center justify-center ${s.color}`}>
                <span className="material-symbols-outlined">{s.icon}</span>
              </div>
              <span className="text-label-sm font-bold text-on-surface-variant">
                {attendance.length > 0 ? `${Math.round((s.val / attendance.length) * 100)}%` : '0%'}
              </span>
            </div>
            <p className="text-label-sm text-outline uppercase tracking-wider">{s.label}</p>
            <h3 className="text-headline-lg mt-xs">{s.val}</h3>
          </div>
        ))}
      </div>

      {/* Filter Bar */}
      <div className="bg-surface-container-lowest border border-outline-variant rounded-xl p-md mb-lg shadow-sm">
        <div className="flex flex-wrap items-end gap-md">
          <div className="flex-1 min-w-[200px]">
            <label className="text-label-sm text-on-surface-variant block mb-1">Search Employee</label>
            <div className="relative">
              <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-outline text-[18px]">search</span>
              <input
                className="w-full bg-background border border-outline-variant rounded-lg py-2 pl-10 pr-4 text-body-md focus:ring-2 focus:ring-primary outline-none"
                placeholder="Name or ID..."
                type="text"
                value={search}
                onChange={e => setSearch(e.target.value)}
              />
            </div>
          </div>
          <div>
            <label className="text-label-sm text-on-surface-variant block mb-1">Date</label>
            <input
              className="bg-background border border-outline-variant rounded-lg py-2 px-md text-body-md outline-none"
              type="date"
              value={date}
              onChange={e => setDate(e.target.value)}
            />
          </div>
          <div>
            <label className="text-label-sm text-on-surface-variant block mb-1">Department</label>
            <select
              className="bg-background border border-outline-variant rounded-lg py-2 px-3 text-body-md"
              value={filterDept}
              onChange={e => setFilterDept(e.target.value)}
            >
              <option>All Departments</option>
              <option>Engineering</option>
              <option>Marketing</option>
              <option>HR</option>
              <option>Finance</option>
            </select>
          </div>
          <div>
            <label className="text-label-sm text-on-surface-variant block mb-1">Status</label>
            <select
              className="bg-background border border-outline-variant rounded-lg py-2 px-3 text-body-md"
              value={filterStatus}
              onChange={e => setFilterStatus(e.target.value)}
            >
              <option>All Status</option>
              <option>Present</option>
              <option>Late</option>
              <option>Absent</option>
              <option>On Leave</option>
            </select>
          </div>
        </div>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-gutter">
        {/* Attendance Table */}
        <div className="lg:col-span-2 bg-surface-container-lowest border border-outline-variant rounded-xl overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-surface-container-low text-on-surface-variant text-label-md uppercase tracking-wider">
                  <th className="px-lg py-md font-bold">Employee</th>
                  <th className="px-lg py-md font-bold">Check In</th>
                  <th className="px-lg py-md font-bold">Check Out</th>
                  <th className="px-lg py-md font-bold">Hours</th>
                  <th className="px-lg py-md font-bold">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-outline-variant text-body-md">
                {filtered.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-lg py-xl text-center text-on-surface-variant text-body-md">
                      No employees match the current filters.
                    </td>
                  </tr>
                ) : filtered.map(emp => (
                  <tr key={emp.id} className="hover:bg-surface-container-low transition-colors">
                    <td className="px-lg py-md">
                      <div className="flex items-center gap-sm">
                        <div className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-sm">
                          {emp.name.split(' ').map(n => n[0]).join('')}
                        </div>
                        <div>
                          <p className="font-bold">{emp.name}</p>
                          <p className="text-label-sm text-on-surface-variant">{emp.dept}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-lg py-md">{emp.checkIn}</td>
                    <td className="px-lg py-md">{emp.checkOut}</td>
                    <td className="px-lg py-md">{emp.hours}</td>
                    <td className="px-lg py-md">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-label-sm font-bold ${statusStyle[emp.status]}`}>
                        {emp.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="p-md bg-surface-container-low flex flex-col gap-md sm:flex-row sm:items-center sm:justify-between border-t border-outline-variant">
            <p className="text-label-sm text-on-surface-variant">
              {search || filterDept !== 'All Departments' || filterStatus !== 'All Status'
                ? `${filtered.length} result${filtered.length !== 1 ? 's' : ''} found`
                : `Showing ${attendance.length} of ${attendance.length} employees`}
            </p>
            <div className="flex space-x-sm">
              <button className="p-1 rounded hover:bg-surface-container opacity-30" disabled>
                <span className="material-symbols-outlined">chevron_left</span>
              </button>
              <button className="px-3 py-1 rounded bg-primary text-on-primary text-label-sm">1</button>
              <button className="px-3 py-1 rounded hover:bg-surface-container text-label-sm">2</button>
              <button className="p-1 rounded hover:bg-surface-container">
                <span className="material-symbols-outlined">chevron_right</span>
              </button>
            </div>
          </div>
        </div>

        {/* Peak Hours Panel */}
        <div className="bg-surface-container-lowest border border-outline-variant rounded-xl p-lg shadow-sm">
          <h4 className="text-headline-md font-bold mb-xs">Peak Check-In Hours</h4>
          <p className="text-label-sm text-outline mb-lg">Today's activity heatmap</p>
          <div className="space-y-sm">
            {[
              { time: '7–8 AM', pct: 15 }, { time: '8–9 AM', pct: 55 },
              { time: '9–10 AM', pct: 80 }, { time: '10–11 AM', pct: 25 },
              { time: '11 AM–12', pct: 10 },
            ].map(({ time, pct }) => (
              <div key={time}>
                <div className="flex justify-between text-label-sm mb-xs">
                  <span>{time}</span>
                  <span className="font-bold">{pct}%</span>
                </div>
                <div className="w-full h-2 bg-surface-container rounded-full overflow-hidden">
                  <div className="h-full bg-primary rounded-full transition-all" style={{ width: `${pct}%` }}></div>
                </div>
              </div>
            ))}
          </div>
          <div className="mt-xl p-md bg-error-container/20 border border-error/20 rounded-lg">
            <h5 className="font-bold text-error text-body-md mb-xs">Exceptions Today</h5>
            <div className="space-y-sm text-label-sm">
              <div className="flex items-center gap-xs text-on-surface-variant">
                <span className="w-2 h-2 rounded-full bg-error"></span>
                {counts['Absent']} employee{counts['Absent'] !== 1 ? 's' : ''} absent
              </div>
              <div className="flex items-center gap-xs text-on-surface-variant">
                <span className="w-2 h-2 rounded-full bg-tertiary"></span>
                {counts['Late']} late arrival{counts['Late'] !== 1 ? 's' : ''} flagged
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
