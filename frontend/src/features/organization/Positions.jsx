const positions = [
  { id: 1, title: 'Senior Software Engineer', dept: 'Engineering', level: 'Senior', headcount: 24, openings: 3, salary: '$9,000 – $12,000' },
  { id: 2, title: 'HR Specialist', dept: 'Human Resources', level: 'Mid', headcount: 8, openings: 1, salary: '$5,500 – $7,000' },
  { id: 3, title: 'Growth Marketing Manager', dept: 'Marketing', level: 'Manager', headcount: 5, openings: 0, salary: '$7,000 – $9,500' },
  { id: 4, title: 'UI/UX Designer', dept: 'Product Design', level: 'Mid', headcount: 12, openings: 2, salary: '$6,500 – $8,500' },
]

export default function Positions() {
  return (
    <div className="p-margin-mobile md:p-margin-desktop">
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-xl gap-md">
        <div>
          <h2 className="text-headline-lg text-on-surface">Positions</h2>
          <p className="text-body-md text-on-surface-variant">Define and manage job positions across the organization</p>
        </div>
        <button className="flex items-center gap-xs px-lg py-sm bg-primary text-on-primary rounded-lg text-label-md hover:brightness-110 active:scale-95 transition-all shadow-md">
          <span className="material-symbols-outlined text-[18px]">add</span>
          Add Position
        </button>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-gutter mb-lg">
        {[
          { label: 'Total Positions', val: '48', icon: 'work_outline', color: 'bg-primary/10 text-primary' },
          { label: 'Open Vacancies', val: '12', icon: 'person_add', color: 'bg-secondary/10 text-secondary' },
          { label: 'Avg. Salary', val: '$7,200', icon: 'payments', color: 'bg-tertiary/10 text-tertiary' },
          { label: 'Departments', val: '12', icon: 'domain', color: 'bg-outline-variant text-on-surface-variant' },
        ].map(s => (
          <div key={s.label} className="bg-surface-container-lowest border border-outline-variant p-lg rounded-xl flex items-center gap-md shadow-sm">
            <div className={`w-12 h-12 rounded-full flex items-center justify-center ${s.color}`}>
              <span className="material-symbols-outlined">{s.icon}</span>
            </div>
            <div>
              <p className="text-label-sm text-outline uppercase tracking-wider">{s.label}</p>
              <h3 className="text-headline-md font-bold mt-xs">{s.val}</h3>
            </div>
          </div>
        ))}
      </div>

      {/* Table */}
      <div className="bg-surface-container-lowest border border-outline-variant rounded-xl overflow-hidden shadow-sm mb-lg">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-surface-container-low text-on-surface-variant text-label-md uppercase tracking-wider">
                <th className="px-lg py-md font-bold">Position Title</th>
                <th className="px-lg py-md font-bold">Department</th>
                <th className="px-lg py-md font-bold">Level</th>
                <th className="px-lg py-md font-bold">Headcount</th>
                <th className="px-lg py-md font-bold">Open</th>
                <th className="px-lg py-md font-bold">Salary Range</th>
                <th className="px-lg py-md font-bold text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-outline-variant text-body-md">
              {positions.map(pos => (
                <tr key={pos.id} className="hover:bg-surface-container-low transition-colors">
                  <td className="px-lg py-md font-bold">{pos.title}</td>
                  <td className="px-lg py-md">{pos.dept}</td>
                  <td className="px-lg py-md">
                    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-label-sm font-bold ${
                      pos.level === 'Senior' ? 'bg-primary/10 text-primary' :
                      pos.level === 'Manager' ? 'bg-tertiary-fixed text-on-tertiary-fixed-variant' :
                      'bg-surface-container text-on-surface-variant'
                    }`}>
                      {pos.level}
                    </span>
                  </td>
                  <td className="px-lg py-md">{pos.headcount}</td>
                  <td className="px-lg py-md">
                    {pos.openings > 0 ? (
                      <span className="inline-flex items-center px-2 py-0.5 rounded-full text-label-sm font-bold bg-secondary-container/30 text-secondary">
                        {pos.openings} Open
                      </span>
                    ) : (
                      <span className="text-label-sm text-on-surface-variant">Filled</span>
                    )}
                  </td>
                  <td className="px-lg py-md text-on-surface-variant">{pos.salary}</td>
                  <td className="px-lg py-md">
                    <div className="flex items-center justify-center gap-2">
                      <button className="p-1 hover:bg-surface-container rounded-lg text-primary transition-all">
                        <span className="material-symbols-outlined text-[20px]">edit</span>
                      </button>
                      <button className="p-1 hover:bg-error-container/20 rounded-lg text-error transition-all">
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
          <p className="text-label-sm text-on-surface-variant">Showing 4 of 48 positions</p>
          <div className="flex space-x-sm">
            <button className="p-1 rounded hover:bg-surface-container transition-colors opacity-30" disabled>
              <span className="material-symbols-outlined">chevron_left</span>
            </button>
            <button className="px-3 py-1 rounded bg-primary text-on-primary text-label-sm">1</button>
            <button className="px-3 py-1 rounded hover:bg-surface-container text-label-sm">2</button>
            <button className="p-1 rounded hover:bg-surface-container transition-colors">
              <span className="material-symbols-outlined">chevron_right</span>
            </button>
          </div>
        </div>
      </div>

      {/* Contextual Help Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-gutter">
        <div className="bg-surface-container-low p-lg rounded-xl border border-outline-variant flex items-start gap-md">
          <div className="p-sm bg-primary/10 rounded-lg">
            <span className="material-symbols-outlined text-primary">info</span>
          </div>
          <div>
            <h4 className="font-bold text-body-lg">Position Levels</h4>
            <p className="text-body-md text-on-surface-variant mt-1">Junior (0–2 yrs), Mid (2–5 yrs), Senior (5+ yrs), Manager. Levels affect salary bands and performance review cycles.</p>
          </div>
        </div>
        <div className="bg-surface-container-low p-lg rounded-xl border border-outline-variant flex items-start gap-md">
          <div className="p-sm bg-secondary/10 rounded-lg">
            <span className="material-symbols-outlined text-secondary">trending_up</span>
          </div>
          <div>
            <h4 className="font-bold text-body-lg">Open Vacancies</h4>
            <p className="text-body-md text-on-surface-variant mt-1">You currently have 12 open positions. Post to job boards by linking positions to your recruitment module.</p>
          </div>
        </div>
      </div>
    </div>
  )
}
