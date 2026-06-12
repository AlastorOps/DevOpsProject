import { useState, useEffect, useCallback } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { dashboardService } from '../../api/dashboard.js'
import { attendanceService } from '../../api/attendance.js'
import { leaveService } from '../../api/leave.js'
import { notificationService } from '../../api/notifications.js'
import { useAttendance } from '../../context/AttendanceContext.jsx'

const statusStyle = {
  'On Time': 'bg-secondary-container text-on-secondary-container',
  Late:      'bg-error-container text-on-error-container',
  Present:   'bg-secondary-container text-on-secondary-container',
  Absent:    'bg-error-container text-on-error-container',
}

const leaveStatusStyle = {
  Pending:  'bg-tertiary-fixed text-on-tertiary-fixed border border-tertiary/20',
  Approved: 'bg-secondary-container text-on-secondary-container border border-secondary/20',
  Rejected: 'bg-error-container text-on-error-container border border-error/20',
}

const TZ = 'Asia/Bangkok'

const fmtTime = (t) => t ? t.slice(0, 5) : '—'

const fmtLiveClock = (date) =>
  date.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit', second: '2-digit', timeZone: TZ })

const fmtLiveDate = (date) =>
  date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', timeZone: TZ })

const formatSeconds = (s) => {
  const h = Math.floor(s / 3600)
  const m = Math.floor((s % 3600) / 60)
  const sec = s % 60
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:${String(sec).padStart(2, '0')}`
}

export default function EmployeeDashboard() {
  const [now, setNow]                 = useState(new Date())
  const [data, setData]               = useState(null)
  const [loading, setLoading]         = useState(true)
  const [recentLeave, setRecentLeave] = useState([])
  const [attendanceLogs, setAttendanceLogs] = useState([])

  // Today's attendance — shared with FloatingCheckout via context
  const { todayAtt, seconds, attLoading, busy: attBusy, checkIn: ctxCheckIn, checkOut: ctxCheckOut } = useAttendance()
  const [attError, setAttError] = useState('')

  const navigate = useNavigate()

  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 1000)
    return () => clearInterval(id)
  }, [])

  // Load dashboard data + attendance log
  useEffect(() => {
    const load = async () => {
      try {
        const res = await dashboardService.employeeStats()
        if (res.ok) {
          const d = await res.json()
          setData(d)
          if (d.employee?.id) {
            const [attRes, leaveRes] = await Promise.all([
              attendanceService.listByEmployee(d.employee.id, { limit: 3 }),
              leaveService.listByEmployee(d.employee.id, { limit: 5 }),
            ])
            if (attRes.ok) { const a = await attRes.json(); setAttendanceLogs(a.records || []) }
            if (leaveRes.ok) { const l = await leaveRes.json(); setRecentLeave(l.requests || []) }
          }
        }
      } catch { /* ignore */ }
      setLoading(false)
    }
    load()
  }, [])

  const handleCheckIn = async () => {
    setAttError('')
    const result = await ctxCheckIn()
    if (!result.ok) setAttError(result.error)
  }

  const handleCheckOut = async () => {
    setAttError('')
    const result = await ctxCheckOut()
    if (!result.ok) setAttError(result.error)
  }

  const markNotificationRead = async (id) => {
    await notificationService.markRead(id)
    setData(prev => prev ? {
      ...prev,
      notifications: prev.notifications.map(n => n.id === id ? { ...n, read: true } : n),
      unread_notifications: Math.max(0, (prev.unread_notifications || 0) - 1),
    } : prev)
  }

  if (loading) return (
    <div className="p-margin-mobile md:p-margin-desktop flex items-center justify-center h-64">
      <span className="material-symbols-outlined text-primary text-[40px]" style={{ animation: 'spin 1s linear infinite' }}>progress_activity</span>
    </div>
  )

  if (!data) return (
    <div className="p-margin-mobile md:p-margin-desktop">
      <div className="bg-error-container/20 border border-error/20 rounded-xl p-lg text-on-error-container">
        No employee profile linked to this account.
      </div>
    </div>
  )

  const emp = data.employee
  const att = data.attendance_this_month
  const totalDays = att.total_days || 1
  const presentPct = Math.round(((att.present + att.late) / totalDays) * 100)
  const recentPayroll = data.recent_payroll
  const fullName = emp.name ?? 'there'

  const checkedIn  = !!todayAtt?.check_in
  const checkedOut = !!todayAtt?.check_out

  return (
    <div className="pt-8 pb-xl px-margin-mobile md:px-margin-desktop">
      <section className="flex flex-col md:flex-row md:items-end justify-between mb-xl">
        <div>
          <h1 className="text-display text-on-surface">Hello, {fullName}.</h1>
          <p className="text-body-lg text-outline mt-xs">Here is what's happening with your profile today.</p>
        </div>
        <div className="flex flex-wrap gap-sm mt-md md:mt-0">
          <Link to="/leave/request" className="flex items-center gap-xs px-md py-sm bg-primary text-on-primary rounded-xl text-label-md transition-transform active:scale-95 shadow-sm hover:bg-primary-container">
            <span className="material-symbols-outlined text-[20px]">add</span>
            Request Leave
          </Link>
          {recentPayroll?.payroll_id && (
            <Link
              to={`/payroll/payslip?emp=${emp.id}`}
              className="flex items-center gap-xs px-md py-sm bg-surface-container-lowest border border-outline-variant text-on-surface rounded-xl text-label-md transition-transform active:scale-95 shadow-sm hover:bg-surface-container-low"
            >
              <span className="material-symbols-outlined text-[20px]">receipt_long</span>
              View Payslip
            </Link>
          )}
        </div>
      </section>

      <div className="grid grid-cols-12 gap-gutter">
        {/* Profile */}
        <div className="col-span-12 lg:col-span-4 bg-surface-container-lowest rounded-xl p-lg border border-outline-variant shadow-sm relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full -mr-16 -mt-16 transition-transform group-hover:scale-150 duration-700"></div>
          <div className="relative z-10 flex flex-col h-full">
            <div className="flex items-start justify-between">
              <div className="w-20 h-20 rounded-2xl bg-primary/10 flex items-center justify-center text-primary border-4 border-surface shadow-md overflow-hidden">
                {emp.photo_path
                  ? <img src={`/uploads/${emp.photo_path}`} alt={emp.name} className="w-full h-full object-cover" />
                  : <span className="material-symbols-outlined text-[48px]" style={{ fontVariationSettings: "'FILL' 1" }}>person</span>
                }
              </div>
              <button onClick={() => navigate('/profile')} className="text-primary hover:bg-primary/10 p-2 rounded-full transition-colors">
                <span className="material-symbols-outlined">edit</span>
              </button>
            </div>
            <div className="mt-md">
              <h3 className="text-headline-md">{emp.name}</h3>
              <p className="text-body-md text-outline">{emp.emp_id}</p>
            </div>
            <div className="mt-auto pt-lg border-t border-outline-variant/30 grid grid-cols-2 gap-md">
              <div>
                <span className="text-label-sm text-outline block">Status</span>
                <span className="text-label-md font-bold">{emp.status}</span>
              </div>
              <div>
                <span className="text-label-sm text-outline block">Email</span>
                <span className="text-label-md font-bold truncate block">{emp.email}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Monthly Attendance Circle */}
        <div className="col-span-12 md:col-span-6 lg:col-span-4 bg-surface-container-lowest rounded-xl p-lg border border-outline-variant shadow-sm flex flex-col">
          <div className="flex items-center justify-between mb-md">
            <h4 className="text-label-md uppercase tracking-wider text-outline">Monthly Attendance</h4>
            <span className="text-secondary font-bold text-label-md">{presentPct}%</span>
          </div>
          <div className="flex-1 flex flex-col items-center justify-center py-md">
            <div className="relative w-36 h-36 flex items-center justify-center">
              <svg className="w-full h-full -rotate-90">
                <circle className="text-surface-container" cx="72" cy="72" fill="transparent" r="64" stroke="currentColor" strokeWidth="12" />
                <circle className="text-primary" cx="72" cy="72" fill="transparent" r="64" stroke="currentColor" strokeDasharray="402" strokeDashoffset={402 - (402 * presentPct / 100)} strokeWidth="12" />
              </svg>
              <div className="absolute flex flex-col items-center">
                <span className="text-headline-lg font-bold">{att.present + att.late}/{totalDays}</span>
                <span className="text-label-sm text-outline">Days</span>
              </div>
            </div>
            <div className="flex gap-md mt-lg">
              <div className="flex items-center gap-xs"><div className="w-3 h-3 rounded-full bg-primary"></div><span className="text-label-sm">Present</span></div>
              <div className="flex items-center gap-xs"><div className="w-3 h-3 rounded-full bg-surface-container"></div><span className="text-label-sm">Remaining</span></div>
            </div>
          </div>
        </div>

        {/* Salary & Notifications */}
        <div className="col-span-12 md:col-span-6 lg:col-span-4 flex flex-col gap-gutter">
          <div className="bg-primary-container text-on-primary-container rounded-xl p-lg shadow-sm border border-primary relative overflow-hidden">
            <div className="absolute bottom-0 right-0 opacity-10"><span className="material-symbols-outlined text-[80px]">payments</span></div>
            <h4 className="text-label-md opacity-80 uppercase mb-xs">Latest Salary</h4>
            {recentPayroll?.net ? (
              <>
                <div className="flex items-baseline gap-xs">
                  <span className="text-display leading-tight">${Number(recentPayroll.net).toLocaleString('en-US', { minimumFractionDigits: 2 })}</span>
                  <span className="text-label-md opacity-80">Net Pay</span>
                </div>
                <p className="text-label-sm mt-md opacity-70">{recentPayroll.month} · {recentPayroll.status}</p>
              </>
            ) : (
              <p className="text-display leading-tight opacity-70">—</p>
            )}
          </div>
          <div className="bg-surface-container-lowest border border-outline-variant rounded-xl p-lg shadow-sm flex-1">
            <div className="flex items-center justify-between mb-md">
              <h4 className="text-label-md uppercase tracking-wider text-outline">Notifications</h4>
              {data.unread_notifications > 0 && (
                <span className="bg-error text-on-error text-[10px] font-bold px-1.5 py-0.5 rounded-full">{data.unread_notifications}</span>
              )}
            </div>
            <div className="space-y-md">
              {(data.notifications || []).slice(0, 3).map(n => (
                <div key={n.id} className={`flex gap-md cursor-pointer ${!n.read ? 'opacity-100' : 'opacity-60'}`} onClick={() => !n.read && markNotificationRead(n.id)}>
                  <div className="w-8 h-8 rounded-full bg-secondary-container flex items-center justify-center shrink-0">
                    <span className="material-symbols-outlined text-on-secondary-container text-[18px]">{n.icon}</span>
                  </div>
                  <div>
                    <p className="text-body-md font-bold leading-tight">{n.title}</p>
                    <p className="text-label-sm text-outline leading-tight mt-1">{n.body}</p>
                  </div>
                </div>
              ))}
              {(data.notifications || []).length === 0 && <p className="text-label-sm text-outline">No notifications.</p>}
            </div>
          </div>
        </div>

        {/* ── Check In / Check Out Widget ─────────────────────────────────────── */}
        <div className="col-span-12 bg-surface-container-lowest rounded-xl border border-outline-variant shadow-sm overflow-hidden">
          <div className="p-lg">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-lg gap-xs">
              <h4 className="text-label-md uppercase tracking-wider text-outline">Today's Attendance</h4>
              <div className="flex items-center gap-xs">
                {attLoading ? null : !checkedIn ? (
                  <span className="flex items-center gap-xs text-label-sm text-on-surface-variant">
                    <span className="w-2 h-2 rounded-full bg-outline"></span>
                    Not checked in
                  </span>
                ) : !checkedOut ? (
                  <span className="flex items-center gap-xs text-label-sm text-secondary font-bold">
                    <span className="w-2 h-2 rounded-full bg-secondary" style={{ animation: 'ping 1.5s cubic-bezier(0,0,0.2,1) infinite' }}></span>
                    Checked In
                  </span>
                ) : (
                  <span className="flex items-center gap-xs text-label-sm text-on-surface-variant font-bold">
                    <span className="w-2 h-2 rounded-full bg-outline"></span>
                    Shift complete
                  </span>
                )}
                <span className="text-label-sm text-on-surface-variant ml-md hidden sm:flex sm:flex-col sm:items-end">
                  <span className="font-mono font-bold">{fmtLiveClock(now)}</span>
                  <span>{fmtLiveDate(now)}</span>
                </span>
              </div>
            </div>

            {attLoading ? (
              <div className="flex items-center justify-center h-20">
                <span className="material-symbols-outlined text-primary text-[32px]" style={{ animation: 'spin 1s linear infinite' }}>progress_activity</span>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-gutter">

                {/* Check In column */}
                <div className="flex flex-col gap-sm">
                  <span className="text-label-sm text-on-surface-variant uppercase tracking-wider flex items-center gap-xs">
                    <span className="material-symbols-outlined text-[16px]">login</span>
                    Check In
                  </span>
                  <p className="text-headline-lg font-bold font-mono text-on-surface">
                    {checkedIn ? fmtTime(todayAtt.check_in) : '—'}
                  </p>
                  {!checkedIn && (
                    <button
                      onClick={handleCheckIn}
                      disabled={attBusy}
                      className="mt-xs flex items-center gap-xs px-lg py-sm bg-primary text-on-primary rounded-lg text-label-md hover:brightness-110 active:scale-95 transition-all disabled:opacity-50 w-fit shadow-sm"
                    >
                      <span className="material-symbols-outlined text-[18px]">login</span>
                      {attBusy ? 'Checking in…' : 'Check In'}
                    </button>
                  )}
                  {checkedIn && (
                    <span className={`text-label-sm font-bold ${todayAtt.status === 'Late' ? 'text-error' : 'text-secondary'}`}>
                      {todayAtt.status}
                    </span>
                  )}
                </div>

                {/* Working Time column */}
                <div className="flex flex-col gap-sm items-center justify-center text-center border-t border-outline-variant sm:border-t-0 sm:border-x sm:border-outline-variant pt-md sm:pt-0 sm:px-gutter">
                  <span className="text-label-sm text-on-surface-variant uppercase tracking-wider flex items-center gap-xs">
                    <span className="material-symbols-outlined text-[16px]">timer</span>
                    {checkedOut ? 'Total Time' : 'Working Time'}
                  </span>
                  {!checkedIn ? (
                    <p className="text-display font-mono font-bold text-on-surface-variant opacity-30">00:00:00</p>
                  ) : checkedOut ? (
                    <>
                      <p className="text-display font-mono font-bold text-on-surface">{formatSeconds(seconds)}</p>
                      {todayAtt.hours && (
                        <span className="text-label-sm text-on-surface-variant">{todayAtt.hours}</span>
                      )}
                    </>
                  ) : (
                    <>
                      <p className="text-display font-mono font-bold text-primary">{formatSeconds(seconds)}</p>
                      <span className="flex items-center gap-xs text-label-sm text-secondary">
                        <span className="w-1.5 h-1.5 rounded-full bg-secondary" style={{ animation: 'ping 1.5s cubic-bezier(0,0,0.2,1) infinite' }}></span>
                        Live
                      </span>
                    </>
                  )}
                </div>

                {/* Check Out column */}
                <div className="flex flex-col gap-sm items-end border-t border-outline-variant sm:border-t-0 pt-md sm:pt-0">
                  <span className="text-label-sm text-on-surface-variant uppercase tracking-wider flex items-center gap-xs">
                    Check Out
                    <span className="material-symbols-outlined text-[16px]">logout</span>
                  </span>
                  <p className="text-headline-lg font-bold font-mono text-on-surface">
                    {checkedOut ? fmtTime(todayAtt.check_out) : '—'}
                  </p>
                  {checkedIn && !checkedOut && (
                    <button
                      onClick={handleCheckOut}
                      disabled={attBusy}
                      className="mt-xs flex items-center gap-xs px-lg py-sm bg-error text-on-error rounded-lg text-label-md hover:opacity-90 active:scale-95 transition-all disabled:opacity-50 w-fit shadow-sm"
                    >
                      <span className="material-symbols-outlined text-[18px]">logout</span>
                      {attBusy ? 'Checking out…' : 'Check Out'}
                    </button>
                  )}
                  {checkedOut && (
                    <span className="text-label-sm text-on-surface-variant">Shift complete</span>
                  )}
                </div>
              </div>
            )}

            {attError && (
              <div className="mt-md flex items-center gap-sm p-md bg-error/10 border border-error/20 rounded-lg text-body-sm text-error">
                <span className="material-symbols-outlined text-[18px] shrink-0">error</span>
                {attError}
              </div>
            )}
          </div>
        </div>
        {/* ── End Check In / Check Out Widget ─────────────────────────────────── */}

        {/* Leave Balance */}
        <div className="col-span-12 lg:col-span-8 bg-surface-container-lowest rounded-xl p-lg border border-outline-variant shadow-sm">
          <h4 className="text-label-md uppercase tracking-wider text-outline mb-lg">Leave Balance</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-xl">
            {(data.leave_balance || []).map((lb, i) => {
              const colors = ['bg-primary', 'bg-secondary', 'bg-tertiary', 'bg-outline', 'bg-error']
              const pct = lb.total > 0 ? Math.round((lb.used / lb.total) * 100) : 0
              return (
                <div key={lb.leave_type} className="space-y-md">
                  <div className="flex justify-between items-center mb-xs">
                    <span className="text-label-md font-bold">{lb.leave_type}</span>
                    <span className="text-label-md">{lb.used}/{lb.total} Days</span>
                  </div>
                  <div className="h-2 w-full bg-surface-container rounded-full overflow-hidden">
                    <div className={`h-full ${colors[i % colors.length]} rounded-full`} style={{ width: `${pct}%` }}></div>
                  </div>
                  <p className="text-label-sm text-outline">Remaining: {lb.remaining} Days</p>
                </div>
              )
            })}
          </div>
        </div>

        {/* Attendance Log */}
        <div className="col-span-12 lg:col-span-4 bg-surface-container-lowest rounded-xl p-lg border border-outline-variant shadow-sm">
          <h4 className="text-label-md uppercase tracking-wider text-outline mb-lg">Attendance Log</h4>
          <div className="space-y-md">
            {attendanceLogs.length === 0 ? (
              <p className="text-label-sm text-outline">No attendance records yet.</p>
            ) : attendanceLogs.map(log => {
              const d = new Date(log.date)
              return (
                <div key={log.id} className="flex items-center justify-between p-sm hover:bg-surface-container-low rounded-lg transition-colors">
                  <div className="flex items-center gap-md">
                    <div className="flex flex-col items-center justify-center w-12 h-12 bg-surface-container rounded-lg">
                      <span className="text-label-sm font-bold">{d.getDate()}</span>
                      <span className="text-[10px] text-outline uppercase">{d.toLocaleString('en-US', { month: 'short' })}</span>
                    </div>
                    <div>
                      <p className="text-body-md font-bold">In: {fmtTime(log.check_in)}</p>
                      <p className="text-label-sm text-outline">Out: {fmtTime(log.check_out)}</p>
                    </div>
                  </div>
                  <span className={`text-label-sm px-2 py-0.5 rounded-full ${statusStyle[log.status] ?? 'bg-surface-container text-on-surface-variant'}`}>{log.status}</span>
                </div>
              )
            })}
          </div>
        </div>

        {/* Leave History */}
        <div className="col-span-12 bg-surface-container-lowest rounded-xl border border-outline-variant shadow-sm overflow-hidden">
          <div className="p-lg border-b border-outline-variant flex items-center justify-between bg-surface-container-low/50">
            <h4 className="text-label-md uppercase tracking-wider text-outline">Leave Request History</h4>
            <Link to="/leave/request" className="text-primary text-label-md flex items-center gap-xs">View All <span className="material-symbols-outlined text-[16px]">arrow_forward</span></Link>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-surface-container text-outline text-label-sm">
                  {['LEAVE TYPE', 'PERIOD', 'DAYS', 'REASON', 'STATUS'].map((h, i) => (
                    <th key={h} className={`px-lg py-md font-semibold ${i === 4 ? 'text-right' : ''}`}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-outline-variant">
                {recentLeave.length === 0 ? (
                  <tr><td colSpan={5} className="px-lg py-xl text-center text-on-surface-variant">No leave history.</td></tr>
                ) : recentLeave.map(r => (
                  <tr key={r.id} className="hover:bg-surface-container-low transition-colors">
                    <td className="px-lg py-md text-label-md font-bold">{r.leave_type}</td>
                    <td className="px-lg py-md text-body-md">{r.from_date} – {r.to_date}</td>
                    <td className="px-lg py-md text-body-md">{r.days} day{r.days !== 1 ? 's' : ''}</td>
                    <td className="px-lg py-md text-body-md italic text-outline">{r.reason}</td>
                    <td className="px-lg py-md text-right">
                      <span className={`text-label-sm px-3 py-1 rounded-full ${leaveStatusStyle[r.status] ?? ''}`}>{r.status}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  )
}
