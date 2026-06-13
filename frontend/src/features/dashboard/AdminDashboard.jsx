import { useState, useEffect, useCallback, useRef } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { dashboardService } from '../../api/dashboard.js'
import { employeeService } from '../../api/employees.js'
import { leaveService } from '../../api/leave.js'
import { notificationService } from '../../api/notifications.js'
import { getToken, client } from '../../api/client.js'

const today = new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric' })

export default function AdminDashboard() {
  const [stats, setStats]             = useState(null)
  const [chartData, setChartData]     = useState([])
  const [chartPeriod, setChartPeriod] = useState('Weekly')
  const [recentEmps, setRecentEmps]   = useState([])
  const [leaveRequests, setLeaveRequests] = useState([])
  const [loading, setLoading]         = useState(true)
  const [toast, setToast]             = useState(null)
  const [notifications, setNotifications]   = useState([])
  const [unreadCount, setUnreadCount]       = useState(0)
  const [showNotifPanel, setShowNotifPanel] = useState(false)
  const notifPanelRef                       = useRef(null)
  const navigate                            = useNavigate()

  const showToast = (message, type = 'success') => {
    setToast({ message, type })
    setTimeout(() => setToast(null), 3000)
  }

  const fetchStats = useCallback(async () => {
    try {
      const res = await dashboardService.adminStats()
      if (res.ok) setStats(await res.json())
    } catch { /* ignore */ }
  }, [])

  const fetchChart = useCallback(async (period) => {
    try {
      const res = await dashboardService.charts(period)
      if (res.ok) {
        const data = await res.json()
        setChartData(data.data || [])
      }
    } catch { /* ignore */ }
  }, [])

  const fetchRecent = useCallback(async () => {
    try {
      const [empRes, leaveRes] = await Promise.all([
        employeeService.list({ limit: 5, page: 1 }),
        leaveService.list({ status: 'Pending', limit: 5 }),
      ])
      if (empRes.ok) {
        const d = await empRes.json()
        setRecentEmps(d.employees || [])
      }
      if (leaveRes.ok) {
        const d = await leaveRes.json()
        setLeaveRequests(d.requests || [])
      }
    } catch { /* ignore */ }
  }, [])

  useEffect(() => {
    setLoading(true)
    Promise.all([fetchStats(), fetchChart('Weekly'), fetchRecent()]).finally(() => setLoading(false))
  }, [fetchStats, fetchChart, fetchRecent])

  useEffect(() => { fetchChart(chartPeriod) }, [chartPeriod, fetchChart])

  const fetchNotifications = useCallback(async () => {
    try {
      const res = await notificationService.list()
      if (res.ok) {
        const data = await res.json()
        setNotifications(data)
        setUnreadCount(data.filter(n => !n.read).length)
      }
    } catch { /* ignore */ }
  }, [])

  const markRead = async (id) => {
    await notificationService.markRead(id)
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n))
    setUnreadCount(prev => Math.max(0, prev - 1))
  }

  const markAllRead = async () => {
    await notificationService.markAllRead()
    setNotifications(prev => prev.map(n => ({ ...n, read: true })))
    setUnreadCount(0)
  }

  useEffect(() => {
    fetchNotifications()
    const token = getToken()
    if (!token) return
    const es = new EventSource(`${client.BASE}/notifications/stream?token=${token}`)
    es.onmessage = (e) => {
      try {
        const incoming = JSON.parse(e.data)
        setNotifications(prev => [...incoming, ...prev])
        setUnreadCount(prev => prev + incoming.filter(n => !n.read).length)
      } catch { /* ignore */ }
    }
    return () => es.close()
  }, [fetchNotifications])

  useEffect(() => {
    const handler = (e) => {
      if (notifPanelRef.current && !notifPanelRef.current.contains(e.target)) {
        setShowNotifPanel(false)
      }
    }
    if (showNotifPanel) document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [showNotifPanel])

  const handleLeaveAction = async (leave, action) => {
    try {
      const res = await (action === 'Approve' ? leaveService.approve(leave.id) : leaveService.reject(leave.id))
      if (res.ok) {
        setLeaveRequests(prev => prev.filter(r => r.id !== leave.id))
        showToast(`Leave for ${leave.employee?.name} ${action === 'Approve' ? 'approved' : 'rejected'}.`, action === 'Approve' ? 'success' : 'error')
        fetchStats(); fetchNotifications()
      } else {
        const err = await res.json().catch(() => ({}))
        showToast(err.detail || 'Action failed.', 'error')
      }
    } catch { showToast('Network error.', 'error') }
  }

  const maxPresent = chartData.length ? Math.max(...chartData.map(d => d.present + d.late + d.absent + d.on_leave), 1) : 1
  const chartBars = chartData.map(d => {
    const total = d.present + d.late
    const pct = Math.round((total / maxPresent) * 100)
    const label = new Date(d.date).toLocaleDateString('en-US', { weekday: 'short' })
    return { day: label, h: `${pct}%`, count: String(total), dim: pct === 0 }
  })

  const statusColor = { Active: 'bg-secondary-container text-on-secondary-container', Inactive: 'bg-error-container text-on-error-container', 'On Leave': 'bg-tertiary-fixed text-on-tertiary-fixed' }

  if (loading) return (
    <div className="p-margin-mobile md:p-margin-desktop flex items-center justify-center h-64">
      <span className="material-symbols-outlined text-primary text-[40px]" style={{ animation: 'spin 1s linear infinite' }}>progress_activity</span>
    </div>
  )

  return (
    <div className="p-margin-mobile md:p-margin-desktop">
      {toast && (
        <div className={`fixed top-20 right-6 z-50 flex items-center gap-md px-lg py-md rounded-xl shadow-lg border text-label-md font-bold transition-all ${toast.type === 'error' ? 'bg-error-container text-on-error-container border-error/30' : 'bg-secondary-container text-on-secondary-container border-secondary/30'}`}>
          <span className="material-symbols-outlined text-[20px]">{toast.type === 'error' ? 'cancel' : 'check_circle'}</span>
          {toast.message}
        </div>
      )}

      <div className="max-w-[1600px] mx-auto space-y-lg">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-md">
          <div>
            <h1 className="text-headline-lg text-on-surface">Dashboard Overview</h1>
            <p className="text-body-md text-on-surface-variant mt-xs">Welcome back. Here's what's happening today, {today}.</p>
          </div>
          <div className="flex flex-wrap gap-sm items-center">
            <Link to="/employees/new" className="bg-primary text-on-primary px-md py-sm rounded-lg flex items-center gap-sm shadow-sm hover:brightness-110 active:scale-95 transition-all">
              <span className="material-symbols-outlined text-[20px]">person_add</span>
              <span className="text-label-md">Add Employee</span>
            </Link>
            <button onClick={() => navigate('/attendance')} className="bg-surface-container-lowest border border-outline-variant text-on-surface px-md py-sm rounded-lg flex items-center gap-sm shadow-sm hover:bg-surface-container-low active:scale-95 transition-all">
              <span className="material-symbols-outlined text-[20px]">how_to_reg</span>
              <span className="text-label-md">Mark Attendance</span>
            </button>
            <button onClick={() => navigate('/payroll')} className="bg-surface-container-lowest border border-outline-variant text-on-surface px-md py-sm rounded-lg flex items-center gap-sm shadow-sm hover:bg-surface-container-low active:scale-95 transition-all">
              <span className="material-symbols-outlined text-[20px]">receipt_long</span>
              <span className="text-label-md">Create Payroll</span>
            </button>

            {/* Notification Bell */}
            <div className="relative" ref={notifPanelRef}>
              <button
                onClick={() => setShowNotifPanel(prev => !prev)}
                className="relative bg-surface-container-lowest border border-outline-variant text-on-surface p-sm rounded-lg flex items-center shadow-sm hover:bg-surface-container-low active:scale-95 transition-all"
              >
                <span className="material-symbols-outlined text-[22px]">notifications</span>
                {unreadCount > 0 && (
                  <span className="absolute -top-1.5 -right-1.5 bg-error text-on-error text-[10px] font-bold min-w-[18px] h-[18px] px-0.5 rounded-full flex items-center justify-center">
                    {unreadCount > 9 ? '9+' : unreadCount}
                  </span>
                )}
              </button>

              {showNotifPanel && (
                <div className="absolute right-0 top-full mt-2 w-96 bg-surface-container-lowest border border-outline-variant rounded-xl shadow-2xl z-50 overflow-hidden">
                  <div className="px-lg py-md border-b border-outline-variant flex items-center justify-between">
                    <div className="flex items-center gap-sm">
                      <span className="material-symbols-outlined text-primary text-[20px]">notifications</span>
                      <h4 className="text-label-md font-bold">Notifications</h4>
                      {unreadCount > 0 && (
                        <span className="bg-error text-on-error text-[10px] font-bold px-1.5 py-0.5 rounded-full">{unreadCount}</span>
                      )}
                    </div>
                    {unreadCount > 0 && (
                      <button onClick={markAllRead} className="text-primary text-label-sm hover:underline">Mark all read</button>
                    )}
                  </div>
                  <div className="max-h-[360px] overflow-y-auto divide-y divide-outline-variant">
                    {notifications.length === 0 ? (
                      <div className="p-xl flex flex-col items-center gap-sm text-on-surface-variant">
                        <span className="material-symbols-outlined text-[40px] opacity-30">notifications_off</span>
                        <p className="text-body-md">No notifications yet.</p>
                      </div>
                    ) : notifications.map(n => (
                      <div
                        key={n.id}
                        onClick={() => !n.read && markRead(n.id)}
                        className={`px-lg py-md flex gap-md cursor-pointer hover:bg-surface-container-low transition-colors ${!n.read ? 'bg-primary/5' : ''}`}
                      >
                        <div className={`w-9 h-9 rounded-full flex items-center justify-center shrink-0 ${!n.read ? 'bg-primary/10' : 'bg-surface-container'}`}>
                          <span className={`material-symbols-outlined text-[18px] ${!n.read ? 'text-primary' : 'text-on-surface-variant'}`}>{n.icon || 'notifications'}</span>
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className={`text-label-md leading-snug ${!n.read ? 'font-bold text-on-surface' : 'text-on-surface'}`}>{n.title}</p>
                          <p className="text-label-sm text-on-surface-variant leading-snug mt-0.5 break-words">{n.body}</p>
                        </div>
                        {!n.read && <div className="w-2 h-2 rounded-full bg-primary shrink-0 mt-1.5"></div>}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Stat Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-gutter">
          {[
            { label: 'Total Employees', val: stats?.total_employees ?? '—', icon: 'group', iconBg: 'bg-primary/10 text-primary', sub: '' },
            { label: 'Active Today', val: stats?.active_today ?? '—', icon: 'person_check', iconBg: 'bg-secondary-container/30 text-on-secondary-container', sub: stats ? `${stats.total_employees ? Math.round((stats.active_today / stats.total_employees) * 100) : 0}% Engagement` : '' },
            { label: 'Monthly Payroll', val: stats ? `$${Number(stats.monthly_payroll).toLocaleString('en-US', { minimumFractionDigits: 0 })}` : '—', icon: 'payments', iconBg: 'bg-tertiary-container/20 text-on-tertiary-fixed-variant', sub: '' },
            { label: 'Departments', val: stats?.total_departments ?? '—', icon: 'domain', iconBg: 'bg-surface-container text-on-surface-variant', sub: '' },
          ].map(s => (
            <div key={s.label} className="bg-surface-container-lowest border border-outline-variant p-lg rounded-xl shadow-sm flex items-center gap-lg">
              <div className={`w-12 h-12 rounded-full flex items-center justify-center ${s.iconBg}`}>
                <span className="material-symbols-outlined">{s.icon}</span>
              </div>
              <div>
                <p className="text-label-sm text-outline uppercase tracking-wider">{s.label}</p>
                <h3 className="text-headline-lg mt-xs">{s.val}</h3>
                {s.sub && <p className="text-label-sm text-outline mt-xs">{s.sub}</p>}
              </div>
            </div>
          ))}
        </div>

        {/* Summary Bar */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-gutter">
          <div className="bg-secondary-container/10 border border-secondary/20 p-md rounded-xl flex justify-between items-center">
            <div className="flex items-center gap-md">
              <div className="p-2 rounded-lg bg-secondary/10 text-secondary"><span className="material-symbols-outlined">event_available</span></div>
              <span className="font-bold text-on-surface">{stats?.present ?? 0} Present</span>
            </div>
            <span className="text-label-sm font-bold text-secondary bg-secondary/10 px-2 py-1 rounded">ON TRACK</span>
          </div>
          <div className="bg-error-container/10 border border-error/20 p-md rounded-xl flex justify-between items-center">
            <div className="flex items-center gap-md">
              <div className="p-2 rounded-lg bg-error/10 text-error"><span className="material-symbols-outlined">event_busy</span></div>
              <span className="font-bold text-on-surface">{stats?.absent ?? 0} Absent</span>
            </div>
            <span className="text-label-sm font-bold text-error bg-error/10 px-2 py-1 rounded">FOLLOW UP</span>
          </div>
          <div className="bg-primary/5 border border-primary/20 p-md rounded-xl flex justify-between items-center">
            <div className="flex items-center gap-md">
              <div className="p-2 rounded-lg bg-primary/10 text-primary"><span className="material-symbols-outlined">pending_actions</span></div>
              <span className="font-bold text-on-surface">{stats?.pending_leaves ?? 0} Pending Requests</span>
            </div>
            <span className="text-label-sm font-bold text-primary bg-primary/10 px-2 py-1 rounded">ACTION REQ.</span>
          </div>
        </div>

        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-gutter">
          <div className="lg:col-span-8 bg-surface-container-lowest border border-outline-variant rounded-xl p-lg shadow-sm">
            <div className="flex items-center justify-between mb-xl">
              <div>
                <h3 className="text-headline-md">Attendance Trend</h3>
                <p className="text-label-sm text-outline">{chartPeriod === 'Weekly' ? 'Last 7 days overview' : 'Monthly breakdown'}</p>
              </div>
              <select className="bg-surface-container border-none rounded-lg text-label-sm py-1 pl-3 pr-8 focus:ring-primary" value={chartPeriod} onChange={e => setChartPeriod(e.target.value)}>
                <option>Weekly</option>
                <option>Monthly</option>
              </select>
            </div>
            <div className="h-64 flex items-end justify-between gap-xs relative px-4">
              <div className="absolute inset-0 border-b border-l border-outline-variant opacity-30 pointer-events-none"></div>
              {chartBars.length === 0 ? (
                <div className="flex-1 flex items-center justify-center text-on-surface-variant text-body-md">No attendance data</div>
              ) : chartBars.map((b, i) => (
                <div key={i} className={`flex-1 ${b.dim ? 'bg-surface-dim opacity-20' : 'bg-primary/10 hover:bg-primary/20 cursor-pointer'} h-[60%] relative group flex flex-col justify-end`}>
                  {!b.dim && (
                    <>
                      <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-inverse-surface text-inverse-on-surface px-2 py-1 rounded text-[10px] opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">{b.count}</div>
                      <div className="w-full bg-primary rounded-t-sm" style={{ height: b.h }}></div>
                    </>
                  )}
                  <span className="absolute -bottom-6 left-1/2 -translate-x-1/2 text-[10px] text-outline">{b.day}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="lg:col-span-4 bg-surface-container-lowest border border-outline-variant rounded-xl p-lg shadow-sm flex flex-col">
            <h3 className="text-headline-md mb-xs">Attendance Today</h3>
            <p className="text-label-sm text-outline mb-lg">Status breakdown</p>
            <div className="flex-1 flex flex-col justify-center gap-md">
              {[
                { label: 'Present', val: stats?.present ?? 0, color: 'bg-secondary' },
                { label: 'Late', val: stats?.late ?? 0, color: 'bg-tertiary' },
                { label: 'Absent', val: stats?.absent ?? 0, color: 'bg-error' },
                { label: 'On Leave', val: stats?.on_leave ?? 0, color: 'bg-outline-variant' },
              ].map(s => (
                <div key={s.label} className="flex items-center justify-between text-body-md">
                  <div className="flex items-center gap-sm">
                    <div className={`w-3 h-3 rounded-full ${s.color}`}></div>
                    <span className="text-label-sm">{s.label}</span>
                  </div>
                  <span className="text-label-sm font-bold">{s.val}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Recent Employees */}
        <div className="bg-surface-container-lowest border border-outline-variant rounded-xl overflow-hidden shadow-sm">
          <div className="p-lg border-b border-outline-variant flex items-center justify-between">
            <h3 className="text-headline-md">Recent Employees</h3>
            <Link to="/employees" className="text-primary text-label-md hover:underline flex items-center gap-xs">View All <span className="material-symbols-outlined text-[16px]">arrow_forward</span></Link>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-surface-container text-on-surface-variant text-label-md uppercase tracking-wider">
                  {['Employee', 'Department', 'Position', 'Status', 'Action'].map(h => (
                    <th key={h} className="px-lg py-md font-bold">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-outline-variant text-body-md">
                {recentEmps.length === 0 ? (
                  <tr><td colSpan={5} className="px-lg py-xl text-center text-on-surface-variant">No employees yet.</td></tr>
                ) : recentEmps.map(emp => (
                  <tr key={emp.id} className="hover:bg-surface-container-low transition-colors">
                    <td className="px-lg py-md">
                      <div className="flex items-center gap-sm">
                        {emp.photo_path
                          ? <img src={`/uploads/${emp.photo_path}`} alt={emp.name} className="w-9 h-9 rounded-full object-cover border border-outline-variant shrink-0" />
                          : <div className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-sm shrink-0">{emp.name.split(' ').map(n => n[0]).join('')}</div>
                        }
                        <div><p className="font-bold">{emp.name}</p><p className="text-label-sm text-on-surface-variant">{emp.emp_id}</p></div>
                      </div>
                    </td>
                    <td className="px-lg py-md">{emp.department?.name ?? '—'}</td>
                    <td className="px-lg py-md">{emp.position?.title ?? '—'}</td>
                    <td className="px-lg py-md">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-label-sm font-bold ${statusColor[emp.status] ?? 'bg-surface-container text-on-surface-variant'}`}>{emp.status}</span>
                    </td>
                    <td className="px-lg py-md">
                      <div className="flex items-center justify-center gap-2">
                        <Link to={`/employees/${emp.id}`} className="p-1 hover:bg-surface-container rounded-lg text-primary transition-all"><span className="material-symbols-outlined text-[20px]">visibility</span></Link>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Pending Leave Requests */}
        <div className="bg-surface-container-lowest border border-outline-variant rounded-xl overflow-hidden shadow-sm">
          <div className="p-lg border-b border-outline-variant flex items-center justify-between">
            <h3 className="text-headline-md">Pending Leave Requests</h3>
            <Link to="/leave" className="text-primary text-label-md hover:underline flex items-center gap-xs">View All <span className="material-symbols-outlined text-[16px]">arrow_forward</span></Link>
          </div>
          <div className="divide-y divide-outline-variant">
            {leaveRequests.length === 0 ? (
              <div className="p-xl text-center text-on-surface-variant text-body-md">No pending leave requests.</div>
            ) : leaveRequests.map(req => (
              <div key={req.id} className="p-lg flex flex-col gap-md sm:flex-row sm:items-center sm:justify-between">
                <div className="flex items-center gap-md min-w-0">
                  {req.employee?.photo_path
                    ? <img src={`/uploads/${req.employee.photo_path}`} alt={req.employee.name} className="w-10 h-10 rounded-full object-cover border border-outline-variant shrink-0" />
                    : <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-sm shrink-0">{(req.employee?.name ?? '?').split(' ').map(n => n[0]).join('')}</div>
                  }
                  <div className="min-w-0">
                    <p className="font-bold text-body-md">{req.employee?.name}</p>
                    <p className="text-label-sm text-on-surface-variant">{req.leave_type} · {req.from_date} – {req.to_date} · {req.days} day{req.days !== 1 ? 's' : ''}</p>
                  </div>
                </div>
                <div className="flex gap-sm sm:justify-end">
                  <button onClick={() => handleLeaveAction(req, 'Approve')} className="px-md py-xs bg-secondary-container text-on-secondary-container rounded-lg text-label-md font-bold hover:opacity-90 transition-all">Approve</button>
                  <button onClick={() => handleLeaveAction(req, 'Reject')} className="px-md py-xs bg-error-container text-on-error-container rounded-lg text-label-md font-bold hover:opacity-90 transition-all">Reject</button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
