import { useState, useEffect } from 'react'
<<<<<<< HEAD
import { api } from '../../lib/api.js'
import { useAuth } from '../../context/AuthContext.jsx'

export default function PersonalProfile() {
  const { user: authUser } = useAuth()
  const [profile, setProfile]   = useState(null)
  const [employee, setEmployee] = useState(null)
  const [loading, setLoading]   = useState(true)
  const [toast, setToast]       = useState(null)
  const [editForm, setEditForm] = useState({ name: '', email: '' })
  const [showEdit, setShowEdit] = useState(false)
  const [pwForm, setPwForm]     = useState({ current_password: '', new_password: '', confirm_password: '' })
  const [pwErrors, setPwErrors] = useState({})
  const [saving, setSaving]     = useState(false)

  const showToast = (message, type = 'success') => { setToast({ message, type }); setTimeout(() => setToast(null), 3000) }

  useEffect(() => {
    const load = async () => {
      try {
        const res = await api.get('/users/profile/me')
        if (res.ok) {
          const d = await res.json()
          setProfile(d)
          setEditForm({ name: d.name, email: d.email })
          if (d.employee_id) {
            const eRes = await api.get(`/employees/${d.employee_id}`)
            if (eRes.ok) setEmployee(await eRes.json())
          }
        }
      } catch { /* ignore */ }
      setLoading(false)
=======
import { useAuth } from '../../context/AuthContext'

const BASE = import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:8000'

function authFetch(path, options = {}) {
  const token = localStorage.getItem('access_token')
  return fetch(`${BASE}${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
      ...options.headers,
    },
  }).then(async res => {
    if (!res.ok) {
      const err = await res.json().catch(() => ({}))
      throw new Error(err.detail ?? 'Request failed')
    }
    return res.status === 204 ? null : res.json()
  })
}

function formatDate(val) {
  if (!val) return '—'
  return new Date(val).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })
}

function tenure(val) {
  if (!val) return ''
  const ms = Date.now() - new Date(val).getTime()
  const totalMonths = Math.floor(ms / (1000 * 60 * 60 * 24 * 30.44))
  const y = Math.floor(totalMonths / 12)
  const m = totalMonths % 12
  return [y && `${y}y`, m && `${m}mo`].filter(Boolean).join(' ')
}

export default function PersonalProfile() {
  const { user, updateUser } = useAuth()
  const [profile, setProfile] = useState(null)
  const [employee, setEmployee] = useState(null)
  const [loading, setLoading] = useState(true)

  const [editOpen, setEditOpen] = useState(false)
  const [editForm, setEditForm] = useState({ name: '', email: '' })
  const [editSaving, setEditSaving] = useState(false)
  const [editError, setEditError] = useState('')

  const [pwForm, setPwForm] = useState({ current_password: '', new_password: '', confirm_password: '' })
  const [pwStatus, setPwStatus] = useState(null)
  const [showPw, setShowPw] = useState({ current: false, new_: false, confirm: false })

  useEffect(() => {
    async function load() {
      try {
        const p = await authFetch('/users/profile/me')
        setProfile(p)
        if (p.employee_id) {
          try {
            const e = await authFetch(`/employees/${p.employee_id}`)
            setEmployee(e)
          } catch {
            // employee record not accessible — skip silently
          }
        }
      } catch (err) {
        console.error('Failed to load profile:', err)
      } finally {
        setLoading(false)
      }
>>>>>>> 3a4016af3185dc214f873ba808f24b3185e9d7d6
    }
    load()
  }, [])

<<<<<<< HEAD
  const handleSaveProfile = async () => {
    setSaving(true)
    try {
      const res = await api.put('/users/profile/me', editForm)
      if (res.ok) {
        const d = await res.json()
        setProfile(d)
        showToast('Profile updated.')
        setShowEdit(false)
      } else {
        const err = await res.json().catch(() => ({}))
        showToast(err.detail || 'Update failed.', 'error')
      }
    } catch { showToast('Network error.', 'error') }
    setSaving(false)
  }

  const handleChangePassword = async () => {
    const errs = {}
    if (!pwForm.current_password) errs.current_password = 'Required.'
    if (!pwForm.new_password) errs.new_password = 'Required.'
    else if (pwForm.new_password.length < 8) errs.new_password = 'At least 8 characters.'
    if (pwForm.new_password !== pwForm.confirm_password) errs.confirm_password = 'Passwords do not match.'
    if (Object.keys(errs).length) { setPwErrors(errs); return }
    setSaving(true)
    try {
      const res = await api.put('/users/profile/password', pwForm)
      if (res.ok || res.status === 204) {
        showToast('Password updated.')
        setPwForm({ current_password: '', new_password: '', confirm_password: '' })
        setPwErrors({})
      } else {
        const err = await res.json().catch(() => ({}))
        showToast(err.detail || 'Password change failed.', 'error')
      }
    } catch { showToast('Network error.', 'error') }
    setSaving(false)
  }

  if (loading) return (
    <div className="pt-8 px-margin-mobile md:px-margin-desktop flex items-center justify-center h-64">
      <span className="material-symbols-outlined text-primary text-[40px]" style={{ animation: 'spin 1s linear infinite' }}>progress_activity</span>
    </div>
  )

  if (!profile) return (
    <div className="pt-8 px-margin-mobile md:px-margin-desktop">
      <div className="bg-error-container/20 border border-error/20 rounded-xl p-lg text-on-error-container">Failed to load profile.</div>
    </div>
  )

  const initials = profile.name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()
=======
  function openEdit() {
    setEditForm({ name: profile?.name ?? user?.name ?? '', email: profile?.email ?? user?.email ?? '' })
    setEditError('')
    setEditOpen(true)
  }

  async function handleEditSave(e) {
    e.preventDefault()
    setEditSaving(true)
    setEditError('')
    try {
      const updated = await authFetch('/users/profile/me', {
        method: 'PUT',
        body: JSON.stringify({ name: editForm.name, email: editForm.email }),
      })
      setProfile(updated)
      updateUser({ name: updated.name, email: updated.email })
      setEditOpen(false)
    } catch (err) {
      setEditError(err.message)
    } finally {
      setEditSaving(false)
    }
  }

  async function handlePasswordChange(e) {
    e.preventDefault()
    if (pwForm.new_password !== pwForm.confirm_password) {
      setPwStatus('Passwords do not match')
      return
    }
    setPwStatus('loading')
    try {
      await authFetch('/users/profile/password', {
        method: 'PUT',
        body: JSON.stringify(pwForm),
      })
      setPwStatus('success')
      setPwForm({ current_password: '', new_password: '', confirm_password: '' })
    } catch (err) {
      setPwStatus(err.message)
    }
  }

  const displayName = profile?.name ?? user?.name ?? '—'
  const displayEmail = profile?.email ?? user?.email ?? '—'
  const displayRole = profile?.role ?? user?.role ?? '—'
  const joinDate = employee?.hire_date ?? null
>>>>>>> 3a4016af3185dc214f873ba808f24b3185e9d7d6

  return (
    <div className="pt-8 px-margin-mobile md:px-margin-desktop max-w-6xl mx-auto pb-xl">
      {toast && (
        <div className={`fixed top-20 right-6 z-50 flex items-center gap-md px-lg py-md rounded-xl shadow-lg border text-label-md font-bold transition-all ${toast.type === 'error' ? 'bg-error-container text-on-error-container border-error/30' : 'bg-secondary-container text-on-secondary-container border-secondary/30'}`}>
          <span className="material-symbols-outlined text-[20px]">{toast.type === 'error' ? 'error' : 'check_circle'}</span>
          {toast.message}
        </div>
      )}

      {/* Edit Profile Modal */}
      {showEdit && (
        <div className="fixed inset-0 z-50 bg-on-background/40 backdrop-blur-sm flex items-center justify-center p-margin-mobile">
          <div className="bg-surface-container-lowest border border-outline-variant rounded-2xl p-xl shadow-2xl w-full max-w-md">
            <h3 className="text-headline-md mb-lg">Edit Profile</h3>
            <div className="space-y-md">
              <div className="flex flex-col gap-xs">
                <label className="text-label-md text-on-surface-variant">Full Name</label>
                <input className="bg-surface border border-outline-variant rounded-lg p-md text-body-md focus:ring-1 focus:ring-primary outline-none" value={editForm.name} onChange={e => setEditForm(p => ({ ...p, name: e.target.value }))} />
              </div>
              <div className="flex flex-col gap-xs">
                <label className="text-label-md text-on-surface-variant">Email</label>
                <input className="bg-surface border border-outline-variant rounded-lg p-md text-body-md focus:ring-1 focus:ring-primary outline-none" type="email" value={editForm.email} onChange={e => setEditForm(p => ({ ...p, email: e.target.value }))} />
              </div>
            </div>
            <div className="flex gap-sm justify-end mt-xl">
              <button onClick={() => setShowEdit(false)} className="px-lg py-sm bg-surface-container border border-outline-variant text-on-surface rounded-lg text-label-md">Cancel</button>
              <button onClick={handleSaveProfile} disabled={saving} className="px-lg py-sm bg-primary text-on-primary rounded-lg text-label-md disabled:opacity-50">{saving ? 'Saving…' : 'Save'}</button>
            </div>
          </div>
        </div>
      )}

      {/* Hero */}
      <div className="bg-surface-container-lowest rounded-xl border border-outline-variant p-xl mb-lg relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-32 bg-primary/5"></div>
        <div className="relative flex flex-col md:flex-row items-start md:items-end gap-lg">
<<<<<<< HEAD
          <div className="relative group">
            <div className="w-32 h-32 md:w-40 md:h-40 rounded-xl bg-primary/10 flex items-center justify-center text-primary text-4xl font-bold border-4 border-surface-container-lowest shadow-md">{initials}</div>
          </div>
          <div className="flex-1 pb-xs">
            <h1 className="text-display text-on-surface">{profile.name}</h1>
            <p className="text-headline-md text-primary mt-1">{profile.role}</p>
            <div className="flex flex-wrap gap-md mt-md">
              <span className="inline-flex items-center px-sm py-xs rounded-lg bg-secondary-container/20 text-on-secondary-container text-label-md">
                <span className="material-symbols-outlined text-[16px] mr-xs" style={{ fontVariationSettings: "'FILL' 1" }}>verified</span> Verified Employee
              </span>
              {employee?.department && (
                <span className="inline-flex items-center px-sm py-xs rounded-lg bg-surface-container text-on-surface-variant text-label-md">
                  <span className="material-symbols-outlined text-[16px] mr-xs">domain</span>{employee.department.name}
=======
          <div className="relative">
            <div className="w-32 h-32 md:w-40 md:h-40 rounded-xl bg-primary/10 flex items-center justify-center text-primary border-4 border-surface-container-lowest shadow-md">
              <span className="material-symbols-outlined text-[80px]" style={{ fontVariationSettings: "'FILL' 1" }}>person</span>
            </div>
            <button className="absolute bottom-2 right-2 bg-primary text-on-primary p-2 rounded-lg shadow-lg hover:opacity-90 transition-colors" type="button">
              <span className="material-symbols-outlined text-[20px]">photo_camera</span>
            </button>
          </div>
          <div className="flex-1 pb-xs">
            {loading ? (
              <div className="h-9 w-56 bg-surface-container rounded-lg animate-pulse mb-2" />
            ) : (
              <h1 className="text-display text-on-surface">{displayName}</h1>
            )}
            <p className="text-headline-md text-primary mt-1">{displayRole}</p>
            <div className="flex flex-wrap gap-md mt-md">
              <span className="inline-flex items-center px-sm py-xs rounded-lg bg-secondary-container/20 text-on-secondary-container text-label-md">
                <span className="material-symbols-outlined text-[16px] mr-xs" style={{ fontVariationSettings: "'FILL' 1" }}>verified</span>
                Verified Employee
              </span>
              {employee?.emp_id && (
                <span className="inline-flex items-center px-sm py-xs rounded-lg bg-surface-container text-on-surface-variant text-label-md">
                  <span className="material-symbols-outlined text-[16px] mr-xs">badge</span>
                  {employee.emp_id}
>>>>>>> 3a4016af3185dc214f873ba808f24b3185e9d7d6
                </span>
              )}
            </div>
          </div>
          <div className="flex flex-wrap gap-md pb-xs">
<<<<<<< HEAD
            <button onClick={() => setShowEdit(true)} className="px-lg py-md bg-primary text-on-primary rounded-lg text-label-md hover:opacity-90 active:scale-95 transition-all flex items-center gap-xs">
=======
            <button
              onClick={openEdit}
              className="px-lg py-md bg-primary text-on-primary rounded-lg text-label-md hover:opacity-90 active:scale-95 transition-all flex items-center gap-xs"
              type="button"
            >
>>>>>>> 3a4016af3185dc214f873ba808f24b3185e9d7d6
              <span className="material-symbols-outlined text-[18px]">edit</span> Edit Profile
            </button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-lg">
<<<<<<< HEAD
        {/* Contact */}
=======
        {/* Contact & Account */}
>>>>>>> 3a4016af3185dc214f873ba808f24b3185e9d7d6
        <div className="md:col-span-1 space-y-lg">
          <div className="bg-surface-container-lowest rounded-xl border border-outline-variant p-lg hover:border-primary/30 transition-colors">
            <div className="flex items-center justify-between mb-lg">
              <h3 className="text-headline-md text-on-surface">Contact Information</h3>
              <span className="material-symbols-outlined text-outline">alternate_email</span>
            </div>
            <div className="space-y-md">
<<<<<<< HEAD
              <div><label className="text-label-sm text-outline uppercase tracking-wider">Email Address</label><p className="text-body-md font-medium text-on-surface">{profile.email}</p></div>
              {employee?.phone && <div><label className="text-label-sm text-outline uppercase tracking-wider">Phone Number</label><p className="text-body-md font-medium text-on-surface">{employee.phone}</p></div>}
              {employee?.address && <div><label className="text-label-sm text-outline uppercase tracking-wider">Address</label><p className="text-body-md font-medium text-on-surface">{employee.address}</p></div>}
=======
              {[
                { label: 'Email Address', val: displayEmail },
                { label: 'Phone Number', val: employee?.phone ?? '—' },
                { label: 'Work Email', val: employee?.work_email ?? displayEmail },
              ].map(item => (
                <div key={item.label}>
                  <label className="text-label-sm text-outline uppercase tracking-wider">{item.label}</label>
                  <p className="text-body-md font-medium text-on-surface">{item.val}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-surface-container-lowest rounded-xl border border-outline-variant p-lg hover:border-primary/30 transition-colors">
            <div className="flex items-center justify-between mb-lg">
              <h3 className="text-headline-md text-on-surface">Account Details</h3>
              <span className="material-symbols-outlined text-outline">manage_accounts</span>
            </div>
            <div className="space-y-md">
              {[
                { label: 'Account Status', val: profile?.status ?? '—' },
                { label: 'Last Login', val: formatDate(profile?.last_login) },
                { label: 'Member Since', val: formatDate(profile?.created_at) },
              ].map(item => (
                <div key={item.label}>
                  <label className="text-label-sm text-outline uppercase tracking-wider">{item.label}</label>
                  <p className="text-body-md font-medium text-on-surface">{item.val}</p>
                </div>
              ))}
>>>>>>> 3a4016af3185dc214f873ba808f24b3185e9d7d6
            </div>
          </div>
        </div>

        {/* Work Info */}
        <div className="md:col-span-2 space-y-lg">
<<<<<<< HEAD
          {employee && (
            <div className="bg-surface-container-lowest rounded-xl border border-outline-variant p-lg hover:border-primary/30 transition-colors">
              <div className="flex items-center justify-between mb-lg">
                <h3 className="text-headline-md text-on-surface">Work Information</h3>
                <span className="material-symbols-outlined text-outline">business_center</span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-xl">
                <div><label className="text-label-sm text-outline uppercase tracking-wider">Current Position</label><p className="text-body-lg font-medium text-on-surface mt-xs">{employee.position?.title ?? '—'}</p></div>
                <div><label className="text-label-sm text-outline uppercase tracking-wider">Department</label><p className="text-body-lg font-medium text-on-surface mt-xs">{employee.department?.name ?? '—'}</p></div>
                <div><label className="text-label-sm text-outline uppercase tracking-wider">Employee ID</label><p className="text-body-lg font-medium text-on-surface mt-xs">{employee.emp_id}</p></div>
                <div><label className="text-label-sm text-outline uppercase tracking-wider">Join Date</label><p className="text-body-lg font-medium text-on-surface mt-xs">{employee.hire_date ? new Date(employee.hire_date).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }) : '—'}</p></div>
                <div><label className="text-label-sm text-outline uppercase tracking-wider">Employment Type</label><p className="text-body-lg font-medium text-on-surface mt-xs">{employee.employment_type ?? '—'}</p></div>
                <div><label className="text-label-sm text-outline uppercase tracking-wider">Status</label><p className="text-body-lg font-medium text-on-surface mt-xs">{employee.status}</p></div>
              </div>
=======
          <div className="bg-surface-container-lowest rounded-xl border border-outline-variant p-lg hover:border-primary/30 transition-colors">
            <div className="flex items-center justify-between mb-lg">
              <h3 className="text-headline-md text-on-surface">Work Information</h3>
              <span className="material-symbols-outlined text-outline">business_center</span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-xl">
              <div>
                <label className="text-label-sm text-outline uppercase tracking-wider">Current Position</label>
                <p className="text-body-lg font-medium text-on-surface mt-xs">{employee?.position?.title ?? displayRole}</p>
                {employee?.employment_type && (
                  <p className="text-label-sm text-on-surface-variant">{employee.employment_type}</p>
                )}
              </div>
              <div>
                <label className="text-label-sm text-outline uppercase tracking-wider">Department</label>
                <p className="text-body-lg font-medium text-on-surface mt-xs">{employee?.department?.name ?? '—'}</p>
              </div>
              <div>
                <label className="text-label-sm text-outline uppercase tracking-wider">Join Date</label>
                <p className="text-body-lg font-medium text-on-surface mt-xs">{formatDate(joinDate)}</p>
                {joinDate && <p className="text-label-sm text-on-surface-variant">{tenure(joinDate)}</p>}
              </div>
              <div>
                <label className="text-label-sm text-outline uppercase tracking-wider">Employee ID</label>
                <p className="text-body-lg font-medium text-on-surface mt-xs">{employee?.emp_id ?? profile?.employee_id ?? '—'}</p>
              </div>
              {employee?.address && (
                <div className="sm:col-span-2">
                  <label className="text-label-sm text-outline uppercase tracking-wider">Address</label>
                  <p className="text-body-lg font-medium text-on-surface mt-xs">{employee.address}</p>
                </div>
              )}
>>>>>>> 3a4016af3185dc214f873ba808f24b3185e9d7d6
            </div>
          )}

          {/* Change Password */}
          <div className="bg-surface-container-lowest rounded-xl border border-outline-variant overflow-hidden hover:border-primary/30 transition-colors">
            <div className="p-lg border-b border-outline-variant flex items-center justify-between">
              <div>
                <h3 className="text-headline-md text-on-surface">Security &amp; Password</h3>
                <p className="text-body-md text-on-surface-variant">Manage your access credentials.</p>
              </div>
              <span className="material-symbols-outlined text-primary text-[32px]">security</span>
            </div>
<<<<<<< HEAD
            <div className="p-lg">
              <div className="bg-surface-container/30 p-lg rounded-xl space-y-md max-w-md">
                <h4 className="font-bold text-on-surface">Change Password</h4>
                <div className="space-y-xs">
                  <label className="text-label-sm text-on-surface-variant">Current Password</label>
                  <input className="w-full bg-surface border border-outline-variant rounded-lg p-md focus:ring-2 focus:ring-primary focus:border-primary transition-all outline-none" placeholder="••••••••" type="password" value={pwForm.current_password} onChange={e => { setPwForm(p => ({ ...p, current_password: e.target.value })); setPwErrors(p => ({ ...p, current_password: '' })) }} />
                  {pwErrors.current_password && <p className="text-label-sm text-error">{pwErrors.current_password}</p>}
                </div>
                <div className="space-y-xs">
                  <label className="text-label-sm text-on-surface-variant">New Password</label>
                  <input className="w-full bg-surface border border-outline-variant rounded-lg p-md focus:ring-2 focus:ring-primary focus:border-primary transition-all outline-none" placeholder="Enter new password" type="password" value={pwForm.new_password} onChange={e => { setPwForm(p => ({ ...p, new_password: e.target.value })); setPwErrors(p => ({ ...p, new_password: '' })) }} />
                  {pwErrors.new_password && <p className="text-label-sm text-error">{pwErrors.new_password}</p>}
                </div>
                <div className="space-y-xs">
                  <label className="text-label-sm text-on-surface-variant">Confirm Password</label>
                  <input className="w-full bg-surface border border-outline-variant rounded-lg p-md focus:ring-2 focus:ring-primary focus:border-primary transition-all outline-none" placeholder="Repeat new password" type="password" value={pwForm.confirm_password} onChange={e => { setPwForm(p => ({ ...p, confirm_password: e.target.value })); setPwErrors(p => ({ ...p, confirm_password: '' })) }} />
                  {pwErrors.confirm_password && <p className="text-label-sm text-error">{pwErrors.confirm_password}</p>}
                </div>
                <button onClick={handleChangePassword} disabled={saving} className="w-full py-md bg-secondary text-on-secondary rounded-lg text-label-md hover:opacity-90 active:scale-95 transition-all disabled:opacity-50">{saving ? 'Updating…' : 'Update Password'}</button>
              </div>
=======
            <div className="p-lg grid grid-cols-1 md:grid-cols-2 gap-xl">
              <div className="space-y-lg">
                <div className="flex items-start gap-md">
                  <div className="w-10 h-10 rounded-full bg-secondary-container/20 flex items-center justify-center flex-shrink-0">
                    <span className="material-symbols-outlined text-on-secondary-container">shield_with_heart</span>
                  </div>
                  <div>
                    <p className="font-medium text-on-surface">Two-Factor Authentication</p>
                    <p className="text-label-md text-on-surface-variant">Highly recommended for administrators to prevent unauthorized access.</p>
                    <button className="mt-md text-primary font-bold text-label-md hover:underline" type="button">Enable 2FA Now</button>
                  </div>
                </div>
                <div className="flex items-start gap-md">
                  <div className="w-10 h-10 rounded-full bg-surface-container flex items-center justify-center flex-shrink-0">
                    <span className="material-symbols-outlined text-on-surface-variant">devices</span>
                  </div>
                  <div>
                    <p className="font-medium text-on-surface">Last Active Session</p>
                    <p className="text-label-md text-on-surface-variant">
                      {profile?.last_login ? `Last login: ${formatDate(profile.last_login)}` : 'No session data available'}
                    </p>
                    <button className="mt-md text-primary font-bold text-label-md hover:underline" type="button">View All Sessions</button>
                  </div>
                </div>
              </div>

              <form onSubmit={handlePasswordChange} className="bg-surface-container/30 p-lg rounded-xl space-y-md">
                <h4 className="font-bold text-on-surface">Change Password</h4>

                {pwStatus === 'success' && (
                  <div className="flex items-center gap-sm p-md bg-secondary/10 border border-secondary/30 rounded-lg text-body-sm text-on-secondary-container">
                    <span className="material-symbols-outlined text-[18px] shrink-0" style={{ fontVariationSettings: "'FILL' 1" }}>check_circle</span>
                    Password updated successfully.
                  </div>
                )}
                {typeof pwStatus === 'string' && pwStatus !== 'loading' && pwStatus !== 'success' && (
                  <div className="flex items-center gap-sm p-md bg-error/10 border border-error/30 rounded-lg text-body-sm text-error">
                    <span className="material-symbols-outlined text-[18px] shrink-0">error</span>
                    {pwStatus}
                  </div>
                )}

                {[
                  { key: 'current_password', label: 'Current Password', showKey: 'current', placeholder: '••••••••' },
                  { key: 'new_password', label: 'New Password', showKey: 'new_', placeholder: 'Enter new password' },
                  { key: 'confirm_password', label: 'Confirm New Password', showKey: 'confirm', placeholder: 'Repeat new password' },
                ].map(({ key, label, showKey, placeholder }) => (
                  <div key={key} className="space-y-xs">
                    <label className="text-label-sm text-on-surface-variant">{label}</label>
                    <div className="relative">
                      <input
                        className="w-full bg-surface border border-outline-variant rounded-lg p-md pr-[44px] focus:ring-2 focus:ring-primary focus:border-primary transition-all outline-none text-body-md"
                        placeholder={placeholder}
                        type={showPw[showKey] ? 'text' : 'password'}
                        value={pwForm[key]}
                        onChange={e => setPwForm(f => ({ ...f, [key]: e.target.value }))}
                        required
                      />
                      <button
                        type="button"
                        onClick={() => setShowPw(s => ({ ...s, [showKey]: !s[showKey] }))}
                        className="absolute right-md top-1/2 -translate-y-1/2 text-outline hover:text-on-surface transition-colors"
                      >
                        <span className="material-symbols-outlined text-[20px]">{showPw[showKey] ? 'visibility_off' : 'visibility'}</span>
                      </button>
                    </div>
                  </div>
                ))}

                <button
                  className="w-full py-md bg-secondary text-on-secondary rounded-lg text-label-md hover:opacity-90 active:scale-95 transition-all disabled:opacity-60 disabled:cursor-not-allowed"
                  disabled={pwStatus === 'loading'}
                  type="submit"
                >
                  {pwStatus === 'loading' ? 'Updating…' : 'Update Password'}
                </button>
              </form>
>>>>>>> 3a4016af3185dc214f873ba808f24b3185e9d7d6
            </div>
          </div>
        </div>
      </div>

      {/* Edit Profile Modal */}
      {editOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-md">
          <div className="absolute inset-0 bg-on-background/40 backdrop-blur-sm" onClick={() => setEditOpen(false)} />
          <div className="relative w-full max-w-md bg-surface-container-lowest rounded-xl border border-outline-variant shadow-2xl">
            <div className="flex items-center justify-between px-xl pt-xl pb-md">
              <h3 className="text-headline-md text-on-surface">Edit Profile</h3>
              <button
                onClick={() => setEditOpen(false)}
                className="text-outline hover:text-on-surface transition-colors p-xs rounded-lg hover:bg-surface-container"
                type="button"
              >
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>
            <form onSubmit={handleEditSave} className="px-xl pb-xl space-y-lg">
              {editError && (
                <div className="flex items-center gap-sm p-md bg-error/10 border border-error/30 rounded-lg text-body-sm text-error">
                  <span className="material-symbols-outlined text-[18px] shrink-0">error</span>
                  {editError}
                </div>
              )}
              <div className="space-y-xs">
                <label className="text-label-md text-on-surface ml-xs block" htmlFor="edit-name">Full Name</label>
                <input
                  autoFocus
                  className="w-full px-md py-md bg-surface-container-low border border-outline-variant rounded-lg focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all text-body-md"
                  id="edit-name"
                  required
                  type="text"
                  value={editForm.name}
                  onChange={e => setEditForm(f => ({ ...f, name: e.target.value }))}
                />
              </div>
              <div className="space-y-xs">
                <label className="text-label-md text-on-surface ml-xs block" htmlFor="edit-email">Email Address</label>
                <input
                  className="w-full px-md py-md bg-surface-container-low border border-outline-variant rounded-lg focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all text-body-md"
                  id="edit-email"
                  required
                  type="email"
                  value={editForm.email}
                  onChange={e => setEditForm(f => ({ ...f, email: e.target.value }))}
                />
              </div>
              <div className="flex gap-md pt-xs">
                <button
                  type="button"
                  onClick={() => setEditOpen(false)}
                  className="flex-1 py-md border border-outline-variant rounded-lg text-label-md text-on-surface hover:bg-surface-container transition-all"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={editSaving}
                  className="flex-1 py-md bg-primary text-on-primary rounded-lg text-label-md hover:opacity-90 active:scale-95 transition-all disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  {editSaving ? 'Saving…' : 'Save Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
