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
  const [records, setRecords]   = useState([])
  const [stats, setStats]       = useState(null)
  const [employees, setEmployees] = useState([])
  const [empLoading, setEmpLoading] = useState(false)
  const [total, setTotal]       = useState(0)
  const [loading, setLoading]   = useState(true)
  const [activeTab, setActiveTab] = useState('all')
  const [showModal, setShowModal] = useState(false)
  const [form, setForm]         = useState({ employee_id: '', month: '', basic: '', bonus: '0', deductions: '0' })
  const [formErrors, setFormErrors] = useState({})
  const [toast, setToast]       = useState(null)
  const [saving, setSaving]     = useState(false)
  const [page, setPage]         = useState(1)
  const limit = 20

  const showToast = (message, type = 'success') => { setToast({ message, type }); setTimeout(() => setToast(null), 3000) }

  const fetchData = useCallback(async () => {
    setLoading(true)
    try {
      const status = activeTab === 'paid' ? 'Paid' : activeTab === 'pending' ? 'Pending' : ''
      const [rRes, sRes] = await Promise.all([
        payrollService.list({ page, limit, status }),
        payrollService.stats(),
      ])
      if (rRes.ok) { const d = await rRes.json(); setRecords(d.records || []); setTotal(d.total || 0) }
      if (sRes.ok) setStats(await sRes.json())
    } catch { /* ignore */ }
    setLoading(false)
  }, [page, activeTab])

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

  useEffect(() => { fetchData() }, [fetchData])
  useEffect(() => { fetchEmployees() }, [fetchEmployees])

  // Re-fetch employees when modal opens in case the initial fetch failed
  useEffect(() => {
    if (showModal && employees.length === 0) fetchEmployees()
  }, [showModal]) // eslint-disable-line react-hooks/exhaustive-deps

  const closeModal = () => { setShowModal(false); setForm({ employee_id: '', month: '', basic: '', bonus: '0', deductions: '0' }); setFormErrors({}) }

  const handleRunPayroll = async () => {
    const errs = {}
    if (!form.employee_id) errs.employee_id = 'Select an employee.'
    if (!form.month) errs.month = 'Month is required.'
    if (!form.basic || Number(form.basic) <= 0) errs.basic = 'Basic salary is required.'
    if (Object.keys(errs).length) { setFormErrors(errs); return }

    setSaving(true)
    try {
      const payload = {
        employee_id: form.employee_id,
        month: form.month,
        basic: Number(form.basic),
        bonus: Number(form.bonus) || 0,
        deductions: Number(form.deductions) || 0,
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

  const ff = (key) => ({ value: form[key], onChange: e => { setForm(p => ({ ...p, [key]: e.target.value })); setFormErrors(p => ({ ...p, [key]: '' })) } })
  const totalPages = Math.max(1, Math.ceil(total / limit))

  const net = (Number(form.basic) || 0) + (Number(form.bonus) || 0) - (Number(form.deductions) || 0)

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
                <input type="month" className={`bg-surface border rounded-lg p-md text-body-md focus:ring-1 outline-none ${formErrors.month ? 'border-error focus:ring-error' : 'border-outline-variant focus:ring-primary'}`} {...ff('month')} />
                {formErrors.month && <p className="text-label-sm text-error">{formErrors.month}</p>}
              </div>
              <div className="grid grid-cols-3 gap-md">
                <div className="flex flex-col gap-xs">
                  <label className="text-label-md text-on-surface-variant">Basic <span className="text-error">*</span></label>
                  <input type="number" className={`bg-surface border rounded-lg p-md text-body-md focus:ring-1 outline-none ${formErrors.basic ? 'border-error' : 'border-outline-variant focus:ring-primary'}`} placeholder="0" {...ff('basic')} />
                  {formErrors.basic && <p className="text-label-sm text-error">{formErrors.basic}</p>}
                </div>
                <div className="flex flex-col gap-xs">
                  <label className="text-label-md text-on-surface-variant">Bonus</label>
                  <input type="number" className="bg-surface border border-outline-variant rounded-lg p-md text-body-md focus:ring-1 focus:ring-primary outline-none" placeholder="0" {...ff('bonus')} />
                </div>
                <div className="flex flex-col gap-xs">
                  <label className="text-label-md text-on-surface-variant">Deductions</label>
                  <input type="number" className="bg-surface border border-outline-variant rounded-lg p-md text-body-md focus:ring-1 focus:ring-primary outline-none" placeholder="0" {...ff('deductions')} />
                </div>
              </div>
              {(Number(form.basic) > 0) && (
                <div className="bg-surface-container-low rounded-lg p-md flex justify-between items-center">
                  <span className="text-label-md text-on-surface-variant">Net Pay</span>
                  <span className="text-headline-md font-bold text-secondary">{fmt(net)}</span>
                </div>
              )}
            </div>
            <div className="flex gap-sm justify-end mt-xl">
              <button onClick={closeModal} className="px-lg py-sm bg-surface-container border border-outline-variant text-on-surface rounded-lg text-label-md">Cancel</button>
              <button onClick={handleRunPayroll} disabled={saving} className="px-lg py-sm bg-primary text-on-primary rounded-lg text-label-md disabled:opacity-50">{saving ? 'Creating…' : 'Create Record'}</button>
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
                      <div className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-sm">{(rec.employee?.name ?? '?').split(' ').map(n => n[0]).join('')}</div>
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
