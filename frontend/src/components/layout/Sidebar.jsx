import { NavLink } from 'react-router-dom'

const navItems = [
  { icon: 'dashboard', label: 'Dashboard', to: '/dashboard' },
  { icon: 'badge', label: 'Employees', to: '/employees' },
  { icon: 'domain', label: 'Departments', to: '/departments' },
  { icon: 'work_outline', label: 'Positions', to: '/positions' },
  { icon: 'event_available', label: 'Attendance', to: '/attendance' },
  { icon: 'event_busy', label: 'Leave Requests', to: '/leave' },
  { icon: 'payments', label: 'Payroll', to: '/payroll' },
  { icon: 'speed', label: 'Performance', to: '/performance' },
  { icon: 'assessment', label: 'Reports', to: '/reports' },
  { icon: 'group', label: 'Users', to: '/users' },
  { icon: 'lock_person', label: 'Roles & Permissions', to: '/roles' },
  { icon: 'settings', label: 'Settings', to: '/settings' },
]

export default function Sidebar({ isOpen, onClose }) {
  return (
    <>
      <div
        className={`fixed inset-0 z-40 bg-on-background/40 backdrop-blur-sm transition-opacity lg:hidden ${isOpen ? 'opacity-100' : 'pointer-events-none opacity-0'}`}
        onClick={onClose}
      />
      <aside className={`fixed left-0 top-0 z-50 h-full w-sidebar-width max-w-[85vw] bg-surface-container-lowest border-r border-outline-variant flex flex-col overflow-y-auto transition-transform duration-200 lg:translate-x-0 ${isOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="px-lg py-xl flex items-start justify-between gap-md">
          <div className="flex flex-col gap-xs">
            <h1 className="text-headline-md font-headline-md font-bold text-primary">Admin Center</h1>
            <p className="text-label-sm text-on-surface-variant">HR &amp; Payroll Management</p>
          </div>
          <button
            aria-label="Close navigation"
            className="lg:hidden rounded-lg p-2 text-on-surface-variant hover:bg-surface-container"
            onClick={onClose}
            type="button"
          >
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>
        <nav className="flex-1 space-y-1 py-md">
          {navItems.map(item => (
            <NavLink
              key={item.to}
              to={item.to}
              onClick={onClose}
              className={({ isActive }) =>
                isActive
                  ? 'relative flex items-center px-lg py-md text-primary font-bold before:absolute before:left-0 before:top-0 before:bottom-0 before:w-1 before:bg-primary bg-surface-container-low transition-colors'
                  : 'flex items-center px-lg py-md text-on-surface-variant hover:bg-surface-container-low transition-colors'
              }
            >
              <span className="material-symbols-outlined mr-md">{item.icon}</span>
              <span className="text-body-md">{item.label}</span>
            </NavLink>
          ))}
        </nav>
        <div className="p-lg border-t border-outline-variant">
          <div className="flex items-center gap-md">
            <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
              <span className="material-symbols-outlined text-sm">corporate_fare</span>
            </div>
            <div className="flex flex-col min-w-0">
              <span className="text-body-md font-bold text-on-surface truncate">Kinetic Ent.</span>
              <span className="text-label-sm text-outline">Premium Plan</span>
            </div>
          </div>
        </div>
      </aside>
    </>
  )
}
