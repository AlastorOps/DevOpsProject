import { useState } from 'react'
import { Link } from 'react-router-dom'

const tabs = ['Profile', 'Attendance', 'Leave', 'Payroll', 'Performance', 'Documents']

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

        {activeTab !== 'Profile' && (
          <div className="p-xl flex items-center justify-center min-h-[200px]">
            <div className="text-center text-on-surface-variant">
              <span className="material-symbols-outlined text-[48px] opacity-30">info</span>
              <p className="text-body-md mt-md">{activeTab} data will be shown here.</p>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
