import { useState } from 'react'

const departments = [
  { id: 1, name: 'Engineering', head: 'Robert Chen', employees: 124, budget: '$1.2M', status: 'Active' },
  { id: 2, name: 'Marketing', head: 'Sarah Williams', employees: 48, budget: '$450K', status: 'Active' },
  { id: 3, name: 'Human Resources', head: 'John Doe', employees: 22, budget: '$280K', status: 'Active' },
  { id: 4, name: 'Finance', head: 'Diana Prince', employees: 35, budget: '$320K', status: 'Active' },
  { id: 5, name: 'Product Design', head: 'Alex Kim', employees: 18, budget: '$210K', status: 'Active' },
]

export default function Departments() {
  const [showModal, setShowModal] = useState(false)

  return (
    <div className="p-margin-mobile md:p-margin-desktop">
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-xl gap-md">
        <div>
          <h2 className="text-headline-lg text-on-surface">Departments</h2>
          <p className="text-body-md text-on-surface-variant">Manage organizational structure and department records</p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="flex items-center gap-xs px-lg py-sm bg-primary text-on-primary rounded-lg text-label-md hover:brightness-110 active:scale-95 transition-all shadow-md"
        >
          <span className="material-symbols-outlined text-[18px]">add</span>
          Add Department
        </button>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-gutter mb-lg">
        <div className="bg-surface-container-lowest border border-outline-variant p-lg rounded-xl flex items-center gap-lg shadow-sm">
          <div className="w-12 h-12 rounded-full bg-primary/10 text-primary flex items-center justify-center">
            <span className="material-symbols-outlined">domain</span>
          </div>
          <div>
            <p className="text-label-sm text-outline uppercase tracking-wider">Total Departments</p>
            <h3 className="text-headline-lg mt-xs">12</h3>
            <p className="text-label-sm text-secondary mt-xs">+2 this quarter</p>
          </div>
        </div>
        <div className="bg-surface-container-lowest border border-outline-variant p-lg rounded-xl flex items-center gap-lg shadow-sm">
          <div className="w-12 h-12 rounded-full bg-secondary/10 text-secondary flex items-center justify-center">
            <span className="material-symbols-outlined">group</span>
          </div>
          <div>
            <p className="text-label-sm text-outline uppercase tracking-wider">Total Employees</p>
            <h3 className="text-headline-lg mt-xs">1,248</h3>
            <p className="text-label-sm text-on-surface-variant mt-xs">Across all departments</p>
          </div>
        </div>
        <div className="bg-surface-container-lowest border border-outline-variant p-lg rounded-xl flex items-center gap-lg shadow-sm">
          <div className="w-12 h-12 rounded-full bg-tertiary/10 text-tertiary flex items-center justify-center">
            <span className="material-symbols-outlined">account_balance</span>
          </div>
          <div>
            <p className="text-label-sm text-outline uppercase tracking-wider">Total Budget</p>
            <h3 className="text-headline-lg mt-xs">$4.8M</h3>
            <p className="text-label-sm text-on-surface-variant mt-xs">Annual allocation</p>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="bg-surface-container-lowest border border-outline-variant rounded-xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-surface-container-low text-on-surface-variant text-label-md uppercase tracking-wider">
                <th className="px-lg py-md font-bold">Department</th>
                <th className="px-lg py-md font-bold">Department Head</th>
                <th className="px-lg py-md font-bold">Employees</th>
                <th className="px-lg py-md font-bold">Annual Budget</th>
                <th className="px-lg py-md font-bold">Status</th>
                <th className="px-lg py-md font-bold text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-outline-variant text-body-md">
              {departments.map(dept => (
                <tr key={dept.id} className="hover:bg-surface-container-low transition-colors">
                  <td className="px-lg py-md">
                    <div className="flex items-center gap-sm">
                      <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
                        <span className="material-symbols-outlined">domain</span>
                      </div>
                      <span className="font-bold">{dept.name}</span>
                    </div>
                  </td>
                  <td className="px-lg py-md">{dept.head}</td>
                  <td className="px-lg py-md font-bold">{dept.employees}</td>
                  <td className="px-lg py-md">{dept.budget}</td>
                  <td className="px-lg py-md">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-label-sm font-bold bg-secondary-container text-on-secondary-container">
                      {dept.status}
                    </span>
                  </td>
                  <td className="px-lg py-md">
                    <div className="flex items-center justify-center gap-2">
                      <button className="p-1 hover:bg-surface-container rounded-lg text-primary transition-all">
                        <span className="material-symbols-outlined text-[20px]">visibility</span>
                      </button>
                      <button className="p-1 hover:bg-surface-container rounded-lg text-outline transition-all">
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
          <p className="text-label-sm text-on-surface-variant">Showing 5 of 12 departments</p>
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

      {/* Add Department Modal */}
      {showModal && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-margin-mobile">
          <div className="absolute inset-0 bg-on-background/40 backdrop-blur-sm" onClick={() => setShowModal(false)}></div>
          <div className="relative bg-surface-container-lowest w-full max-w-lg p-xl rounded-xl shadow-2xl border border-outline-variant">
            <div className="flex items-center justify-between mb-lg">
              <h3 className="text-headline-md font-bold">Add New Department</h3>
              <button className="p-2 hover:bg-surface-container rounded-full" onClick={() => setShowModal(false)}>
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>
            <div className="space-y-md">
              <div className="space-y-xs">
                <label className="text-label-md text-on-surface">Department Name</label>
                <input className="w-full border border-outline-variant rounded-lg py-md px-md text-body-md focus:ring-1 focus:ring-primary outline-none" placeholder="e.g. Product Development" type="text" />
              </div>
              <div className="space-y-xs">
                <label className="text-label-md text-on-surface">Department Head</label>
                <select className="w-full border border-outline-variant rounded-lg py-md px-md text-body-md focus:ring-1 focus:ring-primary">
                  <option>Select Employee</option>
                  <option>John Doe</option>
                  <option>Sarah Jenkins</option>
                </select>
              </div>
              <div className="space-y-xs">
                <label className="text-label-md text-on-surface">Annual Budget</label>
                <input className="w-full border border-outline-variant rounded-lg py-md px-md text-body-md focus:ring-1 focus:ring-primary outline-none" placeholder="$0.00" type="text" />
              </div>
            </div>
            <div className="flex items-center justify-end gap-md pt-lg">
              <button className="px-lg py-md text-on-surface-variant hover:bg-surface-container rounded-lg text-label-md" onClick={() => setShowModal(false)}>Cancel</button>
              <button className="px-xl py-md bg-primary text-on-primary text-label-md rounded-lg shadow-md hover:opacity-90">Create Department</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
