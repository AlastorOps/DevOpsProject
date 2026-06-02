import { useState, useRef } from 'react'
import { Link, useNavigate } from 'react-router-dom'

const emptyForm = {
  name: '', gender: '', dob: '', phone: '', email: '', address: '',
  empId: '', dept: '', pos: '', hireDate: '', employment: 'Full-time', salary: '',
  username: '', workEmail: '', password: '', role: 'Employee', accountActive: true,
}

export default function AddEmployee() {
  const [form, setForm]           = useState(emptyForm)
  const [showPassword, setShowPassword] = useState(false)
  const [photoPreview, setPhotoPreview] = useState(null)
  const [toast, setToast]         = useState(null)
  const photoRef                  = useRef(null)
  const navigate                  = useNavigate()

  const f = (key) => ({ value: form[key], onChange: e => setForm(prev => ({ ...prev, [key]: e.target.value })) })

  const showToast = (message, type = 'success') => {
    setToast({ message, type })
    setTimeout(() => setToast(null), 3000)
  }

  const handlePhoto = (e) => {
    const file = e.target.files[0]
    if (file) setPhotoPreview(URL.createObjectURL(file))
  }

  const checklist = [
    { label: 'Personal details collected',      done: !!(form.name && form.email) },
    { label: 'Department assignment confirmed',  done: !!(form.dept && form.dept !== '') },
    { label: 'System account created',           done: !!(form.username && form.workEmail) },
    { label: 'Equipment request submitted',      done: false },
    { label: 'Welcome email sent',               done: false },
  ]

  const handleSave = () => {
    if (!form.name.trim()) { showToast('Full name is required.', 'error'); return }
    if (!form.email.trim()) { showToast('Personal email is required.', 'error'); return }
    if (!form.dept) { showToast('Please select a department.', 'error'); return }
    showToast(`${form.name} has been registered.`)
    setTimeout(() => navigate('/employees'), 1200)
  }

  return (
    <div className="p-margin-mobile md:p-margin-desktop">
      {/* Toast */}
      {toast && (
        <div className={`fixed top-20 right-6 z-50 flex items-center gap-md px-lg py-md rounded-xl shadow-lg border text-label-md font-bold transition-all ${
          toast.type === 'error'
            ? 'bg-error-container text-on-error-container border-error/30'
            : 'bg-secondary-container text-on-secondary-container border-secondary/30'
        }`}>
          <span className="material-symbols-outlined text-[20px]">{toast.type === 'error' ? 'error' : 'check_circle'}</span>
          {toast.message}
        </div>
      )}

      <div className="mb-xl flex flex-col gap-md md:flex-row md:items-end md:justify-between">
        <div>
          <div className="flex items-center gap-xs text-on-surface-variant mb-xs">
            <Link to="/employees" className="text-label-md hover:text-primary">Employees</Link>
            <span className="material-symbols-outlined text-sm">chevron_right</span>
            <span className="text-label-md text-primary font-bold">Add New Employee</span>
          </div>
          <h2 className="text-display font-display text-on-surface">New Employee Registration</h2>
          <p className="text-body-lg text-on-surface-variant">Complete the form below to onboard a new member to the organization.</p>
        </div>
        <div className="flex flex-wrap gap-md">
          <Link to="/employees" className="px-lg py-md text-primary font-bold border border-primary hover:bg-primary-fixed-dim rounded-lg transition-all">Cancel</Link>
          <button onClick={handleSave} className="px-xl py-md bg-primary text-on-primary font-bold rounded-lg shadow-sm hover:bg-primary-container transition-all">Save Employee</button>
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
              <div className="relative group shrink-0">
                <div
                  onClick={() => photoRef.current.click()}
                  className="w-32 h-32 rounded-xl bg-surface-container border-2 border-dashed border-outline-variant flex flex-col items-center justify-center text-on-surface-variant overflow-hidden cursor-pointer hover:border-primary/50 transition-colors"
                >
                  {photoPreview
                    ? <img src={photoPreview} alt="Preview" className="w-full h-full object-cover" />
                    : <><span className="material-symbols-outlined text-display">add_a_photo</span><span className="text-xs mt-xs">Upload Photo</span></>
                  }
                </div>
                <button onClick={() => photoRef.current.click()} className="absolute -bottom-2 -right-2 w-8 h-8 rounded-full bg-primary text-white flex items-center justify-center shadow-md">
                  <span className="material-symbols-outlined text-sm">edit</span>
                </button>
                <input ref={photoRef} type="file" accept="image/*" className="hidden" onChange={handlePhoto} />
              </div>
              <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-md w-full">
                <div className="space-y-xs">
                  <label className="text-label-md text-on-surface-variant ml-xs">Full Name <span className="text-error">*</span></label>
                  <input className="w-full border border-outline-variant focus:border-primary focus:ring-1 focus:ring-primary rounded-lg py-md px-md text-body-md outline-none" placeholder="e.g. Jonathan Doe" type="text" {...f('name')} />
                </div>
                <div className="space-y-xs">
                  <label className="text-label-md text-on-surface-variant ml-xs">Gender</label>
                  <select className="w-full border border-outline-variant focus:border-primary focus:ring-1 focus:ring-primary rounded-lg py-md px-md text-body-md bg-surface-container-lowest" {...f('gender')} defaultValue="">
                    <option value="" disabled hidden>Select Gender</option>
                    <option>Male</option>
                    <option>Female</option>
                    <option>Other</option>
                  </select>
                </div>
                <div className="space-y-xs">
                  <label className="text-label-md text-on-surface-variant ml-xs">Date of Birth</label>
                  <input className="w-full border border-outline-variant focus:border-primary focus:ring-1 focus:ring-primary rounded-lg py-md px-md text-body-md outline-none" type="date" {...f('dob')} />
                </div>
                <div className="space-y-xs">
                  <label className="text-label-md text-on-surface-variant ml-xs">Phone Number</label>
                  <input className="w-full border border-outline-variant focus:border-primary focus:ring-1 focus:ring-primary rounded-lg py-md px-md text-body-md outline-none" placeholder="+1 (555) 000-0000" type="tel" {...f('phone')} />
                </div>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-md">
              <div className="space-y-xs">
                <label className="text-label-md text-on-surface-variant ml-xs">Personal Email <span className="text-error">*</span></label>
                <input className="w-full border border-outline-variant focus:border-primary focus:ring-1 focus:ring-primary rounded-lg py-md px-md text-body-md outline-none" placeholder="j.doe@example.com" type="email" {...f('email')} />
              </div>
              <div className="space-y-xs">
                <label className="text-label-md text-on-surface-variant ml-xs">Permanent Address</label>
                <input className="w-full border border-outline-variant focus:border-primary focus:ring-1 focus:ring-primary rounded-lg py-md px-md text-body-md outline-none" placeholder="Street, City, State, ZIP" type="text" {...f('address')} />
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
                <input className="w-full border border-outline-variant focus:border-primary rounded-lg py-md px-md text-body-md bg-surface-container-low font-mono outline-none" placeholder="EMP-2024-001" type="text" {...f('empId')} />
              </div>
              <div className="space-y-xs">
                <label className="text-label-md text-on-surface-variant ml-xs">Department <span className="text-error">*</span></label>
                <select className="w-full border border-outline-variant focus:border-primary rounded-lg py-md px-md text-body-md" {...f('dept')} defaultValue="">
                  <option value="" disabled hidden>Select Department</option>
                  <option>Engineering</option>
                  <option>Product Design</option>
                  <option>Human Resources</option>
                  <option>Marketing</option>
                  <option>Finance</option>
                </select>
              </div>
              <div className="space-y-xs">
                <label className="text-label-md text-on-surface-variant ml-xs">Position</label>
              <select className="w-full border border-outline-variant focus:border-primary rounded-lg py-md px-md text-body-md" {...f('pos')} defaultValue="">
                <option value="" disabled hidden>Select Position</option>
                <option value="Senior Developer">Senior Developer</option>
                <option value="UI/UX Designer">UI/UX Designer</option>
                <option value="HR Specialist">HR Specialist</option>
                <option value="Data Analyst">Data Analyst</option>
              </select>
              </div>
              <div className="space-y-xs">
                <label className="text-label-md text-on-surface-variant ml-xs">Hire Date</label>
                <input className="w-full border border-outline-variant focus:border-primary rounded-lg py-md px-md text-body-md outline-none" type="date" defaultValue={new Date().toISOString().split('T')[0]} {...f('hireDate')}/>
              </div>
              <div className="space-y-xs">
                <label className="text-label-md text-on-surface-variant ml-xs">Employment Status</label>
                <select className="w-full border border-outline-variant focus:border-primary rounded-lg py-md px-md text-body-md" {...f('employment')}>
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
                  <input className="w-full border border-outline-variant focus:border-primary rounded-lg py-md pl-xl pr-md text-body-md outline-none" placeholder="0.00" type="number" {...f('salary')} />
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
                <input className="w-full border border-outline-variant focus:border-primary rounded-lg py-md px-md text-body-md outline-none" placeholder="jdoe_emp" type="text" {...f('username')} />
              </div>
              <div className="space-y-xs">
                <label className="text-label-md text-on-surface-variant ml-xs">Work Email</label>
                <input className="w-full border border-outline-variant focus:border-primary rounded-lg py-md px-md text-body-md outline-none" placeholder="j.doe@company.com" type="email" {...f('workEmail')} />
              </div>
              <div className="space-y-xs">
                <label className="text-label-md text-on-surface-variant ml-xs">Password</label>
                <div className="relative">
                  <input
                    className="w-full border border-outline-variant focus:border-primary rounded-lg py-md px-md text-body-md pr-12 outline-none"
                    type={showPassword ? 'text' : 'password'}
                    {...f('password')}
                  />
                  <button onClick={() => setShowPassword(v => !v)} className="absolute right-md top-1/2 -translate-y-1/2 text-on-surface-variant" type="button">
                    <span className="material-symbols-outlined">{showPassword ? 'visibility_off' : 'visibility'}</span>
                  </button>
                </div>
              </div>
              <div className="space-y-xs">
                <label className="text-label-md text-on-surface-variant ml-xs">User Role</label>
                <select className="w-full border border-outline-variant focus:border-primary rounded-lg py-md px-md text-body-md" {...f('role')}>
                  <option>Employee</option>
                  <option>Manager</option>
                  <option>HR Admin</option>
                  <option>Viewer</option>
                </select>
              </div>
            </div>
            <div className="flex items-center gap-md p-md bg-surface-container-low rounded-lg border border-outline-variant border-dashed">
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  checked={form.accountActive}
                  onChange={() => setForm(prev => ({ ...prev, accountActive: !prev.accountActive }))}
                  className="sr-only peer"
                  type="checkbox"
                />
                <div className="w-11 h-6 bg-outline-variant rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
              </label>
              <div>
                <p className="text-body-md font-bold text-on-surface">Account Status: {form.accountActive ? 'Active' : 'Inactive'}</p>
                <p className="text-xs text-on-surface-variant">User will {form.accountActive ? '' : 'not '}be able to log in immediately after saving.</p>
              </div>
            </div>
          </section>

          <div className="flex flex-wrap justify-end gap-md pb-xl">
            <Link to="/employees" className="px-lg py-md text-primary font-bold border border-primary hover:bg-primary-fixed-dim rounded-lg transition-all">Cancel Registration</Link>
            <button onClick={handleSave} className="px-xl py-md bg-primary text-on-primary font-bold rounded-lg shadow-md hover:bg-primary-container transition-all flex items-center gap-sm">
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
              {checklist.map(item => (
                <div key={item.label} className="flex items-center gap-sm">
                  <span
                    className={`material-symbols-outlined text-[20px] ${item.done ? 'text-on-primary-container' : 'text-on-primary-container/40'}`}
                    style={{ fontVariationSettings: item.done ? "'FILL' 1" : "'FILL' 0" }}
                  >
                    {item.done ? 'check_circle' : 'radio_button_unchecked'}
                  </span>
                  <span className={`text-body-md ${item.done ? '' : 'opacity-60'}`}>{item.label}</span>
                </div>
              ))}
            </div>
            <div className="mt-lg pt-md border-t border-on-primary-container/20">
              <div className="flex justify-between text-label-sm mb-1">
                <span>Progress</span>
                <span>{checklist.filter(i => i.done).length}/{checklist.length}</span>
              </div>
              <div className="w-full h-1.5 bg-on-primary-container/20 rounded-full overflow-hidden">
                <div
                  className="h-full bg-on-primary-container rounded-full transition-all duration-500"
                  style={{ width: `${(checklist.filter(i => i.done).length / checklist.length) * 100}%` }}
                ></div>
              </div>
            </div>
          </div>

          <div className="bg-surface-container-lowest border border-outline-variant rounded-xl p-xl shadow-sm">
            <h4 className="text-headline-md mb-md text-on-surface">Recently Added</h4>
            <div className="space-y-md">
              {[
                { name: 'Priya Sharma',   dept: 'Design',      date: 'Oct 22, 2024', init: 'PS' },
                { name: 'Lucas Martin',   dept: 'Engineering', date: 'Oct 20, 2024', init: 'LM' },
                { name: 'Amara Johnson',  dept: 'Sales',       date: 'Oct 18, 2024', init: 'AJ' },
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
