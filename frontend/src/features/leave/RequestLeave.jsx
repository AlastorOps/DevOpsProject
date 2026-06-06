import { useState, useRef, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { leaveService } from '../../api/leave.js'
import { useAuth } from '../../context/AuthContext.jsx'

const statusStyle = {
  Approved: 'bg-secondary-container text-on-secondary-container',
  Rejected: 'bg-error-container text-on-error-container',
  Pending:  'bg-tertiary-fixed text-on-tertiary-fixed-variant',
}

const balanceColors = ['bg-primary', 'bg-secondary', 'bg-tertiary', 'bg-outline', 'bg-error']
const textColors    = ['text-primary', 'text-secondary', 'text-tertiary', 'text-on-surface-variant', 'text-error']

const calcDays = (from, to) => {
  if (!from || !to) return 0
  const diff = new Date(to) - new Date(from)
  return Math.max(1, Math.floor(diff / 86400000) + 1)
}

export default function RequestLeave() {
  const { user } = useAuth()
  const [balances, setBalances]     = useState([])
  const [recent, setRecent]         = useState([])
  const [leaveType, setLeaveType]   = useState('Annual Leave')
  const [fromDate, setFromDate]     = useState('')
  const [toDate, setToDate]         = useState('')
  const [reason, setReason]         = useState('')
  const [file, setFile]             = useState(null)
  const [fileName, setFileName]     = useState('')
  const [toast, setToast]           = useState(null)
  const [submitting, setSubmitting] = useState(false)
  const fileRef                     = useRef(null)

  const days = calcDays(fromDate, toDate)

  const showToast = (message, type = 'success') => { setToast({ message, type }); setTimeout(() => setToast(null), 3000) }

  useEffect(() => {
    if (!user?.employee_id) return
    const load = async () => {
      try {
        const [bRes, lRes] = await Promise.all([
          leaveService.getBalance(user.employee_id),
          leaveService.listByEmployee(user.employee_id, { limit: 5 }),
        ])
        if (bRes.ok) setBalances(await bRes.json())
        if (lRes.ok) { const d = await lRes.json(); setRecent(d.requests || []) }
      } catch { /* ignore */ }
    }
    load()
  }, [user?.employee_id])

  const handleFileChange = (e) => {
    const f = e.target.files[0]
    if (f) { setFile(f); setFileName(f.name) }
  }

  const handleSubmit = async () => {
    if (!fromDate || !toDate) { showToast('Please select both start and end dates.', 'error'); return }
    if (!reason.trim()) { showToast('Please provide a reason for your leave.', 'error'); return }
    if (!user?.employee_id) { showToast('No employee profile linked to your account.', 'error'); return }

    setSubmitting(true)
    try {
      const fd = new FormData()
      fd.append('employee_id', user.employee_id)
      fd.append('leave_type', leaveType)
      fd.append('from_date', fromDate)
      fd.append('to_date', toDate)
      fd.append('reason', reason)
      if (file) fd.append('document', file)

      const res = await leaveService.submit(fd)

      if (res.ok || res.status === 201) {
        showToast(`Leave request submitted for ${days} day${days !== 1 ? 's' : ''}.`)
        setFromDate(''); setToDate(''); setReason(''); setFileName(''); setFile(null)
        const [bRes, lRes] = await Promise.all([
          leaveService.getBalance(user.employee_id),
          leaveService.listByEmployee(user.employee_id, { limit: 5 }),
        ])
        if (bRes.ok) setBalances(await bRes.json())
        if (lRes.ok) { const d = await lRes.json(); setRecent(d.requests || []) }
      } else {
        const err = await res.json().catch(() => ({}))
        showToast(err.detail || 'Submission failed.', 'error')
      }
    } catch { showToast('Network error.', 'error') }
    setSubmitting(false)
  }

  return (
    <div className="p-margin-mobile md:p-margin-desktop">
      {toast && (
        <div className={`fixed top-20 right-6 z-50 flex items-center gap-md px-lg py-md rounded-xl shadow-lg border text-label-md font-bold transition-all ${toast.type === 'error' ? 'bg-error-container text-on-error-container border-error/30' : 'bg-secondary-container text-on-secondary-container border-secondary/30'}`}>
          <span className="material-symbols-outlined text-[20px]">{toast.type === 'error' ? 'error' : 'check_circle'}</span>
          {toast.message}
        </div>
      )}

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
          {balances.length === 0 ? (
            <div className="bg-surface-container-lowest border border-outline-variant rounded-xl p-lg shadow-sm text-on-surface-variant text-body-md">No leave balances found.</div>
          ) : balances.map((lb, i) => (
            <div key={lb.leave_type} className="bg-surface-container-lowest border border-outline-variant rounded-xl p-lg shadow-sm">
              <div className="flex items-center justify-between mb-md">
                <p className="text-label-md font-bold text-on-surface-variant uppercase tracking-wider">{lb.leave_type}</p>
                <span className={`text-label-md font-bold ${textColors[i % textColors.length]}`}>{lb.remaining} left</span>
              </div>
              <div className="w-full h-2 bg-surface-container rounded-full overflow-hidden mb-sm">
                <div className={`h-full ${balanceColors[i % balanceColors.length]} rounded-full transition-all duration-500`} style={{ width: lb.total > 0 ? `${(lb.used / lb.total) * 100}%` : '0%' }}></div>
              </div>
              <div className="flex justify-between text-label-sm text-on-surface-variant">
                <span>{lb.used} used</span><span>{lb.total} total</span>
              </div>
            </div>
          ))}
        </div>

        {/* Form */}
        <div className="lg:col-span-2 space-y-gutter">
          <div className="bg-surface-container-lowest border border-outline-variant rounded-xl p-xl shadow-sm">
            <h3 className="text-headline-md font-bold text-on-surface mb-lg border-b border-outline-variant pb-md">New Leave Request</h3>
            <div className="space-y-md">
              <div className="space-y-xs">
                <label className="text-label-md text-on-surface">Leave Type</label>
                <select className="w-full border border-outline-variant rounded-lg py-md px-md text-body-md focus:ring-1 focus:ring-primary focus:border-primary" value={leaveType} onChange={e => setLeaveType(e.target.value)}>
                  {balances.length > 0 ? balances.map(b => <option key={b.leave_type}>{b.leave_type}</option>) : (
                    <>
                      <option>Annual Leave</option><option>Sick Leave</option><option>Personal Leave</option>
                      <option>Maternity / Paternity Leave</option><option>Emergency Leave</option>
                    </>
                  )}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-md">
                <div className="space-y-xs">
                  <label className="text-label-md text-on-surface">From Date</label>
                  <input className="w-full border border-outline-variant rounded-lg py-md px-md text-body-md focus:ring-1 focus:ring-primary outline-none" type="date" value={fromDate} onChange={e => setFromDate(e.target.value)} />
                </div>
                <div className="space-y-xs">
                  <label className="text-label-md text-on-surface">To Date</label>
                  <input className="w-full border border-outline-variant rounded-lg py-md px-md text-body-md focus:ring-1 focus:ring-primary outline-none" type="date" value={toDate} min={fromDate} onChange={e => setToDate(e.target.value)} />
                </div>
              </div>
              {days > 0 && <p className="text-label-md text-primary font-bold">{days} day{days !== 1 ? 's' : ''} selected</p>}
              <div className="space-y-xs">
                <label className="text-label-md text-on-surface">Reason for Leave</label>
                <textarea className="w-full border border-outline-variant rounded-lg p-md text-body-md focus:ring-1 focus:ring-primary outline-none resize-none" placeholder="Please provide a brief reason…" rows={4} value={reason} onChange={e => setReason(e.target.value)} />
              </div>
              <div className="space-y-xs">
                <label className="text-label-md text-on-surface">Supporting Document (Optional)</label>
                <div onClick={() => fileRef.current.click()} className="border-2 border-dashed border-outline-variant rounded-lg p-xl flex flex-col items-center justify-center text-on-surface-variant hover:border-primary/50 transition-colors cursor-pointer">
                  <span className="material-symbols-outlined text-[40px] mb-sm">upload_file</span>
                  {fileName ? <p className="text-body-md font-medium text-primary">{fileName}</p> : <><p className="text-body-md font-medium">Click to upload or drag &amp; drop</p><p className="text-label-sm mt-xs">PDF, JPG, PNG up to 10MB</p></>}
                </div>
                <input ref={fileRef} type="file" accept=".pdf,.jpg,.jpeg,.png" className="hidden" onChange={handleFileChange} />
              </div>
            </div>
            <div className="flex flex-wrap justify-end gap-md pt-lg border-t border-outline-variant mt-lg">
              <Link to="/leave" className="px-lg py-md text-on-surface-variant hover:bg-surface-container rounded-lg text-label-md">Cancel</Link>
              <button onClick={handleSubmit} disabled={submitting} className="px-xl py-md bg-primary text-on-primary rounded-lg text-label-md font-bold shadow-md hover:opacity-90 active:scale-95 transition-all disabled:opacity-50">
                {submitting ? 'Submitting…' : 'Submit Request'}
              </button>
            </div>
          </div>

          {/* Recent */}
          <div className="bg-surface-container-lowest border border-outline-variant rounded-xl overflow-hidden shadow-sm">
            <div className="p-lg border-b border-outline-variant"><h4 className="text-headline-md font-bold">Recent Requests</h4></div>
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
                {recent.length === 0 ? (
                  <tr><td colSpan={4} className="px-lg py-xl text-center text-on-surface-variant">No recent requests.</td></tr>
                ) : recent.map(req => (
                  <tr key={req.id} className="hover:bg-surface-container-low transition-colors">
                    <td className="px-lg py-md">{req.leave_type}</td>
                    <td className="px-lg py-md text-on-surface-variant">{req.from_date} – {req.to_date}</td>
                    <td className="px-lg py-md font-bold">{req.days}</td>
                    <td className="px-lg py-md"><span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-label-sm font-bold ${statusStyle[req.status] ?? ''}`}>{req.status}</span></td>
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
