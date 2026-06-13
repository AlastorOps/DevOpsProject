import { useState, useEffect, useCallback } from 'react'
import { Link } from 'react-router-dom'
import { payrollService } from '../../api/payroll.js'
import { employeeService } from '../../api/employees.js'
import EmployeeCombobox from '../../components/ui/EmployeeCombobox.jsx'

const statusStyle = {
  Paid:    'bg-secondary-container/20 text-secondary',
  Pending: 'bg-tertiary-container/20 text-tertiary',
}

const fmt = (n) => '$' + Number(n || 0).toLocaleString('en-US', { minimumFractionDigits: 2 })

export default function PayrollManagement() {
  const [records, setRecords]         = useState([])
  const [stats, setStats]             = useState(null)
  const [employees, setEmployees]     = useState([])
  const [empLoading, setEmpLoading]   = useState(false)
  const [total, setTotal]             = useState(0)
  const [loading, setLoading]         = useState(true)
  const [activeTab, setActiveTab]     = useState('all')
  const [showModal, setShowModal]     = useState(false)
  const [form, setForm]               = useState({ employee_id: '', month: '', basic: '', bonus: '0', deductions: '0' })
  const [formErrors, setFormErrors]   = useState({})
  const [toast, setToast]             = useState(null)
  const [saving, setSaving]           = useState(false)
  const [page, setPage]               = useState(1)
  const [search, setSearch]           = useState('')
  const [deleteTarget, setDeleteTarget] = useState(null)
  const limit = 10

  const showToast = (message, type = 'success') => { setToast({ message, type }); setTimeout(() => setToast(null), 3000) }

  const fetchData = useCallback(async () => {
    setLoading(true)
    try {
      const status = activeTab === 'paid' ? 'Paid' : activeTab === 'pending' ? 'Pending' : ''
      const [rRes, sRes] = await Promise.all([
        payrollService.list({ page, limit, status, search }),
        payrollService.stats(),
      ])
      if (rRes.ok) { const d = await rRes.json(); setRecords(d.records || []); setTotal(d.total || 0) }
      if (sRes.ok) setStats(await sRes.json())
    } catch { /* ignore */ }
    setLoading(false)
  }, [page, activeTab, search])

  const fetchEmployees = useCallback(async () => {
    setEmpLoading(true)
    try {
      const res = await employeeService.list({ limit: 500, status: 'Active' })
      if (res.ok) {
        const d = await res.json()
        setEmployees(d.employees || [])
      } else {
        showToast('Failed to load employee list.', 'error')
      }
    } catch {
      showToast('Could not reach the server.', 'error')
    } finally {
      setEmpLoading(false)
    }
  }, [])

  useEffect(() => { const t = setTimeout(fetchData, search ? 300 : 0); return () => clearTimeout(t) }, [fetchData, search])
  useEffect(() => { fetchEmployees() }, [fetchEmployees])

  useEffect(() => {
    if (showModal && employees.length === 0) fetchEmployees()
  }, [showModal]) // eslint-disable-line react-hooks/exhaustive-deps

  const closeModal = () => {
    setShowModal(false)
    setForm({ employee_id: '', month: '', basic: '', bonus: '0', deductions: '0' })
    setFormErrors({})
  }

  // Real-time validation helpers
  const basic     = Number(form.basic) || 0
  const bonus     = Number(form.bonus) || 0
  const deductions = Number(form.deductions) || 0
  const net       = basic + bonus - deductions

  const validateForm = () => {
    const errs = {}
    if (!form.employee_id) errs.employee_id = 'Select an employee.'
    if (!form.month) errs.month = 'Month is required.'
    if (!form.basic || basic <= 0) errs.basic = 'Basic salary must be greater than zero.'
    if (Number(form.bonus) < 0) errs.bonus = 'Bonus cannot be negative.'
    if (Number(form.deductions) < 0) errs.deductions = 'Deductions cannot be negative.'
    if (net < 0) errs.net = 'Net pay is negative — deductions exceed basic + bonus.'
    return errs
  }

  const formValid = (() => {
    if (!form.employee_id || !form.month || basic <= 0) return false
    if (bonus < 0 || deductions < 0 || net < 0) return false
    return true
  })()

  const ff = (key) => ({
    value: form[key],
    onChange: e => {
      setForm(p => ({ ...p, [key]: e.target.value }))
      setFormErrors(p => ({ ...p, [key]: '', net: '' }))
    },
  })

  const handleRunPayroll = async () => {
    const errs = validateForm()
    if (Object.keys(errs).length) { setFormErrors(errs); return }

    setSaving(true)
    try {
      const payload = {
        employee_id: form.employee_id,
        month: form.month,
        basic,
        bonus,
        deductions,
      }
      const res = await payrollService.create(payload)
      if (res.ok || res.status === 201) {
        showToast('Payroll record created.')
        closeModal(); fetchData()
      } else {
        const err = await res.json().catch(() => ({}))
        showToast(err.detail || 'Failed to create payroll.', 'error')
      }
    } catch { showToast('Network error.', 'error') }
    setSaving(false)
  }

  const handleApprove = async (record) => {
    try {
      const res = await payrollService.approve(record.id)
      if (res.ok) { showToast(`Payroll for ${record.employee?.name} marked as paid.`); fetchData() }
      else { const err = await res.json().catch(() => ({})); showToast(err.detail || 'Failed.', 'error') }
    } catch { showToast('Network error.', 'error') }
  }

  const handleDelete = async () => {
    try {
      const res = await payrollService.remove(deleteTarget.id)
      if (res.ok || res.status === 204) {
        showToast(`Payroll record ${deleteTarget.payroll_id} deleted.`)
        setDeleteTarget(null)
        fetchData()
      } else {
        const err = await res.json().catch(() => ({}))
        showToast(err.detail || 'Delete failed.', 'error')
      }
    } catch { showToast('Network error.', 'error') }
  }

  const totalPages = Math.max(1, Math.ceil(total / limit))

  return (
    <div className="p-margin-mobile md:p-margin-desktop">
      {toast && (
        <div className={`fixed top-20 right-6 z-50 flex items-center gap-md px-lg py-md rounded-xl shadow-lg border text-label-md font-bold transition-all ${toast.type === 'error' ? 'bg-error-container text-on-error-container border-error/30' : 'bg-secondary-container text-on-secondary-container border-secondary/30'}`}>
          <span className="material-symbols-outlined text-[20px]">{toast.type === 'error' ? 'error' : 'check_circle'}</span>
          {toast.message}
        </div>
      )}

      {/* Run Payroll Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 bg-on-background/40 backdrop-blur-sm flex items-center justify-center p-margin-mobile">
          <div className="bg-surface-container-lowest border border-outline-variant rounded-2xl p-xl shadow-2xl w-full max-w-md">
            <h3 className="text-headline-md mb-lg">Run Payroll</h3>
            <div className="space-y-md">
              <div className="flex flex-col gap-xs">
                <label className="text-label-md text-on-surface-variant">Employee <span className="text-error">*</span></label>
                <EmployeeCombobox
                  employees={employees}
                  value={form.employee_id}
                  onChange={id => { setForm(p => ({ ...p, employee_id: id })); setFormErrors(p => ({ ...p, employee_id: '' })) }}
                  error={formErrors.employee_id}
                  loading={empLoading}
                />
                {formErrors.employee_id && <p className="text-label-sm text-error">{formErrors.employee_id}</p>}
              </div>
              <div className="flex flex-col gap-xs">
                <label className="text-label-md text-on-surface-variant">Month <span className="text-error">*</span></label>
                <input
                  type="month"
                  className={`bg-surface border rounded-lg p-md text-body-md focus:ring-1 outline-none ${formErrors.month ? 'border-error focus:ring-error' : 'border-outline-variant focus:ring-primary'}`}
                  {...ff('month')}
                />
                {formErrors.month && <p className="text-label-sm text-error">{formErrors.month}</p>}
              </div>
              <div className="grid grid-cols-3 gap-md">
                <div className="flex flex-col gap-xs">
                  <label className="text-label-md text-on-surface-variant">Basic <span className="text-error">*</span></label>
                  <input
                    type="number"
                    min="0"
                    className={`bg-surface border rounded-lg p-md text-body-md focus:ring-1 outline-none ${formErrors.basic ? 'border-error focus:ring-error' : 'border-outline-variant focus:ring-primary'}`}
                    placeholder="0"
                    {...ff('basic')}
                  />
                  {formErrors.basic && <p className="text-label-sm text-error">{formErrors.basic}</p>}
                </div>
                <div className="flex flex-col gap-xs">
                  <label className="text-label-md text-on-surface-variant">Bonus</label>
                  <input
                    type="number"
                    min="0"
                    className={`bg-surface border rounded-lg p-md text-body-md focus:ring-1 outline-none ${formErrors.bonus ? 'border-error focus:ring-error' : 'border-outline-variant focus:ring-primary'}`}
                    placeholder="0"
                    {...ff('bonus')}
                  />
                  {formErrors.bonus && <p className="text-label-sm text-error">{formErrors.bonus}</p>}
                </div>
                <div className="flex flex-col gap-xs">
                  <label className="text-label-md text-on-surface-variant">Deductions</label>
                  <input
                    type="number"
                    min="0"
                    className={`bg-surface border rounded-lg p-md text-body-md focus:ring-1 outline-none ${formErrors.deductions ? 'border-error focus:ring-error' : 'border-outline-variant focus:ring-primary'}`}
                    placeholder="0"
                    {...ff('deductions')}
                  />
                  {formErrors.deductions && <p className="text-label-sm text-error">{formErrors.deductions}</p>}
                </div>
              </div>

              {/* Net pay preview */}
              {basic > 0 && (
                <div className={`rounded-lg p-md flex justify-between items-center ${net < 0 ? 'bg-error/10 border border-error/30' : 'bg-surface-container-low'}`}>
                  <span className="text-label-md text-on-surface-variant">Net Pay</span>
                  <span className={`text-headline-md font-bold ${net < 0 ? 'text-error' : 'text-secondary'}`}>{fmt(net)}</span>
                </div>
              )}
              {formErrors.net && (
                <div className="flex items-center gap-xs bg-error/10 border border-error/20 rounded-lg px-md py-sm">
                  <span className="material-symbols-outlined text-error text-[18px]">error</span>
                  <p className="text-label-sm text-error">{formErrors.net}</p>
                </div>
              )}
            </div>
            <div className="flex gap-sm justify-end mt-xl">
              <button onClick={closeModal} className="px-lg py-sm bg-surface-container border border-outline-variant text-on-surface rounded-lg text-label-md">Cancel</button>
              <button
                onClick={handleRunPayroll}
                disabled={saving || !formValid}
                className="px-lg py-sm bg-primary text-on-primary rounded-lg text-label-md disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {saving ? 'Creating…' : 'Create Record'}
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
              <h3 className="text-headline-md">Delete Payroll Record?</h3>
            </div>
            <div className="space-y-sm mb-xl">
              <p className="text-body-md text-on-surface-variant">
                You are about to permanently delete payroll record <strong>{deleteTarget.payroll_id}</strong>.
                This action cannot be undone.
              </p>
              <div className="bg-surface-container rounded-lg p-md space-y-xs text-body-md">
                <div className="flex justify-between"><span className="text-on-surface-variant">Employee</span><span className="font-bold">{deleteTarget.employee?.name ?? '—'}</span></div>
                <div className="flex justify-between"><span className="text-on-surface-variant">Month</span><span className="font-bold">{deleteTarget.month}</span></div>
                <div className="flex justify-between"><span className="text-on-surface-variant">Net Pay</span><span className="font-bold text-secondary">{fmt(deleteTarget.net)}</span></div>
                <div className="flex justify-between"><span className="text-on-surface-variant">Status</span><span className={`font-bold ${statusStyle[deleteTarget.status] ?? ''} inline-flex px-2 py-0.5 rounded-full text-label-sm`}>{deleteTarget.status}</span></div>
              </div>
            </div>
            <div className="flex gap-sm justify-end">
              <button onClick={() => setDeleteTarget(null)} className="px-lg py-sm bg-surface-container border border-outline-variant text-on-surface rounded-lg text-label-md">Cancel</button>
              <button onClick={handleDelete} className="px-lg py-sm bg-error text-on-error rounded-lg text-label-md hover:opacity-90">Delete</button>
            </div>
          </div>
        </div>
      )}

      <div className="flex flex-col md:flex-row md:items-center justify-between mb-xl gap-md">
        <div>
          <h2 className="text-headline-lg text-on-surface">Payroll Management</h2>
          <p className="text-body-md text-on-surface-variant">Process and manage employee compensation</p>
        </div>
        <button onClick={() => setShowModal(true)} className="flex items-center gap-xs px-lg py-sm bg-primary text-on-primary rounded-lg text-label-md hover:brightness-110 active:scale-95 transition-all shadow-md">
          <span className="material-symbols-outlined text-[18px]">add</span>
          Run Payroll
        </button>
      </div>

      {/* Stats */}
      {stats && (
        <div className="grid grid-cols-2 md:grid-cols-5 gap-gutter mb-lg">
          {[
            { label: 'Total Payroll', val: fmt(stats.total_payroll), accent: 'text-primary' },
            { label: 'Paid',          val: fmt(stats.paid),          accent: 'text-secondary' },
            { label: 'Pending',       val: fmt(stats.pending),       accent: 'text-tertiary' },
            { label: 'Total Bonus',   val: fmt(stats.total_bonus),   accent: 'text-on-surface' },
            { label: 'Deductions',    val: fmt(stats.total_deductions), accent: 'text-error' },
          ].map(s => (
            <div key={s.label} className="bg-surface-container-lowest border border-outline-variant p-lg rounded-xl shadow-sm">
              <p className="text-label-sm text-on-surface-variant uppercase tracking-wider">{s.label}</p>
              <p className={`text-headline-md font-bold mt-xs ${s.accent}`}>{s.val}</p>
            </div>
          ))}
        </div>
      )}

      {/* Filters */}
      <div className="bg-surface-container-lowest border border-outline-variant rounded-xl p-md mb-lg shadow-sm flex flex-wrap gap-md">
        <div className="flex-1 min-w-[200px] relative">
          <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-outline text-[18px]">search</span>
          <input className="w-full bg-background border border-outline-variant rounded-lg py-2 pl-10 pr-4 text-body-md focus:ring-2 focus:ring-primary outline-none" placeholder="Search by employee name…" value={search} onChange={e => { setSearch(e.target.value); setPage(1) }} />
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-sm mb-lg">
        {[['all', 'All'], ['paid', 'Paid'], ['pending', 'Pending']].map(([v, l]) => (
          <button key={v} onClick={() => { setActiveTab(v); setPage(1) }} className={`px-lg py-sm rounded-lg text-label-md transition-all ${activeTab === v ? 'bg-primary text-on-primary' : 'bg-surface-container-lowest border border-outline-variant text-on-surface hover:bg-surface-container-low'}`}>{l}</button>
        ))}
      </div>

      {/* Table */}
      <div className="bg-surface-container-lowest border border-outline-variant rounded-xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-surface-container text-on-surface-variant text-label-md uppercase tracking-wider">
                {['Payroll ID', 'Employee', 'Department', 'Month', 'Basic', 'Bonus', 'Deductions', 'Net', 'Status', 'Actions'].map(h => <th key={h} className="px-lg py-md font-bold border-b border-outline-variant">{h}</th>)}
              </tr>
            </thead>
            <tbody className="divide-y divide-outline-variant text-body-md">
              {loading ? (
                <tr><td colSpan={10} className="px-lg py-xl text-center text-on-surface-variant">Loading…</td></tr>
              ) : records.length === 0 ? (
                <tr><td colSpan={10} className="px-lg py-xl text-center text-on-surface-variant">No payroll records found.</td></tr>
              ) : records.map(rec => (
                <tr key={rec.id} className="hover:bg-surface-container-low transition-colors">
                  <td className="px-lg py-md font-mono text-label-md">{rec.payroll_id}</td>
                  <td className="px-lg py-md">
                    <div className="flex items-center gap-sm">
                      {rec.employee?.photo_path
                        ? <img src={`/uploads/${rec.employee.photo_path}`} alt={rec.employee.name} className="w-9 h-9 rounded-full object-cover border border-outline-variant shrink-0" />
                        : <div className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-sm shrink-0">{(rec.employee?.name ?? '?').split(' ').map(n => n[0]).join('')}</div>
                      }
                      <div><p className="font-bold">{rec.employee?.name ?? '—'}</p><p className="text-label-sm text-on-surface-variant">{rec.employee?.emp_id ?? '—'}</p></div>
                    </div>
                  </td>
                  <td className="px-lg py-md">{rec.employee?.department?.name ?? '—'}</td>
                  <td className="px-lg py-md">{rec.month}</td>
                  <td className="px-lg py-md">{fmt(rec.basic)}</td>
                  <td className="px-lg py-md text-secondary">+{fmt(rec.bonus)}</td>
                  <td className="px-lg py-md text-error">-{fmt(rec.deductions)}</td>
                  <td className="px-lg py-md font-bold text-secondary">{fmt(rec.net)}</td>
                  <td className="px-lg py-md"><span className={`inline-flex px-2 py-0.5 rounded-full text-label-sm font-bold ${statusStyle[rec.status] ?? ''}`}>{rec.status}</span></td>
                  <td className="px-lg py-md">
                    <div className="flex items-center gap-2">
                      <Link to={`/payroll/payslip?id=${rec.id}`} className="p-1 hover:bg-surface-container rounded-lg text-primary transition-all" title="View Payslip">
                        <span className="material-symbols-outlined text-[20px]">receipt_long</span>
                      </Link>
                      {rec.status === 'Pending' && (
                        <button onClick={() => handleApprove(rec)} className="p-1 hover:bg-secondary/10 rounded-lg text-secondary transition-all" title="Mark as Paid">
                          <span className="material-symbols-outlined text-[20px]">check_circle</span>
                        </button>
                      )}
                      {rec.status === 'Pending' && (
                        <button onClick={() => setDeleteTarget(rec)} className="p-1 hover:bg-error-container/20 rounded-lg text-error transition-all" title="Delete Record">
                          <span className="material-symbols-outlined text-[20px]">delete</span>
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="p-md bg-surface-container-low flex flex-col gap-md sm:flex-row sm:items-center sm:justify-between border-t border-outline-variant">
          <p className="text-label-sm text-on-surface-variant">Showing {records.length} of {total} records</p>
          <div className="flex space-x-sm">
            <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1} className="p-1 rounded hover:bg-surface-container disabled:opacity-30"><span className="material-symbols-outlined">chevron_left</span></button>
            {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => i + 1).map(p => (
              <button key={p} onClick={() => setPage(p)} className={`px-3 py-1 rounded text-label-sm ${p === page ? 'bg-primary text-on-primary' : 'hover:bg-surface-container'}`}>{p}</button>
            ))}
            <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page >= totalPages} className="p-1 rounded hover:bg-surface-container disabled:opacity-30"><span className="material-symbols-outlined">chevron_right</span></button>
          </div>
        </div>
      </div>
    </div>
  )
}
