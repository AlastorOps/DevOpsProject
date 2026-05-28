import { Link } from 'react-router-dom'

export default function AddEmployee() {
  return (
    <div className="p-margin-mobile md:p-margin-desktop">
      {/* Breadcrumb & Header */}
      <div className="mb-xl flex flex-col gap-md md:flex-row md:items-end md:justify-between">
        <div>
          <div className="flex items-center gap-xs text-on-surface-variant mb-xs">
            <span className="text-label-md">Employees</span>
            <span className="material-symbols-outlined text-sm">chevron_right</span>
            <span className="text-label-md text-primary font-bold">Add New Employee</span>
          </div>
          <h2 className="text-display font-display text-on-surface">New Employee Registration</h2>
          <p className="text-body-lg text-on-surface-variant">Complete the form below to onboard a new member to the organization.</p>
        </div>
        <div className="flex flex-wrap gap-md">
          <Link to="/employees" className="px-lg py-md text-primary font-bold border border-primary hover:bg-primary-fixed-dim rounded-lg transition-all">Cancel</Link>
          <button className="px-xl py-md bg-primary text-on-primary font-bold rounded-lg shadow-sm hover:bg-primary-container transition-all">Save Employee</button>
        </div>
      </div>

      <div className="grid grid-cols-12 gap-gutter">
        {/* Left Column */}
        <div className="col-span-12 lg:col-span-8 space-y-gutter">
          {/* Personal Info */}
          <section className="bg-surface-container-lowest rounded-xl p-xl border border-outline-variant shadow-sm">
            <div className="flex items-center gap-md mb-xl border-b border-outline-variant pb-md">
              <div className="w-10 h-10 rounded-full bg-primary-fixed flex items-center justify-center text-primary">
                <span className="material-symbols-outlined">person</span>
              </div>
              <h3 className="text-headline-md text-on-surface">Personal Information</h3>
            </div>
            <div className="flex flex-col md:flex-row gap-xl items-start mb-xl">
              <div className="relative group">
                <div className="w-32 h-32 rounded-xl bg-surface-container border-2 border-dashed border-outline-variant flex flex-col items-center justify-center text-on-surface-variant overflow-hidden">
                  <span className="material-symbols-outlined text-display">add_a_photo</span>
                  <span className="text-xs mt-xs">Upload Photo</span>
                </div>
                <button className="absolute -bottom-2 -right-2 w-8 h-8 rounded-full bg-primary text-white flex items-center justify-center shadow-md">
                  <span className="material-symbols-outlined text-sm">edit</span>
                </button>
              </div>
              <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-md w-full">
                <div className="space-y-xs">
                  <label className="text-label-md text-on-surface-variant ml-xs">Full Name</label>
                  <input className="w-full border border-outline-variant focus:border-primary focus:ring-1 focus:ring-primary rounded-lg py-md px-md text-body-md outline-none" placeholder="e.g. Jonathan Doe" type="text" />
                </div>
                <div className="space-y-xs">
                  <label className="text-label-md text-on-surface-variant ml-xs">Gender</label>
                  <select className="w-full border border-outline-variant focus:border-primary focus:ring-1 focus:ring-primary rounded-lg py-md px-md text-body-md bg-surface-container-lowest">
                    <option>Select Gender</option>
                    <option>Male</option>
                    <option>Female</option>
                    <option>Other</option>
                  </select>
                </div>
                <div className="space-y-xs">
                  <label className="text-label-md text-on-surface-variant ml-xs">Date of Birth</label>
                  <input className="w-full border border-outline-variant focus:border-primary focus:ring-1 focus:ring-primary rounded-lg py-md px-md text-body-md outline-none" type="date" />
                </div>
                <div className="space-y-xs">
                  <label className="text-label-md text-on-surface-variant ml-xs">Phone Number</label>
                  <input className="w-full border border-outline-variant focus:border-primary focus:ring-1 focus:ring-primary rounded-lg py-md px-md text-body-md outline-none" placeholder="+1 (555) 000-0000" type="tel" />
                </div>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-md">
              <div className="space-y-xs">
                <label className="text-label-md text-on-surface-variant ml-xs">Personal Email</label>
                <input className="w-full border border-outline-variant focus:border-primary focus:ring-1 focus:ring-primary rounded-lg py-md px-md text-body-md outline-none" placeholder="j.doe@example.com" type="email" />
              </div>
              <div className="space-y-xs">
                <label className="text-label-md text-on-surface-variant ml-xs">Permanent Address</label>
                <input className="w-full border border-outline-variant focus:border-primary focus:ring-1 focus:ring-primary rounded-lg py-md px-md text-body-md outline-none" placeholder="Street, City, State, ZIP" type="text" />
              </div>
            </div>
          </section>

          {/* Work Info */}
          <section className="bg-surface-container-lowest rounded-xl p-xl border border-outline-variant shadow-sm">
            <div className="flex items-center gap-md mb-xl border-b border-outline-variant pb-md">
              <div className="w-10 h-10 rounded-full bg-secondary-container flex items-center justify-center text-on-secondary-container">
                <span className="material-symbols-outlined">business_center</span>
              </div>
              <h3 className="text-headline-md text-on-surface">Work Information</h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-md">
              <div className="space-y-xs">
                <label className="text-label-md text-on-surface-variant ml-xs">Employee ID</label>
                <input className="w-full border border-outline-variant focus:border-primary rounded-lg py-md px-md text-body-md bg-surface-container-low font-mono outline-none" placeholder="EMP-2024-001" type="text" />
              </div>
              <div className="space-y-xs">
                <label className="text-label-md text-on-surface-variant ml-xs">Department</label>
                <select className="w-full border border-outline-variant focus:border-primary rounded-lg py-md px-md text-body-md">
                  <option>Select Department</option>
                  <option>Engineering</option>
                  <option>Product Design</option>
                  <option>Human Resources</option>
                  <option>Marketing</option>
                  <option>Finance</option>
                </select>
              </div>
              <div className="space-y-xs">
                <label className="text-label-md text-on-surface-variant ml-xs">Position</label>
                <select className="w-full border border-outline-variant focus:border-primary rounded-lg py-md px-md text-body-md">
                  <option>Select Position</option>
                  <option>Senior Developer</option>
                  <option>UI/UX Designer</option>
                  <option>HR Specialist</option>
                  <option>Data Analyst</option>
                </select>
              </div>
              <div className="space-y-xs">
                <label className="text-label-md text-on-surface-variant ml-xs">Hire Date</label>
                <input className="w-full border border-outline-variant focus:border-primary rounded-lg py-md px-md text-body-md outline-none" type="date" />
              </div>
              <div className="space-y-xs">
                <label className="text-label-md text-on-surface-variant ml-xs">Employment Status</label>
                <select className="w-full border border-outline-variant focus:border-primary rounded-lg py-md px-md text-body-md">
                  <option>Full-time</option>
                  <option>Part-time</option>
                  <option>Contract</option>
                  <option>Internship</option>
                </select>
              </div>
              <div className="space-y-xs">
                <label className="text-label-md text-on-surface-variant ml-xs">Basic Salary (Monthly)</label>
                <div className="relative">
                  <span className="absolute left-md top-1/2 -translate-y-1/2 text-on-surface-variant">$</span>
                  <input className="w-full border border-outline-variant focus:border-primary rounded-lg py-md pl-xl pr-md text-body-md outline-none" placeholder="0.00" type="number" />
                </div>
              </div>
            </div>
          </section>

          {/* Account Info */}
          <section className="bg-surface-container-lowest rounded-xl p-xl border border-outline-variant shadow-sm">
            <div className="flex items-center gap-md mb-xl border-b border-outline-variant pb-md">
              <div className="w-10 h-10 rounded-full bg-tertiary-fixed flex items-center justify-center text-on-tertiary-fixed">
                <span className="material-symbols-outlined">account_circle</span>
              </div>
              <h3 className="text-headline-md text-on-surface">Account Information</h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-md mb-md">
              <div className="space-y-xs">
                <label className="text-label-md text-on-surface-variant ml-xs">Username</label>
                <input className="w-full border border-outline-variant focus:border-primary rounded-lg py-md px-md text-body-md outline-none" placeholder="jdoe_emp" type="text" />
              </div>
              <div className="space-y-xs">
                <label className="text-label-md text-on-surface-variant ml-xs">Work Email</label>
                <input className="w-full border border-outline-variant focus:border-primary rounded-lg py-md px-md text-body-md outline-none" placeholder="j.doe@company.com" type="email" />
              </div>
              <div className="space-y-xs">
                <label className="text-label-md text-on-surface-variant ml-xs">Password</label>
                <div className="relative">
                  <input className="w-full border border-outline-variant focus:border-primary rounded-lg py-md px-md text-body-md pr-12 outline-none" type="password" defaultValue="password123" />
                  <button className="absolute right-md top-1/2 -translate-y-1/2 text-on-surface-variant" type="button">
                    <span className="material-symbols-outlined">visibility</span>
                  </button>
                </div>
              </div>
              <div className="space-y-xs">
                <label className="text-label-md text-on-surface-variant ml-xs">User Role</label>
                <select className="w-full border border-outline-variant focus:border-primary rounded-lg py-md px-md text-body-md">
                  <option>Employee</option>
                  <option>Manager</option>
                  <option>HR Admin</option>
                  <option>Viewer</option>
                </select>
              </div>
            </div>
            <div className="flex items-center gap-md p-md bg-surface-container-low rounded-lg border border-outline-variant border-dashed">
              <label className="relative inline-flex items-center cursor-pointer">
                <input defaultChecked className="sr-only peer" type="checkbox" />
                <div className="w-11 h-6 bg-outline-variant rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
              </label>
              <div>
                <p className="text-body-md font-bold text-on-surface">Account Status: Active</p>
                <p className="text-xs text-on-surface-variant">User will be able to log in immediately after saving.</p>
              </div>
            </div>
          </section>

          <div className="flex flex-wrap justify-end gap-md pb-xl">
            <Link to="/employees" className="px-lg py-md text-primary font-bold border border-primary hover:bg-primary-fixed-dim rounded-lg transition-all">Cancel Registration</Link>
            <button className="px-xl py-md bg-primary text-on-primary font-bold rounded-lg shadow-md hover:bg-primary-container transition-all flex items-center gap-sm">
              <span className="material-symbols-outlined text-sm">save</span>
              Save Employee
            </button>
          </div>
        </div>

        {/* Right Column */}
        <div className="col-span-12 lg:col-span-4 space-y-gutter">
          <div className="bg-primary-container text-on-primary-container rounded-xl p-xl border border-primary/20">
            <h4 className="text-headline-md mb-md">Onboarding Checklist</h4>
            <div className="space-y-md">
              {[
                { done: true, label: 'Personal details collected' },
                { done: true, label: 'Department assignment confirmed' },
                { done: false, label: 'System account created' },
                { done: false, label: 'Equipment request submitted' },
                { done: false, label: 'Welcome email sent' },
              ].map(item => (
                <div key={item.label} className="flex items-center gap-sm">
                  <span className={`material-symbols-outlined text-[20px] ${item.done ? 'text-on-primary-container' : 'text-on-primary-container/40'}`} style={{ fontVariationSettings: item.done ? "'FILL' 1" : "'FILL' 0" }}>
                    {item.done ? 'check_circle' : 'radio_button_unchecked'}
                  </span>
                  <span className={`text-body-md ${item.done ? '' : 'opacity-60'}`}>{item.label}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-surface-container-lowest border border-outline-variant rounded-xl p-xl shadow-sm">
            <h4 className="text-headline-md mb-md text-on-surface">Recently Added</h4>
            <div className="space-y-md">
              {[
                { name: 'Priya Sharma', dept: 'Design', date: 'Oct 22, 2024', init: 'PS' },
                { name: 'Lucas Martin', dept: 'Engineering', date: 'Oct 20, 2024', init: 'LM' },
                { name: 'Amara Johnson', dept: 'Sales', date: 'Oct 18, 2024', init: 'AJ' },
              ].map(emp => (
                <div key={emp.name} className="flex items-center gap-sm">
                  <div className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-sm">{emp.init}</div>
                  <div>
                    <p className="text-body-md font-bold">{emp.name}</p>
                    <p className="text-label-sm text-on-surface-variant">{emp.dept} · {emp.date}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
