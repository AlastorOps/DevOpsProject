import { useState, useRef, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { employeeService } from '../../api/employees.js'
import { departmentService } from '../../api/departments.js'
import { positionService } from '../../api/positions.js'
import { rolesService } from '../../api/roles.js'

const emptyForm = {
  name: '', gender: '', dob: '', phone: '', personal_email: '', address: '',
  emp_id: '', department_id: '', position_id: '',
  hire_date: new Date().toISOString().split('T')[0],
  employment_type: 'Full-time', salary: '',
  work_email: '', user_password: '', user_role: 'Employee', account_active: true,
}

export default function AddEmployee() {
  const [form, setForm]                 = useState(emptyForm)
  const [showPassword, setShowPassword] = useState(false)
  const [photoFile, setPhotoFile]       = useState(null)
  const [photoPreview, setPhotoPreview] = useState(null)
  const [toast, setToast]               = useState(null)
  const [departments, setDepartments]   = useState([])
  const [positions, setPositions]       = useState([])
  const [roles, setRoles]               = useState([])
  const [recentEmps, setRecentEmps]     = useState([])
  const [saving, setSaving]             = useState(false)
  const photoRef                        = useRef(null)
  const navigate                        = useNavigate()

  useEffect(() => {
    const load = async () => {
      try {
        const [dRes, rRes, eRes] = await Promise.all([
          departmentService.list({ limit: 100 }),
          rolesService.list(),
          employeeService.list({ limit: 3, page: 1 }),
        ])
        if (dRes.ok) { const d = await dRes.json(); setDepartments(d.departments || []) }
        if (rRes.ok) setRoles(await rRes.json())
        if (eRes.ok) { const d = await eRes.json(); setRecentEmps(d.employees || []) }
      } catch { /* ignore */ }
    }
    load()
  }, [])

  useEffect(() => {
    if (!form.department_id) { setPositions([]); return }
    const dept = departments.find(d => d.id === Number(form.department_id))
    if (!dept) return
    positionService.list({ dept: dept.name, limit: 100 }).then(res => {
      if (res.ok) res.json().then(d => setPositions(d.positions || []))
    })
  }, [form.department_id, departments])

  const f = (key) => ({ value: form[key], onChange: e => setForm(prev => ({ ...prev, [key]: e.target.value })) })

  const showToast = (message, type = 'success') => {
    setToast({ message, type })
    setTimeout(() => setToast(null), 3000)
  }

  const handlePhoto = (e) => {
    const file = e.target.files[0]
    if (file) {
      setPhotoFile(file)
      setPhotoPreview(URL.createObjectURL(file))
    }
  }

  const checklist = [
    { label: 'Personal details collected',      done: !!form.name },
    { label: 'Department assignment confirmed',  done: !!form.department_id },
    { label: 'System account created',           done: !!(form.work_email && form.user_password) },
    { label: 'Equipment request submitted',      done: false },
    { label: 'Welcome email sent',               done: false },
  ]

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

  const handleSave = async () => {
    if (!form.name.trim()) { showToast('Full name is required.', 'error'); return }
    if (!form.department_id) { showToast('Please select a department.', 'error'); return }
    if (!form.phone.trim()) { showToast('Phone number is required.', 'error'); return }
    if (!form.hire_date) { showToast('Hire date is required.', 'error'); return }
    if (form.personal_email && !emailRegex.test(form.personal_email)) { showToast('Personal email format is invalid.', 'error'); return }
    if (form.work_email && !emailRegex.test(form.work_email)) { showToast('Work email format is invalid.', 'error'); return }
    if (form.work_email && !form.user_password.trim()) { showToast('Password is required when creating an account.', 'error'); return }
    if (form.dob) {
      const dob = new Date(form.dob)
      const today = new Date()
      if (dob > today) { showToast('Date of birth cannot be in the future.', 'error'); return }
      const age = (today - dob) / (1000 * 60 * 60 * 24 * 365.25)
      if (age < 16) { showToast('Employee must be at least 16 years old.', 'error'); return }
    }
    if (form.salary !== '' && Number(form.salary) < 0) { showToast('Salary cannot be negative.', 'error'); return }

    setSaving(true)
    try {
      const payload = {
        name: form.name,
        gender: form.gender || null,
        dob: form.dob || null,
        phone: form.phone || null,
        personal_email: form.personal_email || null,
        address: form.address || null,
        emp_id: form.emp_id || null,
        department_id: form.department_id ? Number(form.department_id) : null,
        position_id: form.position_id ? Number(form.position_id) : null,
        hire_date: form.hire_date || null,
        employment_type: form.employment_type || null,
        salary: form.salary ? Number(form.salary) : null,
        work_email: form.work_email || null,
        user_password: form.user_password || null,
        user_role: form.user_role,
        account_active: form.account_active,
      }
      const res = await employeeService.create(payload)
      if (res.ok) {
        const data = await res.json()
        if (photoFile) {
          const fd = new FormData()
          fd.append('photo', photoFile)
          await employeeService.uploadPhoto(data.id, fd)
        }
        showToast(`${form.name} has been registered.`)
        setTimeout(() => navigate('/employees'), 1200)
      } else {
        const err = await res.json().catch(() => ({}))
        showToast(err.detail || 'Failed to create employee.', 'error')
      }
    } catch { showToast('Network error.', 'error') }
    setSaving(false)
  }

  return (
    <div className="p-margin-mobile md:p-margin-desktop">
      {toast && (
        <div className={`fixed top-20 right-6 z-50 flex items-center gap-md px-lg py-md rounded-xl shadow-lg border text-label-md font-bold transition-all ${toast.type === 'error' ? 'bg-error-container text-on-error-container border-error/30' : 'bg-secondary-container text-on-secondary-container border-secondary/30'}`}>
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
          <button onClick={handleSave} disabled={saving} className="px-xl py-md bg-primary text-on-primary font-bold rounded-lg shadow-sm hover:bg-primary-container transition-all disabled:opacity-50">
            {saving ? 'Saving…' : 'Save Employee'}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-12 gap-gutter">
        {/* Left Column */}
        <div className="col-span-12 lg:col-span-8 space-y-gutter">
          {/* Personal Info */}
          <section className="bg-surface-container-lowest rounded-xl p-xl border border-outline-variant shadow-sm">
            <div className="flex items-center gap-md mb-xl border-b border-outline-variant pb-md">
              <div className="w-10 h-10 rounded-full bg-primary-fixed flex items-center justify-center text-primary"><span className="material-symbols-outlined">person</span></div>
              <h3 className="text-headline-md text-on-surface">Personal Information</h3>
            </div>
            <div className="flex flex-col md:flex-row gap-xl items-start mb-xl">
              <div className="relative group shrink-0">
                <div onClick={() => photoRef.current.click()} className="w-32 h-32 rounded-xl bg-surface-container border-2 border-dashed border-outline-variant flex flex-col items-center justify-center text-on-surface-variant overflow-hidden cursor-pointer hover:border-primary/50 transition-colors">
                  {photoPreview ? <img src={photoPreview} alt="Preview" className="w-full h-full object-cover" /> : <><span className="material-symbols-outlined text-display">add_a_photo</span><span className="text-xs mt-xs">Upload Photo</span></>}
                </div>
                <button onClick={() => photoRef.current.click()} className="absolute -bottom-2 -right-2 w-8 h-8 rounded-full bg-primary text-white flex items-center justify-center shadow-md"><span className="material-symbols-outlined text-sm">edit</span></button>
                <input ref={photoRef} type="file" accept="image/*" className="hidden" onChange={handlePhoto} />
              </div>
              <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-md w-full">
                <div className="space-y-xs">
                  <label className="text-label-md text-on-surface-variant ml-xs">Full Name <span className="text-error">*</span></label>
                  <input className="w-full border border-outline-variant focus:border-primary focus:ring-1 focus:ring-primary rounded-lg py-md px-md text-body-md outline-none" placeholder="e.g. Jonathan Doe" type="text" {...f('name')} />
                </div>
                <div className="space-y-xs">
                  <label className="text-label-md text-on-surface-variant ml-xs">Gender</label>
                  <select className="w-full border border-outline-variant focus:border-primary focus:ring-1 focus:ring-primary rounded-lg py-md px-md text-body-md bg-surface-container-lowest" {...f('gender')}>
                    <option value="" disabled hidden>Select Gender</option>
                    <option>Male</option><option>Female</option><option>Other</option>
                  </select>
                </div>
                <div className="space-y-xs">
                  <label className="text-label-md text-on-surface-variant ml-xs">Date of Birth</label>
                  <input className="w-full border border-outline-variant focus:border-primary focus:ring-1 focus:ring-primary rounded-lg py-md px-md text-body-md outline-none" type="date" {...f('dob')} />
                </div>
                <div className="space-y-xs">
                  <label className="text-label-md text-on-surface-variant ml-xs">Phone Number <span className="text-error">*</span></label>
                  <input className="w-full border border-outline-variant focus:border-primary focus:ring-1 focus:ring-primary rounded-lg py-md px-md text-body-md outline-none" placeholder="+855 000-0000" type="tel" {...f('phone')} />
                </div>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-md">
              <div className="space-y-xs">
                <label className="text-label-md text-on-surface-variant ml-xs">Personal Email</label>
                <input className="w-full border border-outline-variant focus:border-primary focus:ring-1 focus:ring-primary rounded-lg py-md px-md text-body-md outline-none" placeholder="j.doe@example.com" type="email" {...f('personal_email')} />
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
              <div className="w-10 h-10 rounded-full bg-secondary-container flex items-center justify-center text-on-secondary-container"><span className="material-symbols-outlined">business_center</span></div>
              <h3 className="text-headline-md text-on-surface">Work Information</h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-md">
              <div className="space-y-xs">
                <label className="text-label-md text-on-surface-variant ml-xs">Employee ID</label>
                <input className="w-full border border-outline-variant focus:border-primary rounded-lg py-md px-md text-body-md font-mono outline-none" placeholder="Auto-generated if empty" type="text" {...f('emp_id')} />
              </div>
              <div className="space-y-xs">
                <label className="text-label-md text-on-surface-variant ml-xs">Department <span className="text-error">*</span></label>
                <select className="w-full border border-outline-variant focus:border-primary rounded-lg py-md px-md text-body-md" {...f('department_id')}>
                  <option value="" disabled hidden>Select Department</option>
                  {departments.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
                </select>
              </div>
              <div className="space-y-xs">
                <label className="text-label-md text-on-surface-variant ml-xs">Position</label>
                <select className="w-full border border-outline-variant focus:border-primary rounded-lg py-md px-md text-body-md" {...f('position_id')} disabled={!form.department_id}>
                  <option value="">Select Position</option>
                  {positions.map(p => <option key={p.id} value={p.id}>{p.title}</option>)}
                </select>
              </div>
              <div className="space-y-xs">
                <label className="text-label-md text-on-surface-variant ml-xs">Hire Date <span className="text-error">*</span></label>
                <input className="w-full border border-outline-variant focus:border-primary rounded-lg py-md px-md text-body-md outline-none" type="date" {...f('hire_date')} />
              </div>
              <div className="space-y-xs">
                <label className="text-label-md text-on-surface-variant ml-xs">Employment Type</label>
                <select className="w-full border border-outline-variant focus:border-primary rounded-lg py-md px-md text-body-md" {...f('employment_type')}>
                  <option>Full-time</option><option>Part-time</option><option>Contract</option><option>Internship</option>
                </select>
              </div>
              <div className="space-y-xs">
                <label className="text-label-md text-on-surface-variant ml-xs">Basic Salary (Monthly)</label>
                <div className="relative">
                  <span className="absolute left-md top-1/2 -translate-y-1/2 text-on-surface-variant">$</span>
                  <input className="w-full border border-outline-variant focus:border-primary rounded-lg py-md pl-xl pr-md text-body-md outline-none" placeholder="0.00" type="number" min="0" {...f('salary')} />
                </div>
              </div>
            </div>
          </section>

          {/* Account Info */}
          <section className="bg-surface-container-lowest rounded-xl p-xl border border-outline-variant shadow-sm">
            <div className="flex items-center gap-md mb-xl border-b border-outline-variant pb-md">
              <div className="w-10 h-10 rounded-full bg-tertiary-fixed flex items-center justify-center text-on-tertiary-fixed"><span className="material-symbols-outlined">account_circle</span></div>
              <h3 className="text-headline-md text-on-surface">Account Information</h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-md mb-md">
              <div className="space-y-xs">
                <label className="text-label-md text-on-surface-variant ml-xs">Work Email</label>
                <input className="w-full border border-outline-variant focus:border-primary rounded-lg py-md px-md text-body-md outline-none" placeholder="j.doe@company.com" type="email" {...f('work_email')} />
              </div>
              <div className="space-y-xs">
                <label className="text-label-md text-on-surface-variant ml-xs">Password {form.work_email && <span className="text-error">*</span>}</label>
                <div className="relative">
                  <input className="w-full border border-outline-variant focus:border-primary rounded-lg py-md px-md text-body-md pr-12 outline-none" type={showPassword ? 'text' : 'password'} {...f('user_password')} />
                  <button onClick={() => setShowPassword(v => !v)} className="absolute right-md top-1/2 -translate-y-1/2 text-on-surface-variant" type="button">
                    <span className="material-symbols-outlined">{showPassword ? 'visibility_off' : 'visibility'}</span>
                  </button>
                </div>
              </div>
              <div className="space-y-xs">
                <label className="text-label-md text-on-surface-variant ml-xs">User Role</label>
                <select className="w-full border border-outline-variant focus:border-primary rounded-lg py-md px-md text-body-md" {...f('user_role')}>
                  {roles.length > 0 ? roles.map(r => <option key={r.name} value={r.name}>{r.name}</option>) : (
                    <>
                      <option value="Admin">Admin</option>
                      <option value="HR Manager">HR Manager</option>
                      <option value="Manager">Manager</option>
                      <option value="Employee">Employee</option>
                    </>
                  )}
                </select>
              </div>
            </div>
            <div className="flex items-center gap-md p-md bg-surface-container-low rounded-lg border border-outline-variant border-dashed">
              <label className="relative inline-flex items-center cursor-pointer">
                <input checked={form.account_active} onChange={() => setForm(prev => ({ ...prev, account_active: !prev.account_active }))} className="sr-only peer" type="checkbox" />
                <div className="w-11 h-6 bg-outline-variant rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
              </label>
              <div>
                <p className="text-body-md font-bold text-on-surface">Account Status: {form.account_active ? 'Active' : 'Inactive'}</p>
                <p className="text-xs text-on-surface-variant">User will {form.account_active ? '' : 'not '}be able to log in immediately after saving.</p>
              </div>
            </div>
          </section>

          <div className="flex flex-wrap justify-end gap-md pb-xl">
            <Link to="/employees" className="px-lg py-md text-primary font-bold border border-primary hover:bg-primary-fixed-dim rounded-lg transition-all">Cancel Registration</Link>
            <button onClick={handleSave} disabled={saving} className="px-xl py-md bg-primary text-on-primary font-bold rounded-lg shadow-md hover:bg-primary-container transition-all flex items-center gap-sm disabled:opacity-50">
              <span className="material-symbols-outlined text-sm">save</span>
              {saving ? 'Saving…' : 'Save Employee'}
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
                  <span className={`material-symbols-outlined text-[20px] ${item.done ? 'text-on-primary-container' : 'text-on-primary-container/40'}`} style={{ fontVariationSettings: item.done ? "'FILL' 1" : "'FILL' 0" }}>{item.done ? 'check_circle' : 'radio_button_unchecked'}</span>
                  <span className={`text-body-md ${item.done ? '' : 'opacity-60'}`}>{item.label}</span>
                </div>
              ))}
            </div>
            <div className="mt-lg pt-md border-t border-on-primary-container/20">
              <div className="flex justify-between text-label-sm mb-1"><span>Progress</span><span>{checklist.filter(i => i.done).length}/{checklist.length}</span></div>
              <div className="w-full h-1.5 bg-on-primary-container/20 rounded-full overflow-hidden">
                <div className="h-full bg-on-primary-container rounded-full transition-all duration-500" style={{ width: `${(checklist.filter(i => i.done).length / checklist.length) * 100}%` }}></div>
              </div>
            </div>
          </div>

          <div className="bg-surface-container-lowest border border-outline-variant rounded-xl p-xl shadow-sm">
            <h4 className="text-headline-md mb-md text-on-surface">Recently Added</h4>
            <div className="space-y-md">
              {recentEmps.length === 0 ? (
                <p className="text-label-sm text-on-surface-variant">No employees yet.</p>
              ) : recentEmps.map(emp => (
                <div key={emp.id} className="flex items-center gap-sm">
                  <div className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-sm">{emp.name.split(' ').map(n => n[0]).join('')}</div>
                  <div>
                    <p className="text-body-md font-bold">{emp.name}</p>
                    <p className="text-label-sm text-on-surface-variant">{emp.department?.name ?? '—'} · {emp.hire_date ?? ''}</p>
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
