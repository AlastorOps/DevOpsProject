import { Link } from 'react-router-dom'

const attendanceLogs = [
  { day: '14', month: 'Nov', inTime: '09:02 AM', outTime: '06:15 PM', status: 'On Time', statusStyle: 'bg-secondary-container text-on-secondary-container' },
  { day: '13', month: 'Nov', inTime: '09:45 AM', outTime: '06:30 PM', status: 'Late', statusStyle: 'bg-error-container text-on-error-container' },
  { day: '12', month: 'Nov', inTime: '08:55 AM', outTime: '06:05 PM', status: 'On Time', statusStyle: 'bg-secondary-container text-on-secondary-container' },
]

const leaveHistory = [
  { type: 'Annual Leave', period: 'Dec 24 - Dec 28, 2023', days: '5 Days', reason: 'Christmas Holidays', statusStyle: 'bg-tertiary-fixed text-on-tertiary-fixed border border-tertiary/20', status: 'Pending' },
  { type: 'Sick Leave', period: 'Oct 14 - Oct 15, 2023', days: '2 Days', reason: 'Seasonal Flu', statusStyle: 'bg-secondary-container text-on-secondary-container border border-secondary/20', status: 'Approved' },
  { type: 'Casual Leave', period: 'Sep 05, 2023', days: '1 Day', reason: 'Personal Emergency', statusStyle: 'bg-secondary-container text-on-secondary-container border border-secondary/20', status: 'Approved' },
]

export default function EmployeeDashboard() {
  return (
    <div className="pt-8 pb-xl px-margin-mobile md:px-margin-desktop">
      {/* Header */}
      <section className="flex flex-col md:flex-row md:items-end justify-between mb-xl">
        <div>
          <h1 className="text-display text-on-surface">Good Morning, Marcus.</h1>
          <p className="text-body-lg text-outline mt-xs">Here is what's happening with your profile today.</p>
        </div>
        <div className="flex flex-wrap gap-sm mt-md md:mt-0">
          <Link to="/leave/request" className="flex items-center gap-xs px-md py-sm bg-primary text-on-primary rounded-xl text-label-md transition-transform active:scale-95 shadow-sm hover:bg-primary-container">
            <span className="material-symbols-outlined text-[20px]">add</span>
            Request Leave
          </Link>
          <Link to="/payroll/payslip" className="flex items-center gap-xs px-md py-sm bg-surface-container-lowest border border-outline-variant text-on-surface rounded-xl text-label-md transition-transform active:scale-95 shadow-sm hover:bg-surface-container-low">
            <span className="material-symbols-outlined text-[20px]">receipt_long</span>
            View Payslip
          </Link>
        </div>
      </section>

      {/* Bento Grid */}
      <div className="grid grid-cols-12 gap-gutter">
        {/* Profile Summary */}
        <div className="col-span-12 lg:col-span-4 bg-surface-container-lowest rounded-xl p-lg border border-outline-variant shadow-sm relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full -mr-16 -mt-16 transition-transform group-hover:scale-150 duration-700"></div>
          <div className="relative z-10 flex flex-col h-full">
            <div className="flex items-start justify-between">
              <div className="w-20 h-20 rounded-2xl bg-primary/10 flex items-center justify-center text-primary border-4 border-surface shadow-md">
                <span className="material-symbols-outlined text-[48px]" style={{ fontVariationSettings: "'FILL' 1" }}>person</span>
              </div>
              <button className="text-primary hover:bg-primary/10 p-2 rounded-full transition-colors">
                <span className="material-symbols-outlined">edit</span>
              </button>
            </div>
            <div className="mt-md">
              <h3 className="text-headline-md">Marcus Thorne</h3>
              <p className="text-body-md text-outline">Product Design Team • Employee #4421</p>
            </div>
            <div className="mt-auto pt-lg border-t border-outline-variant/30 grid grid-cols-2 gap-md">
              <div>
                <span className="text-label-sm text-outline block">Department</span>
                <span className="text-label-md font-bold">Creative Dept</span>
              </div>
              <div>
                <span className="text-label-sm text-outline block">Joined</span>
                <span className="text-label-md font-bold">Oct 12, 2021</span>
              </div>
            </div>
          </div>
        </div>

        {/* Attendance Circle */}
        <div className="col-span-12 md:col-span-6 lg:col-span-4 bg-surface-container-lowest rounded-xl p-lg border border-outline-variant shadow-sm flex flex-col">
          <div className="flex items-center justify-between mb-md">
            <h4 className="text-label-md uppercase tracking-wider text-outline">Monthly Attendance</h4>
            <span className="text-secondary font-bold text-label-md">94%</span>
          </div>
          <div className="flex-1 flex flex-col items-center justify-center py-md">
            <div className="relative w-36 h-36 flex items-center justify-center">
              <svg className="w-full h-full -rotate-90">
                <circle className="text-surface-container" cx="72" cy="72" fill="transparent" r="64" stroke="currentColor" strokeWidth="12" />
                <circle className="text-primary" cx="72" cy="72" fill="transparent" r="64" stroke="currentColor" strokeDasharray="402" strokeDashoffset="24" strokeWidth="12" />
              </svg>
              <div className="absolute flex flex-col items-center">
                <span className="text-headline-lg font-bold">18/20</span>
                <span className="text-label-sm text-outline">Days</span>
              </div>
            </div>
            <div className="flex gap-md mt-lg">
              <div className="flex items-center gap-xs">
                <div className="w-3 h-3 rounded-full bg-primary"></div>
                <span className="text-label-sm">Present</span>
              </div>
              <div className="flex items-center gap-xs">
                <div className="w-3 h-3 rounded-full bg-surface-container"></div>
                <span className="text-label-sm">Remaining</span>
              </div>
            </div>
          </div>
        </div>

        {/* Salary & Notifications */}
        <div className="col-span-12 md:col-span-6 lg:col-span-4 flex flex-col gap-gutter">
          <div className="bg-primary-container text-on-primary-container rounded-xl p-lg shadow-sm border border-primary relative overflow-hidden">
            <div className="absolute bottom-0 right-0 opacity-10">
              <span className="material-symbols-outlined text-[80px]">payments</span>
            </div>
            <h4 className="text-label-md opacity-80 uppercase mb-xs">Latest Salary</h4>
            <div className="flex items-baseline gap-xs">
              <span className="text-display leading-tight">$4,250</span>
              <span className="text-label-md opacity-80">Net Pay</span>
            </div>
            <p className="text-label-sm mt-md opacity-70">Paid on Oct 31, 2023</p>
          </div>
          <div className="bg-surface-container-lowest border border-outline-variant rounded-xl p-lg shadow-sm flex-1">
            <div className="flex items-center justify-between mb-md">
              <h4 className="text-label-md uppercase tracking-wider text-outline">Notifications</h4>
              <span className="bg-error text-on-error text-[10px] font-bold px-1.5 py-0.5 rounded-full">3</span>
            </div>
            <div className="space-y-md">
              <div className="flex gap-md">
                <div className="w-8 h-8 rounded-full bg-secondary-container flex items-center justify-center shrink-0">
                  <span className="material-symbols-outlined text-on-secondary-container text-[18px]">task_alt</span>
                </div>
                <div>
                  <p className="text-body-md font-bold leading-tight">Leave Approved</p>
                  <p className="text-label-sm text-outline leading-tight mt-1">Your request for Oct 24 has been accepted.</p>
                </div>
              </div>
              <div className="flex gap-md">
                <div className="w-8 h-8 rounded-full bg-tertiary-fixed flex items-center justify-center shrink-0">
                  <span className="material-symbols-outlined text-on-tertiary-fixed text-[18px]">campaign</span>
                </div>
                <div>
                  <p className="text-body-md font-bold leading-tight">Company Policy Update</p>
                  <p className="text-label-sm text-outline leading-tight mt-1">Please review the new hybrid work policy.</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Leave Balance */}
        <div className="col-span-12 lg:col-span-8 bg-surface-container-lowest rounded-xl p-lg border border-outline-variant shadow-sm">
          <h4 className="text-label-md uppercase tracking-wider text-outline mb-lg">Leave Balance</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-xl">
            {[
              { label: 'Annual Leave', used: 12, total: 20, pct: 60, remaining: 8, color: 'bg-primary' },
              { label: 'Sick Leave', used: 2, total: 10, pct: 20, remaining: 8, color: 'bg-secondary' },
            ].map(lb => (
              <div key={lb.label} className="space-y-md">
                <div className="flex justify-between items-center mb-xs">
                  <span className="text-label-md font-bold">{lb.label}</span>
                  <span className="text-label-md">{lb.used}/{lb.total} Days</span>
                </div>
                <div className="h-2 w-full bg-surface-container rounded-full overflow-hidden">
                  <div className={`h-full ${lb.color} rounded-full`} style={{ width: `${lb.pct}%` }}></div>
                </div>
                <p className="text-label-sm text-outline">Remaining: {lb.remaining} Days</p>
              </div>
            ))}
          </div>
        </div>

        {/* Attendance Log */}
        <div className="col-span-12 lg:col-span-4 bg-surface-container-lowest rounded-xl p-lg border border-outline-variant shadow-sm">
          <h4 className="text-label-md uppercase tracking-wider text-outline mb-lg">Attendance Log</h4>
          <div className="space-y-md">
            {attendanceLogs.map(log => (
              <div key={log.day + log.month} className="flex items-center justify-between p-sm hover:bg-surface-container-low rounded-lg transition-colors">
                <div className="flex items-center gap-md">
                  <div className="flex flex-col items-center justify-center w-12 h-12 bg-surface-container rounded-lg">
                    <span className="text-label-sm font-bold">{log.day}</span>
                    <span className="text-[10px] text-outline uppercase">{log.month}</span>
                  </div>
                  <div>
                    <p className="text-body-md font-bold">In: {log.inTime}</p>
                    <p className="text-label-sm text-outline">Out: {log.outTime}</p>
                  </div>
                </div>
                <span className={`text-label-sm px-2 py-0.5 rounded-full ${log.statusStyle}`}>{log.status}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Leave History */}
        <div className="col-span-12 bg-surface-container-lowest rounded-xl border border-outline-variant shadow-sm overflow-hidden">
          <div className="p-lg border-b border-outline-variant flex items-center justify-between bg-surface-container-low/50">
            <h4 className="text-label-md uppercase tracking-wider text-outline">Leave Request History</h4>
            <Link to="/leave/request" className="text-primary text-label-md flex items-center gap-xs">
              View All <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
            </Link>
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
                {leaveHistory.map((row, i) => (
                  <tr key={i} className="hover:bg-surface-container-low transition-colors">
                    <td className="px-lg py-md text-label-md font-bold">{row.type}</td>
                    <td className="px-lg py-md text-body-md">{row.period}</td>
                    <td className="px-lg py-md text-body-md">{row.days}</td>
                    <td className="px-lg py-md text-body-md italic text-outline">{row.reason}</td>
                    <td className="px-lg py-md text-right">
                      <span className={`text-label-sm px-3 py-1 rounded-full ${row.statusStyle}`}>{row.status}</span>
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
