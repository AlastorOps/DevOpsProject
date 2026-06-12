import { useState, useEffect } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { payrollService } from '../../api/payroll.js'
import { useAuth } from '../../context/AuthContext.jsx'

export default function PayslipView() {
  const [searchParams] = useSearchParams()
  const { user } = useAuth()
  const [payslip, setPayslip] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError]     = useState(null)

  useEffect(() => {
    const load = async () => {
      setLoading(true)
      setError(null)
      try {
        const id = searchParams.get('id')
        if (id) {
          const res = await payrollService.getPayslip(id)
          if (res.ok) { setPayslip(await res.json()); setLoading(false); return }
          setError('Payslip not found.')
        } else if (user?.employee_id) {
          const listRes = await payrollService.listByEmployee(user.employee_id, { limit: 1 })
          if (listRes.ok) {
            const d = await listRes.json()
            if (d.records?.length > 0) {
              const rec = d.records[0]
              const slipRes = await payrollService.getPayslip(rec.id)
              if (slipRes.ok) { setPayslip(await slipRes.json()); setLoading(false); return }
            }
          }
          setError('No payslip found.')
        } else {
          setError('No payroll ID specified.')
        }
      } catch { setError('Failed to load payslip.') }
      setLoading(false)
    }
    load()
  }, [searchParams, user?.employee_id])

  if (loading) return (
    <div className="p-margin-mobile md:p-margin-desktop flex items-center justify-center h-64">
      <span className="material-symbols-outlined text-primary text-[40px]" style={{ animation: 'spin 1s linear infinite' }}>progress_activity</span>
    </div>
  )

  if (error || !payslip) return (
    <div className="p-margin-mobile md:p-margin-desktop">
      <div className="bg-error-container/20 border border-error/20 rounded-xl p-lg text-on-error-container">{error ?? 'Payslip not found.'}</div>
      <Link to="/payroll" className="mt-md inline-flex items-center gap-xs text-primary hover:underline"><span className="material-symbols-outlined text-[18px]">arrow_back</span> Back to Payroll</Link>
    </div>
  )

  const emp = payslip.employee
  const totalEarnings   = Number(payslip.total_earnings || 0)
  const totalDeductions = Number(payslip.total_deductions || 0)
  const netPay          = Number(payslip.net_pay || 0)
  const fmt = (n) => '$' + Number(n || 0).toLocaleString('en-US', { minimumFractionDigits: 2 })

  return (
    <>
      {/* ── Screen layout (unchanged) ── */}
      <div className="p-margin-mobile md:p-margin-desktop max-w-4xl mx-auto">
        <div className="no-print flex items-center gap-xs text-on-surface-variant mb-lg">
          <Link to="/payroll" className="text-label-md hover:text-primary">Payroll</Link>
          <span className="material-symbols-outlined text-[16px]">chevron_right</span>
          <span className="text-label-md text-primary font-bold">Payslip</span>
        </div>

        <div className="bg-surface-container-lowest border border-outline-variant rounded-2xl overflow-hidden shadow-sm">
          {/* Header */}
          <div className="bg-primary text-on-primary p-xl">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-md">
              <div>
                <h2 className="text-display font-bold">Pay Slip</h2>
                <p className="text-label-md opacity-80 mt-1">{payslip.payroll_id}</p>
              </div>
              <div className="flex flex-col items-end gap-xs">
                <span className={`px-3 py-1 rounded-full text-label-md font-bold ${payslip.status === 'Paid' ? 'bg-on-primary/20 text-on-primary' : 'bg-on-primary/10 text-on-primary opacity-80'}`}>{payslip.status}</span>
                {payslip.paid_on && <p className="text-label-sm opacity-80">Paid on {payslip.paid_on}</p>}
              </div>
            </div>
          </div>

          <div className="p-xl space-y-xl">
            {/* Employee Info */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-xl">
              <div>
                <h3 className="text-headline-md font-bold mb-md">{emp?.name ?? '—'}</h3>
                <div className="space-y-sm text-body-md">
                  <div className="flex gap-md"><span className="text-on-surface-variant w-32">Employee ID</span><span className="font-medium">{emp?.emp_id ?? '—'}</span></div>
                  <div className="flex gap-md"><span className="text-on-surface-variant w-32">Department</span><span className="font-medium">{emp?.department?.name ?? '—'}</span></div>
                  <div className="flex gap-md"><span className="text-on-surface-variant w-32">Position</span><span className="font-medium">{emp?.position?.title ?? '—'}</span></div>
                </div>
              </div>
              <div>
                <h3 className="text-headline-md font-bold mb-md text-primary">Net Pay</h3>
                <p className="text-display font-black text-primary">{fmt(netPay)}</p>
                <p className="text-body-md text-on-surface-variant mt-xs">{payslip.month}</p>
              </div>
            </div>

            {/* Earnings & Deductions */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-xl">
              <div className="bg-surface-container-low rounded-xl p-lg">
                <h4 className="text-headline-md font-bold mb-md text-secondary">Earnings</h4>
                <div className="space-y-sm">
                  {(payslip.earnings || []).map(item => (
                    <div key={item.label} className="flex justify-between text-body-md">
                      <span className="text-on-surface-variant">{item.label}</span>
                      <span className="font-medium">{fmt(item.amount)}</span>
                    </div>
                  ))}
                </div>
                <div className="border-t border-outline-variant mt-md pt-md flex justify-between font-bold text-secondary">
                  <span>Total Earnings</span><span>{fmt(totalEarnings)}</span>
                </div>
              </div>
              <div className="bg-surface-container-low rounded-xl p-lg">
                <h4 className="text-headline-md font-bold mb-md text-error">Deductions</h4>
                <div className="space-y-sm">
                  {(payslip.deductions_items || []).map(item => (
                    <div key={item.label} className="flex justify-between text-body-md">
                      <span className="text-on-surface-variant">{item.label}</span>
                      <span className="font-medium text-error">-{fmt(item.amount)}</span>
                    </div>
                  ))}
                  {(payslip.deductions_items || []).length === 0 && <p className="text-on-surface-variant text-body-md">No deductions.</p>}
                </div>
                <div className="border-t border-outline-variant mt-md pt-md flex justify-between font-bold text-error">
                  <span>Total Deductions</span><span>-{fmt(totalDeductions)}</span>
                </div>
              </div>
            </div>

            {/* Net Summary */}
            <div className="bg-primary/5 border border-primary/20 rounded-xl p-lg flex flex-col md:flex-row md:items-center md:justify-between gap-md">
              <div className="space-y-xs">
                <div className="flex gap-md text-body-md"><span className="text-on-surface-variant w-40">Gross Earnings</span><span>{fmt(totalEarnings)}</span></div>
                <div className="flex gap-md text-body-md"><span className="text-on-surface-variant w-40">Total Deductions</span><span className="text-error">-{fmt(totalDeductions)}</span></div>
              </div>
              <div className="text-right">
                <p className="text-label-sm text-outline uppercase tracking-wider">Net Pay</p>
                <p className="text-display font-black text-primary">{fmt(netPay)}</p>
              </div>
            </div>

            {/* Actions */}
            <div className="no-print flex justify-end gap-md">
              <button onClick={() => window.print()} className="flex items-center gap-xs px-lg py-sm bg-surface-container-lowest border border-outline-variant text-on-surface rounded-lg text-label-md hover:bg-surface-container-low">
                <span className="material-symbols-outlined text-[18px]">print</span>
                Print
              </button>
              <Link to="/payroll" className="flex items-center gap-xs px-lg py-sm bg-primary text-on-primary rounded-lg text-label-md hover:brightness-110">
                <span className="material-symbols-outlined text-[18px]">arrow_back</span>
                Back to Payroll
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* ── Print-only professional A4 document ── */}
      {/* Hidden on screen; shown exclusively via @media print CSS */}
      <div id="payslip-print-doc" style={{ display: 'none' }}>

        {/* Company / document header */}
        <div className="pslip-header">
          <div>
            <div className="pslip-company-name">EMS Ops</div>
            <div className="pslip-company-sub">Human Resources Management System</div>
          </div>
          <div className="pslip-doc-meta">
            <div className="pslip-doc-title">Pay Slip</div>
            <div className="pslip-doc-ref">Ref: {payslip.payroll_id}</div>
          </div>
        </div>

        {/* Pay period banner */}
        <div className="pslip-period-bar">
          <span className="pslip-period-label">Pay Period</span>
          <span className="pslip-period-value">{payslip.month}</span>
          <span className="pslip-period-sep">·</span>
          <span className="pslip-period-label">Payment Date</span>
          <span className="pslip-period-value">{payslip.paid_on ?? '—'}</span>
          <span className="pslip-period-sep">·</span>
          <span className={`pslip-status-badge ${payslip.status === 'Paid' ? 'pslip-status-paid' : 'pslip-status-pending'}`}>
            {payslip.status}
          </span>
        </div>

        {/* Employee information */}
        <div className="pslip-section-label">Employee Information</div>
        <div className="pslip-info-grid">
          <div className="pslip-field">
            <span className="pslip-field-label">Full Name</span>
            <span className="pslip-field-value">{emp?.name ?? '—'}</span>
          </div>
          <div className="pslip-field">
            <span className="pslip-field-label">Employee ID</span>
            <span className="pslip-field-value">{emp?.emp_id ?? '—'}</span>
          </div>
          <div className="pslip-field">
            <span className="pslip-field-label">Department</span>
            <span className="pslip-field-value">{emp?.department?.name ?? '—'}</span>
          </div>
          <div className="pslip-field">
            <span className="pslip-field-label">Position</span>
            <span className="pslip-field-value">{emp?.position?.title ?? '—'}</span>
          </div>
        </div>

        <div className="pslip-rule" />

        {/* Earnings & Deductions side by side */}
        <div className="pslip-section-label">Earnings &amp; Deductions</div>
        <div className="pslip-ed-cols">

          {/* Earnings */}
          <div className="pslip-ed-card">
            <div className="pslip-col-heading pslip-col-earn">Earnings</div>
            <table className="pslip-table">
              <tbody>
                {(payslip.earnings || []).map(item => (
                  <tr key={item.label}>
                    <td className="pslip-td-label">{item.label}</td>
                    <td className="pslip-td-amount">{fmt(item.amount)}</td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr className="pslip-tfoot-row">
                  <td className="pslip-td-total-label">Total Earnings</td>
                  <td className="pslip-td-total-amount">{fmt(totalEarnings)}</td>
                </tr>
              </tfoot>
            </table>
          </div>

          {/* Deductions */}
          <div className="pslip-ed-card pslip-ed-card-right">
            <div className="pslip-col-heading pslip-col-ded">Deductions</div>
            <table className="pslip-table">
              <tbody>
                {(payslip.deductions_items || []).length === 0 ? (
                  <tr>
                    <td className="pslip-td-none" colSpan={2}>No deductions this period</td>
                  </tr>
                ) : (payslip.deductions_items || []).map(item => (
                  <tr key={item.label}>
                    <td className="pslip-td-label">{item.label}</td>
                    <td className="pslip-td-amount pslip-td-neg">−{fmt(item.amount)}</td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr className="pslip-tfoot-row">
                  <td className="pslip-td-total-label">Total Deductions</td>
                  <td className="pslip-td-total-amount pslip-td-neg">−{fmt(totalDeductions)}</td>
                </tr>
              </tfoot>
            </table>
          </div>
        </div>

        <div className="pslip-rule" />

        {/* Net pay summary bar */}
        <div className="pslip-net-bar">
          <div className="pslip-net-breakdown">
            <div className="pslip-net-line">
              <span>Gross Earnings</span>
              <span>{fmt(totalEarnings)}</span>
            </div>
            <div className="pslip-net-line pslip-net-line-ded">
              <span>Total Deductions</span>
              <span>−{fmt(totalDeductions)}</span>
            </div>
          </div>
          <div className="pslip-net-total">
            <span className="pslip-net-total-label">Net Pay</span>
            <span className="pslip-net-total-value">{fmt(netPay)}</span>
          </div>
        </div>

        {/* Document footer */}
        <div className="pslip-footer">
          <span>This is an official payroll document generated by EMS Ops. Please retain for your records.</span>
          <span>Printed: {new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</span>
        </div>

      </div>
    </>
  )
}
