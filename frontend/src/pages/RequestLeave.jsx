import { Link } from 'react-router-dom'

const leaveBalances = [
  { type: 'Annual Leave', used: 8, total: 20, color: 'bg-primary', textColor: 'text-primary' },
  { type: 'Sick Leave', used: 2, total: 10, color: 'bg-secondary', textColor: 'text-secondary' },
  { type: 'Personal Leave', used: 1, total: 5, color: 'bg-tertiary', textColor: 'text-tertiary' },
]

const recentRequests = [
  { type: 'Annual Leave', from: 'Sep 15', to: 'Sep 17', days: 3, status: 'Approved' },
  { type: 'Sick Leave', from: 'Aug 10', to: 'Aug 10', days: 1, status: 'Approved' },
  { type: 'Personal Leave', from: 'Jul 4', to: 'Jul 4', days: 1, status: 'Rejected' },
]

const statusStyle = {
  Approved: 'bg-secondary-container text-on-secondary-container',
  Rejected: 'bg-error-container text-on-error-container',
  Pending: 'bg-tertiary-fixed text-on-tertiary-fixed-variant',
}

export default function RequestLeave() {
  return (
    <div className="p-margin-mobile md:p-margin-desktop">
      <div className="mb-xl">
        <div className="flex items-center gap-xs text-on-surface-variant mb-xs">
          <Link to="/leave" className="text-label-md hover:text-primary">Leave Management</Link>
          <span className="material-symbols-outlined text-[16px]">chevron_right</span>
          <span className="text-label-md text-primary font-bold">Request Leave</span>
        </div>
        <h2 className="text-display font-display text-on-surface">Request Time Off</h2>
        <p className="text-body-lg text-on-surface-variant">Submit a new leave request for manager approval.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-gutter">
        {/* Balance Sidebar */}
        <div className="space-y-gutter">
          {leaveBalances.map(lb => (
            <div key={lb.type} className="bg-surface-container-lowest border border-outline-variant rounded-xl p-lg shadow-sm">
              <div className="flex items-center justify-between mb-md">
                <p className="text-label-md font-bold text-on-surface-variant uppercase tracking-wider">{lb.type}</p>
                <span className={`text-label-md font-bold ${lb.textColor}`}>{lb.total - lb.used} left</span>
              </div>
              <div className="w-full h-2 bg-surface-container rounded-full overflow-hidden mb-sm">
                <div
                  className={`h-full ${lb.color} rounded-full`}
                  style={{ width: `${(lb.used / lb.total) * 100}%` }}
                ></div>
              </div>
              <div className="flex justify-between text-label-sm text-on-surface-variant">
                <span>{lb.used} used</span>
                <span>{lb.total} total</span>
              </div>
            </div>
          ))}
        </div>

        {/* Leave Request Form */}
        <div className="lg:col-span-2 space-y-gutter">
          <div className="bg-surface-container-lowest border border-outline-variant rounded-xl p-xl shadow-sm">
            <h3 className="text-headline-md font-bold text-on-surface mb-lg border-b border-outline-variant pb-md">New Leave Request</h3>
            <div className="space-y-md">
              <div className="space-y-xs">
                <label className="text-label-md text-on-surface">Leave Type</label>
                <select className="w-full border border-outline-variant rounded-lg py-md px-md text-body-md focus:ring-1 focus:ring-primary focus:border-primary">
                  <option>Annual Leave</option>
                  <option>Sick Leave</option>
                  <option>Personal Leave</option>
                  <option>Maternity / Paternity Leave</option>
                  <option>Emergency Leave</option>
                </select>
              </div>
              <div className="grid grid-cols-2 gap-md">
                <div className="space-y-xs">
                  <label className="text-label-md text-on-surface">From Date</label>
                  <input className="w-full border border-outline-variant rounded-lg py-md px-md text-body-md focus:ring-1 focus:ring-primary outline-none" type="date" />
                </div>
                <div className="space-y-xs">
                  <label className="text-label-md text-on-surface">To Date</label>
                  <input className="w-full border border-outline-variant rounded-lg py-md px-md text-body-md focus:ring-1 focus:ring-primary outline-none" type="date" />
                </div>
              </div>
              <div className="space-y-xs">
                <label className="text-label-md text-on-surface">Reason for Leave</label>
                <textarea
                  className="w-full border border-outline-variant rounded-lg p-md text-body-md focus:ring-1 focus:ring-primary outline-none resize-none"
                  placeholder="Please provide a brief reason for your leave request..."
                  rows={4}
                />
              </div>
              <div className="space-y-xs">
                <label className="text-label-md text-on-surface">Supporting Document (Optional)</label>
                <div className="border-2 border-dashed border-outline-variant rounded-lg p-xl flex flex-col items-center justify-center text-on-surface-variant hover:border-primary/50 transition-colors cursor-pointer">
                  <span className="material-symbols-outlined text-[40px] mb-sm">upload_file</span>
                  <p className="text-body-md font-medium">Click to upload or drag & drop</p>
                  <p className="text-label-sm mt-xs">PDF, JPG, PNG up to 10MB</p>
                </div>
              </div>
            </div>
            <div className="flex flex-wrap justify-end gap-md pt-lg border-t border-outline-variant mt-lg">
              <Link to="/leave" className="px-lg py-md text-on-surface-variant hover:bg-surface-container rounded-lg text-label-md">Cancel</Link>
              <button className="px-xl py-md bg-primary text-on-primary rounded-lg text-label-md font-bold shadow-md hover:opacity-90 active:scale-95 transition-all">
                Submit Request
              </button>
            </div>
          </div>

          {/* Recent Requests */}
          <div className="bg-surface-container-lowest border border-outline-variant rounded-xl overflow-hidden shadow-sm">
            <div className="p-lg border-b border-outline-variant">
              <h4 className="text-headline-md font-bold">Recent Requests</h4>
            </div>
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-surface-container-low text-on-surface-variant text-label-md uppercase">
                  <th className="px-lg py-md font-bold">Type</th>
                  <th className="px-lg py-md font-bold">Duration</th>
                  <th className="px-lg py-md font-bold">Days</th>
                  <th className="px-lg py-md font-bold">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-outline-variant text-body-md">
                {recentRequests.map((req, i) => (
                  <tr key={i} className="hover:bg-surface-container-low transition-colors">
                    <td className="px-lg py-md">{req.type}</td>
                    <td className="px-lg py-md text-on-surface-variant">{req.from} – {req.to}</td>
                    <td className="px-lg py-md font-bold">{req.days}</td>
                    <td className="px-lg py-md">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-label-sm font-bold ${statusStyle[req.status]}`}>
                        {req.status}
                      </span>
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
