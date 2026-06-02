import { useState } from 'react'

const initialRoles = [
  { name: 'Super Administrator', desc: 'Full access to all system functions' },
  { name: 'HR Manager',          desc: 'Employee records and leave management' },
  { name: 'Payroll Specialist',  desc: 'Salary processing and tax reporting' },
  { name: 'Department Head',     desc: 'View-only access to department data' },
  { name: 'Recruiter',           desc: 'Job postings and candidate tracking' },
  { name: 'Standard Employee',   desc: 'Personal profile and attendance only' },
]

const modules = [
  {
    icon: 'dashboard',
    title: 'Dashboard Module',
    cols: 'grid-cols-1 md:grid-cols-2',
    perms: [
      { label: 'View Analytics',  desc: 'Ability to see real-time company KPIs' },
      { label: 'Edit Widgets',    desc: 'Customize dashboard layout and content' },
    ],
  },
  {
    icon: 'badge',
    title: 'Employee Module',
    cols: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3',
    perms: [
      { label: 'View Directory',   desc: 'Browse all employees' },
      { label: 'Add/Delete',       desc: 'Onboard or offboard staff' },
      { label: 'Modify Records',   desc: 'Update personal info' },
      { label: 'Document Access',  desc: 'View private contracts' },
    ],
  },
  {
    icon: 'payments',
    title: 'Payroll Module',
    cols: 'grid-cols-1 md:grid-cols-2',
    perms: [
      { label: 'Process Salaries', desc: 'Run monthly payment cycles' },
      { label: 'Tax Reporting',    desc: 'Generate government filings' },
      { label: 'Bonus Management', desc: 'Adjust incentive payouts' },
    ],
  },
  {
    icon: 'event_available',
    title: 'Attendance & Leave',
    cols: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3',
    perms: [
      { label: 'View Attendance', desc: 'Monitor daily logs' },
      { label: 'Approve Leaves',  desc: 'Grant or deny requests' },
      { label: 'Overtime Control',desc: 'Authorize extra hours' },
    ],
  },
]

const key = (mod, perm) => `${mod}|${perm}`

const allPerms = modules.flatMap(m => m.perms.map(p => key(m.title, p.label)))

const buildPerms = (enabled) => Object.fromEntries(allPerms.map(k => [k, enabled.includes(k)]))

const defaultPermissions = {
  'Super Administrator': buildPerms(allPerms),
  'HR Manager':          buildPerms([
    key('Dashboard Module',   'View Analytics'),
    key('Employee Module',    'View Directory'),
    key('Employee Module',    'Add/Delete'),
    key('Employee Module',    'Modify Records'),
    key('Attendance & Leave', 'View Attendance'),
    key('Attendance & Leave', 'Approve Leaves'),
  ]),
  'Payroll Specialist':  buildPerms([
    key('Dashboard Module', 'View Analytics'),
    key('Payroll Module',   'Process Salaries'),
    key('Payroll Module',   'Tax Reporting'),
    key('Payroll Module',   'Bonus Management'),
  ]),
  'Department Head':     buildPerms([
    key('Dashboard Module',   'View Analytics'),
    key('Employee Module',    'View Directory'),
    key('Attendance & Leave', 'View Attendance'),
  ]),
  'Recruiter':           buildPerms([
    key('Employee Module', 'View Directory'),
    key('Employee Module', 'Add/Delete'),
  ]),
  'Standard Employee':   buildPerms([
    key('Dashboard Module',   'View Analytics'),
    key('Attendance & Leave', 'View Attendance'),
  ]),
}

export default function RolesPermissions() {
  const [roles, setRoles]               = useState(initialRoles)
  const [activeRole, setActiveRole]     = useState('Super Administrator')
  const [permissions, setPermissions]   = useState(defaultPermissions)
  const [toast, setToast]               = useState(null)
  const [showModal, setShowModal]       = useState(false)
  const [newName, setNewName]           = useState('')
  const [newDesc, setNewDesc]           = useState('')
  const [nameError, setNameError]       = useState('')
  const [deleteTarget, setDeleteTarget] = useState(null)

  const showToast = (message, type = 'success') => {
    setToast({ message, type })
    setTimeout(() => setToast(null), 3000)
  }

  const togglePerm = (modTitle, permLabel) => {
    const k = key(modTitle, permLabel)
    setPermissions(prev => ({
      ...prev,
      [activeRole]: { ...prev[activeRole], [k]: !prev[activeRole][k] },
    }))
  }

  const handleSave = () => showToast(`Permissions saved for "${activeRole}".`)

  const handleReset = () => {
    setPermissions(prev => ({
      ...prev,
      [activeRole]: defaultPermissions[activeRole] ?? buildPerms([]),
    }))
    showToast(`Permissions reset to defaults for "${activeRole}".`)
  }

  const handleCreateRole = () => {
    const trimmed = newName.trim()
    if (!trimmed) { setNameError('Role name is required.'); return }
    if (roles.find(r => r.name.toLowerCase() === trimmed.toLowerCase())) {
      setNameError('A role with this name already exists.')
      return
    }
    const role = { name: trimmed, desc: newDesc.trim() || 'Custom role' }
    setRoles(prev => [...prev, role])
    setPermissions(prev => ({ ...prev, [trimmed]: buildPerms([]) }))
    setActiveRole(trimmed)
    setShowModal(false)
    setNewName('')
    setNewDesc('')
    setNameError('')
    showToast(`Role "${trimmed}" created.`)
  }

  const closeModal = () => {
    setShowModal(false)
    setNewName('')
    setNewDesc('')
    setNameError('')
  }

  const confirmDeleteRole = (e, roleName) => {
    e.stopPropagation()
    if (roles.length === 1) return
    setDeleteTarget(roleName)
  }

  const handleDeleteRole = () => {
    const roleName = deleteTarget
    setDeleteTarget(null)
    const remaining = roles.filter(r => r.name !== roleName)
    setRoles(remaining)
    setPermissions(prev => {
      const next = { ...prev }
      delete next[roleName]
      return next
    })
    if (activeRole === roleName) setActiveRole(remaining[0].name)
    showToast(`Role "${roleName}" deleted.`, 'error')
  }

  const activePerms = permissions[activeRole] ?? buildPerms([])

  return (
    <div className="p-margin-mobile md:p-margin-desktop">
      {/* Toast */}
      {toast && (
        <div className={`fixed top-20 right-6 z-50 flex items-center gap-md px-lg py-md rounded-xl shadow-lg border text-label-md font-bold transition-all ${
          toast.type === 'error'
            ? 'bg-error-container text-on-error-container border-error/30'
            : 'bg-secondary-container text-on-secondary-container border-secondary/30'
        }`}>
          <span className="material-symbols-outlined text-[20px]">
            {toast.type === 'error' ? 'error' : 'check_circle'}
          </span>
          {toast.message}
        </div>
      )}

      {/* Create Role Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 bg-on-background/40 backdrop-blur-sm flex items-center justify-center p-margin-mobile">
          <div className="bg-surface-container-lowest border border-outline-variant rounded-2xl p-xl shadow-2xl w-full max-w-md">
            <h3 className="text-headline-md text-on-surface mb-lg">Create New Role</h3>
            <div className="space-y-md">
              <div className="flex flex-col gap-xs">
                <label className="text-label-md text-on-surface-variant">Role Name <span className="text-error">*</span></label>
                <input
                  autoFocus
                  className={`bg-surface border rounded-lg p-md text-body-md focus:ring-1 outline-none transition-all ${nameError ? 'border-error focus:border-error focus:ring-error' : 'border-outline-variant focus:border-primary focus:ring-primary'}`}
                  placeholder="e.g. Finance Auditor"
                  value={newName}
                  onChange={e => { setNewName(e.target.value); setNameError('') }}
                />
                {nameError && <p className="text-label-sm text-error">{nameError}</p>}
              </div>
              <div className="flex flex-col gap-xs">
                <label className="text-label-md text-on-surface-variant">Description</label>
                <input
                  className="bg-surface border border-outline-variant rounded-lg p-md text-body-md focus:border-primary focus:ring-1 focus:ring-primary outline-none"
                  placeholder="Brief description of this role..."
                  value={newDesc}
                  onChange={e => setNewDesc(e.target.value)}
                />
              </div>
            </div>
            <div className="flex gap-sm justify-end mt-xl">
              <button onClick={closeModal} className="px-lg py-sm bg-surface-container border border-outline-variant text-on-surface rounded-lg text-label-md hover:bg-surface-container-high transition-all">
                Cancel
              </button>
              <button onClick={handleCreateRole} className="px-lg py-sm bg-primary text-on-primary rounded-lg text-label-md hover:brightness-110 active:scale-95 transition-all">
                Create Role
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Role Confirmation */}
      {deleteTarget && (
        <div className="fixed inset-0 z-50 bg-on-background/40 backdrop-blur-sm flex items-center justify-center p-margin-mobile">
          <div className="bg-surface-container-lowest border border-outline-variant rounded-2xl p-xl shadow-2xl max-w-md w-full">
            <div className="flex items-center gap-md mb-md">
              <div className="w-12 h-12 rounded-full bg-error/10 flex items-center justify-center shrink-0">
                <span className="material-symbols-outlined text-error">warning</span>
              </div>
              <h3 className="text-headline-md text-on-surface">Delete Role?</h3>
            </div>
            <p className="text-body-md text-on-surface-variant mb-xl">
              Are you sure you want to delete <strong>"{deleteTarget}"</strong>? All permission settings for this role will be permanently removed.
            </p>
            <div className="flex gap-sm justify-end">
              <button
                onClick={() => setDeleteTarget(null)}
                className="px-lg py-sm bg-surface-container border border-outline-variant text-on-surface rounded-lg text-label-md hover:bg-surface-container-high transition-all"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteRole}
                className="px-lg py-sm bg-error text-on-error rounded-lg text-label-md hover:opacity-90 transition-all"
              >
                Delete Role
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="max-w-[1400px] mx-auto">
        <header className="mb-xl flex flex-col gap-md md:flex-row md:justify-between md:items-end">
          <div>
            <h2 className="text-display text-on-surface">Roles &amp; Permissions</h2>
            <p className="text-body-lg text-on-surface-variant">Define and manage access levels across organizational modules.</p>
          </div>
          <button
            onClick={() => setShowModal(true)}
            className="bg-primary text-on-primary px-lg py-md rounded-lg text-label-md flex items-center gap-sm hover:brightness-110 active:scale-95 transition-all shadow-md"
          >
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
                <span className="text-label-sm bg-surface-variant px-sm py-xs rounded-full">{roles.length} Roles</span>
              </div>
              <div className="flex flex-col divide-y divide-outline-variant">
                {roles.map(role => (
                  <div
                    key={role.name}
                    className={`flex items-center justify-between p-lg transition-all text-left group cursor-pointer ${
                      activeRole === role.name
                        ? 'bg-surface-container-low border-r-4 border-primary'
                        : 'hover:bg-surface-container-low'
                    }`}
                    onClick={() => setActiveRole(role.name)}
                  >
                    <div className="flex flex-col min-w-0 pr-sm flex-1">
                      <span className={`text-body-md font-bold truncate ${activeRole === role.name ? 'text-primary' : 'text-on-surface'}`}>{role.name}</span>
                      <span className="text-label-sm text-on-surface-variant truncate">{role.desc}</span>
                    </div>
                    <div className="flex items-center gap-xs shrink-0">
                      <span className={`material-symbols-outlined ${activeRole === role.name ? 'text-primary' : 'text-outline group-hover:text-on-surface'} group-hover:translate-x-1 transition-all`}>chevron_right</span>
                      {roles.length > 1 && (
                        <button
                          onClick={(e) => confirmDeleteRole(e, role.name)}
                          className="opacity-0 group-hover:opacity-100 p-1 hover:bg-error-container/20 rounded-lg text-error transition-all"
                        >
                          <span className="material-symbols-outlined text-[18px]">delete</span>
                        </button>
                      )}
                    </div>
                  </div>
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
                    {activeRole}
                    <span className="text-primary text-body-md font-normal ml-sm opacity-60">Permissions Configuration</span>
                  </h3>
                  <div className="flex items-center gap-xs mt-1">
                    <span className="inline-block w-2 h-2 rounded-full bg-secondary"></span>
                    <p className="text-label-sm text-secondary">
                      {Object.values(activePerms).filter(Boolean).length} of {allPerms.length} permissions enabled
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-sm">
                  <button
                    onClick={handleReset}
                    className="px-lg py-md rounded-lg text-outline text-label-md border border-outline-variant hover:bg-surface-container active:scale-95 transition-all"
                  >
                    Reset to Defaults
                  </button>
                  <button
                    onClick={handleSave}
                    className="bg-primary text-on-primary px-xl py-md rounded-lg text-label-md shadow-lg hover:brightness-110 active:scale-95 transition-all"
                  >
                    Save Permission
                  </button>
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
                      {mod.perms.map(perm => {
                        const k = key(mod.title, perm.label)
                        const checked = activePerms[k] ?? false
                        return (
                          <label
                            key={perm.label}
                            className={`flex items-start gap-md p-md rounded-lg border cursor-pointer transition-all ${
                              checked
                                ? 'border-primary/40 bg-primary/5'
                                : 'border-outline-variant hover:bg-surface-container-low'
                            }`}
                          >
                            <input
                              checked={checked}
                              onChange={() => togglePerm(mod.title, perm.label)}
                              className="mt-1 w-5 h-5 rounded border-outline text-primary focus:ring-primary cursor-pointer"
                              type="checkbox"
                            />
                            <div>
                              <p className={`font-bold text-body-md ${checked ? 'text-primary' : ''}`}>{perm.label}</p>
                              <p className="text-label-sm text-on-surface-variant">{perm.desc}</p>
                            </div>
                          </label>
                        )
                      })}
                    </div>
                  </div>
                ))}
              </div>

              <div className="p-lg border-t border-outline-variant bg-surface-container-low flex justify-end">
                <button
                  onClick={handleSave}
                  className="bg-primary text-on-primary px-xl py-md rounded-lg text-label-md shadow-lg hover:brightness-110 active:scale-95 transition-all"
                >
                  Save Permission
                </button>
              </div>
            </section>
          </div>
        </div>
      </div>
    </div>
  )
}
