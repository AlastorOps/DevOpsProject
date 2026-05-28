const attendanceData = [
  { id: '#EMP-001', name: 'John Doe', dept: 'HR', checkIn: '08:54 AM', checkOut: '05:10 PM', hours: '8h 16m', status: 'Present' },
  { id: '#EMP-002', name: 'Sarah Jenkins', dept: 'Engineering', checkIn: '09:22 AM', checkOut: '06:05 PM', hours: '8h 43m', status: 'Late' },
  { id: '#EMP-003', name: 'Michael Ross', dept: 'Marketing', checkIn: '—', checkOut: '—', hours: '—', status: 'Absent' },
  { id: '#EMP-004', name: 'Alicia Lee', dept: 'Finance', checkIn: '—', checkOut: '—', hours: '—', status: 'On Leave' },
  { id: '#EMP-005', name: 'David Kim', dept: 'Engineering', checkIn: '08:30 AM', checkOut: '05:00 PM', hours: '8h 30m', status: 'Present' },
]

const statusStyle = {
  Present: 'bg-secondary-container text-on-secondary-container',
  Late: 'bg-tertiary-fixed text-on-tertiary-fixed-variant',
  Absent: 'bg-error-container text-on-error-container',
  'On Leave': 'bg-surface-variant text-on-surface-variant',
}

export default function AttendanceManagement() {
  return (
    <div className="p-margin-mobile md:p-margin-desktop">
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-xl gap-md">
        <div>
          <h2 className="text-headline-lg text-on-surface">Attendance Management</h2>
          <p className="text-body-md text-on-surface-variant">Track daily check-ins, exceptions, and attendance trends</p>
        </div>
        <div className="flex flex-wrap gap-sm">
          <button className="flex items-center gap-xs px-md py-sm border border-outline-variant rounded-lg text-label-md hover:bg-surface-container transition-all">
            <span className="material-symbols-outlined text-[18px]">download</span>
            Export Report
          </button>
          <button className="flex items-center gap-xs px-lg py-sm bg-primary text-on-primary rounded-lg text-label-md hover:brightness-110 active:scale-95 transition-all shadow-md">
            <span className="material-symbols-outlined text-[18px]">how_to_reg</span>
            Mark Attendance
          </button>
        </div>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-gutter mb-lg">
        {[
          { label: 'Present', val: '980', icon: 'person_check', color: 'bg-secondary/10 text-secondary', pct: '78.5%' },
          { label: 'Late', val: '145', icon: 'schedule', color: 'bg-tertiary/10 text-tertiary', pct: '11.6%' },
          { label: 'Absent', val: '78', icon: 'person_off', color: 'bg-error/10 text-error', pct: '6.2%' },
          { label: 'On Leave', val: '45', icon: 'event_busy', color: 'bg-outline-variant text-on-surface-variant', pct: '3.6%' },
        ].map(s => (
          <div key={s.label} className="bg-surface-container-lowest border border-outline-variant p-lg rounded-xl shadow-sm">
            <div className="flex items-center justify-between mb-md">
              <div className={`w-10 h-10 rounded-full flex items-center justify-center ${s.color}`}>
                <span className="material-symbols-outlined">{s.icon}</span>
              </div>
              <span className="text-label-sm font-bold text-on-surface-variant">{s.pct}</span>
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
              <input className="w-full bg-background border border-outline-variant rounded-lg py-2 pl-10 pr-4 text-body-md focus:ring-2 focus:ring-primary outline-none" placeholder="Name or ID..." type="text" />
            </div>
          </div>
          <div>
            <label className="text-label-sm text-on-surface-variant block mb-1">Date</label>
            <input className="bg-background border border-outline-variant rounded-lg py-2 px-md text-body-md outline-none" type="date" defaultValue="2024-10-24" />
          </div>
          <div>
            <label className="text-label-sm text-on-surface-variant block mb-1">Department</label>
            <select className="bg-background border border-outline-variant rounded-lg py-2 px-3 text-body-md">
              <option>All Departments</option>
              <option>Engineering</option>
              <option>Marketing</option>
              <option>HR</option>
            </select>
          </div>
          <div>
            <label className="text-label-sm text-on-surface-variant block mb-1">Status</label>
            <select className="bg-background border border-outline-variant rounded-lg py-2 px-3 text-body-md">
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
                {attendanceData.map(emp => (
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
            <p className="text-label-sm text-on-surface-variant">Showing 5 of 1,248 employees</p>
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
                3 employees without check-out
              </div>
              <div className="flex items-center gap-xs text-on-surface-variant">
                <span className="w-2 h-2 rounded-full bg-tertiary"></span>
                12 late arrivals flagged
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
