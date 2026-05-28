import { Link } from 'react-router-dom'

const users = [
  { id: '#USR-8821', init: 'SD', name: 'Sarah Drummand', email: 'sarah.d@organization.com', role: 'Admin', roleStyle: 'bg-primary/10 text-primary', status: 'Active', statusStyle: 'text-secondary', dotColor: 'bg-secondary', lastLogin: '2 mins ago' },
  { id: '#USR-4532', init: 'MC', name: 'Marcus Chen', email: 'm.chen@hr-dept.com', role: 'HR Manager', roleStyle: 'bg-secondary-container/30 text-secondary', status: 'Active', statusStyle: 'text-secondary', dotColor: 'bg-secondary', lastLogin: 'Today, 09:15 AM' },
  { id: '#USR-7741', init: 'LW', name: 'Linda Wu', email: 'linda.wu@finance.org', role: 'Manager', roleStyle: 'bg-surface-container text-on-surface-variant', status: 'Inactive', statusStyle: 'text-error', dotColor: 'bg-error', lastLogin: '3 days ago' },
  { id: '#USR-1209', init: 'ER', name: 'Elena Rodriguez', email: 'e.rod@design.com', role: 'Employee', roleStyle: 'bg-surface-container text-on-surface-variant', status: 'Active', statusStyle: 'text-secondary', dotColor: 'bg-secondary', lastLogin: 'Yesterday, 4:45 PM' },
  { id: '#USR-3190', init: 'JT', name: 'James Taylor', email: 'james.t@engineering.co', role: 'Employee', roleStyle: 'bg-surface-container text-on-surface-variant', status: 'Pending', statusStyle: 'text-on-surface-variant opacity-60', dotColor: 'bg-outline', lastLogin: 'Never' },
]

export default function UserManagement() {
  return (
    <div className="p-margin-mobile md:p-margin-desktop">
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-xl gap-md">
        <div>
          <nav className="flex items-center text-label-sm text-on-surface-variant mb-xs">
            <span>Management</span>
            <span className="material-symbols-outlined text-[14px] mx-xs">chevron_right</span>
            <span className="text-primary font-bold">User Management</span>
          </nav>
          <h2 className="text-headline-lg text-on-surface">System Users</h2>
          <p className="text-body-md text-on-surface-variant mt-1">Manage administrative access and system permissions across the organization.</p>
        </div>
        <div className="flex flex-wrap items-center gap-md">
          <button className="bg-surface-container-lowest border border-outline-variant text-on-surface text-label-md px-md py-2.5 rounded-lg flex items-center gap-sm hover:bg-surface-container-low transition-colors active:scale-95">
            <span className="material-symbols-outlined text-[20px]">file_download</span>
            Export Data
          </button>
          <button className="bg-primary text-on-primary text-label-md px-lg py-2.5 rounded-lg flex items-center gap-sm hover:opacity-90 shadow-sm active:scale-95 transition-all">
            <span className="material-symbols-outlined text-[20px]">add</span>
            Add User
          </button>
        </div>
      </div>

      {/* Stats & Filters Bento */}
      <div className="grid grid-cols-12 gap-gutter mb-xl">
        <div className="col-span-12 lg:col-span-8 bg-surface-container-lowest rounded-xl border border-outline-variant p-md shadow-sm">
          <div className="flex flex-wrap items-center gap-md">
            <div className="flex-1 min-w-[200px]">
              <label className="block text-label-sm text-on-surface-variant mb-xs ml-1">Filter by Role</label>
              <div className="flex flex-wrap gap-xs">
                <span className="px-sm py-1 bg-primary/10 text-primary border border-primary/20 rounded-full text-label-sm font-bold cursor-pointer">All Roles</span>
                {['Admin', 'HR Manager', 'Dept Head', 'Employee'].map(r => (
                  <span key={r} className="px-sm py-1 bg-surface-container hover:bg-surface-container-high border border-outline-variant/30 rounded-full text-label-sm cursor-pointer transition-colors">{r}</span>
                ))}
              </div>
            </div>
            <div className="h-10 w-px bg-outline-variant mx-xs hidden md:block"></div>
            <div className="w-full md:w-48">
              <label className="block text-label-sm text-on-surface-variant mb-xs ml-1">Status</label>
              <select className="w-full bg-surface-container border-none rounded-lg text-body-md py-1.5 focus:ring-primary/20">
                <option>All Status</option>
                <option>Active</option>
                <option>Inactive</option>
                <option>Pending</option>
              </select>
            </div>
          </div>
        </div>
        <div className="col-span-12 lg:col-span-4 bg-primary rounded-xl border border-primary-container p-md shadow-md text-on-primary flex items-center justify-between overflow-hidden relative">
          <div className="relative z-10">
            <p className="text-label-sm font-bold opacity-80 uppercase tracking-widest mb-xs">Active Users</p>
            <p className="text-display leading-none">1,248</p>
            <div className="flex items-center mt-sm text-secondary-container">
              <span className="material-symbols-outlined text-sm mr-xs">trending_up</span>
              <span className="text-label-md">+12% from last month</span>
            </div>
          </div>
          <div className="absolute -right-4 -bottom-6 opacity-20">
            <span className="material-symbols-outlined text-[120px]" style={{ fontVariationSettings: "'FILL' 1" }}>group</span>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="bg-surface-container-lowest rounded-xl border border-outline-variant shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-surface-container-low border-b border-outline-variant">
                {['User ID', 'Full Name', 'Role', 'Connect Profile', 'Status', 'Last Login', 'Actions'].map((h, i) => (
                  <th key={h} className={`px-lg py-md text-label-sm font-bold text-on-surface-variant uppercase tracking-wider ${i === 6 ? 'text-right' : ''}`}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-outline-variant">
              {users.map(u => (
                <tr key={u.id} className="hover:bg-surface-container-lowest group transition-colors">
                  <td className="px-lg py-md text-body-md text-on-surface-variant font-mono">{u.id}</td>
                  <td className="px-lg py-md">
                    <div className="flex items-center gap-md">
                      <div className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold">{u.init}</div>
                      <div>
                        <p className="font-bold text-body-md text-on-surface">{u.name}</p>
                        <p className="text-label-sm text-on-surface-variant">{u.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-lg py-md">
                    <span className={`inline-flex items-center px-sm py-1 rounded-full text-label-sm font-bold ${u.roleStyle}`}>{u.role}</span>
                  </td>
                  <td className="px-lg py-md">
                    <Link to="/profile" className="text-primary hover:underline text-body-md flex items-center gap-xs">
                      <span className="material-symbols-outlined text-[16px]">person</span>
                      View Profile
                    </Link>
                  </td>
                  <td className="px-lg py-md">
                    <div className={`flex items-center gap-xs font-bold text-label-sm ${u.statusStyle}`}>
                      <span className={`w-2 h-2 rounded-full ${u.dotColor}`}></span>
                      {u.status}
                    </div>
                  </td>
                  <td className="px-lg py-md text-body-md text-on-surface-variant">{u.lastLogin}</td>
                  <td className="px-lg py-md text-right">
                    <button className="p-xs hover:bg-surface-container rounded-full text-on-surface-variant transition-colors">
                      <span className="material-symbols-outlined">more_vert</span>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="bg-surface-container-low px-lg py-md flex flex-col gap-md sm:flex-row sm:items-center sm:justify-between border-t border-outline-variant">
          <p className="text-label-md text-on-surface-variant">Showing 1 to 5 of 1,248 users</p>
          <div className="flex items-center gap-xs">
            <button className="w-8 h-8 flex items-center justify-center rounded-lg border border-outline-variant text-on-surface-variant hover:bg-surface-container disabled:opacity-50" disabled>
              <span className="material-symbols-outlined">chevron_left</span>
            </button>
            <button className="w-8 h-8 flex items-center justify-center rounded-lg bg-primary text-on-primary font-bold text-label-md">1</button>
            <button className="w-8 h-8 flex items-center justify-center rounded-lg border border-outline-variant text-on-surface-variant hover:bg-surface-container text-label-md">2</button>
            <button className="w-8 h-8 flex items-center justify-center rounded-lg border border-outline-variant text-on-surface-variant hover:bg-surface-container text-label-md">3</button>
            <span className="px-xs text-on-surface-variant">...</span>
            <button className="w-8 h-8 flex items-center justify-center rounded-lg border border-outline-variant text-on-surface-variant hover:bg-surface-container text-label-md">250</button>
            <button className="w-8 h-8 flex items-center justify-center rounded-lg border border-outline-variant text-on-surface-variant hover:bg-surface-container">
              <span className="material-symbols-outlined">chevron_right</span>
            </button>
          </div>
        </div>
      </div>

      {/* Help Cards */}
      <div className="mt-xl grid grid-cols-1 md:grid-cols-2 gap-gutter">
        <div className="bg-surface-container-low p-lg rounded-xl border border-outline-variant flex items-start gap-md">
          <div className="p-sm bg-primary/10 rounded-lg">
            <span className="material-symbols-outlined text-primary">security</span>
          </div>
          <div>
            <h4 className="font-bold text-body-lg text-on-surface">Role Inheritance</h4>
            <p className="text-body-md text-on-surface-variant mt-1">Users inherit permissions from their assigned roles. Modifying a role's permissions will affect all users assigned to that role immediately.</p>
            <Link to="/roles" className="mt-md text-primary font-bold text-label-md flex items-center gap-xs hover:gap-sm transition-all">
              Manage Roles &amp; Permissions
              <span className="material-symbols-outlined text-sm">arrow_forward</span>
            </Link>
          </div>
        </div>
        <div className="bg-surface-container-low p-lg rounded-xl border border-outline-variant flex items-start gap-md">
          <div className="p-sm bg-secondary/10 rounded-lg">
            <span className="material-symbols-outlined text-secondary">history</span>
          </div>
          <div>
            <h4 className="font-bold text-body-lg text-on-surface">Audit Logs</h4>
            <p className="text-body-md text-on-surface-variant mt-1">Every administrative action is tracked for security purposes. You can view user creation, role changes, and login history in the central audit center.</p>
            <button className="mt-md text-secondary font-bold text-label-md flex items-center gap-xs hover:gap-sm transition-all">
              View Audit History
              <span className="material-symbols-outlined text-sm">arrow_forward</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
