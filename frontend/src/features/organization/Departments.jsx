import { useState, useEffect, useCallback } from 'react'
import { departmentService } from '../../api/departments.js'
import { employeeService } from '../../api/employees.js'
import EmployeeCombobox from '../../components/ui/EmployeeCombobox.jsx'

export default function Departments() {
  const [departments, setDepartments]   = useState([])
  const [total, setTotal]               = useState(0)
  const [loading, setLoading]           = useState(true)
  const [showModal, setShowModal]       = useState(false)
  const [editDept, setEditDept]         = useState(null)
  const [viewDept, setViewDept]         = useState(null)
  const [deleteTarget, setDeleteTarget] = useState(null)
  const [form, setForm]                 = useState({ name: '', budget: '' })
  const [managerId, setManagerId]       = useState('')
  const [managers, setManagers]         = useState([])
  const [managersLoading, setManagersLoading] = useState(false)
  const [search, setSearch]             = useState('')
  const [toast, setToast]               = useState(null)
  const [saving, setSaving]             = useState(false)

  const showToast = (message, type = 'success') => {
    setToast({ message, type })
    setTimeout(() => setToast(null), 3000)
  }

  const fetchDepartments = useCallback(async () => {
    setLoading(true)
    try {
      const res = await departmentService.list({ limit: 100, search })
      if (res.ok) { const d = await res.json(); setDepartments(d.departments || []); setTotal(d.total || 0) }
    } catch { /* ignore */ }
    setLoading(false)
  }, [search])

  const fetchManagers = useCallback(async () => {
    setManagersLoading(true)
    try {
      const res = await employeeService.eligibleManagers()
      if (res.ok) { const d = await res.json(); setManagers(d.employees || []) }
      else showToast('Failed to load eligible managers.', 'error')
    } catch { showToast('Could not load managers.', 'error') }
    setManagersLoading(false)
  }, [])

  useEffect(() => {
    const t = setTimeout(fetchDepartments, search ? 300 : 0)
    return () => clearTimeout(t)
  }, [fetchDepartments, search])

  const openAdd = () => {
    setEditDept(null)
    setForm({ name: '', budget: '' })
    setManagerId('')
    fetchManagers()
    setShowModal(true)
  }

  const openEdit = (dept) => {
    setEditDept(dept)
    setForm({ name: dept.name, budget: dept.budget ? String(dept.budget) : '' })
    fetchManagers().then?.(() => {
      // pre-select manager by name match after managers load
    })
    fetchManagers()
    setManagerId('')
    setShowModal(true)
  }

  // When managers load and we're editing, try to pre-select by name
  useEffect(() => {
    if (!editDept || !editDept.head || managers.length === 0) return
    const match = managers.find(m => m.name === editDept.head)
    if (match) setManagerId(match.id)
  }, [managers, editDept])

  const closeModal = () => { setShowModal(false); setEditDept(null); setManagerId('') }

  const budgetInvalid = form.budget !== '' && Number(form.budget) < 0

  const handleSave = async () => {
    if (!form.name.trim() || budgetInvalid) return
    setSaving(true)
    try {
      const selectedManager = managers.find(m => m.id === managerId)
      const payload = {
        name: form.name.trim(),
        head: selectedManager ? selectedManager.name : null,
        budget: form.budget ? Number(form.budget) : null,
      }
      const res = editDept
        ? await departmentService.update(editDept.id, payload)
        : await departmentService.create(payload)
      if (res.ok || res.status === 201) {
        showToast(editDept ? `${form.name} updated.` : `${form.name} created.`)
        closeModal()
        fetchDepartments()
      } else {
        const err = await res.json().catch(() => ({}))
        showToast(err.detail || 'Save failed.', 'error')
      }
    } catch { showToast('Network error.', 'error') }
    setSaving(false)
  }

  const handleDelete = async () => {
    try {
      const res = await departmentService.remove(deleteTarget.id)
      if (res.ok || res.status === 204) {
        showToast(`${deleteTarget.name} deleted.`)
        setDeleteTarget(null)
        fetchDepartments()
      } else {
        const err = await res.json().catch(() => ({}))
        showToast(err.detail || 'Delete failed.', 'error')
        setDeleteTarget(null)
      }
    } catch { showToast('Network error.', 'error') }
  }

  const f = (key) => ({ value: form[key], onChange: e => setForm(prev => ({ ...prev, [key]: e.target.value })) })

  const filtered = departments.filter(d => `${d.name} ${d.head ?? ''}`.toLowerCase().includes(search.toLowerCase()))
  const hasEmployees = (deleteTarget?.employee_count ?? 0) > 0

  return (
    <div className="p-margin-mobile md:p-margin-desktop">
      {toast && (
        <div className={`fixed top-20 right-6 z-50 flex items-center gap-md px-lg py-md rounded-xl shadow-lg border text-label-md font-bold transition-all ${toast.type === 'error' ? 'bg-error-container text-on-error-container border-error/30' : 'bg-secondary-container text-on-secondary-container border-secondary/30'}`}>
          <span className="material-symbols-outlined text-[20px]">{toast.type === 'error' ? 'error' : 'check_circle'}</span>
          {toast.message}
        </div>
      )}

      {/* View Modal */}
      {viewDept && (
        <div className="fixed inset-0 z-50 bg-on-background/40 backdrop-blur-sm flex items-center justify-center p-margin-mobile">
          <div className="bg-surface-container-lowest border border-outline-variant rounded-2xl p-xl shadow-2xl w-full max-w-md">
            <div className="flex items-center justify-between mb-lg">
              <h3 className="text-headline-md">{viewDept.name}</h3>
              <button onClick={() => setViewDept(null)} className="p-2 hover:bg-surface-container rounded-full"><span className="material-symbols-outlined">close</span></button>
            </div>
            <div className="space-y-md text-body-md">
              <div><p className="text-label-sm text-outline uppercase">Department Manager</p><p className="font-medium">{viewDept.head ?? '—'}</p></div>
              <div><p className="text-label-sm text-outline uppercase">Employees</p><p className="font-medium">{viewDept.employee_count ?? 0}</p></div>
              <div><p className="text-label-sm text-outline uppercase">Budget</p><p className="font-medium">{viewDept.budget ? `$${Number(viewDept.budget).toLocaleString()}` : '—'}</p></div>
              <div><p className="text-label-sm text-outline uppercase">Status</p><p className="font-medium">{viewDept.status}</p></div>
            </div>
            <div className="flex justify-end mt-lg">
              <button onClick={() => setViewDept(null)} className="px-lg py-sm bg-surface-container border border-outline-variant rounded-lg text-label-md">Close</button>
            </div>
          </div>
        </div>
      )}

      {/* Add/Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 bg-on-background/40 backdrop-blur-sm flex items-center justify-center p-margin-mobile">
          <div className="bg-surface-container-lowest border border-outline-variant rounded-2xl p-xl shadow-2xl w-full max-w-md">
            <h3 className="text-headline-md mb-lg">{editDept ? 'Edit Department' : 'New Department'}</h3>
            <div className="space-y-md">
              <div className="flex flex-col gap-xs">
                <label className="text-label-md text-on-surface-variant">Name <span className="text-error">*</span></label>
                <input
                  autoFocus
                  className="bg-surface border border-outline-variant rounded-lg p-md text-body-md focus:ring-1 focus:ring-primary outline-none"
                  placeholder="e.g. Engineering"
                  {...f('name')}
                />
              </div>
              <div className="flex flex-col gap-xs">
                <label className="text-label-md text-on-surface-variant">Department Manager</label>
                <EmployeeCombobox
                  employees={managers}
                  value={managerId}
                  onChange={id => setManagerId(id)}
                  loading={managersLoading}
                  showPosition={true}
                  placeholder="Select eligible manager…"
                />
                <p className="text-label-sm text-on-surface-variant">Only employees hired 1+ year ago are eligible.</p>
                {editDept?.head && !managers.find(m => m.id === managerId) && managerId === '' && (
                  <p className="text-label-sm text-tertiary">Current: {editDept.head} — select a new manager or leave blank to keep.</p>
                )}
              </div>
              <div className="flex flex-col gap-xs">
                <label className="text-label-md text-on-surface-variant">Annual Budget ($)</label>
                <input
                  className={`bg-surface border rounded-lg p-md text-body-md focus:ring-1 outline-none ${budgetInvalid ? 'border-error focus:ring-error' : 'border-outline-variant focus:ring-primary'}`}
                  type="number"
                  min="0"
                  placeholder="0"
                  {...f('budget')}
                />
                {budgetInvalid && (
                  <p className="text-label-sm text-error flex items-center gap-xs">
                    <span className="material-symbols-outlined text-[14px]">error</span>
                    Annual budget cannot be negative.
                  </p>
                )}
              </div>
            </div>
            <div className="flex gap-sm justify-end mt-xl">
              <button onClick={closeModal} className="px-lg py-sm bg-surface-container border border-outline-variant text-on-surface rounded-lg text-label-md">Cancel</button>
              <button
                onClick={handleSave}
                disabled={!form.name.trim() || budgetInvalid || saving}
                className="px-lg py-sm bg-primary text-on-primary rounded-lg text-label-md disabled:opacity-50"
              >
                {saving ? 'Saving…' : editDept ? 'Save Changes' : 'Create'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirm Modal */}
      {deleteTarget && (
        <div className="fixed inset-0 z-50 bg-on-background/40 backdrop-blur-sm flex items-center justify-center p-margin-mobile">
          <div className="bg-surface-container-lowest border border-outline-variant rounded-2xl p-xl shadow-2xl max-w-md w-full">
            <div className="flex items-center gap-md mb-md">
              <div className="w-12 h-12 rounded-full bg-error/10 flex items-center justify-center shrink-0">
                <span className="material-symbols-outlined text-error">warning</span>
              </div>
              <h3 className="text-headline-md">Delete Department?</h3>
            </div>

            {/* Department details */}
            <div className="bg-surface-container rounded-lg p-md space-y-xs text-body-md mb-md">
              <div className="flex justify-between"><span className="text-on-surface-variant">Name</span><span className="font-bold">{deleteTarget.name}</span></div>
              <div className="flex justify-between"><span className="text-on-surface-variant">Manager</span><span className="font-bold">{deleteTarget.head ?? 'None'}</span></div>
              <div className="flex justify-between"><span className="text-on-surface-variant">Employees</span><span className={`font-bold ${hasEmployees ? 'text-error' : 'text-on-surface'}`}>{deleteTarget.employee_count}</span></div>
              <div className="flex justify-between"><span className="text-on-surface-variant">Budget</span><span className="font-bold">{deleteTarget.budget ? `$${Number(deleteTarget.budget).toLocaleString()}` : '—'}</span></div>
            </div>

            {hasEmployees ? (
              <div className="bg-error/10 border border-error/20 rounded-lg p-md mb-xl flex gap-sm">
                <span className="material-symbols-outlined text-error shrink-0">group</span>
                <div>
                  <p className="text-body-md font-bold text-error">Cannot delete — employees assigned</p>
                  <p className="text-label-sm text-on-surface-variant mt-xs">
                    <strong>{deleteTarget.employee_count}</strong> employee(s) are still assigned to this department.
                    Please reassign or remove them before deleting.
                  </p>
                </div>
              </div>
            ) : (
              <p className="text-body-md text-on-surface-variant mb-xl">
                Deleting <strong>{deleteTarget.name}</strong> is permanent and cannot be undone.
                All positions linked to this department will be unlinked.
              </p>
            )}

            <div className="flex gap-sm justify-end">
              <button onClick={() => setDeleteTarget(null)} className="px-lg py-sm bg-surface-container border border-outline-variant text-on-surface rounded-lg text-label-md">
                {hasEmployees ? 'Close' : 'Cancel'}
              </button>
              {!hasEmployees && (
                <button onClick={handleDelete} className="px-lg py-sm bg-error text-on-error rounded-lg text-label-md hover:opacity-90">
                  Delete
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      <div className="flex flex-col md:flex-row md:items-center justify-between mb-xl gap-md">
        <div>
          <h2 className="text-headline-lg text-on-surface">Departments</h2>
          <p className="text-body-md text-on-surface-variant">{total} department{total !== 1 ? 's' : ''} in the organization</p>
        </div>
        <button onClick={openAdd} className="flex items-center gap-xs px-lg py-sm bg-primary text-on-primary rounded-lg text-label-md hover:brightness-110 active:scale-95 transition-all shadow-md">
          <span className="material-symbols-outlined text-[18px]">add</span>
          New Department
        </button>
      </div>

      {/* Search */}
      <div className="flex items-center gap-sm bg-surface-container-lowest border border-outline-variant rounded-xl px-md py-sm shadow-sm focus-within:border-primary transition-all mb-lg">
        <span className="material-symbols-outlined text-on-surface-variant text-[20px]">search</span>
        <input className="flex-1 bg-transparent outline-none text-body-md placeholder:text-on-surface-variant" placeholder="Search departments…" value={search} onChange={e => setSearch(e.target.value)} />
        {search && <button onClick={() => setSearch('')} className="text-on-surface-variant hover:text-on-surface"><span className="material-symbols-outlined text-[18px]">close</span></button>}
      </div>

      {loading ? (
        <div className="flex items-center justify-center h-32"><span className="material-symbols-outlined text-primary text-[40px]" style={{ animation: 'spin 1s linear infinite' }}>progress_activity</span></div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-gutter">
          {filtered.length === 0 ? (
            <div className="col-span-full text-center text-on-surface-variant py-xl">No departments found.</div>
          ) : filtered.map(dept => (
            <div key={dept.id} className="bg-surface-container-lowest border border-outline-variant rounded-xl p-lg shadow-sm hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between mb-md">
                <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
                  <span className="material-symbols-outlined">domain</span>
                </div>
                <div className="flex gap-xs">
                  <button onClick={() => setViewDept(dept)} className="p-1.5 hover:bg-surface-container rounded-lg text-primary transition-all"><span className="material-symbols-outlined text-[18px]">visibility</span></button>
                  <button onClick={() => openEdit(dept)} className="p-1.5 hover:bg-surface-container rounded-lg text-outline transition-all"><span className="material-symbols-outlined text-[18px]">edit</span></button>
                  <button onClick={() => setDeleteTarget(dept)} className="p-1.5 hover:bg-error-container/20 rounded-lg text-error transition-all"><span className="material-symbols-outlined text-[18px]">delete</span></button>
                </div>
              </div>
              <h3 className="text-headline-md font-bold text-on-surface">{dept.name}</h3>
              <p className="text-body-md text-on-surface-variant mt-xs">{dept.head ?? 'No manager assigned'}</p>
              <div className="mt-lg grid grid-cols-2 gap-md pt-md border-t border-outline-variant">
                <div>
                  <p className="text-label-sm text-outline uppercase">Employees</p>
                  <p className="text-headline-md font-bold mt-xs">{dept.employee_count ?? 0}</p>
                </div>
                <div>
                  <p className="text-label-sm text-outline uppercase">Budget</p>
                  <p className="text-headline-md font-bold mt-xs">{dept.budget ? `$${Number(dept.budget).toLocaleString()}` : '—'}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
