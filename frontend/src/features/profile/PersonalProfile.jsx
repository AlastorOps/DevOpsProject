import { useState, useEffect } from 'react'
import { useAuth } from '../../context/AuthContext'
import { profileService } from '../../api/users.js'
import { client } from '../../api/client.js'

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

  const [editOpen, setEditOpen]       = useState(false)
  const [editLoading, setEditLoading] = useState(false)
  const [editForm, setEditForm]       = useState({ name: '', email: '', phone: '', personal_email: '', address: '', dob: '', gender: '' })
  const [editSaving, setEditSaving]   = useState(false)
  const [editError, setEditError]     = useState('')
  const [photoFile, setPhotoFile]     = useState(null)
  const [photoPreview, setPhotoPreview]     = useState(null)
  const [currentPhotoPath, setCurrentPhotoPath] = useState(null)
  const [photoVersion, setPhotoVersion] = useState(() => Date.now())

  const [pwForm, setPwForm] = useState({ current_password: '', new_password: '', confirm_password: '' })
  const [pwStatus, setPwStatus] = useState(null)
  const [showPw, setShowPw] = useState({ current: false, new_: false, confirm: false })

  useEffect(() => {
    async function load() {
      try {
        const p = await profileService.get()
        setProfile(p)
        if (p.employee_id) {
          try {
            const eRes = await client.get(`/employees/${p.employee_id}`)
            if (eRes.ok) setEmployee(await eRes.json())
          } catch {
            // employee record not accessible — skip silently
          }
        }
      } catch (err) {
        console.error('Failed to load profile:', err)
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  async function openEdit() {
    setEditOpen(true)
    setEditLoading(true)
    setEditError('')
    setPhotoFile(null)
    setPhotoPreview(null)
    try {
      const empData = await profileService.getMyEmployee()
      console.log('[EditProfile] Loaded employee data:', empData)
      setCurrentPhotoPath(empData.photo_path ?? null)
      setEditForm({
        name:           empData.name           ?? profile?.name  ?? user?.name  ?? '',
        email:          empData.work_email     ?? profile?.email ?? user?.email ?? '',
        phone:          empData.phone          ?? '',
        personal_email: empData.personal_email ?? '',
        address:        empData.address        ?? '',
        dob:            empData.dob            ?? '',
        gender:         empData.gender         ?? '',
      })
    } catch (err) {
      console.error('[EditProfile] Failed to load profile:', err)
      setCurrentPhotoPath(employee?.photo_path ?? null)
      setEditForm({
        name:           profile?.name  ?? user?.name  ?? '',
        email:          profile?.email ?? user?.email ?? '',
        phone:          employee?.phone          ?? '',
        personal_email: employee?.personal_email ?? '',
        address:        employee?.address        ?? '',
        dob:            employee?.dob            ?? '',
        gender:         employee?.gender         ?? '',
      })
      setEditError('Could not refresh profile data — showing last known values.')
    } finally {
      setEditLoading(false)
    }
  }

  function handlePhotoChange(e) {
    const file = e.target.files[0]
    if (!file) return
    setPhotoFile(file)
    setPhotoPreview(URL.createObjectURL(file))
  }

  async function handleEditSave(e) {
    e.preventDefault()
    setEditSaving(true)
    setEditError('')
    try {
      // 1. Update user account (name + email)
      const userUpdated = await profileService.update({ name: editForm.name, email: editForm.email })
      setProfile(userUpdated)

      // 2. Update employee personal fields
      const empUpdated = await profileService.updateMyEmployee({
        name:           editForm.name           || null,
        phone:          editForm.phone          || null,
        personal_email: editForm.personal_email || null,
        address:        editForm.address        || null,
        dob:            editForm.dob            || null,
        gender:         editForm.gender         || null,
      })

      // 3. Upload photo if selected
      let finalPhotoPath = empUpdated.photo_path
      if (photoFile) {
        const fd = new FormData()
        fd.append('photo', photoFile)
        const photoRes = await profileService.uploadMyPhoto(fd)
        finalPhotoPath = photoRes.photo_path
        setPhotoVersion(Date.now())
      }

      setEmployee({ ...empUpdated, photo_path: finalPhotoPath })
      setCurrentPhotoPath(finalPhotoPath)
      updateUser({ name: userUpdated.name, email: userUpdated.email, photo_path: finalPhotoPath, photo_ts: Date.now() })
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
      await profileService.changePassword(pwForm)
      setPwStatus('success')
      setPwForm({ current_password: '', new_password: '', confirm_password: '' })
    } catch (err) {
      setPwStatus(err.message)
    }
  }

  const displayName  = profile?.name  ?? user?.name  ?? '—'
  const displayEmail = profile?.email ?? user?.email ?? '—'
  const displayRole  = profile?.role  ?? user?.role  ?? '—'
  const joinDate     = employee?.hire_date ?? null

  return (
    <div className="pt-8 px-margin-mobile md:px-margin-desktop max-w-6xl mx-auto pb-xl">

      {/* Hero */}
      <div className="bg-surface-container-lowest rounded-xl border border-outline-variant p-xl mb-lg relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-32 bg-primary/5"></div>
        <div className="relative flex flex-col md:flex-row items-start md:items-end gap-lg">
          <div className="relative">
            <div className="w-32 h-32 md:w-40 md:h-40 rounded-xl bg-primary/10 flex items-center justify-center text-primary border-4 border-surface-container-lowest shadow-md overflow-hidden">
              {employee?.photo_path
                ? <img src={`/uploads/${employee.photo_path}?v=${photoVersion}`} alt={displayName} className="w-full h-full object-cover" />
                : <span className="material-symbols-outlined text-[80px]" style={{ fontVariationSettings: "'FILL' 1" }}>person</span>
              }
            </div>
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
                </span>
              )}
            </div>
          </div>
          <div className="flex flex-wrap gap-md pb-xs">
            <button
              onClick={openEdit}
              className="px-lg py-md bg-primary text-on-primary rounded-lg text-label-md hover:opacity-90 active:scale-95 transition-all flex items-center gap-xs"
              type="button"
            >
              <span className="material-symbols-outlined text-[18px]">edit</span> Edit Profile
            </button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-lg">
        {/* Contact & Account */}
        <div className="md:col-span-1 space-y-lg">
          <div className="bg-surface-container-lowest rounded-xl border border-outline-variant p-lg hover:border-primary/30 transition-colors">
            <div className="flex items-center justify-between mb-lg">
              <h3 className="text-headline-md text-on-surface">Contact Information</h3>
              <span className="material-symbols-outlined text-outline">alternate_email</span>
            </div>
            <div className="space-y-md">
              {[
                { label: 'Email Address', val: displayEmail },
                { label: 'Phone Number', val: employee?.phone ?? '—' },
                { label: 'Work Email',   val: employee?.work_email ?? displayEmail },
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
                { label: 'Last Login',     val: formatDate(profile?.last_login) },
                { label: 'Member Since',   val: formatDate(profile?.created_at) },
              ].map(item => (
                <div key={item.label}>
                  <label className="text-label-sm text-outline uppercase tracking-wider">{item.label}</label>
                  <p className="text-body-md font-medium text-on-surface">{item.val}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Work Info + Security */}
        <div className="md:col-span-2 space-y-lg">
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
            </div>
          </div>

          {/* Security */}
          <div className="bg-surface-container-lowest rounded-xl border border-outline-variant overflow-hidden hover:border-primary/30 transition-colors">
            <div className="p-lg border-b border-outline-variant flex items-center justify-between">
              <div>
                <h3 className="text-headline-md text-on-surface">Security &amp; Password</h3>
                <p className="text-body-md text-on-surface-variant">Manage your access credentials.</p>
              </div>
              <span className="material-symbols-outlined text-primary text-[32px]">security</span>
            </div>
            <div className="p-lg grid grid-cols-1 md:grid-cols-2 gap-xl">
              <div className="space-y-lg">
                <div className="flex items-start gap-md">
                  <div className="w-10 h-10 rounded-full bg-secondary-container/20 flex items-center justify-center flex-shrink-0">
                    <span className="material-symbols-outlined text-on-secondary-container">shield_with_heart</span>
                  </div>
                  <div>
                    <p className="font-medium text-on-surface">Two-Factor Authentication</p>
                    <p className="text-label-md text-on-surface-variant">Recommended for admin accounts.</p>
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
                  { key: 'current_password', label: 'Current Password', showKey: 'current',  placeholder: '••••••••' },
                  { key: 'new_password',      label: 'New Password',     showKey: 'new_',     placeholder: 'Enter new password' },
                  { key: 'confirm_password',  label: 'Confirm Password', showKey: 'confirm',  placeholder: 'Repeat new password' },
                ].map(({ key, label, showKey, placeholder }) => (
                  <div key={key} className="space-y-xs">
                    <label className="text-label-sm text-on-surface-variant">{label}</label>
                    <div className="relative">
                      <input
                        className="w-full bg-surface border border-outline-variant rounded-lg p-md pr-[44px] focus:ring-2 focus:ring-primary focus:border-primary transition-all outline-none text-body-md"
                        placeholder={placeholder}
                        type={showPw[showKey] ? 'text' : 'password'}
                        value={pwForm[key]}
                        required
                        onChange={e => setPwForm(f => ({ ...f, [key]: e.target.value }))}
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
            </div>
          </div>
        </div>
      </div>

      {/* ── Edit Profile Modal ───────────────────────────────────────────────── */}
      {editOpen && (
        <div className="fixed inset-0 z-50 flex items-start justify-center p-md overflow-y-auto">
          <div className="absolute inset-0 bg-on-background/40 backdrop-blur-sm" onClick={() => !editSaving && setEditOpen(false)} />
          <div className="relative w-full max-w-2xl bg-surface-container-lowest rounded-xl border border-outline-variant shadow-2xl my-xl">

            {/* Header */}
            <div className="flex items-center justify-between px-xl pt-xl pb-md border-b border-outline-variant">
              <div>
                <h3 className="text-headline-md text-on-surface">Edit Profile</h3>
                <p className="text-body-sm text-outline">Update your personal information</p>
              </div>
              <button
                type="button"
                onClick={() => !editSaving && setEditOpen(false)}
                className="text-outline hover:text-on-surface p-xs rounded-lg hover:bg-surface-container transition-colors"
              >
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>

            {editLoading ? (
              <div className="px-xl py-xl flex flex-col items-center justify-center gap-md text-outline">
                <span className="material-symbols-outlined text-primary text-[40px]" style={{ animation: 'spin 1s linear infinite' }}>progress_activity</span>
                <p className="text-body-md">Loading your profile…</p>
              </div>
            ) : (
            <form onSubmit={handleEditSave} className="px-xl py-lg space-y-lg">
              {editError && (
                <div className="flex items-center gap-sm p-md bg-error/10 border border-error/30 rounded-lg text-body-sm text-error">
                  <span className="material-symbols-outlined text-[18px] shrink-0">error</span>
                  {editError}
                </div>
              )}

              {/* Photo */}
              <div className="flex items-center gap-lg">
                <div className="w-20 h-20 rounded-2xl bg-primary/10 flex items-center justify-center text-primary border-2 border-outline-variant overflow-hidden shrink-0">
                  {photoPreview
                    ? <img src={photoPreview} className="w-full h-full object-cover" alt="Preview" />
                    : currentPhotoPath
                      ? <img src={`/uploads/${currentPhotoPath}?v=${photoVersion}`} className="w-full h-full object-cover" alt={editForm.name} />
                      : <span className="material-symbols-outlined text-[40px]" style={{ fontVariationSettings: "'FILL' 1" }}>person</span>
                  }
                </div>
                <div>
                  <label
                    htmlFor="pp-photo"
                    className="cursor-pointer inline-flex items-center gap-xs px-md py-sm border border-outline-variant rounded-lg text-label-md hover:bg-surface-container transition-colors"
                  >
                    <span className="material-symbols-outlined text-[18px]">upload</span>
                    {photoFile ? photoFile.name : 'Change Photo'}
                  </label>
                  <input id="pp-photo" type="file" accept="image/*" className="hidden" onChange={handlePhotoChange} />
                  <p className="text-label-sm text-outline mt-xs">JPG, PNG or GIF · max 5 MB</p>
                </div>
              </div>

              {/* Fields */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-md">
                <div className="space-y-xs">
                  <label className="text-label-sm text-on-surface-variant uppercase tracking-wider" htmlFor="pp-name">Full Name</label>
                  <input
                    id="pp-name" type="text" required autoFocus
                    className="w-full px-md py-md bg-surface-container-low border border-outline-variant rounded-lg focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all text-body-md"
                    value={editForm.name}
                    onChange={e => setEditForm(f => ({ ...f, name: e.target.value }))}
                  />
                </div>

                <div className="space-y-xs">
                  <label className="text-label-sm text-on-surface-variant uppercase tracking-wider" htmlFor="pp-email">Work Email</label>
                  <input
                    id="pp-email" type="email" required
                    className="w-full px-md py-md bg-surface-container-low border border-outline-variant rounded-lg focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all text-body-md"
                    value={editForm.email}
                    onChange={e => setEditForm(f => ({ ...f, email: e.target.value }))}
                  />
                </div>

                <div className="space-y-xs">
                  <label className="text-label-sm text-on-surface-variant uppercase tracking-wider" htmlFor="pp-phone">Phone</label>
                  <input
                    id="pp-phone" type="tel"
                    className="w-full px-md py-md bg-surface-container-low border border-outline-variant rounded-lg focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all text-body-md"
                    placeholder="+1 234 567 8900"
                    value={editForm.phone}
                    onChange={e => setEditForm(f => ({ ...f, phone: e.target.value }))}
                  />
                </div>

                <div className="space-y-xs">
                  <label className="text-label-sm text-on-surface-variant uppercase tracking-wider" htmlFor="pp-dob">Date of Birth</label>
                  <input
                    id="pp-dob" type="date"
                    className="w-full px-md py-md bg-surface-container-low border border-outline-variant rounded-lg focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all text-body-md"
                    value={editForm.dob}
                    onChange={e => setEditForm(f => ({ ...f, dob: e.target.value }))}
                  />
                </div>

                <div className="space-y-xs">
                  <label className="text-label-sm text-on-surface-variant uppercase tracking-wider" htmlFor="pp-gender">Gender</label>
                  <select
                    id="pp-gender"
                    className="w-full px-md py-md bg-surface-container-low border border-outline-variant rounded-lg focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all text-body-md"
                    value={editForm.gender}
                    onChange={e => setEditForm(f => ({ ...f, gender: e.target.value }))}
                  >
                    <option value="">Prefer not to say</option>
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Other">Other</option>
                  </select>
                </div>

                <div className="space-y-xs">
                  <label className="text-label-sm text-on-surface-variant uppercase tracking-wider" htmlFor="pp-personal-email">Personal Email</label>
                  <input
                    id="pp-personal-email" type="email"
                    className="w-full px-md py-md bg-surface-container-low border border-outline-variant rounded-lg focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all text-body-md"
                    placeholder="personal@email.com"
                    value={editForm.personal_email}
                    onChange={e => setEditForm(f => ({ ...f, personal_email: e.target.value }))}
                  />
                </div>

                <div className="sm:col-span-2 space-y-xs">
                  <label className="text-label-sm text-on-surface-variant uppercase tracking-wider" htmlFor="pp-address">Address</label>
                  <textarea
                    id="pp-address" rows={2}
                    className="w-full px-md py-md bg-surface-container-low border border-outline-variant rounded-lg focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all text-body-md resize-none"
                    placeholder="123 Main St, City, Country"
                    value={editForm.address}
                    onChange={e => setEditForm(f => ({ ...f, address: e.target.value }))}
                  />
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-md pt-xs border-t border-outline-variant">
                <button
                  type="button"
                  onClick={() => setEditOpen(false)}
                  disabled={editSaving}
                  className="flex-1 py-md border border-outline-variant rounded-lg text-label-md text-on-surface hover:bg-surface-container transition-all disabled:opacity-50"
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
            )}
          </div>
        </div>
      )}
      {/* ── End Edit Profile Modal ────────────────────────────────────────────── */}
    </div>
  )
}
