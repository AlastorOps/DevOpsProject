import { useState, useEffect, useCallback } from 'react'
import { positionService } from '../../api/positions.js'
import { departmentService } from '../../api/departments.js'

export default function Positions() {
  const [positions, setPositions]     = useState([])
  const [total, setTotal]             = useState(0)
  const [departments, setDepartments] = useState([])
  const [loading, setLoading]         = useState(true)
  const [showModal, setShowModal]     = useState(false)
  const [editPos, setEditPos]         = useState(null)
  const [deleteTarget, setDeleteTarget] = useState(null)
  const [search, setSearch]           = useState('')
  const [filterDept, setFilterDept]   = useState('')
  const [filterLevel, setFilterLevel] = useState('')
  const [form, setForm]               = useState({ title: '', department_id: '', level: '', salary_min: '', salary_max: '', headcount: '', openings: '' })
  const [toast, setToast]             = useState(null)
  const [saving, setSaving]           = useState(false)

  const showToast = (msg, type = 'success') => { setToast({ message: msg, type }); setTimeout(() => setToast(null), 3000) }

  const fetchData = useCallback(async () => {
    setLoading(true)
    try {
      const [pRes, dRes] = await Promise.all([
        positionService.list({ limit: 100, search, dept: filterDept, level: filterLevel }),
        departmentService.list({ limit: 100 }),
      ])
      if (pRes.ok) { const d = await pRes.json(); setPositions(d.positions || []); setTotal(d.total || 0) }
      if (dRes.ok) { const d = await dRes.json(); setDepartments(d.departments || []) }
    } catch { /* ignore */ }
    setLoading(false)
  }, [search, filterDept, filterLevel])

  useEffect(() => { const t = setTimeout(fetchData, search ? 300 : 0); return () => clearTimeout(t) }, [fetchData, search])

  const openAdd = () => { setEditPos(null); setForm({ title: '', department_id: '', level: '', salary_min: '', salary_max: '', headcount: '0', openings: '0' }); setShowModal(true) }
  const openEdit = (pos) => {
    setEditPos(pos)
    setForm({ title: pos.title, department_id: pos.department_id ? String(pos.department_id) : '', level: pos.level ?? '', salary_min: pos.salary_min ? String(pos.salary_min) : '', salary_max: pos.salary_max ? String(pos.salary_max) : '', headcount: String(pos.headcount ?? 0), openings: String(pos.openings ?? 0) })
    setShowModal(true)
  }
  const closeModal = () => { setShowModal(false); setEditPos(null) }

  const handleSave = async () => {
    if (!form.title.trim()) return
    setSaving(true)
    try {
      const payload = {
        title: form.title.trim(),
        department_id: form.department_id ? Number(form.department_id) : null,
        level: form.level || null,
        salary_min: form.salary_min ? Number(form.salary_min) : null,
        salary_max: form.salary_max ? Number(form.salary_max) : null,
        headcount: Number(form.headcount) || 0,
        openings: Number(form.openings) || 0,
      }
      const res = editPos ? await positionService.update(editPos.id, payload) : await positionService.create(payload)
      if (res.ok || res.status === 201) {
        showToast(editPos ? `${form.title} updated.` : `${form.title} created.`)
        closeModal(); fetchData()
      } else {
        const err = await res.json().catch(() => ({}))
        showToast(err.detail || 'Save failed.', 'error')
      }
    } catch { showToast('Network error.', 'error') }
    setSaving(false)
  }

  const handleDelete = async () => {
    try {
      const res = await positionService.remove(deleteTarget.id)
      if (res.ok || res.status === 204) {
        showToast(`${deleteTarget.title} deleted.`, 'error'); setDeleteTarget(null); fetchData()
      } else {
        const err = await res.json().catch(() => ({}))
        showToast(err.detail || 'Delete failed.', 'error')
      }
    } catch { showToast('Network error.', 'error') }
  }

  const f = (key) => ({ value: form[key], onChange: e => setForm(prev => ({ ...prev, [key]: e.target.value })) })

  const levels = ['Junior', 'Mid', 'Senior', 'Lead', 'Manager', 'Director']

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
          <div className="bg-surface-container-lowest border border-outline-variant rounded-2xl p-xl shadow-2xl w-full max-w-lg">
            <h3 className="text-headline-md mb-lg">{editPos ? 'Edit Position' : 'New Position'}</h3>
            <div className="grid grid-cols-2 gap-md">
              <div className="col-span-2 flex flex-col gap-xs">
                <label className="text-label-md text-on-surface-variant">Title <span className="text-error">*</span></label>
                <input autoFocus className="bg-surface border border-outline-variant rounded-lg p-md text-body-md focus:ring-1 focus:ring-primary outline-none" placeholder="e.g. Senior Developer" {...f('title')} />
              </div>
              <div className="flex flex-col gap-xs">
                <label className="text-label-md text-on-surface-variant">Department</label>
                <select className="bg-surface border border-outline-variant rounded-lg p-md text-body-md focus:ring-1 focus:ring-primary" {...f('department_id')}>
                  <option value="">None</option>
                  {departments.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
                </select>
              </div>
              <div className="flex flex-col gap-xs">
                <label className="text-label-md text-on-surface-variant">Level</label>
                <select className="bg-surface border border-outline-variant rounded-lg p-md text-body-md focus:ring-1 focus:ring-primary" {...f('level')}>
                  <option value="">None</option>
                  {levels.map(l => <option key={l}>{l}</option>)}
                </select>
              </div>
              <div className="flex flex-col gap-xs">
                <label className="text-label-md text-on-surface-variant">Min Salary ($)</label>
                <input type="number" className="bg-surface border border-outline-variant rounded-lg p-md text-body-md focus:ring-1 focus:ring-primary outline-none" placeholder="0" {...f('salary_min')} />
              </div>
              <div className="flex flex-col gap-xs">
                <label className="text-label-md text-on-surface-variant">Max Salary ($)</label>
                <input type="number" className="bg-surface border border-outline-variant rounded-lg p-md text-body-md focus:ring-1 focus:ring-primary outline-none" placeholder="0" {...f('salary_max')} />
              </div>
              <div className="flex flex-col gap-xs">
                <label className="text-label-md text-on-surface-variant">Headcount</label>
                <input type="number" className="bg-surface border border-outline-variant rounded-lg p-md text-body-md focus:ring-1 focus:ring-primary outline-none" placeholder="0" {...f('headcount')} />
              </div>
              <div className="flex flex-col gap-xs">
                <label className="text-label-md text-on-surface-variant">Open Positions</label>
                <input type="number" className="bg-surface border border-outline-variant rounded-lg p-md text-body-md focus:ring-1 focus:ring-primary outline-none" placeholder="0" {...f('openings')} />
              </div>
            </div>
            <div className="flex gap-sm justify-end mt-xl">
              <button onClick={closeModal} className="px-lg py-sm bg-surface-container border border-outline-variant text-on-surface rounded-lg text-label-md">Cancel</button>
              <button onClick={handleSave} disabled={!form.title.trim() || saving} className="px-lg py-sm bg-primary text-on-primary rounded-lg text-label-md disabled:opacity-50">{saving ? 'Saving…' : editPos ? 'Save Changes' : 'Create'}</button>
            </div>
          </div>
        </div>
      )}

      {deleteTarget && (
        <div className="fixed inset-0 z-50 bg-on-background/40 backdrop-blur-sm flex items-center justify-center p-margin-mobile">
          <div className="bg-surface-container-lowest border border-outline-variant rounded-2xl p-xl shadow-2xl max-w-md w-full">
            <div className="flex items-center gap-md mb-md">
              <div className="w-12 h-12 rounded-full bg-error/10 flex items-center justify-center shrink-0"><span className="material-symbols-outlined text-error">warning</span></div>
              <h3 className="text-headline-md">Delete Position?</h3>
            </div>
            <p className="text-body-md text-on-surface-variant mb-xl">Delete <strong>{deleteTarget.title}</strong>? This cannot be undone.</p>
            <div className="flex gap-sm justify-end">
              <button onClick={() => setDeleteTarget(null)} className="px-lg py-sm bg-surface-container border border-outline-variant text-on-surface rounded-lg text-label-md">Cancel</button>
              <button onClick={handleDelete} className="px-lg py-sm bg-error text-on-error rounded-lg text-label-md hover:opacity-90">Delete</button>
            </div>
          </div>
        </div>
      )}

      <div className="flex flex-col md:flex-row md:items-center justify-between mb-xl gap-md">
        <div>
          <h2 className="text-headline-lg text-on-surface">Positions</h2>
          <p className="text-body-md text-on-surface-variant">{total} position{total !== 1 ? 's' : ''} defined</p>
        </div>
        <button onClick={openAdd} className="flex items-center gap-xs px-lg py-sm bg-primary text-on-primary rounded-lg text-label-md hover:brightness-110 active:scale-95 transition-all shadow-md">
          <span className="material-symbols-outlined text-[18px]">add</span>
          New Position
        </button>
      </div>

      {/* Filters */}
      <div className="bg-surface-container-lowest border border-outline-variant rounded-xl p-md mb-lg shadow-sm flex flex-wrap gap-md">
        <div className="flex-1 min-w-[200px] relative">
          <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-outline text-[18px]">search</span>
          <input className="w-full bg-background border border-outline-variant rounded-lg py-2 pl-10 pr-4 text-body-md focus:ring-2 focus:ring-primary outline-none" placeholder="Search positions…" value={search} onChange={e => setSearch(e.target.value)} />
        </div>
        <select className="bg-background border border-outline-variant rounded-lg py-2 px-3 text-body-md" value={filterDept} onChange={e => setFilterDept(e.target.value)}>
          <option value="">All Departments</option>
          {departments.map(d => <option key={d.id} value={d.name}>{d.name}</option>)}
        </select>
        <select className="bg-background border border-outline-variant rounded-lg py-2 px-3 text-body-md" value={filterLevel} onChange={e => setFilterLevel(e.target.value)}>
          <option value="">All Levels</option>
          {['Junior', 'Mid', 'Senior', 'Lead', 'Manager', 'Director'].map(l => <option key={l}>{l}</option>)}
        </select>
      </div>

      {loading ? (
        <div className="flex items-center justify-center h-32"><span className="material-symbols-outlined text-primary text-[40px]" style={{ animation: 'spin 1s linear infinite' }}>progress_activity</span></div>
      ) : (
        <div className="bg-surface-container-lowest border border-outline-variant rounded-xl overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-surface-container text-on-surface-variant text-label-md uppercase tracking-wider">
                  {['Title', 'Department', 'Level', 'Salary Range', 'Headcount', 'Openings', 'Actions'].map(h => <th key={h} className="px-lg py-md font-bold border-b border-outline-variant">{h}</th>)}
                </tr>
              </thead>
              <tbody className="divide-y divide-outline-variant text-body-md">
                {positions.length === 0 ? (
                  <tr><td colSpan={7} className="px-lg py-xl text-center text-on-surface-variant">No positions found.</td></tr>
                ) : positions.map(pos => (
                  <tr key={pos.id} className="hover:bg-surface-container-low transition-colors">
                    <td className="px-lg py-md font-bold">{pos.title}</td>
                    <td className="px-lg py-md">{pos.department?.name ?? '—'}</td>
                    <td className="px-lg py-md">
                      {pos.level ? <span className="px-2 py-0.5 bg-surface-container text-on-surface-variant rounded-full text-label-sm">{pos.level}</span> : '—'}
                    </td>
                    <td className="px-lg py-md text-on-surface-variant">
                      {pos.salary_min && pos.salary_max ? `$${Number(pos.salary_min).toLocaleString()} – $${Number(pos.salary_max).toLocaleString()}` : '—'}
                    </td>
                    <td className="px-lg py-md">{pos.headcount}</td>
                    <td className="px-lg py-md">
                      <span className={`font-bold ${pos.openings > 0 ? 'text-secondary' : 'text-on-surface-variant'}`}>{pos.openings}</span>
                    </td>
                    <td className="px-lg py-md">
                      <div className="flex items-center gap-2">
                        <button onClick={() => openEdit(pos)} className="p-1 hover:bg-surface-container rounded-lg text-outline transition-all"><span className="material-symbols-outlined text-[20px]">edit</span></button>
                        <button onClick={() => setDeleteTarget(pos)} className="p-1 hover:bg-error-container/20 rounded-lg text-error transition-all"><span className="material-symbols-outlined text-[20px]">delete</span></button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  )
}
