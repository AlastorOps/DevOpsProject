import { Link } from 'react-router-dom'

const payrollRecords = [
  { id: '#PR-2024-001', name: 'Jane Doe', init: 'JD', dept: 'Engineering', basic: '$8,500.00', bonus: '+$500.00', deduct: '-$120.00', net: '$8,880.00', status: 'Paid' },
  { id: '#PR-2024-002', name: 'Marcus Smith', init: 'MS', dept: 'Marketing', basic: '$6,200.00', bonus: '+$200.00', deduct: '-$85.00', net: '$6,315.00', status: 'Pending' },
  { id: '#PR-2024-003', name: 'Elena Wong', init: 'EW', dept: 'Design', basic: '$7,800.00', bonus: '+$0.00', deduct: '-$210.00', net: '$7,590.00', status: 'Paid' },
  { id: '#PR-2024-004', name: 'Robert Chen', init: 'RC', dept: 'Operations', basic: '$9,100.00', bonus: '+$1,200.00', deduct: '-$450.00', net: '$9,850.00', status: 'Pending' },
]

const statusStyle = {
  Paid: 'bg-secondary-container/20 text-secondary',
  Pending: 'bg-tertiary-container/20 text-tertiary',
}

export default function PayrollManagement() {
  return (
    <div className="p-margin-mobile md:p-margin-desktop">
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-xl gap-md">
        <div>
          <h2 className="text-headline-lg text-on-surface">Payroll Management</h2>
          <p className="text-body-md text-on-surface-variant">Process salaries, manage payslips, and track payroll cycles</p>
        </div>
        <div className="flex gap-sm">
          <button className="flex items-center gap-xs px-md py-sm border border-outline-variant rounded-lg text-label-md hover:bg-surface-container transition-all">
            <span className="material-symbols-outlined text-[18px]">download</span>
            Export Excel
          </button>
          <button className="flex items-center gap-xs px-lg py-sm bg-primary text-on-primary rounded-lg text-label-md hover:brightness-110 active:scale-95 transition-all shadow-md">
            <span className="material-symbols-outlined text-[18px]">add</span>
            Run Payroll
          </button>
        </div>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-gutter mb-lg">
        <div className="bg-inverse-surface text-inverse-on-surface p-lg rounded-xl shadow-sm">
          <p className="text-label-sm opacity-60 uppercase tracking-wider">Total Payroll</p>
          <h3 className="text-headline-lg font-bold mt-xs">$428,500</h3>
          <div className="flex items-center gap-xs mt-sm text-secondary-fixed text-label-sm">
            <span className="material-symbols-outlined text-[14px]">trending_up</span>
            <span>+3.2% from last month</span>
          </div>
        </div>
        <div className="bg-surface-container-lowest border border-outline-variant p-lg rounded-xl shadow-sm">
          <p className="text-label-sm text-outline uppercase tracking-wider">Paid</p>
          <h3 className="text-headline-lg font-bold mt-xs">$375,120</h3>
          <div className="flex items-center gap-xs mt-sm text-secondary text-label-sm">
            <span className="material-symbols-outlined text-[14px]">check_circle</span>
            <span>87.5% complete</span>
          </div>
        </div>
        <div className="bg-surface-container-lowest border border-outline-variant p-lg rounded-xl shadow-sm">
          <p className="text-label-sm text-outline uppercase tracking-wider">Pending Payroll</p>
          <h3 className="text-headline-lg font-bold mt-xs">$53,380</h3>
          <div className="flex items-center gap-xs mt-sm text-error text-label-sm">
            <span className="material-symbols-outlined text-[14px]">trending_down</span>
            <span>-1.2%</span>
          </div>
        </div>
        <div className="bg-surface-container-low border-none p-lg rounded-xl flex flex-col justify-between">
          <div className="flex flex-col space-y-md">
            <div className="flex items-center justify-between border-b border-outline-variant pb-sm">
              <div>
                <p className="text-label-sm text-on-surface-variant uppercase">Total Bonus</p>
                <p className="text-body-lg font-bold text-secondary">$12,450</p>
              </div>
              <span className="material-symbols-outlined text-secondary">redeem</span>
            </div>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-label-sm text-on-surface-variant uppercase">Total Deduction</p>
                <p className="text-body-lg font-bold text-error">$8,920</p>
              </div>
              <span className="material-symbols-outlined text-error">money_off</span>
            </div>
          </div>
        </div>
      </div>

      {/* Payroll Records Table */}
      <div className="bg-surface-container-lowest border border-outline-variant rounded-xl overflow-hidden shadow-sm mb-lg">
        <div className="p-lg border-b border-outline-variant flex items-center justify-between bg-surface-container-lowest">
          <div className="flex items-center space-x-md">
            <h4 className="text-headline-md text-on-surface">Payroll Records</h4>
            <div className="flex bg-surface-container rounded-lg p-1">
              <button className="px-md py-xs bg-surface-container-lowest shadow-sm rounded-md text-label-md text-on-surface">All Records</button>
              <button className="px-md py-xs text-label-md text-on-surface-variant hover:text-on-surface">Paid Only</button>
              <button className="px-md py-xs text-label-md text-on-surface-variant hover:text-on-surface">Pending</button>
            </div>
          </div>
          <button className="text-primary text-label-md flex items-center hover:underline">
            View History <span className="material-symbols-outlined ml-xs text-[16px]">history</span>
          </button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-surface-container-low text-on-surface-variant uppercase text-label-sm">
                <th className="px-lg py-md font-medium tracking-wider">Payroll ID</th>
                <th className="px-lg py-md font-medium tracking-wider">Employee</th>
                <th className="px-lg py-md font-medium tracking-wider">Department</th>
                <th className="px-lg py-md font-medium tracking-wider">Basic Salary</th>
                <th className="px-lg py-md font-medium tracking-wider text-secondary">Bonus</th>
                <th className="px-lg py-md font-medium tracking-wider text-error">Deduction</th>
                <th className="px-lg py-md font-medium tracking-wider">Net Salary</th>
                <th className="px-lg py-md font-medium tracking-wider">Status</th>
                <th className="px-lg py-md font-medium tracking-wider text-center">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-outline-variant text-body-md">
              {payrollRecords.map(rec => (
                <tr key={rec.id} className="hover:bg-surface-container-low transition-colors">
                  <td className="px-lg py-md font-medium">{rec.id}</td>
                  <td className="px-lg py-md">
                    <div className="flex items-center space-x-sm">
                      <div className="w-8 h-8 rounded-full bg-primary-container/20 text-primary flex items-center justify-center text-[12px] font-bold">{rec.init}</div>
                      <span>{rec.name}</span>
                    </div>
                  </td>
                  <td className="px-lg py-md text-on-surface-variant">{rec.dept}</td>
                  <td className="px-lg py-md">{rec.basic}</td>
                  <td className="px-lg py-md text-secondary">{rec.bonus}</td>
                  <td className="px-lg py-md text-error">{rec.deduct}</td>
                  <td className="px-lg py-md font-bold">{rec.net}</td>
                  <td className="px-lg py-md">
                    <span className={`inline-flex items-center px-2 py-1 rounded-full text-label-sm ${statusStyle[rec.status]}`}>
                      <span className={`w-1.5 h-1.5 rounded-full ${rec.status === 'Paid' ? 'bg-secondary' : 'bg-tertiary'} mr-2`}></span>
                      {rec.status}
                    </span>
                  </td>
                  <td className="px-lg py-md text-center">
                    <Link to="/payroll/payslip" className="text-primary hover:text-primary-container p-2 rounded-full hover:bg-primary/10 transition-all inline-block">
                      <span className="material-symbols-outlined">visibility</span>
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="p-md bg-surface-container-low flex items-center justify-between border-t border-outline-variant">
          <p className="text-label-sm text-on-surface-variant">Showing 4 of 124 employees</p>
          <div className="flex space-x-sm">
            <button className="p-1 rounded hover:bg-surface-container opacity-30" disabled>
              <span className="material-symbols-outlined">chevron_left</span>
            </button>
            <button className="px-3 py-1 rounded bg-primary text-on-primary text-label-sm">1</button>
            <button className="px-3 py-1 rounded hover:bg-surface-container text-label-sm">2</button>
            <button className="px-3 py-1 rounded hover:bg-surface-container text-label-sm">3</button>
            <button className="p-1 rounded hover:bg-surface-container">
              <span className="material-symbols-outlined">chevron_right</span>
            </button>
          </div>
        </div>
      </div>

      {/* Contextual Insights */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-gutter">
        <div className="lg:col-span-2 bg-surface-container-lowest border border-outline-variant p-lg rounded-xl shadow-sm">
          <div className="flex items-center justify-between mb-lg">
            <h4 className="text-headline-md text-on-surface">Payment Distribution</h4>
            <div className="flex items-center space-x-sm">
              <div className="flex items-center text-label-sm"><span className="w-3 h-3 rounded-full bg-primary mr-2"></span>Salary</div>
              <div className="flex items-center text-label-sm"><span className="w-3 h-3 rounded-full bg-secondary mr-2"></span>Bonuses</div>
              <div className="flex items-center text-label-sm"><span className="w-3 h-3 rounded-full bg-error mr-2"></span>Taxes</div>
            </div>
          </div>
          <div className="relative h-48 w-full bg-surface-container-low rounded-lg overflow-hidden flex items-end px-md pb-md space-x-4">
            <div className="flex-1 bg-primary rounded-t-sm" style={{ height: '80%' }}></div>
            <div className="flex-1 bg-secondary rounded-t-sm" style={{ height: '15%' }}></div>
            <div className="flex-1 bg-error rounded-t-sm" style={{ height: '25%' }}></div>
            <div className="flex-1 bg-primary rounded-t-sm" style={{ height: '75%' }}></div>
            <div className="flex-1 bg-secondary rounded-t-sm" style={{ height: '10%' }}></div>
            <div className="flex-1 bg-error rounded-t-sm" style={{ height: '30%' }}></div>
            <div className="flex-1 bg-primary rounded-t-sm" style={{ height: '85%' }}></div>
          </div>
        </div>
        <div className="bg-inverse-surface text-inverse-on-surface p-lg rounded-xl shadow-sm">
          <div className="flex items-center justify-between mb-md">
            <h4 className="text-headline-md">Quick Action</h4>
            <span className="material-symbols-outlined opacity-60">bolt</span>
          </div>
          <p className="text-body-md opacity-80 mb-lg">Acknowledge all pending March payslips to notify employees via email automatically.</p>
          <button className="w-full py-md bg-inverse-primary text-primary font-bold rounded-lg hover:opacity-90 active:scale-95 transition-all">
            Approve All Pending
          </button>
          <div className="mt-xl pt-lg border-t border-on-surface-variant/20">
            <div className="flex justify-between items-center text-label-sm uppercase tracking-widest opacity-60">
              <span>Cycle Progress</span>
              <span>92%</span>
            </div>
            <div className="w-full h-1 bg-on-surface-variant/20 rounded-full mt-2 overflow-hidden">
              <div className="w-[92%] h-full bg-secondary-fixed"></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
