const roles = [
  { name: 'Super Administrator', desc: 'Full access to all system functions', active: true },
  { name: 'HR Manager', desc: 'Employee records and leave management', active: false },
  { name: 'Payroll Specialist', desc: 'Salary processing and tax reporting', active: false },
  { name: 'Department Head', desc: 'View-only access to department data', active: false },
  { name: 'Recruiter', desc: 'Job postings and candidate tracking', active: false },
  { name: 'Standard Employee', desc: 'Personal profile and attendance only', active: false },
]

const modules = [
  {
    icon: 'dashboard',
    title: 'Dashboard Module',
    cols: 'grid-cols-1 md:grid-cols-2',
    perms: [
      { label: 'View Analytics', desc: 'Ability to see real-time company KPIs' },
      { label: 'Edit Widgets', desc: 'Customize dashboard layout and content' },
    ],
  },
  {
    icon: 'badge',
    title: 'Employee Module',
    cols: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3',
    perms: [
      { label: 'View Directory', desc: 'Browse all employees' },
      { label: 'Add/Delete', desc: 'Onboard or offboard staff' },
      { label: 'Modify Records', desc: 'Update personal info' },
      { label: 'Document Access', desc: 'View private contracts' },
    ],
  },
  {
    icon: 'payments',
    title: 'Payroll Module',
    cols: 'grid-cols-1 md:grid-cols-2',
    perms: [
      { label: 'Process Salaries', desc: 'Run monthly payment cycles' },
      { label: 'Tax Reporting', desc: 'Generate government filings' },
      { label: 'Bonus Management', desc: 'Adjust incentive payouts' },
    ],
  },
  {
    icon: 'event_available',
    title: 'Attendance & Leave',
    cols: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3',
    perms: [
      { label: 'View Attendance', desc: 'Monitor daily logs' },
      { label: 'Approve Leaves', desc: 'Grant or deny requests' },
      { label: 'Overtime Control', desc: 'Authorize extra hours' },
    ],
  },
]

export default function RolesPermissions() {
  return (
    <div className="p-margin-mobile md:p-margin-desktop">
      <div className="max-w-[1400px] mx-auto">
        <header className="mb-xl flex flex-col gap-md md:flex-row md:justify-between md:items-end">
          <div>
            <h2 className="text-display text-on-surface">Roles &amp; Permissions</h2>
            <p className="text-body-lg text-on-surface-variant">Define and manage access levels across organizational modules.</p>
          </div>
          <button className="bg-primary text-on-primary px-lg py-md rounded-lg text-label-md flex items-center gap-sm hover:opacity-90 active:scale-95 transition-all shadow-md">
            <span className="material-symbols-outlined text-[20px]">add</span>
            Create New Role
          </button>
        </header>

        <div className="grid grid-cols-12 gap-gutter items-start">
          {/* Role List */}
          <div className="col-span-12 lg:col-span-4 flex flex-col gap-gutter">
            <section className="bg-surface-container-lowest border border-outline-variant rounded-xl overflow-hidden shadow-sm">
              <div className="p-lg border-b border-outline-variant flex justify-between items-center">
                <h3 className="text-headline-md text-on-surface">Active Roles</h3>
                <span className="text-label-sm bg-surface-variant px-sm py-xs rounded-full">6 Roles</span>
              </div>
              <div className="flex flex-col">
                {roles.map(role => (
                  <button key={role.name} className={`flex items-center justify-between p-lg transition-all text-left group ${role.active ? 'bg-surface-container-low border-r-4 border-primary' : 'hover:bg-surface-container-low'}`}>
                    <div className="flex flex-col">
                      <span className={`text-headline-md ${role.active ? 'text-primary' : 'text-on-surface'}`}>{role.name}</span>
                      <span className="text-label-sm text-on-surface-variant">{role.desc}</span>
                    </div>
                    <span className={`material-symbols-outlined ${role.active ? 'text-primary' : 'text-outline group-hover:text-on-surface'} group-hover:translate-x-1 transition-all`}>chevron_right</span>
                  </button>
                ))}
              </div>
            </section>
            <div className="bg-tertiary-fixed text-on-tertiary-fixed p-lg rounded-xl flex items-start gap-md border border-tertiary/20">
              <span className="material-symbols-outlined mt-1">info</span>
              <div>
                <h4 className="font-bold text-body-lg">Note on Inheritance</h4>
                <p className="text-label-sm opacity-80 leading-relaxed mt-xs">Modifying the Super Administrator role may restrict your own access. Proceed with extreme caution.</p>
              </div>
            </div>
          </div>

          {/* Permission Matrix */}
          <div className="col-span-12 lg:col-span-8">
            <section className="bg-surface-container-lowest border border-outline-variant rounded-xl shadow-sm flex flex-col">
              <div className="p-lg border-b border-outline-variant flex flex-col md:flex-row md:items-center justify-between gap-md">
                <div>
                  <h3 className="text-headline-md text-on-surface">
                    Super Administrator <span className="text-primary text-body-md font-normal ml-sm opacity-60">Permissions Configuration</span>
                  </h3>
                  <div className="flex items-center gap-xs mt-1">
                    <span className="inline-block w-2 h-2 rounded-full bg-secondary"></span>
                    <p className="text-label-sm text-secondary">Locked for system stability</p>
                  </div>
                </div>
                <div className="flex items-center gap-sm">
                  <button className="px-lg py-md rounded-lg text-outline text-label-md hover:bg-surface-container transition-all">Reset to Defaults</button>
                  <button className="bg-primary text-on-primary px-xl py-md rounded-lg text-label-md shadow-lg hover:opacity-90 active:scale-95 transition-all">Save Permission</button>
                </div>
              </div>
              <div className="p-lg space-y-xl overflow-y-auto" style={{ maxHeight: 'calc(100vh - 320px)' }}>
                {modules.map(mod => (
                  <div key={mod.title}>
                    <div className="flex items-center gap-md mb-md">
                      <div className="w-10 h-10 rounded-lg bg-surface-container flex items-center justify-center text-primary">
                        <span className="material-symbols-outlined">{mod.icon}</span>
                      </div>
                      <h4 className="text-headline-md text-on-surface">{mod.title}</h4>
                    </div>
                    <div className={`grid ${mod.cols} gap-md ml-14`}>
                      {mod.perms.map(perm => (
                        <label key={perm.label} className="flex items-start gap-md p-md rounded-lg border border-outline-variant hover:bg-surface-container-low cursor-pointer transition-all">
                          <input defaultChecked className="mt-1 w-5 h-5 rounded border-outline text-primary focus:ring-primary" type="checkbox" />
                          <div>
                            <p className="font-bold text-body-md">{perm.label}</p>
                            <p className="text-label-sm text-on-surface-variant">{perm.desc}</p>
                          </div>
                        </label>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
              <div className="p-lg border-t border-outline-variant bg-surface-container-low flex justify-end">
                <button className="bg-primary text-on-primary px-xl py-md rounded-lg text-label-md shadow-lg hover:opacity-90 active:scale-95 transition-all">Save Permission</button>
              </div>
            </section>
          </div>
        </div>
      </div>
    </div>
  )
}
