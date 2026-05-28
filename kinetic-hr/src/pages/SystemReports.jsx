const reportCards = [
  {
    icon: 'badge',
    iconColor: 'bg-primary/10 text-primary',
    badge: 'Monthly',
    badgeStyle: 'bg-surface-container text-on-surface-variant',
    title: 'Employee Distribution',
    desc: 'Detailed breakdown of headcount by status, tenure, and demographics.',
    hoverBtn: 'hover:bg-primary hover:text-on-primary group-hover:bg-primary group-hover:text-on-primary',
    chart: (
      <div className="h-32 bg-surface-container rounded-lg relative overflow-hidden flex items-end px-md gap-sm py-xs">
        <div className="w-1/4 bg-primary rounded-t-sm h-12"></div>
        <div className="w-1/4 bg-primary/60 rounded-t-sm h-24"></div>
        <div className="w-1/4 bg-primary rounded-t-sm h-16"></div>
        <div className="w-1/4 bg-primary/80 rounded-t-sm h-20"></div>
        <div className="absolute top-md right-md">
          <span className="text-label-sm text-primary font-bold">+12% growth</span>
        </div>
      </div>
    ),
  },
  {
    icon: 'event_available',
    iconColor: 'bg-secondary/10 text-secondary',
    badge: 'Real-time',
    badgeStyle: 'bg-secondary-container text-on-secondary-container',
    title: 'Attendance Metrics',
    desc: 'Track punctuality trends, overtime logs, and absenteeism rates across units.',
    hoverBtn: 'hover:bg-secondary hover:text-on-secondary group-hover:bg-secondary group-hover:text-on-secondary',
    chart: (
      <div className="h-32 bg-surface-container rounded-lg flex items-center justify-center relative">
        <div className="absolute inset-0 bg-gradient-to-tr from-secondary/5 to-transparent rounded-lg"></div>
        <div className="flex items-center justify-center space-x-md">
          <div className="flex flex-col items-center">
            <span className="text-headline-md font-bold text-secondary">94%</span>
            <span className="text-label-sm text-on-surface-variant">On-time</span>
          </div>
          <div className="w-px h-12 bg-outline-variant"></div>
          <div className="flex flex-col items-center">
            <span className="text-headline-md font-bold text-on-surface-variant">0.8%</span>
            <span className="text-label-sm text-on-surface-variant">Late Rate</span>
          </div>
        </div>
      </div>
    ),
  },
  {
    icon: 'event_busy',
    iconColor: 'bg-tertiary/10 text-tertiary',
    badge: 'Quarterly',
    badgeStyle: 'bg-tertiary-fixed text-on-tertiary-fixed',
    title: 'Leave & Time-Off',
    desc: 'Analysis of accrued balance, pending requests, and popular leave periods.',
    hoverBtn: 'hover:bg-tertiary hover:text-on-tertiary group-hover:bg-tertiary group-hover:text-on-tertiary',
    chart: (
      <div className="h-32 bg-surface-container rounded-lg overflow-hidden flex items-center p-md">
        <div className="w-full space-y-md">
          {[{ label: 'Sick Leave', pct: 12 }, { label: 'Annual Vacation', pct: 65 }].map(item => (
            <div key={item.label} className="space-y-xs">
              <div className="flex justify-between text-label-sm"><span>{item.label}</span><span>{item.pct}%</span></div>
              <div className="w-full bg-white h-1.5 rounded-full">
                <div className="bg-tertiary/60 h-1.5 rounded-full" style={{ width: `${item.pct}%` }}></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    ),
  },
  {
    icon: 'payments',
    iconColor: 'bg-primary/10 text-primary',
    badge: 'Confidential',
    badgeStyle: 'bg-primary-fixed text-on-primary-fixed',
    title: 'Payroll Summary',
    desc: 'Gross to net calculations, tax deductions, and benefits disbursement reports.',
    hoverBtn: 'hover:bg-primary hover:text-on-primary group-hover:bg-primary group-hover:text-on-primary',
    chart: (
      <div className="h-32 bg-surface-container rounded-lg p-md">
        <div className="grid grid-cols-2 gap-sm h-full">
          <div className="bg-white rounded-lg p-xs flex flex-col justify-center border border-outline-variant/30">
            <span className="text-label-sm text-on-surface-variant">Avg. Payout</span>
            <span className="font-bold text-body-lg text-primary">$4,520</span>
          </div>
          <div className="bg-white rounded-lg p-xs flex flex-col justify-center border border-outline-variant/30">
            <span className="text-label-sm text-on-surface-variant">Tax Total</span>
            <span className="font-bold text-body-lg text-primary">$1.2M</span>
          </div>
        </div>
      </div>
    ),
  },
  {
    icon: 'domain',
    iconColor: 'bg-secondary/10 text-secondary',
    badge: null,
    badgeStyle: '',
    title: 'Departmental ROI',
    desc: 'Comparative analysis of department budgets vs productivity outputs.',
    hoverBtn: 'hover:bg-secondary hover:text-on-secondary group-hover:bg-secondary group-hover:text-on-secondary',
    chart: (
      <div className="h-32 bg-surface-container rounded-lg flex items-center px-lg">
        <div className="w-full flex justify-around">
          {[{ color: 'bg-secondary', label: 'Sales' }, { color: 'bg-primary', label: 'Eng' }, { color: 'bg-tertiary', label: 'Ops' }].map(d => (
            <div key={d.label} className="flex flex-col items-center">
              <div className={`w-3 h-3 rounded-full ${d.color} mb-xs`}></div>
              <span className="text-label-sm">{d.label}</span>
            </div>
          ))}
        </div>
      </div>
    ),
  },
  {
    icon: 'speed',
    iconColor: 'bg-tertiary/10 text-tertiary',
    badge: null,
    badgeStyle: '',
    title: 'Performance Reviews',
    desc: 'Aggregation of individual KPIs, peer reviews, and manager ratings.',
    hoverBtn: 'hover:bg-tertiary hover:text-on-tertiary group-hover:bg-tertiary group-hover:text-on-tertiary',
    chart: (
      <div className="h-32 bg-surface-container rounded-lg flex items-center justify-center">
        <div className="relative w-24 h-24">
          <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
            <path d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="#fff" strokeDasharray="100, 100" strokeWidth="3" />
            <path d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="#7e3000" strokeDasharray="82, 100" strokeWidth="3" />
          </svg>
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-body-lg font-bold">4.2</span>
          </div>
        </div>
      </div>
    ),
  },
]

const recentReports = [
  { icon: 'description', title: 'Q3 Payroll Summary - Engineering', by: 'Alex Rivera', when: '2 hours ago' },
  { icon: 'analytics', title: 'Oct 2023 Attendance Heatmap', by: 'System', when: 'Today, 9:15 AM' },
]

export default function SystemReports() {
  return (
    <div className="p-margin-mobile md:p-margin-desktop">
      <div className="mb-xl flex flex-col md:flex-row md:items-end justify-between gap-md">
        <div>
          <h2 className="text-display text-on-surface mb-xs">Reporting Hub</h2>
          <p className="text-body-lg text-on-surface-variant max-w-2xl">Access deep-dive analytics and compliance exports across all organizational domains.</p>
        </div>
        <div className="flex items-center space-x-sm">
          <button className="bg-surface-container-lowest border border-outline-variant px-md py-sm rounded-lg flex items-center space-x-xs hover:bg-surface-container transition-colors text-body-md">
            <span className="material-symbols-outlined text-[20px]">file_download</span>
            <span>Export Excel</span>
          </button>
          <button className="bg-surface-container-lowest border border-outline-variant px-md py-sm rounded-lg flex items-center space-x-xs hover:bg-surface-container transition-colors text-body-md">
            <span className="material-symbols-outlined text-[20px]">picture_as_pdf</span>
            <span>Export PDF</span>
          </button>
        </div>
      </div>

      {/* Global Filters */}
      <div className="bg-surface-container-lowest border border-outline-variant p-md rounded-xl mb-xl flex flex-wrap items-center gap-lg shadow-sm">
        <div className="flex flex-col gap-xs">
          <label className="text-label-sm text-on-surface-variant">Reporting Period</label>
          <div className="flex items-center bg-surface-container rounded-lg px-md py-sm border border-transparent focus-within:border-primary transition-all">
            <span className="material-symbols-outlined text-primary text-[20px] mr-sm">calendar_today</span>
            <input className="bg-transparent border-none p-0 text-body-md focus:ring-0 outline-none w-48" type="text" defaultValue="Oct 01, 2023 - Oct 31, 2023" />
          </div>
        </div>
        <div className="flex flex-col gap-xs">
          <label className="text-label-sm text-on-surface-variant">Department Filter</label>
          <select className="bg-surface-container border-none rounded-lg px-md py-sm text-body-md focus:ring-2 focus:ring-primary min-w-[200px]">
            <option>All Departments</option>
            <option>Engineering</option>
            <option>Marketing</option>
            <option>Human Resources</option>
            <option>Sales</option>
          </select>
        </div>
        <div className="flex-grow flex justify-end items-end h-full pt-md md:pt-0">
          <button className="bg-primary text-on-primary px-xl py-sm rounded-lg font-bold hover:opacity-90 active:scale-95 transition-all flex items-center">
            <span className="material-symbols-outlined mr-sm">filter_list</span>
            Apply Filters
          </button>
        </div>
      </div>

      {/* Reports Grid */}
      <div className="grid gap-gutter" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(min(100%, 360px), 1fr))' }}>
        {reportCards.map(card => (
          <div key={card.title} className="bg-surface-container-lowest border border-outline-variant rounded-xl overflow-hidden flex flex-col group hover:-translate-y-1 transition-transform duration-200">
            <div className="p-lg flex-1">
              <div className="flex items-center justify-between mb-md">
                <div className={`p-sm rounded-lg ${card.iconColor}`}>
                  <span className="material-symbols-outlined">{card.icon}</span>
                </div>
                {card.badge && (
                  <span className={`text-label-sm px-sm py-xs rounded ${card.badgeStyle}`}>{card.badge}</span>
                )}
              </div>
              <h3 className="text-headline-md text-on-surface mb-xs">{card.title}</h3>
              <p className="text-body-md text-on-surface-variant mb-md">{card.desc}</p>
              {card.chart}
            </div>
            <div className="p-md bg-surface-container-low border-t border-outline-variant">
              <button className={`w-full bg-surface-container-highest text-on-surface font-bold py-sm rounded-lg flex items-center justify-center transition-all ${card.hoverBtn}`}>
                Generate Report
                <span className="material-symbols-outlined ml-sm text-[20px]">chevron_right</span>
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Bottom Section */}
      <div className="mt-xl grid grid-cols-1 lg:grid-cols-3 gap-lg">
        <div className="lg:col-span-2 bg-surface-container-lowest border border-outline-variant rounded-xl p-lg shadow-sm">
          <h4 className="text-headline-md font-bold mb-md flex items-center">
            <span className="material-symbols-outlined mr-sm text-primary">history</span>
            Recently Generated Reports
          </h4>
          <div className="space-y-md">
            {recentReports.map(r => (
              <div key={r.title} className="flex items-center justify-between p-md bg-background rounded-lg border border-outline-variant/30 hover:border-primary/50 transition-colors">
                <div className="flex items-center space-x-md">
                  <span className="material-symbols-outlined text-on-surface-variant">{r.icon}</span>
                  <div>
                    <p className="text-body-md font-bold">{r.title}</p>
                    <p className="text-label-sm text-on-surface-variant">Generated by {r.by} • {r.when}</p>
                  </div>
                </div>
                <div className="flex space-x-sm">
                  <button className="p-xs hover:text-primary transition-colors"><span className="material-symbols-outlined text-[20px]">visibility</span></button>
                  <button className="p-xs hover:text-primary transition-colors"><span className="material-symbols-outlined text-[20px]">download</span></button>
                </div>
              </div>
            ))}
          </div>
        </div>
        <div className="bg-primary text-on-primary rounded-xl p-lg relative overflow-hidden shadow-lg shadow-primary/20">
          <div className="relative z-10">
            <h4 className="text-headline-md font-bold mb-md">Insights Engine</h4>
            <p className="text-on-primary-container text-body-md mb-lg">AI-driven analysis suggests a 15% increase in voluntary leave for the next quarter. Would you like to generate a mitigation strategy report?</p>
            <button className="bg-white text-primary px-lg py-md rounded-lg font-bold w-full active:scale-95 transition-transform">
              Explore Insights
            </button>
          </div>
          <div className="absolute -right-8 -bottom-8 w-48 h-48 bg-white/10 rounded-full blur-3xl"></div>
          <div className="absolute -left-8 -top-8 w-32 h-32 bg-on-primary/5 rounded-full blur-2xl"></div>
        </div>
      </div>
    </div>
  )
}
