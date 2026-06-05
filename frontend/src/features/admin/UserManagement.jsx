import { useState, useEffect, useCallback } from 'react'
import { Link } from 'react-router-dom'
import { api } from '../../lib/api.js'
import { useAuth } from '../../context/AuthContext.jsx'

const roleStyle = {
  'Admin':      'bg-primary/10 text-primary',
  'HR Manager': 'bg-secondary-container/30 text-secondary',
  'Manager':    'bg-surface-container text-on-surface-variant',
  'Employee':   'bg-surface-container text-on-surface-variant',
}
const statusConfig = {
  Active:   { text: 'text-secondary', dot: 'bg-secondary' },
  Inactive: { text: 'text-error',     dot: 'bg-error' },
  Pending:  { text: 'text-on-surface-variant', dot: 'bg-outline' },
}
const roles = ['Admin', 'HR Manager', 'Manager', 'Employee']
const initials = (name) => name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()

export default function UserManagement() {
  const { user: currentUser } = useAuth()
  const [users, setUsers]               = useState([])
  const [total, setTotal]               = useState(0)
  const [loading, setLoading]           = useState(true)
  const [search, setSearch]             = useState('')
  const [roleFilter, setRoleFilter]     = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [toast, setToast]               = useState(null)
  const [editingUser, setEditingUser]   = useState(null)
  const [showModal, setShowModal]       = useState(false)
  const [form, setForm]                 = useState({ name: '', email: '', password: '', role: 'Employee', status: 'Active' })
  const [formErrors, setFormErrors]     = useState({})
  const [deleteId, setDeleteId]         = useState(null)
  const [page, setPage]                 = useState(1)
  const [saving, setSaving]             = useState(false)
  const limit = 20

  const showToast = (message, type = 'success') => { setToast({ message, type }); setTimeout(() => setToast(null), 3000) }

  const fetchUsers = useCallback(async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams({ page, limit, ...(search && { search }), ...(roleFilter && { role: roleFilter }), ...(statusFilter && { status: statusFilter }) })
      const res = await api.get(`/users?${params}`)
      if (res.ok) { const d = await res.json(); setUsers(d.users || []); setTotal(d.total || 0) }
    } catch { /* ignore */ }
    setLoading(false)
  }, [page, search, roleFilter, statusFilter])

  useEffect(() => { const t = setTimeout(fetchUsers, search ? 300 : 0); return () => clearTimeout(t) }, [fetchUsers, search])

  const openAdd = () => { setEditingUser(null); setForm({ name: '', email: '', password: '', role: 'Employee', status: 'Active' }); setFormErrors({}); setShowModal(true) }
  const openEdit = (user) => { setEditingUser(user); setForm({ name: user.name, email: user.email, password: '', role: user.role, status: user.status }); setFormErrors({}); setShowModal(true) }
  const closeModal = () => { setShowModal(false); setEditingUser(null) }

  const validate = () => {
    const errs = {}
    if (!form.name.trim()) errs.name = 'Name is required.'
    if (!form.email.trim()) errs.email = 'Email is required.'
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) errs.email = 'Enter a valid email.'
    if (!editingUser && !form.password.trim()) errs.password = 'Password is required.'
    return errs
  }

  const handleSubmit = async () => {
    const errs = validate()
    if (Object.keys(errs).length) { setFormErrors(errs); return }
    setSaving(true)
    try {
      let res
      if (editingUser) {
        const payload = { name: form.name, email: form.email, role: form.role, status: form.status }
        res = await api.put(`/users/${editingUser.id}`, payload)
      } else {
        res = await api.post('/users', { name: form.name, email: form.email, password: form.password, role: form.role, status: form.status })
      }
      if (res.ok || res.status === 201) {
        showToast(editingUser ? `${form.name} updated.` : `User ${form.name} added.`)
        closeModal(); fetchUsers()
      } else {
        const err = await res.json().catch(() => ({}))
        showToast(err.detail || 'Save failed.', 'error')
      }
    } catch { showToast('Network error.', 'error') }
    setSaving(false)
  }

  const toggleStatus = async (user) => {
    const next = user.status === 'Active' ? 'Inactive' : 'Active'
    try {
      const res = await api.put(`/users/${user.id}/status`, { status: next })
      if (res.ok) { showToast(`${user.name} is now ${next}.`, next === 'Active' ? 'success' : 'error'); fetchUsers() }
      else { const err = await res.json().catch(() => ({})); showToast(err.detail || 'Failed.', 'error') }
    } catch { showToast('Network error.', 'error') }
  }

  const handleDelete = async () => {
    const user = users.find(u => u.id === deleteId)
    try {
      const res = await api.delete(`/users/${deleteId}`)
      if (res.ok || res.status === 204) {
        showToast(`${user?.name} removed.`, 'error'); setDeleteId(null); fetchUsers()
      } else {
        const err = await res.json().catch(() => ({})); showToast(err.detail || 'Delete failed.', 'error')
      }
    } catch { showToast('Network error.', 'error') }
  }

  const handleExport = async () => {
    try {
      const token = localStorage.getItem('access_token')
      const BASE = import.meta.env.VITE_API_BASE_URL ?? '/api'
      const res = await fetch(`${BASE}/users/export`, { headers: { Authorization: `Bearer ${token}` } })
      if (!res.ok) { showToast('Export failed.', 'error'); return }
      const blob = await res.blob()
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = 'users.csv'
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)
    } catch { showToast('Export failed.', 'error') }
  }

  const totalPages = Math.max(1, Math.ceil(total / limit))
  const activeCount = users.filter(u => u.status === 'Active').length

  return (
    <div className="p-margin-mobile md:p-margin-desktop">
      {toast && (
        <div className={`fixed top-20 right-6 z-50 flex items-center gap-md px-lg py-md rounded-xl shadow-lg border text-label-md font-bold transition-all ${toast.type === 'error' ? 'bg-error-container text-on-error-container border-error/30' : 'bg-secondary-container text-on-secondary-container border-secondary/30'}`}>
          <span className="material-symbols-outlined text-[20px]">{toast.type === 'error' ? 'error' : 'check_circle'}</span>
          {toast.message}
        </div>
      )}

      {showModal && (
        <div className="fixed inset-0 z-50 bg-on-background/40 backdrop-blur-sm flex items-center justify-center p-margin-mobile">
          <div className="bg-surface-container-lowest border border-outline-variant rounded-2xl p-xl shadow-2xl w-full max-w-md">
            <h3 className="text-headline-md text-on-surface mb-lg">{editingUser ? 'Edit User' : 'Add New User'}</h3>
            <div className="space-y-md">
              <div className="flex flex-col gap-xs">
                <label className="text-label-md text-on-surface-variant">Full Name <span className="text-error">*</span></label>
                <input autoFocus className={`bg-surface border rounded-lg p-md text-body-md focus:ring-1 outline-none ${formErrors.name ? 'border-error focus:ring-error' : 'border-outline-variant focus:ring-primary'}`} placeholder="e.g. John Smith" value={form.name} onChange={e => { setForm(f => ({ ...f, name: e.target.value })); setFormErrors(f => ({ ...f, name: '' })) }} />
                {formErrors.name && <p className="text-label-sm text-error">{formErrors.name}</p>}
              </div>
              <div className="flex flex-col gap-xs">
                <label className="text-label-md text-on-surface-variant">Email Address <span className="text-error">*</span></label>
                <input className={`bg-surface border rounded-lg p-md text-body-md focus:ring-1 outline-none ${formErrors.email ? 'border-error focus:ring-error' : 'border-outline-variant focus:ring-primary'}`} placeholder="email@org.com" type="email" value={form.email} onChange={e => { setForm(f => ({ ...f, email: e.target.value })); setFormErrors(f => ({ ...f, email: '' })) }} />
                {formErrors.email && <p className="text-label-sm text-error">{formErrors.email}</p>}
              </div>
              {!editingUser && (
                <div className="flex flex-col gap-xs">
                  <label className="text-label-md text-on-surface-variant">Password <span className="text-error">*</span></label>
                  <input className={`bg-surface border rounded-lg p-md text-body-md focus:ring-1 outline-none ${formErrors.password ? 'border-error focus:ring-error' : 'border-outline-variant focus:ring-primary'}`} type="password" placeholder="Minimum 8 characters" value={form.password} onChange={e => { setForm(f => ({ ...f, password: e.target.value })); setFormErrors(f => ({ ...f, password: '' })) }} />
                  {formErrors.password && <p className="text-label-sm text-error">{formErrors.password}</p>}
                </div>
              )}
              <div className="grid grid-cols-2 gap-md">
                <div className="flex flex-col gap-xs">
                  <label className="text-label-md text-on-surface-variant">Role</label>
                  <select className="bg-surface border border-outline-variant rounded-lg p-md text-body-md focus:border-primary focus:ring-1 focus:ring-primary outline-none" value={form.role} onChange={e => setForm(f => ({ ...f, role: e.target.value }))}>
                    {roles.map(r => <option key={r}>{r}</option>)}
                  </select>
                </div>
                <div className="flex flex-col gap-xs">
                  <label className="text-label-md text-on-surface-variant">Status</label>
                  <select className="bg-surface border border-outline-variant rounded-lg p-md text-body-md focus:border-primary focus:ring-1 focus:ring-primary outline-none" value={form.status} onChange={e => setForm(f => ({ ...f, status: e.target.value }))}>
                    {['Active', 'Inactive'].map(s => <option key={s}>{s}</option>)}
                  </select>
                </div>
              </div>
            </div>
            <div className="flex gap-sm justify-end mt-xl">
              <button onClick={closeModal} className="px-lg py-sm bg-surface-container border border-outline-variant text-on-surface rounded-lg text-label-md hover:bg-surface-container-high">Cancel</button>
              <button onClick={handleSubmit} disabled={saving} className="px-lg py-sm bg-primary text-on-primary rounded-lg text-label-md hover:brightness-110 disabled:opacity-50">{saving ? 'Saving…' : editingUser ? 'Save Changes' : 'Add User'}</button>
            </div>
          </div>
        </div>
      )}

      {deleteId && (
        <div className="fixed inset-0 z-50 bg-on-background/40 backdrop-blur-sm flex items-center justify-center p-margin-mobile">
          <div className="bg-surface-container-lowest border border-outline-variant rounded-2xl p-xl shadow-2xl w-full max-w-sm">
            <div className="flex items-center gap-md mb-md">
              <div className="w-12 h-12 rounded-full bg-error/10 flex items-center justify-center shrink-0"><span className="material-symbols-outlined text-error">delete</span></div>
              <h3 className="text-headline-md text-on-surface">Remove User?</h3>
            </div>
            <p className="text-body-md text-on-surface-variant mb-xl">This will permanently remove <strong>{users.find(u => u.id === deleteId)?.name}</strong> from the system.</p>
            <div className="flex gap-sm justify-end">
              <button onClick={() => setDeleteId(null)} className="px-lg py-sm bg-surface-container border border-outline-variant text-on-surface rounded-lg text-label-md">Cancel</button>
              <button onClick={handleDelete} className="px-lg py-sm bg-error text-on-error rounded-lg text-label-md hover:opacity-90">Remove</button>
            </div>
          </div>
        </div>
      )}

      <div className="flex flex-col md:flex-row md:items-center justify-between mb-xl gap-md">
        <div>
          <h2 className="text-headline-lg text-on-surface">System Users</h2>
          <p className="text-body-md text-on-surface-variant mt-1">Manage administrative access and permissions.</p>
        </div>
        <div className="flex flex-wrap items-center gap-md">
          <button onClick={handleExport} className="bg-surface-container-lowest border border-outline-variant text-on-surface text-label-md px-md py-2.5 rounded-lg flex items-center gap-sm hover:bg-surface-container-low transition-colors">
            <span className="material-symbols-outlined text-[20px]">file_download</span>
            Export Data
          </button>
          <button onClick={openAdd} className="bg-primary text-on-primary text-label-md px-lg py-2.5 rounded-lg flex items-center gap-sm hover:brightness-110 shadow-sm">
            <span className="material-symbols-outlined text-[20px]">add</span>
            Add User
          </button>
        </div>
      </div>

      {/* Search */}
      <div className="flex items-center gap-sm bg-surface-container-lowest border border-outline-variant rounded-xl px-md py-sm shadow-sm focus-within:border-primary transition-all">
        <span className="material-symbols-outlined text-on-surface-variant text-[20px]">search</span>
        <input className="flex-1 bg-transparent outline-none text-body-md placeholder:text-on-surface-variant" placeholder="Search by name or email…" value={search} onChange={e => { setSearch(e.target.value); setPage(1) }} />
        {search && <button onClick={() => { setSearch(''); setPage(1) }} className="text-on-surface-variant hover:text-on-surface"><span className="material-symbols-outlined text-[18px]">close</span></button>}
      </div>
      <br />

      {/* Stats & Filters */}
      <div className="grid grid-cols-12 gap-gutter mb-xl">
        <div className="col-span-12 lg:col-span-8 bg-surface-container-lowest rounded-xl border border-outline-variant p-md shadow-sm">
          <div className="flex flex-wrap items-center gap-md">
            <div className="flex-1 min-w-[200px]">
              <label className="block text-label-sm text-on-surface-variant mb-xs ml-1">Filter by Role</label>
              <div className="flex flex-wrap gap-xs">
                {['', ...roles].map(r => (
                  <button key={r || 'all'} onClick={() => { setRoleFilter(r); setPage(1) }} className={`px-sm py-1 rounded-full text-label-sm font-bold cursor-pointer transition-colors ${roleFilter === r ? 'bg-primary/10 text-primary border border-primary/20' : 'bg-surface-container hover:bg-surface-container-high border border-outline-variant/30 text-on-surface-variant'}`}>
                    {r || 'All Roles'}
                  </button>
                ))}
              </div>
            </div>
            <div className="h-10 w-px bg-outline-variant mx-xs hidden md:block" />
            <div className="w-full md:w-48">
              <label className="block text-label-sm text-on-surface-variant mb-xs ml-1">Status</label>
              <select className="w-full bg-surface-container border-none rounded-lg text-body-md py-1.5 focus:ring-primary/20" value={statusFilter} onChange={e => { setStatusFilter(e.target.value); setPage(1) }}>
                <option value="">All Status</option><option>Active</option><option>Inactive</option>
              </select>
            </div>
          </div>
        </div>
        <div className="col-span-12 lg:col-span-4 bg-primary rounded-xl border border-primary-container p-md shadow-md text-on-primary flex items-center justify-between overflow-hidden relative">
          <div className="relative z-10">
            <p className="text-label-sm font-bold opacity-80 uppercase tracking-widest mb-xs">Active Users</p>
            <p className="text-display leading-none">{activeCount}</p>
            <div className="flex items-center mt-sm text-secondary-container"><span className="material-symbols-outlined text-sm mr-xs">group</span><span className="text-label-md">{total} total users</span></div>
          </div>
          <div className="absolute -right-4 -bottom-6 opacity-20"><span className="material-symbols-outlined text-[120px]" style={{ fontVariationSettings: "'FILL' 1" }}>group</span></div>
        </div>
      </div>

      {/* Table */}
      <div className="bg-surface-container-lowest rounded-xl border border-outline-variant shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-surface-container-low border-b border-outline-variant">
                {['Full Name', 'Role', 'Status', 'Last Login', 'Actions'].map((h, i) => (
                  <th key={h} className={`px-lg py-md text-label-sm font-bold text-on-surface-variant uppercase tracking-wider ${i === 4 ? 'text-right' : ''}`}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-outline-variant">
              {loading ? (
                <tr><td colSpan={5} className="px-lg py-2xl text-center text-on-surface-variant">Loading…</td></tr>
              ) : users.length === 0 ? (
                <tr><td colSpan={5} className="px-lg py-2xl text-center text-on-surface-variant"><span className="material-symbols-outlined text-[40px] block mb-md opacity-30">manage_accounts</span>No users match.</td></tr>
              ) : users.map(u => {
                const sc = statusConfig[u.status] ?? statusConfig.Pending
                return (
                  <tr key={u.id} className="hover:bg-surface-container-lowest group transition-colors">
                    <td className="px-lg py-md">
                      <div className="flex items-center gap-md">
                        <div className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-sm shrink-0">{initials(u.name)}</div>
                        <div><p className="font-bold text-body-md text-on-surface">{u.name}</p><p className="text-label-sm text-on-surface-variant">{u.email}</p></div>
                      </div>
                    </td>
                    <td className="px-lg py-md"><span className={`inline-flex items-center px-sm py-1 rounded-full text-label-sm font-bold ${roleStyle[u.role] ?? 'bg-surface-container text-on-surface-variant'}`}>{u.role}</span></td>
                    <td className="px-lg py-md"><div className={`flex items-center gap-xs font-bold text-label-sm ${sc.text}`}><span className={`w-2 h-2 rounded-full ${sc.dot}`} />{u.status}</div></td>
                    <td className="px-lg py-md text-body-md text-on-surface-variant">{u.last_login ? new Date(u.last_login).toLocaleString() : 'Never'}</td>
                    <td className="px-lg py-md">
                      <div className="flex items-center justify-end gap-xs">
                        <button onClick={() => openEdit(u)} className="p-1.5 hover:bg-surface-container rounded-lg text-outline hover:text-primary transition-all"><span className="material-symbols-outlined text-[18px]">edit</span></button>
                        {u.id !== currentUser?.id && (
                          <>
                            <button onClick={() => toggleStatus(u)} className={`p-1.5 rounded-lg transition-all ${u.status === 'Active' ? 'hover:bg-error/10 text-outline hover:text-error' : 'hover:bg-secondary/10 text-outline hover:text-secondary'}`}><span className="material-symbols-outlined text-[18px]">{u.status === 'Active' ? 'person_off' : 'person_check'}</span></button>
                            <button onClick={() => setDeleteId(u.id)} className="p-1.5 hover:bg-error/10 rounded-lg text-outline hover:text-error transition-all"><span className="material-symbols-outlined text-[18px]">delete</span></button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
        <div className="bg-surface-container-low px-lg py-md flex flex-col gap-md sm:flex-row sm:items-center sm:justify-between border-t border-outline-variant">
          <p className="text-label-md text-on-surface-variant">Showing {users.length} of {total} users</p>
          <div className="flex items-center gap-xs">
            <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1} className="w-8 h-8 flex items-center justify-center rounded-lg border border-outline-variant text-on-surface-variant hover:bg-surface-container disabled:opacity-50"><span className="material-symbols-outlined">chevron_left</span></button>
            {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => i + 1).map(p => (
              <button key={p} onClick={() => setPage(p)} className={`w-8 h-8 flex items-center justify-center rounded-lg text-label-md ${p === page ? 'bg-primary text-on-primary font-bold' : 'border border-outline-variant text-on-surface-variant hover:bg-surface-container'}`}>{p}</button>
            ))}
            <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page >= totalPages} className="w-8 h-8 flex items-center justify-center rounded-lg border border-outline-variant text-on-surface-variant hover:bg-surface-container disabled:opacity-50"><span className="material-symbols-outlined">chevron_right</span></button>
          </div>
        </div>
      </div>

      <div className="mt-xl grid grid-cols-1 md:grid-cols-2 gap-gutter">
        <div className="bg-surface-container-low p-lg rounded-xl border border-outline-variant flex items-start gap-md">
          <div className="p-sm bg-primary/10 rounded-lg"><span className="material-symbols-outlined text-primary">security</span></div>
          <div>
            <h4 className="font-bold text-body-lg text-on-surface">Role Inheritance</h4>
            <p className="text-body-md text-on-surface-variant mt-1">Users inherit permissions from their assigned roles. Modifying a role affects all users immediately.</p>
            <Link to="/roles" className="mt-md text-primary font-bold text-label-md flex items-center gap-xs hover:gap-sm transition-all">Manage Roles &amp; Permissions<span className="material-symbols-outlined text-sm">arrow_forward</span></Link>
          </div>
        </div>
        <div className="bg-surface-container-low p-lg rounded-xl border border-outline-variant flex items-start gap-md">
          <div className="p-sm bg-secondary/10 rounded-lg"><span className="material-symbols-outlined text-secondary">history</span></div>
          <div>
            <h4 className="font-bold text-body-lg text-on-surface">Audit Logs</h4>
            <p className="text-body-md text-on-surface-variant mt-1">Every administrative action is tracked for security purposes.</p>
          </div>
        </div>
      </div>
    </div>
  )
}
