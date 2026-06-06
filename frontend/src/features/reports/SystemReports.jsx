import { useState, useEffect } from 'react'
import { reportsService } from '../../api/reports.js'
import { departmentService } from '../../api/departments.js'

const REPORT_ICONS = {
  headcount:   'group',
  payroll:     'payments',
  leave:       'event_note',
  attendance:  'how_to_reg',
  performance: 'star',
}

export default function SystemReports() {
  const [reportTypes, setReportTypes]   = useState([])
  const [departments, setDepartments]   = useState([])
  const [selectedType, setSelectedType] = useState(null)
  const [deptFilter, setDeptFilter]     = useState('')
  const [periodFilter, setPeriodFilter] = useState('')
  const [reportData, setReportData]     = useState(null)
  const [loading, setLoading]           = useState(false)
  const [loadingTypes, setLoadingTypes] = useState(true)
  const [toast, setToast]               = useState(null)

  const showToast = (msg, type = 'success') => { setToast({ message: msg, type }); setTimeout(() => setToast(null), 3000) }

  useEffect(() => {
    const load = async () => {
      try {
        const [rRes, dRes] = await Promise.all([reportsService.listTypes(), departmentService.list({ limit: 100 })])
        if (rRes.ok) setReportTypes(await rRes.json())
        if (dRes.ok) { const d = await dRes.json(); setDepartments(d.departments || []) }
      } catch { /* ignore */ }
      setLoadingTypes(false)
    }
    load()
  }, [])

  const handleGenerate = async () => {
    if (!selectedType) { showToast('Please select a report type.', 'error'); return }
    setLoading(true)
    setReportData(null)
    try {
      const res = await reportsService.generate({ reportType: selectedType.id, deptFilter, periodFilter })
      if (res.ok) setReportData(await res.json())
      else { const err = await res.json().catch(() => ({})); showToast(err.detail || 'Generation failed.', 'error') }
    } catch { showToast('Network error.', 'error') }
    setLoading(false)
  }

  const renderReport = () => {
    if (!reportData) return null
    const summary = reportData.summary

    return (
      <div className="space-y-lg">
        {/* Summary Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-gutter">
          {Object.entries(summary).map(([k, v]) => (
            <div key={k} className="bg-surface-container-low rounded-xl p-lg border border-outline-variant">
              <p className="text-label-sm text-outline uppercase tracking-wider">{k.replace(/_/g, ' ')}</p>
              <p className="text-headline-md font-bold mt-xs">{typeof v === 'number' ? v.toLocaleString() : v}</p>
            </div>
          ))}
        </div>

        {/* Table Data */}
        {reportData.by_department && (
          <div className="bg-surface-container-lowest border border-outline-variant rounded-xl overflow-hidden">
            <div className="p-lg border-b border-outline-variant"><h4 className="text-headline-md">By Department</h4></div>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-surface-container text-on-surface-variant text-label-sm uppercase tracking-wider">
                    {Object.keys(reportData.by_department[0] || {}).map(h => <th key={h} className="px-lg py-md font-bold">{h.replace(/_/g, ' ')}</th>)}
                  </tr>
                </thead>
                <tbody className="divide-y divide-outline-variant text-body-md">
                  {reportData.by_department.map((row, i) => (
                    <tr key={i} className="hover:bg-surface-container-low transition-colors">
                      {Object.values(row).map((val, j) => <td key={j} className="px-lg py-md">{typeof val === 'number' ? val.toLocaleString() : String(val)}</td>)}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {reportData.by_type && (
          <div className="bg-surface-container-lowest border border-outline-variant rounded-xl overflow-hidden">
            <div className="p-lg border-b border-outline-variant"><h4 className="text-headline-md">By Type</h4></div>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-surface-container text-on-surface-variant text-label-sm uppercase tracking-wider">
                    {Object.keys(reportData.by_type[0] || {}).map(h => <th key={h} className="px-lg py-md font-bold">{h.replace(/_/g, ' ')}</th>)}
                  </tr>
                </thead>
                <tbody className="divide-y divide-outline-variant text-body-md">
                  {reportData.by_type.map((row, i) => (
                    <tr key={i} className="hover:bg-surface-container-low transition-colors">
                      {Object.values(row).map((val, j) => <td key={j} className="px-lg py-md">{typeof val === 'number' ? val.toLocaleString() : String(val)}</td>)}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {reportData.by_rating && (
          <div className="bg-surface-container-lowest border border-outline-variant rounded-xl overflow-hidden">
            <div className="p-lg border-b border-outline-variant"><h4 className="text-headline-md">By Rating</h4></div>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-surface-container text-on-surface-variant text-label-sm uppercase tracking-wider">
                    {Object.keys(reportData.by_rating[0] || {}).map(h => <th key={h} className="px-lg py-md font-bold">{h.replace(/_/g, ' ')}</th>)}
                  </tr>
                </thead>
                <tbody className="divide-y divide-outline-variant text-body-md">
                  {reportData.by_rating.map((row, i) => (
                    <tr key={i} className="hover:bg-surface-container-low transition-colors">
                      {Object.values(row).map((val, j) => <td key={j} className="px-lg py-md">{typeof val === 'number' ? val.toLocaleString() : String(val)}</td>)}
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

  return (
    <div className="p-margin-mobile md:p-margin-desktop">
      {toast && (
        <div className={`fixed top-20 right-6 z-50 flex items-center gap-md px-lg py-md rounded-xl shadow-lg border text-label-md font-bold transition-all ${toast.type === 'error' ? 'bg-error-container text-on-error-container border-error/30' : 'bg-secondary-container text-on-secondary-container border-secondary/30'}`}>
          <span className="material-symbols-outlined text-[20px]">{toast.type === 'error' ? 'error' : 'check_circle'}</span>
          {toast.message}
        </div>
      )}

      <div className="mb-xl">
        <h2 className="text-headline-lg text-on-surface">System Reports</h2>
        <p className="text-body-md text-on-surface-variant">Generate analytics and insights from your organization data</p>
      </div>

      {/* Report Type Selection */}
      <div className="bg-surface-container-lowest border border-outline-variant rounded-xl p-lg shadow-sm mb-lg">
        <h3 className="text-headline-md mb-md">Select Report Type</h3>
        {loadingTypes ? (
          <p className="text-on-surface-variant">Loading report types…</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-md">
            {reportTypes.map(rt => (
              <button key={rt.id} onClick={() => { setSelectedType(rt); setReportData(null) }} className={`flex items-start gap-md p-lg rounded-xl border text-left transition-all ${selectedType?.id === rt.id ? 'border-primary bg-primary/5' : 'border-outline-variant hover:bg-surface-container-low'}`}>
                <div className={`w-10 h-10 rounded-lg flex items-center justify-center shrink-0 ${selectedType?.id === rt.id ? 'bg-primary/10 text-primary' : 'bg-surface-container text-on-surface-variant'}`}>
                  <span className="material-symbols-outlined">{REPORT_ICONS[rt.id] ?? 'analytics'}</span>
                </div>
                <div>
                  <p className={`font-bold text-body-md ${selectedType?.id === rt.id ? 'text-primary' : 'text-on-surface'}`}>{rt.name}</p>
                  <p className="text-label-sm text-on-surface-variant mt-xs">{rt.description}</p>
                </div>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Filters */}
      {selectedType && (
        <div className="bg-surface-container-lowest border border-outline-variant rounded-xl p-lg shadow-sm mb-lg">
          <h3 className="text-headline-md mb-md">Report Filters</h3>
          <div className="flex flex-wrap gap-md items-end">
            <div>
              <label className="text-label-sm text-on-surface-variant block mb-1">Department</label>
              <select className="bg-background border border-outline-variant rounded-lg py-2 px-3 text-body-md" value={deptFilter} onChange={e => setDeptFilter(e.target.value)}>
                <option value="">All Departments</option>
                {departments.map(d => <option key={d.id} value={d.name}>{d.name}</option>)}
              </select>
            </div>
            {(selectedType.id === 'payroll' || selectedType.id === 'leave') && (
              <div>
                <label className="text-label-sm text-on-surface-variant block mb-1">Period / Month</label>
                <input type="month" className="bg-background border border-outline-variant rounded-lg py-2 px-3 text-body-md" value={periodFilter} onChange={e => setPeriodFilter(e.target.value)} />
              </div>
            )}
            <button onClick={handleGenerate} disabled={loading} className="flex items-center gap-xs px-lg py-sm bg-primary text-on-primary rounded-lg text-label-md hover:brightness-110 active:scale-95 transition-all shadow-md disabled:opacity-50">
              <span className="material-symbols-outlined text-[18px]">{loading ? 'progress_activity' : 'analytics'}</span>
              {loading ? 'Generating…' : 'Generate Report'}
            </button>
          </div>
        </div>
      )}

      {/* Report Output */}
      {reportData && (
        <div className="bg-surface-container-lowest border border-outline-variant rounded-xl p-lg shadow-sm">
          <div className="flex items-center justify-between mb-lg">
            <h3 className="text-headline-md">{selectedType?.name} — Results</h3>
            <button onClick={() => window.print()} className="flex items-center gap-xs px-md py-sm border border-outline-variant rounded-lg text-label-md hover:bg-surface-container-low">
              <span className="material-symbols-outlined text-[18px]">print</span>
              Print
            </button>
          </div>
          {renderReport()}
        </div>
      )}

      {!selectedType && !loadingTypes && (
        <div className="bg-surface-container-lowest border border-outline-variant rounded-xl p-xl flex flex-col items-center justify-center text-on-surface-variant shadow-sm">
          <span className="material-symbols-outlined text-[48px] mb-md opacity-30">analytics</span>
          <p className="text-body-md">Select a report type above to get started.</p>
        </div>
      )}
    </div>
  )
}
