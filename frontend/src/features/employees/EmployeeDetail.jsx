import { useState, useEffect, useCallback } from 'react'
import { Link, useParams } from 'react-router-dom'
import Badge from '../../components/ui/Badge'
import { employeeService } from '../../api/employees.js'
import { attendanceService } from '../../api/attendance.js'
import { leaveService } from '../../api/leave.js'
import { payrollService } from '../../api/payroll.js'
import { performanceService } from '../../api/performance.js'

const tabs = ['Profile', 'Attendance', 'Leave', 'Payroll', 'Performance']

const attStatusVariant = { 'On Time': 'approved', Present: 'approved', Late: 'leave', Absent: 'inactive' }

export default function EmployeeDetail() {
  const { id } = useParams()
  const [activeTab, setActiveTab] = useState('Profile')
  const [employee, setEmployee]   = useState(null)
  const [attendance, setAttendance] = useState([])
  const [leaves, setLeaves]       = useState([])
  const [payroll, setPayroll]     = useState([])
  const [performance, setPerformance] = useState([])
  const [leaveBalance, setLeaveBalance] = useState([])
  const [loading, setLoading]     = useState(true)

  const fetchEmployee = useCallback(async () => {
    try {
      const res = await employeeService.get(id)
      if (res.ok) setEmployee(await res.json())
    } catch { /* ignore */ }
  }, [id])

  const fetchTabData = useCallback(async (tab) => {
    if (!id) return
    try {
      if (tab === 'Attendance') {
        const res = await attendanceService.listByEmployee(id, { limit: 20 })
        if (res.ok) { const d = await res.json(); setAttendance(d.records || []) }
      } else if (tab === 'Leave') {
        const [lRes, bRes] = await Promise.all([
          leaveService.listByEmployee(id, { limit: 20 }),
          leaveService.getBalance(id),
        ])
        if (lRes.ok) { const d = await lRes.json(); setLeaves(d.requests || []) }
        if (bRes.ok) setLeaveBalance(await bRes.json())
      } else if (tab === 'Payroll') {
        const res = await payrollService.listByEmployee(id, { limit: 20 })
        if (res.ok) { const d = await res.json(); setPayroll(d.records || []) }
      } else if (tab === 'Performance') {
        const res = await performanceService.listByEmployee(id, { limit: 20 })
        if (res.ok) { const d = await res.json(); setPerformance(d.reviews || []) }
      }
    } catch { /* ignore */ }
  }, [id])

  useEffect(() => {
    setLoading(true)
    fetchEmployee().finally(() => setLoading(false))
  }, [fetchEmployee])

  useEffect(() => { fetchTabData(activeTab) }, [activeTab, fetchTabData])

  if (loading) return (
    <div className="p-margin-mobile md:p-margin-desktop flex items-center justify-center h-64">
      <span className="material-symbols-outlined text-primary text-[40px]" style={{ animation: 'spin 1s linear infinite' }}>progress_activity</span>
    </div>
  )

  if (!employee) return (
    <div className="p-margin-mobile md:p-margin-desktop">
      <div className="bg-error-container/20 border border-error/20 rounded-xl p-lg text-on-error-container">Employee not found.</div>
    </div>
  )

  const initials = employee.name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()

  const annualBalance = leaveBalance.find(b => b.leave_type === 'Annual Leave')

  const latestPayroll = payroll[0]

  return (
    <div className="p-margin-mobile md:p-margin-desktop">
      <div className="flex items-center gap-xs text-on-surface-variant mb-lg">
        <Link to="/employees" className="text-label-md hover:text-primary">Employees</Link>
        <span className="material-symbols-outlined text-[16px]">chevron_right</span>
        <span className="text-label-md text-primary font-bold">Employee Profile</span>
      </div>

      <div className="bg-surface-container-lowest border border-outline-variant rounded-xl overflow-hidden shadow-sm mb-lg">
        <div className="h-24 bg-primary/10"></div>
        <div className="px-xl pb-xl -mt-12 flex flex-col md:flex-row md:items-end justify-between gap-md">
          <div className="flex flex-col sm:flex-row sm:items-end gap-lg">
            {employee.photo_path
              ? <img src={`/uploads/${employee.photo_path}`} alt={employee.name} className="w-24 h-24 rounded-xl object-cover border-4 border-surface-container-lowest shadow-md" />
              : <div className="w-24 h-24 rounded-xl bg-primary flex items-center justify-center text-on-primary font-bold text-2xl border-4 border-surface-container-lowest shadow-md">{initials}</div>
            }
            <div className="pb-2">
              <h1 className="text-headline-lg font-bold text-on-surface">{employee.name}</h1>
              <p className="text-body-md text-primary">{employee.position?.title ?? '—'}</p>
              <div className="flex flex-wrap gap-sm mt-sm">
                <span className="inline-flex items-center gap-xs px-sm py-xs rounded-lg bg-secondary-container/20 text-on-secondary-container text-label-md">
                  <span className="material-symbols-outlined text-[14px]" style={{ fontVariationSettings: "'FILL' 1" }}>verified</span> Verified Employee
                </span>
                <span className="inline-flex items-center gap-xs px-sm py-xs rounded-lg bg-surface-container text-on-surface-variant text-label-md">
                  <span className="material-symbols-outlined text-[14px]">badge</span> {employee.emp_id}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-gutter mb-lg">
        <div className="bg-surface-container-lowest border border-outline-variant p-lg rounded-xl flex items-center gap-md shadow-sm">
          <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center text-primary"><span className="material-symbols-outlined">event_note</span></div>
          <div>
            <p className="text-label-sm text-outline uppercase">Leave Balance</p>
            <p className="text-headline-md font-bold mt-xs">{annualBalance ? `${annualBalance.remaining} days` : '—'}</p>
            <p className="text-label-sm text-on-surface-variant mt-xs">Annual Remaining</p>
          </div>
        </div>
        <div className="bg-surface-container-lowest border border-outline-variant p-lg rounded-xl flex items-center gap-md shadow-sm">
          <div className="w-12 h-12 rounded-full bg-tertiary/10 flex items-center justify-center text-tertiary"><span className="material-symbols-outlined">payments</span></div>
          <div>
            <p className="text-label-sm text-outline uppercase">Salary</p>
            <p className="text-headline-md font-bold mt-xs">{employee.salary ? `$${Number(employee.salary).toLocaleString()}` : '—'}</p>
            <p className="text-label-sm text-on-surface-variant mt-xs">Per month (Gross)</p>
          </div>
        </div>
        <div className="bg-surface-container-lowest border border-outline-variant p-lg rounded-xl flex items-center gap-md shadow-sm">
          <div className="w-12 h-12 rounded-full bg-secondary/10 flex items-center justify-center text-secondary"><span className="material-symbols-outlined">work</span></div>
          <div>
            <p className="text-label-sm text-outline uppercase">Employment</p>
            <p className="text-headline-md font-bold mt-xs">{employee.employment_type ?? '—'}</p>
            <p className="text-label-sm text-on-surface-variant mt-xs">{employee.status}</p>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-surface-container-lowest border border-outline-variant rounded-xl overflow-hidden shadow-sm">
        <div className="flex border-b border-outline-variant overflow-x-auto">
          {tabs.map(tab => (
            <button key={tab} onClick={() => setActiveTab(tab)} className={`px-lg py-md text-label-md font-bold whitespace-nowrap transition-colors ${activeTab === tab ? 'text-primary border-b-2 border-primary -mb-px' : 'text-on-surface-variant hover:text-on-surface hover:bg-surface-container-low'}`}>{tab}</button>
          ))}
        </div>

        {activeTab === 'Profile' && (
          <div className="p-xl grid grid-cols-1 md:grid-cols-2 gap-xl">
            <div className="space-y-lg">
              <h4 className="text-headline-md mb-md text-on-surface">Contact Information</h4>
              {[
                { label: 'Email', val: employee.work_email ?? employee.personal_email ?? '—', icon: 'mail' },
                { label: 'Phone', val: employee.phone ?? '—', icon: 'phone' },
                { label: 'Address', val: employee.address ?? '—', icon: 'location_on' },
              ].map(item => (
                <div key={item.label} className="flex items-center gap-md">
                  <span className="material-symbols-outlined text-outline">{item.icon}</span>
                  <div><p className="text-label-sm text-on-surface-variant">{item.label}</p><p className="text-body-md font-medium">{item.val}</p></div>
                </div>
              ))}
            </div>
            <div>
              <h4 className="text-headline-md mb-md text-on-surface">Work Information</h4>
              <div className="grid grid-cols-2 gap-md">
                {[
                  { label: 'Department', val: employee.department?.name ?? '—' },
                  { label: 'Position', val: employee.position?.title ?? '—' },
                  { label: 'Employment Type', val: employee.employment_type ?? '—' },
                  { label: 'Join Date', val: employee.hire_date ? new Date(employee.hire_date).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }) : '—' },
                  { label: 'Employee ID', val: employee.emp_id },
                  { label: 'Status', val: employee.status },
                ].map(item => (
                  <div key={item.label}>
                    <p className="text-label-sm text-on-surface-variant uppercase tracking-wider">{item.label}</p>
                    <p className="text-body-md font-medium mt-xs">{item.val}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'Attendance' && (
          <div className="p-xl space-y-lg">
            <div className="overflow-x-auto rounded-xl border border-outline-variant">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-surface-container text-on-surface-variant text-label-sm uppercase tracking-wider">
                    {['Date', 'Check In', 'Check Out', 'Hours', 'Status'].map(h => <th key={h} className="px-lg py-md font-bold">{h}</th>)}
                  </tr>
                </thead>
                <tbody className="divide-y divide-outline-variant text-body-md">
                  {attendance.length === 0 ? (
                    <tr><td colSpan={5} className="px-lg py-xl text-center text-on-surface-variant">No attendance records.</td></tr>
                  ) : attendance.map(row => (
                    <tr key={row.id} className="hover:bg-surface-container-low transition-colors">
                      <td className="px-lg py-md font-bold">{row.date}</td>
                      <td className="px-lg py-md">{row.check_in ?? '—'}</td>
                      <td className="px-lg py-md">{row.check_out ?? '—'}</td>
                      <td className="px-lg py-md">{row.hours ?? '—'}</td>
                      <td className="px-lg py-md"><Badge label={row.status} variant={attStatusVariant[row.status] ?? 'inactive'} /></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeTab === 'Leave' && (
          <div className="p-xl space-y-lg">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-gutter">
              {leaveBalance.slice(0, 3).map((lb, i) => {
                const colors = ['bg-primary', 'bg-secondary', 'bg-tertiary']
                const pct = lb.total > 0 ? (lb.used / lb.total) * 100 : 0
                return (
                  <div key={lb.leave_type} className="bg-surface-container-low rounded-xl p-lg space-y-md">
                    <div className="flex justify-between"><span className="text-label-md font-bold">{lb.leave_type}</span><span className="text-label-sm text-outline">{lb.used}/{lb.total} days</span></div>
                    <div className="h-2 w-full bg-surface-container rounded-full overflow-hidden"><div className={`h-full ${colors[i % 3]} rounded-full`} style={{ width: `${pct}%` }} /></div>
                    <p className="text-label-sm text-on-surface-variant">Remaining: {lb.remaining} days</p>
                  </div>
                )
              })}
            </div>
            <div className="overflow-x-auto rounded-xl border border-outline-variant">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-surface-container text-on-surface-variant text-label-sm uppercase tracking-wider">
                    {['Type', 'From', 'To', 'Days', 'Reason', 'Status'].map(h => <th key={h} className="px-lg py-md font-bold">{h}</th>)}
                  </tr>
                </thead>
                <tbody className="divide-y divide-outline-variant text-body-md">
                  {leaves.length === 0 ? (
                    <tr><td colSpan={6} className="px-lg py-xl text-center text-on-surface-variant">No leave history.</td></tr>
                  ) : leaves.map(row => (
                    <tr key={row.id} className="hover:bg-surface-container-low transition-colors">
                      <td className="px-lg py-md font-bold">{row.leave_type}</td>
                      <td className="px-lg py-md">{row.from_date}</td>
                      <td className="px-lg py-md">{row.to_date}</td>
                      <td className="px-lg py-md">{row.days}</td>
                      <td className="px-lg py-md text-on-surface-variant italic">{row.reason}</td>
                      <td className="px-lg py-md"><Badge label={row.status} variant={row.status.toLowerCase()} /></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeTab === 'Payroll' && (
          <div className="p-xl space-y-lg">
            {latestPayroll && (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-gutter">
                {[
                  { label: 'Gross Salary', value: `$${Number(latestPayroll.basic).toLocaleString()}`, icon: 'payments', iconBg: 'bg-primary/10', iconColor: 'text-primary' },
                  { label: 'Total Deductions', value: `$${Number(latestPayroll.deductions).toLocaleString()}`, icon: 'remove_circle', iconBg: 'bg-error/10', iconColor: 'text-error' },
                  { label: 'Net Pay', value: `$${Number(latestPayroll.net).toLocaleString()}`, icon: 'account_balance_wallet', iconBg: 'bg-secondary/10', iconColor: 'text-secondary' },
                ].map(s => (
                  <div key={s.label} className="bg-surface-container-low rounded-xl p-lg flex items-center gap-md">
                    <div className={`w-11 h-11 rounded-full flex items-center justify-center shrink-0 ${s.iconBg} ${s.iconColor}`}><span className="material-symbols-outlined">{s.icon}</span></div>
                    <div><p className="text-label-sm text-outline uppercase tracking-wider">{s.label}</p><p className="text-headline-md font-bold mt-xs">{s.value}</p></div>
                  </div>
                ))}
              </div>
            )}
            <div className="overflow-x-auto rounded-xl border border-outline-variant">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-surface-container text-on-surface-variant text-label-sm uppercase tracking-wider">
                    {['Month', 'Basic', 'Bonus', 'Deductions', 'Net Pay', 'Status', 'Paid On'].map(h => <th key={h} className="px-lg py-md font-bold">{h}</th>)}
                  </tr>
                </thead>
                <tbody className="divide-y divide-outline-variant text-body-md">
                  {payroll.length === 0 ? (
                    <tr><td colSpan={7} className="px-lg py-xl text-center text-on-surface-variant">No payroll records.</td></tr>
                  ) : payroll.map(row => (
                    <tr key={row.id} className="hover:bg-surface-container-low transition-colors">
                      <td className="px-lg py-md font-bold">{row.month}</td>
                      <td className="px-lg py-md">${Number(row.basic).toLocaleString()}</td>
                      <td className="px-lg py-md text-secondary">+${Number(row.bonus).toLocaleString()}</td>
                      <td className="px-lg py-md text-on-surface-variant">-${Number(row.deductions).toLocaleString()}</td>
                      <td className="px-lg py-md font-bold text-secondary">${Number(row.net).toLocaleString()}</td>
                      <td className="px-lg py-md"><Badge label={row.status} variant={row.status === 'Paid' ? 'paid' : 'leave'} /></td>
                      <td className="px-lg py-md text-on-surface-variant">{row.paid_on ?? '—'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeTab === 'Performance' && (
          <div className="p-xl space-y-lg">
            <div className="overflow-x-auto rounded-xl border border-outline-variant">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-surface-container text-on-surface-variant text-label-sm uppercase tracking-wider">
                    {['Cycle', 'Rating', 'Stars', 'Reviewer', 'Date', 'Comments'].map(h => <th key={h} className="px-lg py-md font-bold">{h}</th>)}
                  </tr>
                </thead>
                <tbody className="divide-y divide-outline-variant text-body-md">
                  {performance.length === 0 ? (
                    <tr><td colSpan={6} className="px-lg py-xl text-center text-on-surface-variant">No performance reviews.</td></tr>
                  ) : performance.map(row => (
                    <tr key={row.id} className="hover:bg-surface-container-low transition-colors">
                      <td className="px-lg py-md font-bold">{row.cycle}</td>
                      <td className="px-lg py-md"><Badge label={row.rating} variant={row.rating === 'Excellent' ? 'approved' : row.rating === 'Poor' ? 'inactive' : 'leave'} /></td>
                      <td className="px-lg py-md">
                        <div className="flex gap-xs">{[1,2,3,4,5].map(i => <span key={i} className={`material-symbols-outlined text-[16px] ${i <= row.stars ? 'text-primary' : 'text-outline-variant'}`} style={{ fontVariationSettings: i <= row.stars ? "'FILL' 1" : "'FILL' 0" }}>star</span>)}</div>
                      </td>
                      <td className="px-lg py-md">{row.reviewer_name ?? '—'}</td>
                      <td className="px-lg py-md">{row.review_date}</td>
                      <td className="px-lg py-md text-on-surface-variant italic">{row.comments ?? '—'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
