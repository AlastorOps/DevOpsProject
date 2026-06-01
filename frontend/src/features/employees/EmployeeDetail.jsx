import { useState } from 'react'
import { Link } from 'react-router-dom'
import Badge from '../../components/ui/Badge'

const tabs = ['Profile', 'Attendance', 'Leave', 'Payroll', 'Performance', 'Documents']

const attendanceData = [
  { date: 'Nov 14', day: 'Thu', in: '09:02 AM', out: '06:15 PM', hours: '9h 13m', status: 'On Time' },
  { date: 'Nov 13', day: 'Wed', in: '09:45 AM', out: '06:30 PM', hours: '8h 45m', status: 'Late' },
  { date: 'Nov 12', day: 'Tue', in: '08:55 AM', out: '06:05 PM', hours: '9h 10m', status: 'On Time' },
  { date: 'Nov 11', day: 'Mon', in: '09:00 AM', out: '05:50 PM', hours: '8h 50m', status: 'On Time' },
  { date: 'Nov 08', day: 'Fri', in: '—', out: '—', hours: '—', status: 'Absent' },
  { date: 'Nov 07', day: 'Thu', in: '09:10 AM', out: '06:20 PM', hours: '9h 10m', status: 'On Time' },
]

const leaveData = [
  { type: 'Annual Leave', start: 'Oct 28', end: 'Oct 31', days: 4, reason: 'Family vacation', status: 'Approved' },
  { type: 'Sick Leave', start: 'Sep 15', end: 'Sep 16', days: 2, reason: 'Seasonal flu', status: 'Approved' },
  { type: 'Personal Leave', start: 'Aug 02', end: 'Aug 02', days: 1, reason: 'Personal errand', status: 'Approved' },
  { type: 'Annual Leave', start: 'Dec 24', end: 'Dec 26', days: 3, reason: 'Christmas holidays', status: 'Pending' },
]

const payrollData = [
  { month: 'October 2024', gross: '$8,500', tax: '$1,200', deductions: '$350', net: '$6,950', status: 'Paid', date: 'Oct 31, 2024' },
  { month: 'September 2024', gross: '$8,500', tax: '$1,200', deductions: '$350', net: '$6,950', status: 'Paid', date: 'Sep 30, 2024' },
  { month: 'August 2024', gross: '$8,500', tax: '$1,200', deductions: '$350', net: '$6,950', status: 'Paid', date: 'Aug 31, 2024' },
]

const performanceData = [
  { kpi: 'Recruitment Targets', target: '20 hires/quarter', achieved: '22 hires', score: 110, trend: 'up' },
  { kpi: 'Employee Satisfaction', target: '85% score', achieved: '88%', score: 88, trend: 'up' },
  { kpi: 'Onboarding Time', target: '< 5 days', achieved: '4.2 days', score: 92, trend: 'up' },
  { kpi: 'Policy Compliance', target: '100%', achieved: '97%', score: 97, trend: 'neutral' },
]

const documentsData = [
  { name: 'Employment Contract', type: 'PDF', size: '284 KB', uploaded: 'Oct 12, 2018', icon: 'description' },
  { name: 'NDA Agreement', type: 'PDF', size: '156 KB', uploaded: 'Oct 12, 2018', icon: 'gavel' },
  { name: 'Tax Form W-4', type: 'PDF', size: '98 KB', uploaded: 'Jan 15, 2024', icon: 'receipt' },
  { name: 'Performance Review Q3', type: 'DOCX', size: '412 KB', uploaded: 'Sep 30, 2024', icon: 'analytics' },
  { name: 'ID Verification', type: 'JPG', size: '1.2 MB', uploaded: 'Oct 12, 2018', icon: 'badge' },
]

const attendanceStatusVariant = { 'On Time': 'approved', Late: 'leave', Absent: 'inactive' }

export default function EmployeeDetail() {
  const [activeTab, setActiveTab] = useState('Profile')

  return (
    <div className="p-margin-mobile md:p-margin-desktop">
      {/* Breadcrumb */}
      <div className="flex items-center gap-xs text-on-surface-variant mb-lg">
        <Link to="/employees" className="text-label-md hover:text-primary">Employees</Link>
        <span className="material-symbols-outlined text-[16px]">chevron_right</span>
        <span className="text-label-md text-primary font-bold">Employee Profile</span>
      </div>

      {/* Profile Header Card */}
      <div className="bg-surface-container-lowest border border-outline-variant rounded-xl overflow-hidden shadow-sm mb-lg">
        <div className="h-24 bg-primary/10"></div>
        <div className="px-xl pb-xl -mt-12 flex flex-col md:flex-row md:items-end justify-between gap-md">
          <div className="flex flex-col sm:flex-row sm:items-end gap-lg">
            <div className="w-24 h-24 rounded-xl bg-primary flex items-center justify-center text-on-primary font-bold text-2xl border-4 border-surface-container-lowest shadow-md">JD</div>
            <div className="pb-2">
              <h1 className="text-headline-lg font-bold text-on-surface">John Doe</h1>
              <p className="text-body-md text-primary">HR Manager</p>
              <div className="flex flex-wrap gap-sm mt-sm">
                <span className="inline-flex items-center gap-xs px-sm py-xs rounded-lg bg-secondary-container/20 text-on-secondary-container text-label-md">
                  <span className="material-symbols-outlined text-[14px]" style={{ fontVariationSettings: "'FILL' 1" }}>verified</span>
                  Verified Employee
                </span>
                <span className="inline-flex items-center gap-xs px-sm py-xs rounded-lg bg-surface-container text-on-surface-variant text-label-md">
                  <span className="material-symbols-outlined text-[14px]">badge</span>
                  #EMP-001
                </span>
              </div>
            </div>
          </div>
          <div className="flex flex-wrap gap-sm pb-2">
            <button className="flex items-center gap-xs px-md py-sm bg-surface-container border border-outline-variant text-on-surface rounded-lg text-label-md hover:bg-surface-container-high transition-all">
              <span className="material-symbols-outlined text-[18px]">edit</span> Edit Profile
            </button>
            <button className="flex items-center gap-xs px-md py-sm bg-primary text-on-primary rounded-lg text-label-md hover:brightness-110 transition-all">
              <span className="material-symbols-outlined text-[18px]">mail</span> Send Message
            </button>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-gutter mb-lg">
        <div className="bg-surface-container-lowest border border-outline-variant p-lg rounded-xl flex items-center gap-md shadow-sm">
          <div className="w-12 h-12 rounded-full bg-secondary/10 flex items-center justify-center text-secondary">
            <span className="material-symbols-outlined">event_available</span>
          </div>
          <div>
            <p className="text-label-sm text-outline uppercase">Attendance Rate</p>
            <p className="text-headline-md font-bold mt-xs">96.4%</p>
            <p className="text-label-sm text-secondary mt-xs">Last 30 days</p>
          </div>
        </div>
        <div className="bg-surface-container-lowest border border-outline-variant p-lg rounded-xl flex items-center gap-md shadow-sm">
          <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center text-primary">
            <span className="material-symbols-outlined">event_note</span>
          </div>
          <div>
            <p className="text-label-sm text-outline uppercase">Leave Balance</p>
            <p className="text-headline-md font-bold mt-xs">12 days</p>
            <p className="text-label-sm text-on-surface-variant mt-xs">Annual / Remaining</p>
          </div>
        </div>
        <div className="bg-surface-container-lowest border border-outline-variant p-lg rounded-xl flex items-center gap-md shadow-sm">
          <div className="w-12 h-12 rounded-full bg-tertiary/10 flex items-center justify-center text-tertiary">
            <span className="material-symbols-outlined">payments</span>
          </div>
          <div>
            <p className="text-label-sm text-outline uppercase">Salary</p>
            <p className="text-headline-md font-bold mt-xs">$8,500</p>
            <p className="text-label-sm text-on-surface-variant mt-xs">Per month (Gross)</p>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-surface-container-lowest border border-outline-variant rounded-xl overflow-hidden shadow-sm">
        <div className="flex border-b border-outline-variant overflow-x-auto">
          {tabs.map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-lg py-md text-label-md font-bold whitespace-nowrap transition-colors ${
                activeTab === tab
                  ? 'text-primary border-b-2 border-primary -mb-px'
                  : 'text-on-surface-variant hover:text-on-surface hover:bg-surface-container-low'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        {activeTab === 'Profile' && (
          <div className="p-xl grid grid-cols-1 md:grid-cols-2 gap-xl">
            <div className="space-y-lg">
              <div>
                <h4 className="text-headline-md mb-md text-on-surface">Contact Information</h4>
                <div className="space-y-md">
                  {[
                    { label: 'Email', val: 'john.doe@company.com', icon: 'mail' },
                    { label: 'Phone', val: '+1 (555) 010-2345', icon: 'phone' },
                    { label: 'Address', val: '123 Main St, New York, NY', icon: 'location_on' },
                  ].map(item => (
                    <div key={item.label} className="flex items-center gap-md">
                      <span className="material-symbols-outlined text-outline">{item.icon}</span>
                      <div>
                        <p className="text-label-sm text-on-surface-variant">{item.label}</p>
                        <p className="text-body-md font-medium">{item.val}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
            <div className="space-y-lg">
              <div>
                <h4 className="text-headline-md mb-md text-on-surface">Work Information</h4>
                <div className="grid grid-cols-2 gap-md">
                  {[
                    { label: 'Department', val: 'Human Resources' },
                    { label: 'Position', val: 'HR Manager' },
                    { label: 'Employment Type', val: 'Full-time' },
                    { label: 'Join Date', val: 'October 12, 2018' },
                    { label: 'Manager', val: 'Sarah Mitchell' },
                    { label: 'Location', val: 'New York, NY' },
                  ].map(item => (
                    <div key={item.label}>
                      <p className="text-label-sm text-on-surface-variant uppercase tracking-wider">{item.label}</p>
                      <p className="text-body-md font-medium mt-xs">{item.val}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'Attendance' && (
          <div className="p-xl space-y-lg">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-gutter">
              {[
                { label: 'Present Days', value: '20', icon: 'event_available', iconBg: 'bg-secondary/10', iconColor: 'text-secondary' },
                { label: 'Late Arrivals', value: '2', icon: 'schedule', iconBg: 'bg-tertiary/10', iconColor: 'text-tertiary' },
                { label: 'Absent Days', value: '1', icon: 'event_busy', iconBg: 'bg-error/10', iconColor: 'text-error' },
              ].map(s => (
                <div key={s.label} className="bg-surface-container-low rounded-xl p-lg flex items-center gap-md">
                  <div className={`w-11 h-11 rounded-full flex items-center justify-center shrink-0 ${s.iconBg} ${s.iconColor}`}>
                    <span className="material-symbols-outlined">{s.icon}</span>
                  </div>
                  <div>
                    <p className="text-label-sm text-outline uppercase tracking-wider">{s.label}</p>
                    <p className="text-headline-md font-bold mt-xs">{s.value}</p>
                  </div>
                </div>
              ))}
            </div>
            <div className="overflow-x-auto rounded-xl border border-outline-variant">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-surface-container text-on-surface-variant text-label-sm uppercase tracking-wider">
                    {['Date', 'Day', 'Clock In', 'Clock Out', 'Hours', 'Status'].map(h => (
                      <th key={h} className="px-lg py-md font-bold">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-outline-variant text-body-md">
                  {attendanceData.map(row => (
                    <tr key={row.date} className="hover:bg-surface-container-low transition-colors">
                      <td className="px-lg py-md font-bold">{row.date}</td>
                      <td className="px-lg py-md text-on-surface-variant">{row.day}</td>
                      <td className="px-lg py-md">{row.in}</td>
                      <td className="px-lg py-md">{row.out}</td>
                      <td className="px-lg py-md">{row.hours}</td>
                      <td className="px-lg py-md"><Badge label={row.status} variant={attendanceStatusVariant[row.status]} /></td>
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
              {[
                { label: 'Annual Leave', used: 8, total: 20, color: 'bg-primary' },
                { label: 'Sick Leave', used: 2, total: 10, color: 'bg-secondary' },
                { label: 'Personal Leave', used: 1, total: 5, color: 'bg-tertiary' },
              ].map(lb => (
                <div key={lb.label} className="bg-surface-container-low rounded-xl p-lg space-y-md">
                  <div className="flex justify-between">
                    <span className="text-label-md font-bold">{lb.label}</span>
                    <span className="text-label-sm text-outline">{lb.used}/{lb.total} days</span>
                  </div>
                  <div className="h-2 w-full bg-surface-container rounded-full overflow-hidden">
                    <div className={`h-full ${lb.color} rounded-full`} style={{ width: `${(lb.used / lb.total) * 100}%` }} />
                  </div>
                  <p className="text-label-sm text-on-surface-variant">Remaining: {lb.total - lb.used} days</p>
                </div>
              ))}
            </div>
            <div className="overflow-x-auto rounded-xl border border-outline-variant">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-surface-container text-on-surface-variant text-label-sm uppercase tracking-wider">
                    {['Type', 'From', 'To', 'Days', 'Reason', 'Status'].map(h => (
                      <th key={h} className="px-lg py-md font-bold">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-outline-variant text-body-md">
                  {leaveData.map((row, i) => (
                    <tr key={i} className="hover:bg-surface-container-low transition-colors">
                      <td className="px-lg py-md font-bold">{row.type}</td>
                      <td className="px-lg py-md">{row.start}</td>
                      <td className="px-lg py-md">{row.end}</td>
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
            <div className="grid grid-cols-1 md:grid-cols-3 gap-gutter">
              {[
                { label: 'Gross Salary', value: '$8,500', icon: 'payments', iconBg: 'bg-primary/10', iconColor: 'text-primary' },
                { label: 'Total Deductions', value: '$1,550', icon: 'remove_circle', iconBg: 'bg-error/10', iconColor: 'text-error' },
                { label: 'Net Pay', value: '$6,950', icon: 'account_balance_wallet', iconBg: 'bg-secondary/10', iconColor: 'text-secondary' },
              ].map(s => (
                <div key={s.label} className="bg-surface-container-low rounded-xl p-lg flex items-center gap-md">
                  <div className={`w-11 h-11 rounded-full flex items-center justify-center shrink-0 ${s.iconBg} ${s.iconColor}`}>
                    <span className="material-symbols-outlined">{s.icon}</span>
                  </div>
                  <div>
                    <p className="text-label-sm text-outline uppercase tracking-wider">{s.label}</p>
                    <p className="text-headline-md font-bold mt-xs">{s.value}</p>
                  </div>
                </div>
              ))}
            </div>
            <div className="overflow-x-auto rounded-xl border border-outline-variant">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-surface-container text-on-surface-variant text-label-sm uppercase tracking-wider">
                    {['Month', 'Gross', 'Tax', 'Deductions', 'Net Pay', 'Status', 'Paid On'].map(h => (
                      <th key={h} className="px-lg py-md font-bold">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-outline-variant text-body-md">
                  {payrollData.map(row => (
                    <tr key={row.month} className="hover:bg-surface-container-low transition-colors">
                      <td className="px-lg py-md font-bold">{row.month}</td>
                      <td className="px-lg py-md">{row.gross}</td>
                      <td className="px-lg py-md text-error">{row.tax}</td>
                      <td className="px-lg py-md text-on-surface-variant">{row.deductions}</td>
                      <td className="px-lg py-md font-bold text-secondary">{row.net}</td>
                      <td className="px-lg py-md"><Badge label={row.status} variant="paid" /></td>
                      <td className="px-lg py-md text-on-surface-variant">{row.date}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeTab === 'Performance' && (
          <div className="p-xl space-y-lg">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-gutter">
              <div className="bg-surface-container-low rounded-xl p-lg space-y-md">
                <p className="text-label-sm text-outline uppercase tracking-wider">Overall Rating</p>
                <div className="flex items-end gap-md">
                  <span className="text-display font-bold text-primary">4.4</span>
                  <span className="text-on-surface-variant text-body-md mb-1">/ 5.0</span>
                </div>
                <div className="flex gap-xs">
                  {[1,2,3,4,5].map(i => (
                    <span key={i} className={`material-symbols-outlined text-[20px] ${i <= 4 ? 'text-primary' : 'text-outline-variant'}`} style={{ fontVariationSettings: i <= 4 ? "'FILL' 1" : "'FILL' 0" }}>star</span>
                  ))}
                </div>
                <p className="text-label-sm text-on-surface-variant">Last reviewed: September 2024</p>
              </div>
              <div className="bg-surface-container-low rounded-xl p-lg space-y-md">
                <p className="text-label-sm text-outline uppercase tracking-wider">Review Cycle</p>
                <p className="text-headline-md font-bold">Q3 2024</p>
                <p className="text-body-md text-on-surface-variant">Next review scheduled for December 2024</p>
                <span className="inline-flex items-center gap-xs px-sm py-xs bg-secondary/10 text-secondary rounded-lg text-label-sm font-bold">
                  <span className="material-symbols-outlined text-[14px]">trending_up</span>
                  Exceeds Expectations
                </span>
              </div>
            </div>
            <div className="space-y-md">
              {performanceData.map(kpi => (
                <div key={kpi.kpi} className="bg-surface-container-low rounded-xl p-lg flex flex-col sm:flex-row sm:items-center justify-between gap-md">
                  <div className="flex-1 min-w-0">
                    <p className="text-body-md font-bold">{kpi.kpi}</p>
                    <p className="text-label-sm text-on-surface-variant mt-xs">Target: {kpi.target} · Achieved: {kpi.achieved}</p>
                  </div>
                  <div className="flex items-center gap-md shrink-0">
                    <div className="w-32 h-2 bg-surface-container rounded-full overflow-hidden">
                      <div className="h-full bg-primary rounded-full" style={{ width: `${Math.min(kpi.score, 100)}%` }} />
                    </div>
                    <span className={`text-label-md font-bold w-10 text-right ${kpi.score >= 100 ? 'text-secondary' : kpi.score >= 85 ? 'text-primary' : 'text-error'}`}>{kpi.score}%</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'Documents' && (
          <div className="p-xl space-y-md">
            {documentsData.map(doc => (
              <div key={doc.name} className="flex items-center justify-between p-lg bg-surface-container-low rounded-xl hover:bg-surface-container transition-colors">
                <div className="flex items-center gap-md min-w-0">
                  <div className="w-11 h-11 rounded-xl bg-primary/10 flex items-center justify-center text-primary shrink-0">
                    <span className="material-symbols-outlined">{doc.icon}</span>
                  </div>
                  <div className="min-w-0">
                    <p className="text-body-md font-bold truncate">{doc.name}</p>
                    <p className="text-label-sm text-on-surface-variant">{doc.type} · {doc.size} · Uploaded {doc.uploaded}</p>
                  </div>
                </div>
                <button className="flex items-center gap-xs px-md py-sm text-primary border border-primary/30 hover:bg-primary/10 rounded-lg text-label-md transition-all shrink-0 ml-md">
                  <span className="material-symbols-outlined text-[18px]">download</span>
                  <span className="hidden sm:inline">Download</span>
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
