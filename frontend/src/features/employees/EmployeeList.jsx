import { useState, useEffect, useCallback } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { employeeService } from '../../api/employees.js'
import { departmentService } from '../../api/departments.js'
import { positionService } from '../../api/positions.js'

const statusStyle = {
  Active:     'bg-secondary-container text-on-secondary-container',
  Inactive:   'bg-error-container text-on-error-container',
  'On Leave': 'bg-tertiary-fixed text-on-tertiary-fixed',
}

export default function EmployeeList() {
  const [searchParams] = useSearchParams()
  const [employees, setEmployees]       = useState([])
  const [total, setTotal]               = useState(0)
  const [page, setPage]                 = useState(1)
  const [departments, setDepartments]   = useState([])
  const [search, setSearch]             = useState(() => searchParams.get('q') ?? '')
  const [filterDept, setFilterDept]     = useState('')
  const [filterStatus, setFilterStatus] = useState('')
  const [loading, setLoading]           = useState(true)
  const [showModal, setShowModal]       = useState(false)
  const [editEmp, setEditEmp]           = useState(null)
  const [form, setForm]                 = useState({})
  const [positions, setPositions]       = useState([])
  const [deleteTarget, setDeleteTarget] = useState(null)
  const [toast, setToast]               = useState(null)
  const [totalHeadcount, setTotalHeadcount] = useState(0)
  const [activeCount, setActiveCount]       = useState(0)
  const [onLeaveCount, setOnLeaveCount]     = useState(0)
  const [inactiveCount, setInactiveCount]   = useState(0)
  const limit = 10

  const showToast = (message, type = 'success') => {
    setToast({ message, type })
    setTimeout(() => setToast(null), 3000)
  }

  const fetchEmployees = useCallback(async () => {
    setLoading(true)
    try {
      const res = await employeeService.list({ page, limit, search, dept: filterDept, status: filterStatus })
      if (res.ok) {
        const d = await res.json()
        setEmployees(d.employees)
        setTotal(d.total)
      }
    } catch { /* ignore */ }
    setLoading(false)
  }, [page, search, filterDept, filterStatus])

  const fetchDepartments = useCallback(async () => {
    try {
      const res = await departmentService.list({ limit: 100 })
      if (res.ok) { const d = await res.json(); setDepartments(d.departments || []) }
    } catch { /* ignore */ }
  }, [])

  const fetchPositions = useCallback(async (deptId) => {
    try {
      const res = await positionService.list({ limit: 100, dept: deptId || '' })
      if (res.ok) { const d = await res.json(); setPositions(d.positions || []) }
    } catch { /* ignore */ }
  }, [])

  const fetchCounts = useCallback(async () => {
    try {
      const [allRes, aRes, lRes, iRes] = await Promise.all([
        employeeService.list({ limit: 1 }),
        employeeService.list({ limit: 1, status: 'Active' }),
        employeeService.list({ limit: 1, status: 'On Leave' }),
        employeeService.list({ limit: 1, status: 'Inactive' }),
      ])
      if (allRes.ok) { const d = await allRes.json(); setTotalHeadcount(d.total) }
      if (aRes.ok)   { const d = await aRes.json();   setActiveCount(d.total) }
      if (lRes.ok)   { const d = await lRes.json();   setOnLeaveCount(d.total) }
      if (iRes.ok)   { const d = await iRes.json();   setInactiveCount(d.total) }
    } catch { /* ignore */ }
  }, [])

  useEffect(() => { fetchDepartments(); fetchCounts() }, [fetchDepartments, fetchCounts])

  useEffect(() => {
    const timer = setTimeout(() => fetchEmployees(), search ? 300 : 0)
    return () => clearTimeout(timer)
  }, [fetchEmployees, search])

  const openEdit = (emp) => {
    setEditEmp(emp)
    setForm({
      name: emp.name, phone: emp.phone ?? '', gender: emp.gender ?? 'Male',
      department_id: emp.department_id ? String(emp.department_id) : '',
      position_id: emp.position_id ? String(emp.position_id) : '',
      status: emp.status, work_email: emp.work_email ?? '',
    })
    fetchPositions(emp.department_id)
    setShowModal(true)
  }

  const closeModal = () => { setShowModal(false); setEditEmp(null); setForm({}) }

  const handleSave = async () => {
    if (!form.name?.trim()) return
    try {
      const res = await employeeService.update(editEmp.id, {
        name: form.name, phone: form.phone || null, gender: form.gender,
        department_id: form.department_id ? Number(form.department_id) : null,
        position_id: form.position_id ? Number(form.position_id) : null,
        status: form.status,
      })
      if (res.ok) {
        showToast(`${form.name} updated.`)
        closeModal()
        fetchEmployees()
        fetchCounts()
      } else {
        const err = await res.json().catch(() => ({}))
        showToast(err.detail || 'Update failed.', 'error')
      }
    } catch { showToast('Network error.', 'error') }
  }

  const handleDelete = async () => {
    try {
      const res = await employeeService.remove(deleteTarget.id)
      if (res.ok || res.status === 204) {
        showToast(`${deleteTarget.name} removed.`, 'error')
        setDeleteTarget(null)
        fetchEmployees()
        fetchCounts()
      } else {
        const err = await res.json().catch(() => ({}))
        showToast(err.detail || 'Delete failed.', 'error')
      }
    } catch { showToast('Network error.', 'error') }
  }

  const field = (key) => ({ value: form[key] ?? '', onChange: e => setForm(prev => ({ ...prev, [key]: e.target.value })) })

  const totalPages = Math.max(1, Math.ceil(total / limit))

  return (
    <div className="p-margin-mobile md:p-margin-desktop">
      {toast && (
        <div className={`fixed top-20 right-6 z-50 flex items-center gap-md px-lg py-md rounded-xl shadow-lg border text-label-md font-bold transition-all ${toast.type === 'error' ? 'bg-error-container text-on-error-container border-error/30' : 'bg-secondary-container text-on-secondary-container border-secondary/30'}`}>
          <span className="material-symbols-outlined text-[20px]">{toast.type === 'error' ? 'person_off' : 'check_circle'}</span>
          {toast.message}
        </div>
      )}

      {deleteTarget && (
        <div className="fixed inset-0 z-50 bg-on-background/40 backdrop-blur-sm flex items-center justify-center p-margin-mobile">
          <div className="bg-surface-container-lowest border border-outline-variant rounded-2xl p-xl shadow-2xl max-w-md w-full">
            <div className="flex items-center gap-md mb-md">
              <div className="w-12 h-12 rounded-full bg-error/10 flex items-center justify-center shrink-0"><span className="material-symbols-outlined text-error">person_off</span></div>
              <div>
                <h3 className="text-headline-md">Remove Employee?</h3>
                <p className="text-label-sm text-on-surface-variant">{deleteTarget.emp_id}</p>
              </div>
            </div>
            <div className="bg-surface-container rounded-lg p-md space-y-xs text-body-md mb-md">
              <div className="flex justify-between"><span className="text-on-surface-variant">Name</span><span className="font-bold">{deleteTarget.name}</span></div>
              <div className="flex justify-between"><span className="text-on-surface-variant">Department</span><span className="font-bold">{deleteTarget.department?.name ?? '—'}</span></div>
              <div className="flex justify-between"><span className="text-on-surface-variant">Position</span><span className="font-bold">{deleteTarget.position?.title ?? '—'}</span></div>
              <div className="flex justify-between"><span className="text-on-surface-variant">Status</span><span className="font-bold">{deleteTarget.status}</span></div>
            </div>
            <div className="bg-error/10 border border-error/20 rounded-lg p-md mb-xl flex gap-sm">
              <span className="material-symbols-outlined text-error shrink-0 text-[20px]">warning</span>
              <div className="text-label-sm text-on-surface-variant space-y-xs">
                <p className="font-bold text-error">This action is permanent and cannot be undone.</p>
                <p>All records associated with this employee will be deleted, including:</p>
                <ul className="list-disc list-inside space-y-0.5 mt-xs">
                  <li>Attendance history</li>
                  <li>Payroll records</li>
                  <li>Leave requests &amp; balances</li>
                  <li>Performance reviews</li>
                  <li>Login account (if linked)</li>
                </ul>
              </div>
            </div>
            <div className="flex gap-sm justify-end">
              <button onClick={() => setDeleteTarget(null)} className="px-lg py-sm bg-surface-container border border-outline-variant text-on-surface rounded-lg text-label-md hover:bg-surface-container-high transition-all">Cancel</button>
              <button onClick={handleDelete} className="px-lg py-sm bg-error text-on-error rounded-lg text-label-md hover:opacity-90 transition-all">Remove Permanently</button>
            </div>
          </div>
        </div>
      )}

      {showModal && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-margin-mobile">
          <div className="absolute inset-0 bg-on-background/40 backdrop-blur-sm" onClick={closeModal}></div>
          <div className="relative bg-surface-container-lowest w-full max-w-lg p-xl rounded-xl shadow-2xl border border-outline-variant">
            <div className="flex items-center justify-between mb-lg">
              <h3 className="text-headline-md font-bold">Edit Employee</h3>
              <button onClick={closeModal} className="p-2 hover:bg-surface-container rounded-full"><span className="material-symbols-outlined">close</span></button>
            </div>
            <div className="space-y-md">
              <div className="grid grid-cols-2 gap-md">
                <div className="space-y-xs col-span-2">
                  <label className="text-label-md text-on-surface">Full Name</label>
                  <input className="w-full border border-outline-variant rounded-lg py-md px-md text-body-md focus:ring-1 focus:ring-primary outline-none" type="text" {...field('name')} />
                </div>
                <div className="space-y-xs">
                  <label className="text-label-md text-on-surface">Phone</label>
                  <input className="w-full border border-outline-variant rounded-lg py-md px-md text-body-md focus:ring-1 focus:ring-primary outline-none" type="tel" {...field('phone')} />
                </div>
                <div className="space-y-xs">
                  <label className="text-label-md text-on-surface">Gender</label>
                  <select className="w-full border border-outline-variant rounded-lg py-md px-md text-body-md focus:ring-1 focus:ring-primary" {...field('gender')}>
                    <option>Male</option><option>Female</option><option>Other</option>
                  </select>
                </div>
                <div className="space-y-xs">
                  <label className="text-label-md text-on-surface">Department</label>
                  <select
                    className="w-full border border-outline-variant rounded-lg py-md px-md text-body-md focus:ring-1 focus:ring-primary"
                    value={form.department_id ?? ''}
                    onChange={e => {
                      const newDeptId = e.target.value
                      setForm(prev => ({ ...prev, department_id: newDeptId, position_id: '' }))
                      fetchPositions(newDeptId)
                    }}
                  >
                    <option value="">None</option>
                    {departments.map(d => <option key={d.id} value={String(d.id)}>{d.name}</option>)}
                  </select>
                </div>
                <div className="space-y-xs">
                  <label className="text-label-md text-on-surface">Position</label>
                  <select className="w-full border border-outline-variant rounded-lg py-md px-md text-body-md focus:ring-1 focus:ring-primary" {...field('position_id')}>
                    <option value="">None</option>
                    {positions.map(p => <option key={p.id} value={String(p.id)}>{p.title}</option>)}
                  </select>
                </div>
                <div className="space-y-xs">
                  <label className="text-label-md text-on-surface">Status</label>
                  <select className="w-full border border-outline-variant rounded-lg py-md px-md text-body-md focus:ring-1 focus:ring-primary" {...field('status')}>
                    <option>Active</option><option>Inactive</option><option>On Leave</option>
                  </select>
                </div>
              </div>
            </div>
            <div className="flex justify-end gap-md pt-lg">
              <button onClick={closeModal} className="px-lg py-md text-on-surface-variant hover:bg-surface-container rounded-lg text-label-md">Cancel</button>
              <button onClick={handleSave} disabled={!form.name?.trim()} className="px-xl py-md bg-primary text-on-primary text-label-md rounded-lg shadow-md hover:opacity-90 disabled:opacity-40 disabled:cursor-not-allowed">Save Changes</button>
            </div>
          </div>
        </div>
      )}

      <div className="flex flex-col md:flex-row md:items-center justify-between mb-md gap-md">
        <div>
          <h2 className="text-headline-lg text-on-surface">Employees</h2>
          <p className="text-body-md text-on-surface-variant">Manage organization directory and employee profiles</p>
        </div>
        <div className="flex flex-wrap items-center gap-sm">
          <Link to="/employees/new" className="flex items-center gap-xs px-lg py-sm bg-primary text-on-primary rounded-lg text-label-md hover:brightness-110 active:scale-95 transition-all shadow-md">
            <span className="material-symbols-outlined text-[18px]">person_add</span>
            Add Employee
          </Link>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-gutter mb-lg">
        {[
          { label: 'Total Headcount', val: totalHeadcount, icon: 'group',        color: 'text-primary bg-primary/10' },
          { label: 'Active',          val: activeCount,   icon: 'person_check', color: 'text-secondary bg-secondary/10' },
          { label: 'On Leave',        val: onLeaveCount,  icon: 'event_busy',   color: 'text-tertiary bg-tertiary/10' },
          { label: 'Inactive',        val: inactiveCount, icon: 'person_off',   color: 'text-error bg-error/10' },
        ].map(s => (
          <div key={s.label} className="bg-surface-container-lowest border border-outline-variant p-lg rounded-xl flex items-center gap-md shadow-sm">
            <div className={`w-10 h-10 rounded-full flex items-center justify-center ${s.color}`}><span className="material-symbols-outlined">{s.icon}</span></div>
            <div>
              <p className="text-label-sm text-on-surface-variant uppercase tracking-wider">{s.label}</p>
              <p className="text-headline-md font-bold mt-xs">{s.val}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Search */}
      <div className="flex items-center gap-sm bg-surface-container-lowest border border-outline-variant rounded-xl px-md py-sm shadow-sm focus-within:border-primary transition-all mb-lg">
        <span className="material-symbols-outlined text-on-surface-variant text-[20px]">search</span>
        <input className="flex-1 bg-transparent outline-none text-body-md placeholder:text-on-surface-variant" placeholder="Search by name, ID or email…" type="text" value={search} onChange={e => { setSearch(e.target.value); setPage(1) }} />
        {search && <button onClick={() => { setSearch(''); setPage(1) }} className="text-on-surface-variant hover:text-on-surface transition-colors"><span className="material-symbols-outlined text-[18px]">close</span></button>}
      </div>

      {/* Filters */}
      <div className="bg-surface-container-lowest border border-outline-variant rounded-xl p-md mb-lg shadow-sm">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-md">
          <div>
            <label className="text-label-sm text-on-surface-variant block mb-1">Department</label>
            <select className="w-full bg-background border border-outline-variant rounded-lg py-2 px-3 text-body-md focus:ring-2 focus:ring-primary" value={filterDept} onChange={e => { setFilterDept(e.target.value); setPage(1) }}>
              <option value="">All Departments</option>
              {departments.map(d => <option key={d.id} value={d.name}>{d.name}</option>)}
            </select>
          </div>
          <div>
            <label className="text-label-sm text-on-surface-variant block mb-1">Status</label>
            <select className="w-full bg-background border border-outline-variant rounded-lg py-2 px-3 text-body-md focus:ring-2 focus:ring-primary" value={filterStatus} onChange={e => { setFilterStatus(e.target.value); setPage(1) }}>
              <option value="">All Status</option>
              <option>Active</option><option>Inactive</option><option>On Leave</option>
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
                {['ID', 'Employee', 'Gender', 'Department', 'Position', 'Contact', 'Status', 'Action'].map(h => (
                  <th key={h} className={`px-md py-4 font-bold border-b border-outline-variant${h === 'Action' ? ' w-32 text-center' : ''}`}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="text-body-md text-on-surface divide-y divide-outline-variant">
              {loading ? (
                <tr><td colSpan={8} className="px-md py-xl text-center text-on-surface-variant">Loading…</td></tr>
              ) : employees.length === 0 ? (
                <tr><td colSpan={8} className="px-md py-xl text-center text-on-surface-variant">No employees match the current filters.</td></tr>
              ) : employees.map(emp => (
                <tr key={emp.id} className="hover:bg-surface-container-low transition-colors">
                  <td className="px-md py-4 text-label-md font-bold">{emp.emp_id}</td>
                  <td className="px-md py-4">
                    <div className="flex items-center gap-sm">
                      {emp.photo_path
                        ? <img src={`/uploads/${emp.photo_path}`} alt={emp.name} className="w-10 h-10 rounded-full object-cover border border-outline-variant shrink-0" />
                        : <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-sm border border-outline-variant shrink-0">{emp.name.split(' ').map(n => n[0]).join('')}</div>
                      }
                      <div><p className="font-bold">{emp.name}</p><p className="text-label-sm text-on-surface-variant">{emp.work_email ?? emp.personal_email ?? '—'}</p></div>
                    </div>
                  </td>
                  <td className="px-md py-4">{emp.gender ?? '—'}</td>
                  <td className="px-md py-4">{emp.department?.name ?? '—'}</td>
                  <td className="px-md py-4">{emp.position?.title ?? '—'}</td>
                  <td className="px-md py-4"><p className="text-label-sm">{emp.phone ?? '—'}</p></td>
                  <td className="px-md py-4">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-label-sm font-bold ${statusStyle[emp.status] ?? 'bg-surface-container text-on-surface-variant'}`}>{emp.status}</span>
                  </td>
                  <td className="px-md py-4 w-32">
                    <div className="flex items-center justify-center gap-2">
                      <Link to={`/employees/${emp.id}`} className="p-1 flex items-center justify-center hover:bg-surface-container rounded-lg text-primary transition-all"><span className="material-symbols-outlined text-[20px]">visibility</span></Link>
                      <button onClick={() => openEdit(emp)} className="p-1 flex items-center justify-center hover:bg-surface-container rounded-lg text-outline transition-all"><span className="material-symbols-outlined text-[20px]">edit</span></button>
                      <button onClick={() => setDeleteTarget(emp)} className="p-1 flex items-center justify-center hover:bg-error-container/20 rounded-lg text-error transition-all"><span className="material-symbols-outlined text-[20px]">delete</span></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="p-md bg-surface-container-low flex flex-col gap-md sm:flex-row sm:items-center sm:justify-between border-t border-outline-variant">
          <p className="text-label-sm text-on-surface-variant">Showing {employees.length} of {total} employees</p>
          <div className="flex space-x-sm">
            <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1} className="p-1 rounded hover:bg-surface-container transition-colors disabled:opacity-30"><span className="material-symbols-outlined">chevron_left</span></button>
            {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => i + 1).map(p => (
              <button key={p} onClick={() => setPage(p)} className={`px-3 py-1 rounded text-label-sm ${p === page ? 'bg-primary text-on-primary' : 'hover:bg-surface-container'}`}>{p}</button>
            ))}
            <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page >= totalPages} className="p-1 rounded hover:bg-surface-container transition-colors disabled:opacity-30"><span className="material-symbols-outlined">chevron_right</span></button>
          </div>
        </div>
      </div>
    </div>
  )
}
