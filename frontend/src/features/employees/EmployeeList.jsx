import { useState } from 'react'
import { Link } from 'react-router-dom'

const initialEmployees = [
  { id: '#EMP-001', name: 'John Doe',      email: 'john.doe@example.com',  gender: 'Male',   dept: 'Human Resources', pos: 'HR Manager',       phone: '+1 (555) 010-2345', status: 'Active' },
  { id: '#EMP-002', name: 'Sarah Jenkins', email: 's.jenkins@example.com', gender: 'Female', dept: 'Engineering',     pos: 'Senior Developer', phone: '+1 (555) 010-8892', status: 'Active' },
  { id: '#EMP-003', name: 'Michael Ross',  email: 'm.ross@example.com',    gender: 'Male',   dept: 'Marketing',       pos: 'Head of Growth',   phone: '+1 (555) 010-4456', status: 'Inactive' },
  { id: '#EMP-004', name: 'Alicia Lee',    email: 'a.lee@example.com',     gender: 'Female', dept: 'Finance',         pos: 'Accountant',       phone: '+1 (555) 010-7712', status: 'Active' },
]

const statusStyle = {
  Active:     'bg-secondary-container text-on-secondary-container',
  Inactive:   'bg-error-container text-on-error-container',
  'On Leave': 'bg-tertiary-fixed text-on-tertiary-fixed',
}

const emptyForm = { name: '', email: '', gender: 'Male', dept: 'Human Resources', pos: '', phone: '', status: 'Active' }

export default function EmployeeList() {
  const [employees, setEmployees]       = useState(initialEmployees)
  const [search, setSearch]             = useState('')
  const [filterDept, setFilterDept]     = useState('All Departments')
  const [filterPos, setFilterPos]       = useState('All Positions')
  const [filterStatus, setFilterStatus] = useState('All Status')
  const [showModal, setShowModal]       = useState(false)
  const [editEmp, setEditEmp]           = useState(null)
  const [form, setForm]                 = useState(emptyForm)
  const [deleteTarget, setDeleteTarget] = useState(null)
  const [toast, setToast]               = useState(null)

  const showToast = (message, type = 'success') => {
    setToast({ message, type })
    setTimeout(() => setToast(null), 3000)
  }

  const filtered = employees.filter(emp => {
    const matchSearch = `${emp.name} ${emp.id} ${emp.email}`.toLowerCase().includes(search.toLowerCase())
    const matchDept   = filterDept   === 'All Departments' || emp.dept   === filterDept
    const matchPos    = filterPos    === 'All Positions'   || emp.pos    === filterPos
    const matchStatus = filterStatus === 'All Status'      || emp.status === filterStatus
    return matchSearch && matchDept && matchPos && matchStatus
  })

  const openEdit = (emp) => {
    setEditEmp(emp)
    setForm({ name: emp.name, email: emp.email, gender: emp.gender, dept: emp.dept, pos: emp.pos, phone: emp.phone, status: emp.status })
    setShowModal(true)
  }

  const closeModal = () => { setShowModal(false); setEditEmp(null); setForm(emptyForm) }

  const handleSave = () => {
    if (!form.name.trim()) return
    setEmployees(prev => prev.map(e => e.id === editEmp.id ? { ...e, ...form } : e))
    showToast(`${form.name} updated.`)
    closeModal()
  }

  const handleDelete = () => {
    setEmployees(prev => prev.filter(e => e.id !== deleteTarget.id))
    showToast(`${deleteTarget.name} removed.`, 'error')
    setDeleteTarget(null)
  }

  const field = (key) => ({ value: form[key], onChange: e => setForm(prev => ({ ...prev, [key]: e.target.value })) })

  const counts = {
    active:   employees.filter(e => e.status === 'Active').length,
    onLeave:  employees.filter(e => e.status === 'On Leave').length,
    inactive: employees.filter(e => e.status === 'Inactive').length,
  }

  return (
    <div className="p-margin-mobile md:p-margin-desktop">
      {/* Toast */}
      {toast && (
        <div className={`fixed top-20 right-6 z-50 flex items-center gap-md px-lg py-md rounded-xl shadow-lg border text-label-md font-bold transition-all ${
          toast.type === 'error'
            ? 'bg-error-container text-on-error-container border-error/30'
            : 'bg-secondary-container text-on-secondary-container border-secondary/30'
        }`}>
          <span className="material-symbols-outlined text-[20px]">{toast.type === 'error' ? 'person_off' : 'check_circle'}</span>
          {toast.message}
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
              <h3 className="text-headline-md">Remove Employee?</h3>
            </div>
            <p className="text-body-md text-on-surface-variant mb-xl">
              Are you sure you want to remove <strong>{deleteTarget.name}</strong> from the directory? This cannot be undone.
            </p>
            <div className="flex gap-sm justify-end">
              <button onClick={() => setDeleteTarget(null)} className="px-lg py-sm bg-surface-container border border-outline-variant text-on-surface rounded-lg text-label-md hover:bg-surface-container-high transition-all">Cancel</button>
              <button onClick={handleDelete} className="px-lg py-sm bg-error text-on-error rounded-lg text-label-md hover:opacity-90 transition-all">Remove</button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-margin-mobile">
          <div className="absolute inset-0 bg-on-background/40 backdrop-blur-sm" onClick={closeModal}></div>
          <div className="relative bg-surface-container-lowest w-full max-w-lg p-xl rounded-xl shadow-2xl border border-outline-variant">
            <div className="flex items-center justify-between mb-lg">
              <h3 className="text-headline-md font-bold">Edit Employee</h3>
              <button onClick={closeModal} className="p-2 hover:bg-surface-container rounded-full">
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>
            <div className="space-y-md">
              <div className="grid grid-cols-2 gap-md">
                <div className="space-y-xs col-span-2">
                  <label className="text-label-md text-on-surface">Full Name</label>
                  <input className="w-full border border-outline-variant rounded-lg py-md px-md text-body-md focus:ring-1 focus:ring-primary outline-none" type="text" {...field('name')} />
                </div>
                <div className="space-y-xs">
                  <label className="text-label-md text-on-surface">Email</label>
                  <input className="w-full border border-outline-variant rounded-lg py-md px-md text-body-md focus:ring-1 focus:ring-primary outline-none" type="email" {...field('email')} />
                </div>
                <div className="space-y-xs">
                  <label className="text-label-md text-on-surface">Phone</label>
                  <input className="w-full border border-outline-variant rounded-lg py-md px-md text-body-md focus:ring-1 focus:ring-primary outline-none" type="tel" {...field('phone')} />
                </div>
                <div className="space-y-xs">
                  <label className="text-label-md text-on-surface">Gender</label>
                  <select className="w-full border border-outline-variant rounded-lg py-md px-md text-body-md focus:ring-1 focus:ring-primary" {...field('gender')}>
                    <option>Male</option>
                    <option>Female</option>
                    <option>Other</option>
                  </select>
                </div>
                <div className="space-y-xs">
                  <label className="text-label-md text-on-surface">Department</label>
                  <select className="w-full border border-outline-variant rounded-lg py-md px-md text-body-md focus:ring-1 focus:ring-primary" {...field('dept')}>
                    <option>Human Resources</option>
                    <option>Engineering</option>
                    <option>Marketing</option>
                    <option>Sales</option>
                    <option>Finance</option>
                    <option>Operations</option>
                  </select>
                </div>
                <div className="space-y-xs">
                  <label className="text-label-md text-on-surface">Position</label>
                  <input className="w-full border border-outline-variant rounded-lg py-md px-md text-body-md focus:ring-1 focus:ring-primary outline-none" type="text" {...field('pos')} />
                </div>
                <div className="space-y-xs">
                  <label className="text-label-md text-on-surface">Status</label>
                  <select className="w-full border border-outline-variant rounded-lg py-md px-md text-body-md focus:ring-1 focus:ring-primary" {...field('status')}>
                    <option>Active</option>
                    <option>Inactive</option>
                    <option>On Leave</option>
                  </select>
                </div>
              </div>
            </div>
            <div className="flex justify-end gap-md pt-lg">
              <button onClick={closeModal} className="px-lg py-md text-on-surface-variant hover:bg-surface-container rounded-lg text-label-md">Cancel</button>
              <button onClick={handleSave} disabled={!form.name.trim()} className="px-xl py-md bg-primary text-on-primary text-label-md rounded-lg shadow-md hover:opacity-90 disabled:opacity-40 disabled:cursor-not-allowed">
                Save Changes
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="flex flex-col md:flex-row md:items-center justify-between mb-xl gap-md">
        <div>
          <h2 className="text-headline-lg text-on-surface">Employees</h2>
          <p className="text-body-md text-on-surface-variant">Manage organization directory and employee profiles</p>
        </div>
        <div className="flex flex-wrap items-center gap-sm">
          <button onClick={() => showToast('Exporting as Excel…')} className="flex items-center gap-xs px-md py-sm bg-surface-container-highest text-on-surface-variant border border-outline-variant rounded-lg text-label-md hover:bg-surface-container transition-all">
            <span className="material-symbols-outlined text-[18px]">download</span>
            Export Excel
          </button>
          <button onClick={() => showToast('Exporting as PDF…')} className="flex items-center gap-xs px-md py-sm bg-surface-container-highest text-on-surface-variant border border-outline-variant rounded-lg text-label-md hover:bg-surface-container transition-all">
            <span className="material-symbols-outlined text-[18px]">picture_as_pdf</span>
            Export PDF
          </button>
          <Link to="/employees/new" className="flex items-center gap-xs px-lg py-sm bg-primary text-on-primary rounded-lg text-label-md hover:brightness-110 active:scale-95 transition-all shadow-md">
            <span className="material-symbols-outlined text-[18px]">person_add</span>
            Add Employee
          </Link>
        </div>
      </div>

      {/* Filter Toolbar */}
      <div className="bg-surface-container-lowest border border-outline-variant rounded-xl p-md mb-lg shadow-sm">
        <div className="grid grid-cols-1 md:grid-cols-4 lg:grid-cols-5 gap-md">
          <div className="md:col-span-1 lg:col-span-2">
            <label className="text-label-sm text-on-surface-variant block mb-1">Search Directory</label>
            <div className="relative">
              <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant text-[18px]">search</span>
              <input
                className="w-full bg-background border border-outline-variant rounded-lg py-2 pl-10 pr-4 text-body-md focus:ring-2 focus:ring-primary outline-none"
                placeholder="Name, ID or Email..."
                type="text"
                value={search}
                onChange={e => setSearch(e.target.value)}
              />
            </div>
          </div>
          <div>
            <label className="text-label-sm text-on-surface-variant block mb-1">Department</label>
            <select className="w-full bg-background border border-outline-variant rounded-lg py-2 px-3 text-body-md focus:ring-2 focus:ring-primary" value={filterDept} onChange={e => setFilterDept(e.target.value)}>
              <option>All Departments</option>
              <option>Human Resources</option>
              <option>Engineering</option>
              <option>Marketing</option>
              <option>Sales</option>
              <option>Finance</option>
              <option>Operations</option>
            </select>
          </div>
          <div>
            <label className="text-label-sm text-on-surface-variant block mb-1">Position</label>
            <select className="w-full bg-background border border-outline-variant rounded-lg py-2 px-3 text-body-md focus:ring-2 focus:ring-primary" value={filterPos} onChange={e => setFilterPos(e.target.value)}>
              <option>All Positions</option>
              <option>HR Manager</option>
              <option>Senior Developer</option>
              <option>Head of Growth</option>
              <option>Accountant</option>
            </select>
          </div>
          <div>
            <label className="text-label-sm text-on-surface-variant block mb-1">Status</label>
            <select className="w-full bg-background border border-outline-variant rounded-lg py-2 px-3 text-body-md focus:ring-2 focus:ring-primary" value={filterStatus} onChange={e => setFilterStatus(e.target.value)}>
              <option>All Status</option>
              <option>Active</option>
              <option>Inactive</option>
              <option>On Leave</option>
            </select>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="bg-surface-container-lowest border border-outline-variant rounded-xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-surface-container text-on-surface-variant text-label-md uppercase tracking-wider">
                <th className="px-md py-4 font-bold border-b border-outline-variant">ID</th>
                <th className="px-md py-4 font-bold border-b border-outline-variant">Employee</th>
                <th className="px-md py-4 font-bold border-b border-outline-variant">Gender</th>
                <th className="px-md py-4 font-bold border-b border-outline-variant">Department</th>
                <th className="px-md py-4 font-bold border-b border-outline-variant">Position</th>
                <th className="px-md py-4 font-bold border-b border-outline-variant">Contact</th>
                <th className="px-md py-4 font-bold border-b border-outline-variant">Status</th>
                <th className="px-md py-4 font-bold border-b border-outline-variant text-center">Action</th>
              </tr>
            </thead>
            <tbody className="text-body-md text-on-surface divide-y divide-outline-variant">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-md py-xl text-center text-on-surface-variant text-body-md">
                    No employees match the current filters.
                  </td>
                </tr>
              ) : filtered.map(emp => (
                <tr key={emp.id} className="hover:bg-surface-container-low transition-colors">
                  <td className="px-md py-4 text-label-md font-bold">{emp.id}</td>
                  <td className="px-md py-4">
                    <div className="flex items-center gap-sm">
                      <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-sm border border-outline-variant">
                        {emp.name.split(' ').map(n => n[0]).join('')}
                      </div>
                      <div>
                        <p className="font-bold">{emp.name}</p>
                        <p className="text-label-sm text-on-surface-variant">{emp.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-md py-4">{emp.gender}</td>
                  <td className="px-md py-4">{emp.dept}</td>
                  <td className="px-md py-4">{emp.pos}</td>
                  <td className="px-md py-4">
                    <p className="text-label-sm">{emp.phone}</p>
                  </td>
                  <td className="px-md py-4">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-label-sm font-bold ${statusStyle[emp.status]}`}>
                      {emp.status}
                    </span>
                  </td>
                  <td className="px-md py-4">
                    <div className="flex items-center justify-center gap-2">
                      <Link to={`/employees/${emp.id.replace('#', '')}`} className="p-1 hover:bg-surface-container rounded-lg text-primary transition-all">
                        <span className="material-symbols-outlined text-[20px]">visibility</span>
                      </Link>
                      <button onClick={() => openEdit(emp)} className="p-1 hover:bg-surface-container rounded-lg text-outline transition-all">
                        <span className="material-symbols-outlined text-[20px]">edit</span>
                      </button>
                      <button onClick={() => setDeleteTarget(emp)} className="p-1 hover:bg-error-container/20 rounded-lg text-error transition-all">
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
            {search || filterDept !== 'All Departments' || filterPos !== 'All Positions' || filterStatus !== 'All Status'
              ? `${filtered.length} result${filtered.length !== 1 ? 's' : ''} found`
              : `Showing ${employees.length} of ${employees.length} employees`}
          </p>
          <div className="flex space-x-sm">
            <button className="p-1 rounded hover:bg-surface-container transition-colors opacity-30" disabled>
              <span className="material-symbols-outlined">chevron_left</span>
            </button>
            <button className="px-3 py-1 rounded bg-primary text-on-primary text-label-sm">1</button>
            <button className="px-3 py-1 rounded hover:bg-surface-container text-label-sm">2</button>
            <button className="px-3 py-1 rounded hover:bg-surface-container text-label-sm">3</button>
            <button className="p-1 rounded hover:bg-surface-container transition-colors">
              <span className="material-symbols-outlined">chevron_right</span>
            </button>
          </div>
        </div>
      </div>

      {/* Bottom Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-gutter mt-lg">
        {[
          { label: 'Total Headcount', val: employees.length,  icon: 'group',        color: 'text-primary bg-primary/10' },
          { label: 'Active',          val: counts.active,     icon: 'person_check', color: 'text-secondary bg-secondary/10' },
          { label: 'On Leave',        val: counts.onLeave,    icon: 'event_busy',   color: 'text-tertiary bg-tertiary/10' },
          { label: 'Inactive',        val: counts.inactive,   icon: 'person_off',   color: 'text-error bg-error/10' },
        ].map(s => (
          <div key={s.label} className="bg-surface-container-lowest border border-outline-variant p-lg rounded-xl flex items-center gap-md shadow-sm">
            <div className={`w-10 h-10 rounded-full flex items-center justify-center ${s.color}`}>
              <span className="material-symbols-outlined">{s.icon}</span>
            </div>
            <div>
              <p className="text-label-sm text-on-surface-variant uppercase tracking-wider">{s.label}</p>
              <p className="text-headline-md font-bold mt-xs">{s.val}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
