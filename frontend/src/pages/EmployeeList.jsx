import { Link } from 'react-router-dom'

const employees = [
  { id: '#EMP-001', name: 'John Doe', email: 'john.doe@example.com', gender: 'Male', dept: 'Human Resources', pos: 'HR Manager', phone: '+1 (555) 010-2345', status: 'Active' },
  { id: '#EMP-002', name: 'Sarah Jenkins', email: 's.jenkins@example.com', gender: 'Female', dept: 'Engineering', pos: 'Senior Developer', phone: '+1 (555) 010-8892', status: 'Active' },
  { id: '#EMP-003', name: 'Michael Ross', email: 'm.ross@example.com', gender: 'Male', dept: 'Marketing', pos: 'Head of Growth', phone: '+1 (555) 010-4456', status: 'Inactive' },
  { id: '#EMP-004', name: 'Alicia Lee', email: 'a.lee@example.com', gender: 'Female', dept: 'Finance', pos: 'Accountant', phone: '+1 (555) 010-7712', status: 'Active' },
]

const statusStyle = {
  Active: 'bg-secondary-container text-on-secondary-container',
  Inactive: 'bg-error-container text-on-error-container',
  'On Leave': 'bg-tertiary-fixed text-on-tertiary-fixed',
}

export default function EmployeeList() {
  return (
    <div className="p-margin-mobile md:p-margin-desktop">
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-xl gap-md">
        <div>
          <h2 className="text-headline-lg text-on-surface">Employees</h2>
          <p className="text-body-md text-on-surface-variant">Manage organization directory and employee profiles</p>
        </div>
        <div className="flex flex-wrap items-center gap-sm">
          <button className="flex items-center gap-xs px-md py-sm bg-surface-container-highest text-on-surface-variant border border-outline-variant rounded-lg text-label-md hover:bg-surface-container transition-all">
            <span className="material-symbols-outlined text-[18px]">download</span>
            Export Excel
          </button>
          <button className="flex items-center gap-xs px-md py-sm bg-surface-container-highest text-on-surface-variant border border-outline-variant rounded-lg text-label-md hover:bg-surface-container transition-all">
            <span className="material-symbols-outlined text-[18px]">picture_as_pdf</span>
            Export PDF
          </button>
          <Link to="/employees/new" className="flex items-center gap-xs px-lg py-sm bg-primary text-on-primary rounded-lg text-label-md hover:brightness-110 active:scale-95 transition-all shadow-md">
            <span className="material-symbols-outlined text-[18px]">person_add</span>
            Add Employee
          </Link>
        </div>
      </div>

      {/* Filter Toolbar */}
      <div className="bg-surface-container-lowest border border-outline-variant rounded-xl p-md mb-lg shadow-sm">
        <div className="grid grid-cols-1 md:grid-cols-4 lg:grid-cols-5 gap-md">
          <div className="md:col-span-1 lg:col-span-2">
            <label className="text-label-sm text-on-surface-variant block mb-1">Search Directory</label>
            <div className="relative">
              <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant text-[18px]">search</span>
              <input className="w-full bg-background border border-outline-variant rounded-lg py-2 pl-10 pr-4 text-body-md focus:ring-2 focus:ring-primary outline-none" placeholder="Name, ID or Email..." type="text" />
            </div>
          </div>
          <div>
            <label className="text-label-sm text-on-surface-variant block mb-1">Department</label>
            <select className="w-full bg-background border border-outline-variant rounded-lg py-2 px-3 text-body-md focus:ring-2 focus:ring-primary">
              <option>All Departments</option>
              <option>Human Resources</option>
              <option>Engineering</option>
              <option>Marketing</option>
              <option>Sales</option>
              <option>Operations</option>
            </select>
          </div>
          <div>
            <label className="text-label-sm text-on-surface-variant block mb-1">Position</label>
            <select className="w-full bg-background border border-outline-variant rounded-lg py-2 px-3 text-body-md focus:ring-2 focus:ring-primary">
              <option>All Positions</option>
              <option>Manager</option>
              <option>Senior Developer</option>
              <option>HR Specialist</option>
              <option>Accountant</option>
            </select>
          </div>
          <div>
            <label className="text-label-sm text-on-surface-variant block mb-1">Status</label>
            <select className="w-full bg-background border border-outline-variant rounded-lg py-2 px-3 text-body-md focus:ring-2 focus:ring-primary">
              <option>All Status</option>
              <option>Active</option>
              <option>Inactive</option>
              <option>On Leave</option>
            </select>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="bg-surface-container-lowest border border-outline-variant rounded-xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-surface-container text-on-surface-variant text-label-md uppercase tracking-wider">
                <th className="px-md py-4 font-bold border-b border-outline-variant">ID</th>
                <th className="px-md py-4 font-bold border-b border-outline-variant">Employee</th>
                <th className="px-md py-4 font-bold border-b border-outline-variant">Gender</th>
                <th className="px-md py-4 font-bold border-b border-outline-variant">Department</th>
                <th className="px-md py-4 font-bold border-b border-outline-variant">Position</th>
                <th className="px-md py-4 font-bold border-b border-outline-variant">Contact</th>
                <th className="px-md py-4 font-bold border-b border-outline-variant">Status</th>
                <th className="px-md py-4 font-bold border-b border-outline-variant text-center">Action</th>
              </tr>
            </thead>
            <tbody className="text-body-md text-on-surface divide-y divide-outline-variant">
              {employees.map(emp => (
                <tr key={emp.id} className="hover:bg-surface-container-low transition-colors">
                  <td className="px-md py-4 text-label-md font-bold">{emp.id}</td>
                  <td className="px-md py-4">
                    <div className="flex items-center gap-sm">
                      <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-sm border border-outline-variant">
                        {emp.name.split(' ').map(n => n[0]).join('')}
                      </div>
                      <div>
                        <p className="font-bold">{emp.name}</p>
                        <p className="text-label-sm text-on-surface-variant">{emp.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-md py-4">{emp.gender}</td>
                  <td className="px-md py-4">{emp.dept}</td>
                  <td className="px-md py-4">{emp.pos}</td>
                  <td className="px-md py-4">
                    <p className="text-label-sm">{emp.phone}</p>
                  </td>
                  <td className="px-md py-4">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-label-sm font-bold ${statusStyle[emp.status]}`}>
                      {emp.status}
                    </span>
                  </td>
                  <td className="px-md py-4">
                    <div className="flex items-center justify-center gap-2">
                      <Link to="/employees/1" className="p-1 hover:bg-surface-container rounded-lg text-primary transition-all">
                        <span className="material-symbols-outlined text-[20px]">visibility</span>
                      </Link>
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
        {/* Pagination */}
        <div className="p-md bg-surface-container-low flex flex-col gap-md sm:flex-row sm:items-center sm:justify-between border-t border-outline-variant">
          <p className="text-label-sm text-on-surface-variant">Showing 4 of 1,248 employees</p>
          <div className="flex space-x-sm">
            <button className="p-1 rounded hover:bg-surface-container transition-colors opacity-30" disabled>
              <span className="material-symbols-outlined">chevron_left</span>
            </button>
            <button className="px-3 py-1 rounded bg-primary text-on-primary text-label-sm">1</button>
            <button className="px-3 py-1 rounded hover:bg-surface-container text-label-sm">2</button>
            <button className="px-3 py-1 rounded hover:bg-surface-container text-label-sm">3</button>
            <button className="p-1 rounded hover:bg-surface-container transition-colors">
              <span className="material-symbols-outlined">chevron_right</span>
            </button>
          </div>
        </div>
      </div>

      {/* Bottom Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-gutter mt-lg">
        {[
          { label: 'Total Headcount', val: '1,248', icon: 'group', color: 'text-primary bg-primary/10' },
          { label: 'Active', val: '1,180', icon: 'person_check', color: 'text-secondary bg-secondary/10' },
          { label: 'On Leave', val: '43', icon: 'event_busy', color: 'text-tertiary bg-tertiary/10' },
          { label: 'Inactive', val: '25', icon: 'person_off', color: 'text-error bg-error/10' },
        ].map(s => (
          <div key={s.label} className="bg-surface-container-lowest border border-outline-variant p-lg rounded-xl flex items-center gap-md shadow-sm">
            <div className={`w-10 h-10 rounded-full flex items-center justify-center ${s.color}`}>
              <span className="material-symbols-outlined">{s.icon}</span>
            </div>
            <div>
              <p className="text-label-sm text-on-surface-variant uppercase tracking-wider">{s.label}</p>
              <p className="text-headline-md font-bold mt-xs">{s.val}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
