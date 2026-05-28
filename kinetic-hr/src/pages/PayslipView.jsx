import { Link } from 'react-router-dom'

export default function PayslipView() {
  return (
    <div className="p-margin-mobile md:p-margin-desktop">
      {/* Breadcrumb & Actions */}
      <div className="flex flex-col md:flex-row md:items-end justify-between mb-lg gap-md">
        <div>
          <div className="flex items-center gap-xs text-on-surface-variant mb-xs">
            <Link to="/payroll" className="text-label-md hover:text-primary">Payroll</Link>
            <span className="material-symbols-outlined text-[16px]">chevron_right</span>
            <span className="text-label-md">Payslips</span>
            <span className="material-symbols-outlined text-[16px]">chevron_right</span>
            <span className="text-label-md text-primary font-bold">INV-2023-11-042</span>
          </div>
          <h2 className="text-headline-lg">Payslip Detail</h2>
        </div>
        <div className="flex items-center gap-sm">
          <button className="flex items-center gap-sm px-lg py-sm border border-outline-variant rounded-lg text-label-md text-on-surface hover:bg-surface-container transition-all">
            <span className="material-symbols-outlined">print</span>
            Print Document
          </button>
          <button className="flex items-center gap-sm px-lg py-sm bg-primary text-on-primary rounded-lg text-label-md hover:bg-primary-container transition-all">
            <span className="material-symbols-outlined">download</span>
            Download PDF
          </button>
        </div>
      </div>

      {/* Payslip Document */}
      <div className="bg-surface-container-lowest border border-outline-variant rounded-xl shadow-sm max-w-4xl mx-auto overflow-hidden mb-xl">
        {/* Header */}
        <div className="p-xl border-b border-outline-variant flex flex-col md:flex-row justify-between gap-lg">
          <div className="flex gap-md items-start">
            <div className="w-16 h-16 bg-primary rounded-xl flex items-center justify-center text-on-primary">
              <span className="material-symbols-outlined text-[40px]">corporate_fare</span>
            </div>
            <div>
              <h3 className="text-headline-md font-bold text-on-background">Admin Center Corp.</h3>
              <p className="text-body-md text-on-surface-variant">123 Business Avenue, Suite 500</p>
              <p className="text-body-md text-on-surface-variant">New York, NY 10001</p>
            </div>
          </div>
          <div className="text-left md:text-right">
            <h4 className="text-headline-md font-bold text-primary mb-xs">PAYSLIP</h4>
            <div className="space-y-1">
              <p className="text-label-md text-on-surface-variant uppercase tracking-tighter">Payslip Number</p>
              <p className="text-body-lg font-bold">INV-2023-11-042</p>
              <p className="text-label-md text-on-surface-variant uppercase tracking-tighter mt-md">Payroll Period</p>
              <p className="text-body-md">November 01 – 30, 2023</p>
            </div>
          </div>
        </div>

        {/* Employee Info */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-gutter p-xl bg-surface-container-low/50">
          {[
            { label: 'Employee Name', val: 'David Richardson' },
            { label: 'Employee ID', val: 'EMP-99042' },
            { label: 'Department', val: 'Product Design' },
            { label: 'Position', val: 'Senior UX Architect' },
          ].map(item => (
            <div key={item.label}>
              <p className="text-label-md text-on-surface-variant uppercase mb-xs">{item.label}</p>
              <p className="text-body-md font-bold">{item.val}</p>
            </div>
          ))}
        </div>

        {/* Earnings & Deductions */}
        <div className="flex flex-col md:flex-row">
          <div className="flex-1 p-xl border-r border-outline-variant">
            <div className="flex items-center justify-between mb-md">
              <h4 className="text-label-md font-extrabold uppercase tracking-widest text-secondary">Earnings</h4>
              <span className="text-label-sm text-secondary bg-secondary-container px-sm py-xs rounded-full">Primary</span>
            </div>
            <div className="space-y-md">
              {[
                { label: 'Basic Salary', amt: '$7,500.00' },
                { label: 'Performance Bonus', amt: '$850.00' },
                { label: 'Travel Allowance', amt: '$120.00' },
                { label: 'Remote Stipend', amt: '$200.00' },
              ].map(item => (
                <div key={item.label} className="flex justify-between items-center">
                  <span className="text-body-md">{item.label}</span>
                  <span className="text-body-md font-bold">{item.amt}</span>
                </div>
              ))}
            </div>
            <div className="mt-xl pt-md border-t border-dashed border-outline-variant flex justify-between items-center font-bold">
              <span className="text-body-lg">Total Earnings</span>
              <span className="text-body-lg">$8,670.00</span>
            </div>
          </div>
          <div className="flex-1 p-xl">
            <div className="flex items-center justify-between mb-md">
              <h4 className="text-label-md font-extrabold uppercase tracking-widest text-error">Deductions</h4>
              <span className="text-label-sm text-error bg-error-container px-sm py-xs rounded-full">Required</span>
            </div>
            <div className="space-y-md">
              {[
                { label: 'Income Tax (FIT)', amt: '($1,240.50)' },
                { label: 'Health Insurance', amt: '($150.00)' },
                { label: 'Social Security', amt: '($465.00)' },
                { label: 'Retirement (401k)', amt: '($375.00)' },
              ].map(item => (
                <div key={item.label} className="flex justify-between items-center">
                  <span className="text-body-md">{item.label}</span>
                  <span className="text-body-md font-bold">{item.amt}</span>
                </div>
              ))}
            </div>
            <div className="mt-xl pt-md border-t border-dashed border-outline-variant flex justify-between items-center font-bold">
              <span className="text-body-lg text-on-surface-variant">Total Deductions</span>
              <span className="text-body-lg text-error">($2,230.50)</span>
            </div>
          </div>
        </div>

        {/* Net Pay */}
        <div className="p-xl bg-surface-container-highest flex flex-col md:flex-row items-center justify-between gap-lg">
          <div className="flex items-center gap-xl">
            <div className="flex items-center gap-sm">
              <div className="w-3 h-3 rounded-full bg-secondary"></div>
              <span className="text-label-md font-bold text-secondary uppercase">Paid via Direct Deposit</span>
            </div>
            <div className="text-body-md text-on-surface-variant">
              Payment Date: <span className="font-bold text-on-surface">Dec 01, 2023</span>
            </div>
          </div>
          <div className="text-center md:text-right">
            <p className="text-label-md text-on-surface-variant uppercase tracking-widest mb-xs">Net Salary Received</p>
            <p className="text-display text-primary">$6,439.50</p>
          </div>
        </div>

        {/* Legal */}
        <div className="p-lg bg-surface-container-low text-center border-t border-outline-variant">
          <p className="text-label-sm text-on-surface-variant italic">
            This is a computer-generated document and does not require a signature. For any discrepancies, please contact the HR Department within 5 business days.
          </p>
        </div>
      </div>

      {/* YTD & Info Cards */}
      <div className="max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-12 gap-gutter">
        <div className="col-span-12 md:col-span-6 bg-surface-container-lowest border border-outline-variant rounded-xl p-lg flex items-center gap-lg">
          <div className="w-12 h-12 bg-primary-fixed-dim rounded-full flex items-center justify-center text-primary">
            <span className="material-symbols-outlined">account_balance</span>
          </div>
          <div>
            <p className="text-label-md text-on-surface-variant">Bank Account</p>
            <p className="text-body-lg font-bold">Chase Bank •••• 4829</p>
          </div>
        </div>
        <div className="col-span-12 md:col-span-6 bg-surface-container-lowest border border-outline-variant rounded-xl p-lg flex items-center gap-lg">
          <div className="w-12 h-12 bg-tertiary-fixed-dim rounded-full flex items-center justify-center text-tertiary">
            <span className="material-symbols-outlined">calendar_month</span>
          </div>
          <div>
            <p className="text-label-md text-on-surface-variant">Next Pay Date</p>
            <p className="text-body-lg font-bold">Jan 01, 2024</p>
          </div>
        </div>
        <div className="col-span-12 bg-surface-container-lowest border border-outline-variant rounded-xl p-xl">
          <div className="flex items-center justify-between mb-lg">
            <h5 className="text-headline-md font-bold">Year to Date (YTD) Summary</h5>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-lg">
            {[
              { label: 'YTD Gross Earnings', val: '$95,370.00', barColor: 'bg-secondary', w: 'w-3/4' },
              { label: 'YTD Total Taxes', val: '$14,886.00', barColor: 'bg-error', w: 'w-1/4' },
              { label: 'YTD Net Pay', val: '$70,824.00', barColor: 'bg-primary', w: 'w-2/3' },
            ].map(item => (
              <div key={item.label} className="p-md bg-surface-container rounded-lg">
                <p className="text-label-md text-on-surface-variant mb-xs">{item.label}</p>
                <p className="text-headline-md font-bold">{item.val}</p>
                <div className="h-1 bg-outline-variant mt-sm rounded-full overflow-hidden">
                  <div className={`h-full ${item.barColor} ${item.w}`}></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
