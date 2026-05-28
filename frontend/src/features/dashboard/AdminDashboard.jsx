import { Link } from 'react-router-dom'

export default function AdminDashboard() {
  return (
    <div className="p-margin-mobile md:p-margin-desktop">
      <div className="max-w-[1600px] mx-auto space-y-lg">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-md">
          <div>
            <h1 className="text-headline-lg text-on-surface">Dashboard Overview</h1>
            <p className="text-body-md text-on-surface-variant mt-xs">Welcome back. Here's what's happening today, October 24th.</p>
          </div>
          <div className="flex flex-wrap gap-sm">
            <Link to="/employees/new" className="bg-primary text-on-primary px-md py-sm rounded-lg flex items-center gap-sm shadow-sm hover:brightness-110 active:scale-95 transition-all">
              <span className="material-symbols-outlined text-[20px]">person_add</span>
              <span className="text-label-md">Add Employee</span>
            </Link>
            <button className="bg-surface-container-lowest border border-outline-variant text-on-surface px-md py-sm rounded-lg flex items-center gap-sm shadow-sm hover:bg-surface-container-low active:scale-95 transition-all">
              <span className="material-symbols-outlined text-[20px]">how_to_reg</span>
              <span className="text-label-md">Mark Attendance</span>
            </button>
            <button className="bg-surface-container-lowest border border-outline-variant text-on-surface px-md py-sm rounded-lg flex items-center gap-sm shadow-sm hover:bg-surface-container-low active:scale-95 transition-all">
              <span className="material-symbols-outlined text-[20px]">receipt_long</span>
              <span className="text-label-md">Create Payroll</span>
            </button>
          </div>
        </div>

        {/* Stat Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-gutter">
          <div className="bg-surface-container-lowest border border-outline-variant p-lg rounded-xl shadow-sm flex items-center gap-lg">
            <div className="w-12 h-12 rounded-full bg-primary/10 text-primary flex items-center justify-center">
              <span className="material-symbols-outlined">group</span>
            </div>
            <div>
              <p className="text-label-sm text-outline uppercase tracking-wider">Total Employees</p>
              <h3 className="text-headline-lg mt-xs">1,248</h3>
              <div className="flex items-center gap-xs mt-xs text-secondary text-label-sm">
                <span className="material-symbols-outlined text-[14px]">trending_up</span>
                <span>+12 this month</span>
              </div>
            </div>
          </div>
          <div className="bg-surface-container-lowest border border-outline-variant p-lg rounded-xl shadow-sm flex items-center gap-lg">
            <div className="w-12 h-12 rounded-full bg-secondary-container/30 text-on-secondary-container flex items-center justify-center">
              <span className="material-symbols-outlined">person_check</span>
            </div>
            <div>
              <p className="text-label-sm text-outline uppercase tracking-wider">Active Today</p>
              <h3 className="text-headline-lg mt-xs">1,150</h3>
              <p className="text-label-sm text-outline mt-xs">92% Engagement Rate</p>
            </div>
          </div>
          <div className="bg-surface-container-lowest border border-outline-variant p-lg rounded-xl shadow-sm flex items-center gap-lg">
            <div className="w-12 h-12 rounded-full bg-tertiary-container/20 text-on-tertiary-fixed-variant flex items-center justify-center">
              <span className="material-symbols-outlined">payments</span>
            </div>
            <div>
              <p className="text-label-sm text-outline uppercase tracking-wider">Monthly Payroll</p>
              <h3 className="text-headline-lg mt-xs">$450,200</h3>
              <div className="flex items-center gap-xs mt-xs text-error text-label-sm">
                <span className="material-symbols-outlined text-[14px]">trending_up</span>
                <span>+2.4% vs last month</span>
              </div>
            </div>
          </div>
          <div className="bg-surface-container-lowest border border-outline-variant p-lg rounded-xl shadow-sm flex items-center gap-lg">
            <div className="w-12 h-12 rounded-full bg-surface-container text-on-surface-variant flex items-center justify-center">
              <span className="material-symbols-outlined">domain</span>
            </div>
            <div>
              <p className="text-label-sm text-outline uppercase tracking-wider">Departments</p>
              <h3 className="text-headline-lg mt-xs">12</h3>
              <p className="text-label-sm text-outline mt-xs">Managed across 3 regions</p>
            </div>
          </div>
        </div>

        {/* Secondary Summary Bar */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-gutter">
          <div className="bg-secondary-container/10 border border-secondary/20 p-md rounded-xl flex justify-between items-center">
            <div className="flex items-center gap-md">
              <div className="p-2 rounded-lg bg-secondary/10 text-secondary">
                <span className="material-symbols-outlined">event_available</span>
              </div>
              <span className="font-bold text-on-surface">980 Present</span>
            </div>
            <span className="text-label-sm font-bold text-secondary bg-secondary/10 px-2 py-1 rounded">ON TRACK</span>
          </div>
          <div className="bg-error-container/10 border border-error/20 p-md rounded-xl flex justify-between items-center">
            <div className="flex items-center gap-md">
              <div className="p-2 rounded-lg bg-error/10 text-error">
                <span className="material-symbols-outlined">event_busy</span>
              </div>
              <span className="font-bold text-on-surface">25 Absent</span>
            </div>
            <span className="text-label-sm font-bold text-error bg-error/10 px-2 py-1 rounded">FOLLOW UP</span>
          </div>
          <div className="bg-primary/5 border border-primary/20 p-md rounded-xl flex justify-between items-center">
            <div className="flex items-center gap-md">
              <div className="p-2 rounded-lg bg-primary/10 text-primary">
                <span className="material-symbols-outlined">pending_actions</span>
              </div>
              <span className="font-bold text-on-surface">8 Pending Requests</span>
            </div>
            <span className="text-label-sm font-bold text-primary bg-primary/10 px-2 py-1 rounded">ACTION REQ.</span>
          </div>
        </div>

        {/* Charts Area */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-gutter">
          {/* Attendance Bar Chart */}
          <div className="lg:col-span-8 bg-surface-container-lowest border border-outline-variant rounded-xl p-lg shadow-sm">
            <div className="flex items-center justify-between mb-xl">
              <div>
                <h3 className="text-headline-md">Attendance Trend</h3>
                <p className="text-label-sm text-outline">Last 7 working days overview</p>
              </div>
              <select className="bg-surface-container border-none rounded-lg text-label-sm py-1 pl-3 pr-8 focus:ring-primary">
                <option>Weekly</option>
                <option>Monthly</option>
              </select>
            </div>
            <div className="h-64 flex items-end justify-between gap-xs relative px-4">
              <div className="absolute inset-0 border-b border-l border-outline-variant opacity-30 pointer-events-none"></div>
              {[
                { day: 'Mon', h: '85%', count: '950' },
                { day: 'Tue', h: '88%', count: '975' },
                { day: 'Wed', h: '82%', count: '940' },
                { day: 'Thu', h: '92%', count: '980' },
                { day: 'Fri', h: '86%', count: '960' },
                { day: 'Sat', h: '0%', count: '', dim: true },
                { day: 'Sun', h: '0%', count: '', dim: true },
              ].map(({ day, h, count, dim }) => (
                <div key={day} className={`w-1/12 ${dim ? 'bg-surface-dim opacity-20' : 'bg-primary/10 hover:bg-primary/20 cursor-pointer'} h-[60%] relative group flex flex-col justify-end`}>
                  {!dim && (
                    <>
                      <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-inverse-surface text-inverse-on-surface px-2 py-1 rounded text-[10px] opacity-0 group-hover:opacity-100 transition-opacity">{count}</div>
                      <div className="w-full bg-primary rounded-t-sm" style={{ height: h }}></div>
                    </>
                  )}
                  <span className="absolute -bottom-6 left-1/2 -translate-x-1/2 text-[10px] text-outline">{day}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Department Donut Chart */}
          <div className="lg:col-span-4 bg-surface-container-lowest border border-outline-variant rounded-xl p-lg shadow-sm flex flex-col">
            <h3 className="text-headline-md mb-xs">By Department</h3>
            <p className="text-label-sm text-outline mb-lg">Staff distribution</p>
            <div className="flex-1 flex flex-col justify-center gap-md">
              <div className="relative w-32 h-32 mx-auto">
                <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
                  <circle className="stroke-primary" cx="18" cy="18" fill="none" r="16" strokeDasharray="40 100" strokeWidth="4" />
                  <circle className="stroke-secondary" cx="18" cy="18" fill="none" r="16" strokeDasharray="25 100" strokeDashoffset="-40" strokeWidth="4" />
                  <circle className="stroke-tertiary" cx="18" cy="18" fill="none" r="16" strokeDasharray="20 100" strokeDashoffset="-65" strokeWidth="4" />
                  <circle className="stroke-outline-variant" cx="18" cy="18" fill="none" r="16" strokeDasharray="15 100" strokeDashoffset="-85" strokeWidth="4" />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className="text-headline-md font-bold">12</span>
                  <span className="text-[8px] text-outline font-bold uppercase">Depts</span>
                </div>
              </div>
              <div className="space-y-sm mt-md">
                {[
                  { color: 'bg-primary', name: 'Engineering', pct: '40%' },
                  { color: 'bg-secondary', name: 'Marketing', pct: '25%' },
                  { color: 'bg-tertiary', name: 'Operations', pct: '20%' },
                  { color: 'bg-outline-variant', name: 'Others', pct: '15%' },
                ].map(({ color, name, pct }) => (
                  <div key={name} className="flex items-center justify-between text-body-md">
                    <div className="flex items-center gap-sm">
                      <div className={`w-3 h-3 rounded-full ${color}`}></div>
                      <span className="text-label-sm">{name}</span>
                    </div>
                    <span className="text-label-sm font-bold">{pct}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Recent Employees Table */}
        <div className="bg-surface-container-lowest border border-outline-variant rounded-xl overflow-hidden shadow-sm">
          <div className="p-lg border-b border-outline-variant flex items-center justify-between">
            <h3 className="text-headline-md">Recent Employees</h3>
            <Link to="/employees" className="text-primary text-label-md hover:underline flex items-center gap-xs">
              View All <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
            </Link>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-surface-container text-on-surface-variant text-label-md uppercase tracking-wider">
                  <th className="px-lg py-md font-bold">Employee</th>
                  <th className="px-lg py-md font-bold">Department</th>
                  <th className="px-lg py-md font-bold">Position</th>
                  <th className="px-lg py-md font-bold">Status</th>
                  <th className="px-lg py-md font-bold text-center">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-outline-variant text-body-md">
                {[
                  { id: '#EMP-001', name: 'John Doe', dept: 'Human Resources', pos: 'HR Manager', status: 'Active', statusColor: 'bg-secondary-container text-on-secondary-container' },
                  { id: '#EMP-002', name: 'Sarah Jenkins', dept: 'Engineering', pos: 'Senior Developer', status: 'Active', statusColor: 'bg-secondary-container text-on-secondary-container' },
                  { id: '#EMP-003', name: 'Michael Ross', dept: 'Marketing', pos: 'Head of Growth', status: 'Inactive', statusColor: 'bg-error-container text-on-error-container' },
                  { id: '#EMP-004', name: 'Alicia Lee', dept: 'Finance', pos: 'Accountant', status: 'On Leave', statusColor: 'bg-tertiary-fixed text-on-tertiary-fixed' },
                ].map(emp => (
                  <tr key={emp.id} className="hover:bg-surface-container-low transition-colors">
                    <td className="px-lg py-md">
                      <div className="flex items-center gap-sm">
                        <div className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-sm">
                          {emp.name.split(' ').map(n => n[0]).join('')}
                        </div>
                        <div>
                          <p className="font-bold">{emp.name}</p>
                          <p className="text-label-sm text-on-surface-variant">{emp.id}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-lg py-md">{emp.dept}</td>
                    <td className="px-lg py-md">{emp.pos}</td>
                    <td className="px-lg py-md">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-label-sm font-bold ${emp.statusColor}`}>
                        {emp.status}
                      </span>
                    </td>
                    <td className="px-lg py-md">
                      <div className="flex items-center justify-center gap-2">
                        <Link to={`/employees/1`} className="p-1 hover:bg-surface-container rounded-lg text-primary transition-all">
                          <span className="material-symbols-outlined text-[20px]">visibility</span>
                        </Link>
                        <button className="p-1 hover:bg-surface-container rounded-lg text-outline transition-all">
                          <span className="material-symbols-outlined text-[20px]">edit</span>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Leave Requests */}
        <div className="bg-surface-container-lowest border border-outline-variant rounded-xl overflow-hidden shadow-sm">
          <div className="p-lg border-b border-outline-variant flex items-center justify-between">
            <h3 className="text-headline-md">Pending Leave Requests</h3>
            <Link to="/leave" className="text-primary text-label-md hover:underline flex items-center gap-xs">
              View All <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
            </Link>
          </div>
          <div className="divide-y divide-outline-variant">
            {[
              { name: 'Alice Wang', type: 'Annual Leave', dates: 'Oct 28 – Oct 31', days: '4 days', init: 'AW' },
              { name: 'Brad Kim', type: 'Sick Leave', dates: 'Oct 25 – Oct 26', days: '2 days', init: 'BK' },
              { name: 'Carla Osei', type: 'Personal Leave', dates: 'Nov 1', days: '1 day', init: 'CO' },
            ].map(req => (
              <div key={req.name} className="p-lg flex flex-col gap-md sm:flex-row sm:items-center sm:justify-between">
                <div className="flex items-center gap-md min-w-0">
                  <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-sm">{req.init}</div>
                  <div className="min-w-0">
                    <p className="font-bold text-body-md">{req.name}</p>
                    <p className="text-label-sm text-on-surface-variant">{req.type} · {req.dates} · {req.days}</p>
                  </div>
                </div>
                <div className="flex gap-sm sm:justify-end">
                  <button className="px-md py-xs bg-secondary-container text-on-secondary-container rounded-lg text-label-md font-bold hover:opacity-90 transition-all">Approve</button>
                  <button className="px-md py-xs bg-error-container text-on-error-container rounded-lg text-label-md font-bold hover:opacity-90 transition-all">Reject</button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
