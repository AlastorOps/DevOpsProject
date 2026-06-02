import { useState } from 'react'

const initialDepartments = [
  { id: 1, name: 'Engineering',     head: 'Robert Chen',   employees: 124, budget: '$1.2M', status: 'Active' },
  { id: 2, name: 'Marketing',       head: 'Sarah Williams', employees: 48,  budget: '$450K', status: 'Active' },
  { id: 3, name: 'Human Resources', head: 'John Doe',       employees: 22,  budget: '$280K', status: 'Active' },
  { id: 4, name: 'Finance',         head: 'Diana Prince',   employees: 35,  budget: '$320K', status: 'Active' },
  { id: 5, name: 'Product Design',  head: 'Alex Kim',       employees: 18,  budget: '$210K', status: 'Active' },
]

const emptyForm = { name: '', head: '', budget: '' }

export default function Departments() {
  const [departments, setDepartments] = useState(initialDepartments)
  const [showModal, setShowModal]     = useState(false)
  const [editDept, setEditDept]       = useState(null)
  const [viewDept, setViewDept]       = useState(null)
  const [deleteTarget, setDeleteTarget] = useState(null)
  const [form, setForm]               = useState(emptyForm)
  const [search, setSearch]           = useState('')
  const [toast, setToast]             = useState(null)

  const showToast = (message) => {
    setToast(message)
    setTimeout(() => setToast(null), 3000)
  }

  const filtered = departments.filter(d =>
    `${d.name} ${d.head}`.toLowerCase().includes(search.toLowerCase())
  )

  const openAdd = () => {
    setEditDept(null)
    setForm(emptyForm)
    setShowModal(true)
  }

  const openEdit = (dept) => {
    setEditDept(dept)
    setForm({ name: dept.name, head: dept.head, budget: dept.budget })
    setShowModal(true)
  }

  const closeModal = () => {
    setShowModal(false)
    setForm(emptyForm)
    setEditDept(null)
  }

  const handleSave = () => {
    if (!form.name.trim()) return
    if (editDept) {
      setDepartments(prev => prev.map(d =>
        d.id === editDept.id ? { ...d, name: form.name, head: form.head, budget: form.budget } : d
      ))
      showToast(`"${form.name}" updated.`)
    } else {
      const newId = Math.max(0, ...departments.map(d => d.id)) + 1
      setDepartments(prev => [...prev, { id: newId, name: form.name, head: form.head, budget: form.budget, employees: 0, status: 'Active' }])
      showToast(`"${form.name}" department created.`)
    }
    closeModal()
  }

  const handleDelete = () => {
    setDepartments(prev => prev.filter(d => d.id !== deleteTarget.id))
    showToast(`"${deleteTarget.name}" deleted.`)
    setDeleteTarget(null)
  }

  const field = (key) => ({
    value: form[key],
    onChange: e => setForm(prev => ({ ...prev, [key]: e.target.value })),
  })

  return (
    <div className="p-margin-mobile md:p-margin-desktop">
      {/* Toast */}
      {toast && (
        <div className="fixed top-20 right-6 z-50 flex items-center gap-md px-lg py-md rounded-xl shadow-lg border text-label-md font-bold bg-secondary-container text-on-secondary-container border-secondary/30">
          <span className="material-symbols-outlined text-[20px]">check_circle</span>
          {toast}
        </div>
      )}

      {/* Delete Confirm */}
      {deleteTarget && (
        <div className="fixed inset-0 z-50 bg-on-background/40 backdrop-blur-sm flex items-center justify-center p-margin-mobile">
          <div className="bg-surface-container-lowest border border-outline-variant rounded-2xl p-xl shadow-2xl max-w-md w-full">
            <div className="flex items-center gap-md mb-md">
              <div className="w-12 h-12 rounded-full bg-error/10 flex items-center justify-center shrink-0">
                <span className="material-symbols-outlined text-error">warning</span>
              </div>
              <h3 className="text-headline-md text-on-surface">Delete Department?</h3>
            </div>
            <p className="text-body-md text-on-surface-variant mb-xl">
              Are you sure you want to delete <strong>"{deleteTarget.name}"</strong>? This action cannot be undone.
            </p>
            <div className="flex gap-sm justify-end">
              <button onClick={() => setDeleteTarget(null)} className="px-lg py-sm bg-surface-container border border-outline-variant text-on-surface rounded-lg text-label-md hover:bg-surface-container-high transition-all">
                Cancel
              </button>
              <button onClick={handleDelete} className="px-lg py-sm bg-error text-on-error rounded-lg text-label-md hover:opacity-90 transition-all">
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* View Modal */}
      {viewDept && (
        <div className="fixed inset-0 z-50 bg-on-background/40 backdrop-blur-sm flex items-center justify-center p-margin-mobile">
          <div className="bg-surface-container-lowest border border-outline-variant rounded-2xl p-xl shadow-2xl max-w-md w-full">
            <div className="flex items-center justify-between mb-lg">
              <h3 className="text-headline-md font-bold">Department Details</h3>
              <button onClick={() => setViewDept(null)} className="p-2 hover:bg-surface-container rounded-full">
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>
            <div className="flex items-center gap-md mb-lg">
              <div className="w-14 h-14 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
                <span className="material-symbols-outlined text-[32px]">domain</span>
              </div>
              <div>
                <h4 className="text-headline-md font-bold">{viewDept.name}</h4>
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-label-sm font-bold bg-secondary-container text-on-secondary-container">{viewDept.status}</span>
              </div>
            </div>
            <div className="space-y-md">
              {[
                { label: 'Department Head', val: viewDept.head,      icon: 'person' },
                { label: 'Employees',       val: viewDept.employees, icon: 'group' },
                { label: 'Annual Budget',   val: viewDept.budget,    icon: 'account_balance' },
              ].map(item => (
                <div key={item.label} className="flex items-center gap-md p-md bg-surface-container rounded-lg">
                  <span className="material-symbols-outlined text-primary">{item.icon}</span>
                  <div>
                    <p className="text-label-sm text-on-surface-variant">{item.label}</p>
                    <p className="text-body-md font-bold">{item.val}</p>
                  </div>
                </div>
              ))}
            </div>
            <div className="flex justify-end gap-sm mt-xl">
              <button onClick={() => setViewDept(null)} className="px-lg py-sm bg-surface-container border border-outline-variant text-on-surface rounded-lg text-label-md hover:bg-surface-container-high transition-all">Close</button>
              <button onClick={() => { setViewDept(null); openEdit(viewDept) }} className="px-lg py-sm bg-primary text-on-primary rounded-lg text-label-md hover:opacity-90 transition-all">Edit</button>
            </div>
          </div>
        </div>
      )}

      <div className="flex flex-col md:flex-row md:items-center justify-between mb-xl gap-md">
        <div>
          <h2 className="text-headline-lg text-on-surface">Departments</h2>
          <p className="text-body-md text-on-surface-variant">Manage organizational structure and department records</p>
        </div>
        <button onClick={openAdd} className="flex items-center gap-xs px-lg py-sm bg-primary text-on-primary rounded-lg text-label-md hover:brightness-110 active:scale-95 transition-all shadow-md">
          <span className="material-symbols-outlined text-[18px]">add</span>
          Add Department
        </button>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-gutter mb-lg">
        <div className="bg-surface-container-lowest border border-outline-variant p-lg rounded-xl flex items-center gap-lg shadow-sm">
          <div className="w-12 h-12 rounded-full bg-primary/10 text-primary flex items-center justify-center">
            <span className="material-symbols-outlined">domain</span>
          </div>
          <div>
            <p className="text-label-sm text-outline uppercase tracking-wider">Total Departments</p>
            <h3 className="text-headline-lg mt-xs">{departments.length}</h3>
          </div>
        </div>
        <div className="bg-surface-container-lowest border border-outline-variant p-lg rounded-xl flex items-center gap-lg shadow-sm">
          <div className="w-12 h-12 rounded-full bg-secondary/10 text-secondary flex items-center justify-center">
            <span className="material-symbols-outlined">group</span>
          </div>
          <div>
            <p className="text-label-sm text-outline uppercase tracking-wider">Total Employees</p>
            <h3 className="text-headline-lg mt-xs">{departments.reduce((sum, d) => sum + d.employees, 0).toLocaleString()}</h3>
          </div>
        </div>
        <div className="bg-surface-container-lowest border border-outline-variant p-lg rounded-xl flex items-center gap-lg shadow-sm">
          <div className="w-12 h-12 rounded-full bg-tertiary/10 text-tertiary flex items-center justify-center">
            <span className="material-symbols-outlined">account_balance</span>
          </div>
          <div>
            <p className="text-label-sm text-outline uppercase tracking-wider">Total Budget</p>
            <h3 className="text-headline-lg mt-xs">$4.8M</h3>
          </div>
        </div>
      </div>

      {/* Search */}
      <div className="flex items-center gap-sm bg-surface-container-lowest border border-outline-variant rounded-xl px-md py-sm shadow-sm focus-within:border-primary transition-all">
        <span className="material-symbols-outlined text-on-surface-variant text-[20px]">search</span>
        <input
          className="flex-1 bg-transparent outline-none text-body-md placeholder:text-on-surface-variant"
          placeholder="Search by name or department head…"
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
        {search && (
          <button onClick={() => setSearch('')} className="text-on-surface-variant hover:text-on-surface transition-colors">
            <span className="material-symbols-outlined text-[18px]">close</span>
          </button>
        )}
      </div>
        <br />

      {/* Table */}
      <div className="bg-surface-container-lowest border border-outline-variant rounded-xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-surface-container-low text-on-surface-variant text-label-md uppercase tracking-wider">
                <th className="px-lg py-md font-bold">Department</th>
                <th className="px-lg py-md font-bold">Department Head</th>
                <th className="px-lg py-md font-bold">Employees</th>
                <th className="px-lg py-md font-bold">Annual Budget</th>
                <th className="px-lg py-md font-bold">Status</th>
                <th className="px-lg py-md font-bold text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-outline-variant text-body-md">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-lg py-xl text-center text-on-surface-variant text-body-md">
                    No departments match <strong>"{search}"</strong>.
                  </td>
                </tr>
              ) : filtered.map(dept => (
                <tr key={dept.id} className="hover:bg-surface-container-low transition-colors">
                  <td className="px-lg py-md">
                    <div className="flex items-center gap-sm">
                      <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
                        <span className="material-symbols-outlined">domain</span>
                      </div>
                      <span className="font-bold">{dept.name}</span>
                    </div>
                  </td>
                  <td className="px-lg py-md">{dept.head}</td>
                  <td className="px-lg py-md font-bold">{dept.employees}</td>
                  <td className="px-lg py-md">{dept.budget}</td>
                  <td className="px-lg py-md">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-label-sm font-bold bg-secondary-container text-on-secondary-container">
                      {dept.status}
                    </span>
                  </td>
                  <td className="px-lg py-md">
                    <div className="flex items-center justify-center gap-2">
                      <button onClick={() => setViewDept(dept)} className="p-1 hover:bg-surface-container rounded-lg text-primary transition-all" title="View">
                        <span className="material-symbols-outlined text-[20px]">visibility</span>
                      </button>
                      <button onClick={() => openEdit(dept)} className="p-1 hover:bg-surface-container rounded-lg text-outline transition-all" title="Edit">
                        <span className="material-symbols-outlined text-[20px]">edit</span>
                      </button>
                      <button onClick={() => setDeleteTarget(dept)} className="p-1 hover:bg-error-container/20 rounded-lg text-error transition-all" title="Delete">
                        <span className="material-symbols-outlined text-[20px]">delete</span>
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="p-md bg-surface-container-low flex flex-col gap-md sm:flex-row sm:items-center sm:justify-between border-t border-outline-variant">
          <p className="text-label-sm text-on-surface-variant">
            {search
              ? `${filtered.length} result${filtered.length !== 1 ? 's' : ''} for "${search}"`
              : `Showing ${departments.length} of ${departments.length} departments`}
          </p>
          <div className="flex space-x-sm">
            <button className="p-1 rounded hover:bg-surface-container transition-colors opacity-30" disabled>
              <span className="material-symbols-outlined">chevron_left</span>
            </button>
            <button className="px-3 py-1 rounded bg-primary text-on-primary text-label-sm">1</button>
            <button className="px-3 py-1 rounded hover:bg-surface-container text-label-sm">2</button>
            <button className="p-1 rounded hover:bg-surface-container transition-colors">
              <span className="material-symbols-outlined">chevron_right</span>
            </button>
          </div>
        </div>
      </div>

      {/* Add / Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-margin-mobile">
          <div className="absolute inset-0 bg-on-background/40 backdrop-blur-sm" onClick={closeModal}></div>
          <div className="relative bg-surface-container-lowest w-full max-w-lg p-xl rounded-xl shadow-2xl border border-outline-variant">
            <div className="flex items-center justify-between mb-lg">
              <h3 className="text-headline-md font-bold">{editDept ? 'Edit Department' : 'Add New Department'}</h3>
              <button className="p-2 hover:bg-surface-container rounded-full" onClick={closeModal}>
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>
            <div className="space-y-md">
              <div className="space-y-xs">
                <label className="text-label-md text-on-surface">Department Name</label>
                <input className="w-full border border-outline-variant rounded-lg py-md px-md text-body-md focus:ring-1 focus:ring-primary outline-none" placeholder="e.g. Product Development" type="text" {...field('name')} />
              </div>
              <div className="space-y-xs">
                <label className="text-label-md text-on-surface">Department Head</label>
                <input className="w-full border border-outline-variant rounded-lg py-md px-md text-body-md focus:ring-1 focus:ring-primary outline-none" placeholder="e.g. Jane Doe" type="text" {...field('head')} />
              </div>
              <div className="space-y-xs">
                <label className="text-label-md text-on-surface">Annual Budget</label>
                <input className="w-full border border-outline-variant rounded-lg py-md px-md text-body-md focus:ring-1 focus:ring-primary outline-none" placeholder="e.g. $500K" type="text" {...field('budget')} />
              </div>
            </div>
            <div className="flex items-center justify-end gap-md pt-lg">
              <button className="px-lg py-md text-on-surface-variant hover:bg-surface-container rounded-lg text-label-md" onClick={closeModal}>Cancel</button>
              <button
                onClick={handleSave}
                disabled={!form.name.trim()}
                className="px-xl py-md bg-primary text-on-primary text-label-md rounded-lg shadow-md hover:opacity-90 disabled:opacity-40 disabled:cursor-not-allowed"
              >
                {editDept ? 'Save Changes' : 'Create Department'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
