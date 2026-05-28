import { useState } from 'react'

const leaveRequests = [
  { id: 'LV-2024-0041', name: 'Alice Wang', init: 'AW', dept: 'Engineering', type: 'Annual Leave', from: 'Oct 28', to: 'Oct 31', days: 4, reason: 'Family vacation', status: 'Pending' },
  { id: 'LV-2024-0040', name: 'Brad Kim', init: 'BK', dept: 'Marketing', type: 'Sick Leave', from: 'Oct 25', to: 'Oct 26', days: 2, reason: 'Medical appointment', status: 'Approved' },
  { id: 'LV-2024-0039', name: 'Carla Osei', init: 'CO', dept: 'Sales', type: 'Personal Leave', from: 'Nov 1', to: 'Nov 1', days: 1, reason: 'Personal errand', status: 'Rejected' },
]

const statusStyle = {
  Pending: 'bg-tertiary-fixed text-on-tertiary-fixed-variant',
  Approved: 'bg-secondary-container text-on-secondary-container',
  Rejected: 'bg-error-container text-on-error-container',
}

export default function LeaveManagement() {
  const [toast, setToast] = useState(null)

  const handleAction = (action, name) => {
    setToast(`${action}: Leave request for ${name}`)
    setTimeout(() => setToast(null), 3000)
  }

  return (
    <div className="p-margin-mobile md:p-margin-desktop">
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-xl gap-md">
        <div>
          <h2 className="text-headline-lg text-on-surface">Leave Management</h2>
          <p className="text-body-md text-on-surface-variant">Review, approve, or reject employee leave requests</p>
        </div>
        <button className="flex items-center gap-xs px-lg py-sm bg-primary text-on-primary rounded-lg text-label-md hover:brightness-110 active:scale-95 transition-all shadow-md">
          <span className="material-symbols-outlined text-[18px]">download</span>
          Export Report
        </button>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-gutter mb-lg">
        {[
          { label: 'Total Requests', val: '124', icon: 'event_note', style: 'bg-primary text-on-primary', trend: '+8 this week' },
          { label: 'Approved', val: '89', icon: 'event_available', style: 'bg-secondary-container/30', trend: '71.8%' },
          { label: 'Pending', val: '24', icon: 'pending_actions', style: 'bg-tertiary-fixed/30', trend: 'Needs action' },
          { label: 'Rejected', val: '11', icon: 'event_busy', style: 'bg-error-container/30', trend: '8.9%' },
        ].map(s => (
          <div key={s.label} className={`p-lg rounded-xl border border-outline-variant shadow-sm ${s.style}`}>
            <div className="flex items-center justify-between mb-md">
              <span className="material-symbols-outlined">{s.icon}</span>
              <span className="text-label-sm opacity-70">{s.trend}</span>
            </div>
            <p className="text-label-sm uppercase tracking-wider opacity-70">{s.label}</p>
            <h3 className="text-headline-lg font-bold mt-xs">{s.val}</h3>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="bg-surface-container-lowest border border-outline-variant rounded-xl p-md mb-lg flex flex-wrap gap-md shadow-sm">
        <div className="flex-1 min-w-[200px] relative">
          <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-outline text-[18px]">search</span>
          <input className="w-full bg-background border border-outline-variant rounded-lg py-2 pl-10 pr-4 text-body-md focus:ring-2 focus:ring-primary outline-none" placeholder="Search employee..." type="text" />
        </div>
        <select className="bg-background border border-outline-variant rounded-lg py-2 px-3 text-body-md">
          <option>All Leave Types</option>
          <option>Annual Leave</option>
          <option>Sick Leave</option>
          <option>Personal Leave</option>
        </select>
        <select className="bg-background border border-outline-variant rounded-lg py-2 px-3 text-body-md">
          <option>All Status</option>
          <option>Pending</option>
          <option>Approved</option>
          <option>Rejected</option>
        </select>
      </div>

      {/* Leave Requests Table */}
      <div className="bg-surface-container-lowest border border-outline-variant rounded-xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-surface-container-low text-on-surface-variant text-label-md uppercase tracking-wider">
                <th className="px-lg py-md font-bold">Employee</th>
                <th className="px-lg py-md font-bold">Leave Type</th>
                <th className="px-lg py-md font-bold">Duration</th>
                <th className="px-lg py-md font-bold">Days</th>
                <th className="px-lg py-md font-bold">Reason</th>
                <th className="px-lg py-md font-bold">Status</th>
                <th className="px-lg py-md font-bold text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-outline-variant text-body-md">
              {leaveRequests.map(req => (
                <tr key={req.id} className="hover:bg-surface-container-low transition-colors">
                  <td className="px-lg py-md">
                    <div className="flex items-center gap-sm">
                      <div className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-sm">{req.init}</div>
                      <div>
                        <p className="font-bold">{req.name}</p>
                        <p className="text-label-sm text-on-surface-variant">{req.dept}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-lg py-md">{req.type}</td>
                  <td className="px-lg py-md text-on-surface-variant">{req.from} – {req.to}</td>
                  <td className="px-lg py-md font-bold">{req.days}</td>
                  <td className="px-lg py-md text-on-surface-variant">{req.reason}</td>
                  <td className="px-lg py-md">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-label-sm font-bold ${statusStyle[req.status]}`}>
                      {req.status}
                    </span>
                  </td>
                  <td className="px-lg py-md">
                    {req.status === 'Pending' ? (
                      <div className="flex items-center justify-center gap-sm">
                        <button
                          onClick={() => handleAction('Approved', req.name)}
                          className="px-md py-xs bg-secondary-container text-on-secondary-container rounded-lg text-label-md font-bold hover:opacity-90"
                        >
                          Approve
                        </button>
                        <button
                          onClick={() => handleAction('Rejected', req.name)}
                          className="px-md py-xs bg-error-container text-on-error-container rounded-lg text-label-md font-bold hover:opacity-90"
                        >
                          Reject
                        </button>
                      </div>
                    ) : (
                      <div className="flex items-center justify-center">
                        <button className="p-1 hover:bg-surface-container rounded-lg text-outline transition-all">
                          <span className="material-symbols-outlined text-[20px]">more_vert</span>
                        </button>
                      </div>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
          <div className="p-md bg-surface-container-low flex flex-col gap-md sm:flex-row sm:items-center sm:justify-between border-t border-outline-variant">
          <p className="text-label-sm text-on-surface-variant">Showing 3 of 124 requests</p>
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

      {/* Toast */}
      {toast && (
        <div className="fixed bottom-lg right-lg bg-inverse-surface text-inverse-on-surface px-lg py-md rounded-xl shadow-xl flex items-center gap-md z-50">
          <span className="material-symbols-outlined text-secondary-fixed">check_circle</span>
          <span className="text-body-md">{toast}</span>
          <button onClick={() => setToast(null)} className="text-inverse-on-surface/60 hover:text-inverse-on-surface ml-md">
            <span className="material-symbols-outlined text-[18px]">close</span>
          </button>
        </div>
      )}
    </div>
  )
}
