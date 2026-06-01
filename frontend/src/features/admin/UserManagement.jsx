import { useState } from 'react'
import { Link } from 'react-router-dom'

const roleStyle = {
  'Admin':       'bg-primary/10 text-primary',
  'HR Manager':  'bg-secondary-container/30 text-secondary',
  'Manager':     'bg-surface-container text-on-surface-variant',
  'Employee':    'bg-surface-container text-on-surface-variant',
}

const statusConfig = {
  Active:   { text: 'text-secondary',                dot: 'bg-secondary' },
  Inactive: { text: 'text-error',                    dot: 'bg-error' },
  Pending:  { text: 'text-on-surface-variant',       dot: 'bg-outline' },
}

const roles = ['Admin', 'HR Manager', 'Manager', 'Employee']

const initials = (name) => name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()

const initialUsers = [
  { id: '#USR-8821', name: 'Sarah Drummand',   email: 'sarah.d@organization.com',  role: 'Admin',      status: 'Active',   lastLogin: '2 mins ago' },
  { id: '#USR-4532', name: 'Marcus Chen',       email: 'm.chen@hr-dept.com',         role: 'HR Manager', status: 'Active',   lastLogin: 'Today, 09:15 AM' },
  { id: '#USR-7741', name: 'Linda Wu',          email: 'linda.wu@finance.org',       role: 'Manager',    status: 'Inactive', lastLogin: '3 days ago' },
  { id: '#USR-1209', name: 'Elena Rodriguez',   email: 'e.rod@design.com',           role: 'Employee',   status: 'Active',   lastLogin: 'Yesterday, 4:45 PM' },
  { id: '#USR-3190', name: 'James Taylor',      email: 'james.t@engineering.co',     role: 'Employee',   status: 'Pending',  lastLogin: 'Never' },
]

const emptyForm = { name: '', email: '', role: 'Employee', status: 'Active' }

export default function UserManagement() {
  const [users, setUsers]                 = useState(initialUsers)
  const [roleFilter, setRoleFilter]       = useState('All Roles')
  const [statusFilter, setStatusFilter]   = useState('All Status')
  const [toast, setToast]                 = useState(null)
  const [editingUser, setEditingUser]     = useState(null)
  const [showModal, setShowModal]         = useState(false)
  const [form, setForm]                   = useState(emptyForm)
  const [formErrors, setFormErrors]       = useState({})
  const [deleteId, setDeleteId]           = useState(null)

  const showToast = (message, type = 'success') => {
    setToast({ message, type })
    setTimeout(() => setToast(null), 3000)
  }

  const filtered = users.filter(u => {
    const matchRole   = roleFilter === 'All Roles' || u.role === roleFilter
    const matchStatus = statusFilter === 'All Status' || u.status === statusFilter
    return matchRole && matchStatus
  })

  const openAdd = () => {
    setEditingUser(null)
    setForm(emptyForm)
    setFormErrors({})
    setShowModal(true)
  }

  const openEdit = (user) => {
    setEditingUser(user)
    setForm({ name: user.name, email: user.email, role: user.role, status: user.status })
    setFormErrors({})
    setShowModal(true)
  }

  const closeModal = () => {
    setShowModal(false)
    setEditingUser(null)
    setForm(emptyForm)
    setFormErrors({})
  }

  const validate = () => {
    const errs = {}
    if (!form.name.trim())  errs.name  = 'Name is required.'
    if (!form.email.trim()) errs.email = 'Email is required.'
    else if (!/\S+@\S+\.\S+/.test(form.email)) errs.email = 'Enter a valid email.'
    return errs
  }

  const handleSubmit = () => {
    const errs = validate()
    if (Object.keys(errs).length) { setFormErrors(errs); return }

    if (editingUser) {
      setUsers(prev => prev.map(u => u.id === editingUser.id ? { ...u, ...form } : u))
      showToast(`"${form.name}" has been updated.`)
    } else {
      const newId = `#USR-${Math.floor(1000 + Math.random() * 9000)}`
      setUsers(prev => [...prev, { id: newId, ...form, lastLogin: 'Never' }])
      showToast(`User "${form.name}" has been added.`)
    }
    closeModal()
  }

  const toggleStatus = (user) => {
    const next = user.status === 'Active' ? 'Inactive' : 'Active'
    setUsers(prev => prev.map(u => u.id === user.id ? { ...u, status: next } : u))
    showToast(`${user.name} is now ${next}.`, next === 'Active' ? 'success' : 'error')
  }

  const confirmDelete = (id) => setDeleteId(id)

  const handleDelete = () => {
    const user = users.find(u => u.id === deleteId)
    setUsers(prev => prev.filter(u => u.id !== deleteId))
    setDeleteId(null)
    showToast(`"${user?.name}" has been removed.`, 'error')
  }

  const handleExport = () => {
    const rows = [['ID', 'Name', 'Email', 'Role', 'Status', 'Last Login']]
    filtered.forEach(u => rows.push([u.id, u.name, u.email, u.role, u.status, u.lastLogin]))
    const csv  = rows.map(r => r.map(v => `"${v}"`).join(',')).join('\n')
    const blob = new Blob([csv], { type: 'text/csv' })
    const url  = URL.createObjectURL(blob)
    const a    = document.createElement('a'); a.href = url; a.download = 'users.csv'; a.click()
    URL.revokeObjectURL(url)
    showToast('Users exported as CSV.')
  }

  const activeCount = users.filter(u => u.status === 'Active').length

  return (
    <div className="p-margin-mobile md:p-margin-desktop">

      {/* Toast */}
      {toast && (
        <div className={`fixed top-20 right-6 z-50 flex items-center gap-md px-lg py-md rounded-xl shadow-lg border text-label-md font-bold transition-all ${
          toast.type === 'error'
            ? 'bg-error-container text-on-error-container border-error/30'
            : 'bg-secondary-container text-on-secondary-container border-secondary/30'
        }`}>
          <span className="material-symbols-outlined text-[20px]">{toast.type === 'error' ? 'error' : 'check_circle'}</span>
          {toast.message}
        </div>
      )}

      {/* Add / Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 bg-on-background/40 backdrop-blur-sm flex items-center justify-center p-margin-mobile">
          <div className="bg-surface-container-lowest border border-outline-variant rounded-2xl p-xl shadow-2xl w-full max-w-md">
            <h3 className="text-headline-md text-on-surface mb-lg">{editingUser ? 'Edit User' : 'Add New User'}</h3>
            <div className="space-y-md">
              {/* Name */}
              <div className="flex flex-col gap-xs">
                <label className="text-label-md text-on-surface-variant">Full Name <span className="text-error">*</span></label>
                <input
                  autoFocus
                  className={`bg-surface border rounded-lg p-md text-body-md focus:ring-1 outline-none transition-all ${formErrors.name ? 'border-error focus:border-error focus:ring-error' : 'border-outline-variant focus:border-primary focus:ring-primary'}`}
                  placeholder="e.g. John Smith"
                  value={form.name}
                  onChange={e => { setForm(f => ({ ...f, name: e.target.value })); setFormErrors(f => ({ ...f, name: '' })) }}
                />
                {formErrors.name && <p className="text-label-sm text-error">{formErrors.name}</p>}
              </div>
              {/* Email */}
              <div className="flex flex-col gap-xs">
                <label className="text-label-md text-on-surface-variant">Email Address <span className="text-error">*</span></label>
                <input
                  className={`bg-surface border rounded-lg p-md text-body-md focus:ring-1 outline-none transition-all ${formErrors.email ? 'border-error focus:border-error focus:ring-error' : 'border-outline-variant focus:border-primary focus:ring-primary'}`}
                  placeholder="email@organization.com"
                  type="email"
                  value={form.email}
                  onChange={e => { setForm(f => ({ ...f, email: e.target.value })); setFormErrors(f => ({ ...f, email: '' })) }}
                />
                {formErrors.email && <p className="text-label-sm text-error">{formErrors.email}</p>}
              </div>
              {/* Role + Status */}
              <div className="grid grid-cols-2 gap-md">
                <div className="flex flex-col gap-xs">
                  <label className="text-label-md text-on-surface-variant">Role</label>
                  <select
                    className="bg-surface border border-outline-variant rounded-lg p-md text-body-md focus:border-primary focus:ring-1 focus:ring-primary outline-none"
                    value={form.role}
                    onChange={e => setForm(f => ({ ...f, role: e.target.value }))}
                  >
                    {roles.map(r => <option key={r}>{r}</option>)}
                  </select>
                </div>
                <div className="flex flex-col gap-xs">
                  <label className="text-label-md text-on-surface-variant">Status</label>
                  <select
                    className="bg-surface border border-outline-variant rounded-lg p-md text-body-md focus:border-primary focus:ring-1 focus:ring-primary outline-none"
                    value={form.status}
                    onChange={e => setForm(f => ({ ...f, status: e.target.value }))}
                  >
                    {['Active', 'Inactive', 'Pending'].map(s => <option key={s}>{s}</option>)}
                  </select>
                </div>
              </div>
            </div>
            <div className="flex gap-sm justify-end mt-xl">
              <button onClick={closeModal} className="px-lg py-sm bg-surface-container border border-outline-variant text-on-surface rounded-lg text-label-md hover:bg-surface-container-high transition-all">
                Cancel
              </button>
              <button onClick={handleSubmit} className="px-lg py-sm bg-primary text-on-primary rounded-lg text-label-md hover:brightness-110 active:scale-95 transition-all">
                {editingUser ? 'Save Changes' : 'Add User'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation */}
      {deleteId && (
        <div className="fixed inset-0 z-50 bg-on-background/40 backdrop-blur-sm flex items-center justify-center p-margin-mobile">
          <div className="bg-surface-container-lowest border border-outline-variant rounded-2xl p-xl shadow-2xl w-full max-w-sm">
            <div className="flex items-center gap-md mb-md">
              <div className="w-12 h-12 rounded-full bg-error/10 flex items-center justify-center shrink-0">
                <span className="material-symbols-outlined text-error">delete</span>
              </div>
              <h3 className="text-headline-md text-on-surface">Remove User?</h3>
            </div>
            <p className="text-body-md text-on-surface-variant mb-xl">
              This will permanently remove <strong>{users.find(u => u.id === deleteId)?.name}</strong> from the system.
            </p>
            <div className="flex gap-sm justify-end">
              <button onClick={() => setDeleteId(null)} className="px-lg py-sm bg-surface-container border border-outline-variant text-on-surface rounded-lg text-label-md hover:bg-surface-container-high transition-all">
                Cancel
              </button>
              <button onClick={handleDelete} className="px-lg py-sm bg-error text-on-error rounded-lg text-label-md hover:opacity-90 active:scale-95 transition-all">
                Remove
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Page Header */}
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
          <button
            onClick={handleExport}
            className="bg-surface-container-lowest border border-outline-variant text-on-surface text-label-md px-md py-2.5 rounded-lg flex items-center gap-sm hover:bg-surface-container-low transition-colors active:scale-95"
          >
            <span className="material-symbols-outlined text-[20px]">file_download</span>
            Export Data
          </button>
          <button
            onClick={openAdd}
            className="bg-primary text-on-primary text-label-md px-lg py-2.5 rounded-lg flex items-center gap-sm hover:brightness-110 shadow-sm active:scale-95 transition-all"
          >
            <span className="material-symbols-outlined text-[20px]">add</span>
            Add User
          </button>
        </div>
      </div>

      {/* Stats & Filters */}
      <div className="grid grid-cols-12 gap-gutter mb-xl">
        <div className="col-span-12 lg:col-span-8 bg-surface-container-lowest rounded-xl border border-outline-variant p-md shadow-sm">
          <div className="flex flex-wrap items-center gap-md">
            <div className="flex-1 min-w-[200px]">
              <label className="block text-label-sm text-on-surface-variant mb-xs ml-1">Filter by Role</label>
              <div className="flex flex-wrap gap-xs">
                {['All Roles', ...roles].map(r => (
                  <button
                    key={r}
                    onClick={() => setRoleFilter(r)}
                    className={`px-sm py-1 rounded-full text-label-sm font-bold cursor-pointer transition-colors ${
                      roleFilter === r
                        ? 'bg-primary/10 text-primary border border-primary/20'
                        : 'bg-surface-container hover:bg-surface-container-high border border-outline-variant/30 text-on-surface-variant'
                    }`}
                  >
                    {r}
                  </button>
                ))}
              </div>
            </div>
            <div className="h-10 w-px bg-outline-variant mx-xs hidden md:block" />
            <div className="w-full md:w-48">
              <label className="block text-label-sm text-on-surface-variant mb-xs ml-1">Status</label>
              <select
                className="w-full bg-surface-container border-none rounded-lg text-body-md py-1.5 focus:ring-primary/20"
                value={statusFilter}
                onChange={e => setStatusFilter(e.target.value)}
              >
                {['All Status', 'Active', 'Inactive', 'Pending'].map(s => <option key={s}>{s}</option>)}
              </select>
            </div>
          </div>
        </div>
        <div className="col-span-12 lg:col-span-4 bg-primary rounded-xl border border-primary-container p-md shadow-md text-on-primary flex items-center justify-between overflow-hidden relative">
          <div className="relative z-10">
            <p className="text-label-sm font-bold opacity-80 uppercase tracking-widest mb-xs">Active Users</p>
            <p className="text-display leading-none">{activeCount}</p>
            <div className="flex items-center mt-sm text-secondary-container">
              <span className="material-symbols-outlined text-sm mr-xs">group</span>
              <span className="text-label-md">{users.length} total users</span>
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
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-lg py-2xl text-center text-on-surface-variant">
                    <span className="material-symbols-outlined text-[40px] block mb-md opacity-30">manage_accounts</span>
                    No users match the current filters.
                  </td>
                </tr>
              ) : filtered.map(u => {
                const sc = statusConfig[u.status] ?? statusConfig.Pending
                return (
                  <tr key={u.id} className="hover:bg-surface-container-lowest group transition-colors">
                    <td className="px-lg py-md text-body-md text-on-surface-variant font-mono">{u.id}</td>
                    <td className="px-lg py-md">
                      <div className="flex items-center gap-md">
                        <div className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-sm shrink-0">
                          {initials(u.name)}
                        </div>
                        <div>
                          <p className="font-bold text-body-md text-on-surface">{u.name}</p>
                          <p className="text-label-sm text-on-surface-variant">{u.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-lg py-md">
                      <span className={`inline-flex items-center px-sm py-1 rounded-full text-label-sm font-bold ${roleStyle[u.role] ?? 'bg-surface-container text-on-surface-variant'}`}>
                        {u.role}
                      </span>
                    </td>
                    <td className="px-lg py-md">
                      <Link to="/profile" className="text-primary hover:underline text-body-md flex items-center gap-xs">
                        <span className="material-symbols-outlined text-[16px]">person</span>
                        View Profile
                      </Link>
                    </td>
                    <td className="px-lg py-md">
                      <div className={`flex items-center gap-xs font-bold text-label-sm ${sc.text}`}>
                        <span className={`w-2 h-2 rounded-full ${sc.dot}`} />
                        {u.status}
                      </div>
                    </td>
                    <td className="px-lg py-md text-body-md text-on-surface-variant">{u.lastLogin}</td>
                    <td className="px-lg py-md">
                      <div className="flex items-center justify-end gap-xs">
                        <button
                          onClick={() => openEdit(u)}
                          title="Edit user"
                          className="p-1.5 hover:bg-surface-container rounded-lg text-outline hover:text-primary transition-all"
                        >
                          <span className="material-symbols-outlined text-[18px]">edit</span>
                        </button>
                        <button
                          onClick={() => toggleStatus(u)}
                          title={u.status === 'Active' ? 'Deactivate' : 'Activate'}
                          className={`p-1.5 rounded-lg transition-all ${u.status === 'Active' ? 'hover:bg-error/10 text-outline hover:text-error' : 'hover:bg-secondary/10 text-outline hover:text-secondary'}`}
                        >
                          <span className="material-symbols-outlined text-[18px]">{u.status === 'Active' ? 'person_off' : 'person_check'}</span>
                        </button>
                        <button
                          onClick={() => confirmDelete(u.id)}
                          title="Delete user"
                          className="p-1.5 hover:bg-error/10 rounded-lg text-outline hover:text-error transition-all"
                        >
                          <span className="material-symbols-outlined text-[18px]">delete</span>
                        </button>
                      </div>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
        <div className="bg-surface-container-low px-lg py-md flex flex-col gap-md sm:flex-row sm:items-center sm:justify-between border-t border-outline-variant">
          <p className="text-label-md text-on-surface-variant">Showing {filtered.length} of {users.length} users</p>
          <div className="flex items-center gap-xs">
            <button className="w-8 h-8 flex items-center justify-center rounded-lg border border-outline-variant text-on-surface-variant hover:bg-surface-container disabled:opacity-50" disabled>
              <span className="material-symbols-outlined">chevron_left</span>
            </button>
            <button className="w-8 h-8 flex items-center justify-center rounded-lg bg-primary text-on-primary font-bold text-label-md">1</button>
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
            <button
              onClick={() => showToast('Audit log feature coming soon.')}
              className="mt-md text-secondary font-bold text-label-md flex items-center gap-xs hover:gap-sm transition-all"
            >
              View Audit History
              <span className="material-symbols-outlined text-sm">arrow_forward</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
