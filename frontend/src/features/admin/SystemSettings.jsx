import { useState, useRef, useEffect } from 'react'
import { useTheme } from '../../hooks/useTheme.js'
import { settingsService } from '../../api/settings.js'
import { client } from '../../api/client.js'

export default function SystemSettings() {
  const [toast, setToast]               = useState(null)
  const [logoPreview, setLogoPreview]   = useState(null)
  const { theme: selectedTheme, setTheme } = useTheme()
  const [showResetConfirm, setShowResetConfirm] = useState(false)
  const [loading, setLoading]           = useState(true)
  const [saving, setSaving]             = useState(false)
  const [settings, setSettings]         = useState({
    org_name: '', reg_number: '', headquarters: '',
    language: 'en', theme: 'light',
    email_notifications: true, sms_notifications: false, push_notifications: true,
    two_fa_enabled: false, backups_enabled: true, logo_path: null,
  })
  const fileInputRef = useRef(null)

  const showToast = (message, type = 'success') => { setToast({ message, type }); setTimeout(() => setToast(null), 3000) }

  useEffect(() => {
    const load = async () => {
      try {
        const res = await settingsService.get()
        if (res.ok) {
          const d = await res.json()
          setSettings(d)
          if (d.logo_path) setLogoPreview(`${client.BASE}/uploads/logos/${d.logo_path.split('/').pop()}`)
        }
      } catch { /* ignore */ }
      setLoading(false)
    }
    load()
  }, [])

  const handleSave = async () => {
    if (!settings.org_name?.trim()) { showToast('Organization name is required.', 'error'); return }
    setSaving(true)
    try {
      const res = await settingsService.update({
        org_name: settings.org_name || null,
        reg_number: settings.reg_number || null,
        headquarters: settings.headquarters || null,
        language: settings.language,
        email_notifications: settings.email_notifications,
        sms_notifications: settings.sms_notifications,
        push_notifications: settings.push_notifications,
        two_fa_enabled: settings.two_fa_enabled,
        backups_enabled: settings.backups_enabled,
      })
      if (res.ok) showToast('Settings saved successfully.')
      else { const err = await res.json().catch(() => ({})); showToast(err.detail || 'Save failed.', 'error') }
    } catch { showToast('Network error.', 'error') }
    setSaving(false)
  }

  const handleLogoChange = async (e) => {
    const file = e.target.files[0]
    if (!file) return
    setLogoPreview(URL.createObjectURL(file))
    try {
      const res = await settingsService.uploadLogo(file)
      if (res.ok) showToast('Logo updated.')
      else showToast('Logo upload failed.', 'error')
    } catch { showToast('Network error.', 'error') }
  }

  const handleReset = async () => {
    setShowResetConfirm(false)
    try {
      const res = await settingsService.reset()
      if (res.ok || res.status === 204) showToast('All system data has been reset.', 'error')
      else { const err = await res.json().catch(() => ({})); showToast(err.detail || 'Reset failed.', 'error') }
    } catch { showToast('Network error.', 'error') }
  }

  const set = (key, val) => setSettings(prev => ({ ...prev, [key]: val }))

  if (loading) return (
    <div className="p-margin-mobile md:p-margin-desktop flex items-center justify-center h-64">
      <span className="material-symbols-outlined text-primary text-[40px]" style={{ animation: 'spin 1s linear infinite' }}>progress_activity</span>
    </div>
  )

  return (
    <div className="p-margin-mobile md:p-margin-desktop max-w-6xl mx-auto">
      {toast && (
        <div className={`fixed top-20 right-6 z-50 flex items-center gap-md px-lg py-md rounded-xl shadow-lg border text-label-md font-bold transition-all ${toast.type === 'error' ? 'bg-error-container text-on-error-container border-error/30' : 'bg-secondary-container text-on-secondary-container border-secondary/30'}`}>
          <span className="material-symbols-outlined text-[20px]">{toast.type === 'error' ? 'error' : 'check_circle'}</span>
          {toast.message}
        </div>
      )}

      {showResetConfirm && (
        <div className="fixed inset-0 z-50 bg-on-background/40 backdrop-blur-sm flex items-center justify-center p-margin-mobile">
          <div className="bg-surface-container-lowest border border-outline-variant rounded-2xl p-xl shadow-2xl max-w-md w-full">
            <div className="flex items-center gap-md mb-md">
              <div className="w-12 h-12 rounded-full bg-error/10 flex items-center justify-center shrink-0"><span className="material-symbols-outlined text-error">warning</span></div>
              <h3 className="text-headline-md text-on-surface">Reset All System Data?</h3>
            </div>
            <p className="text-body-md text-on-surface-variant mb-xl">This will permanently delete all organization records. This action <strong>cannot be undone</strong>.</p>
            <div className="flex gap-sm justify-end">
              <button onClick={() => setShowResetConfirm(false)} className="px-lg py-sm bg-surface-container border border-outline-variant text-on-surface rounded-lg text-label-md hover:bg-surface-container-high">Cancel</button>
              <button onClick={handleReset} className="px-lg py-sm bg-error text-on-error rounded-lg text-label-md hover:opacity-90">Yes, Reset Everything</button>
            </div>
          </div>
        </div>
      )}

      <div className="mb-xl">
        <h2 className="text-display text-on-background">System Settings</h2>
        <p className="text-body-lg text-on-surface-variant mt-xs">Manage organizational preferences, security protocols, and system appearance.</p>
      </div>

      <div className="grid grid-cols-12 gap-gutter">
        <div className="col-span-12 space-y-gutter">
          {/* Company Profile */}
          <section className="bg-surface-container-lowest border border-outline-variant rounded-xl p-lg shadow-sm">
            <div className="flex flex-col gap-md sm:flex-row sm:items-center sm:justify-between mb-lg">
              <h3 className="text-headline-md text-on-surface">Company Profile</h3>
              <button onClick={handleSave} disabled={saving} className="bg-primary text-on-primary px-lg py-sm rounded-lg text-label-md hover:brightness-110 active:scale-95 transition-all disabled:opacity-50">{saving ? 'Saving…' : 'Save Changes'}</button>
            </div>
            <div className="grid grid-cols-2 gap-lg">
              <div className="col-span-2 md:col-span-1 flex flex-col gap-xs">
                <label className="text-label-md text-on-surface-variant px-xs">Organization Name</label>
                <input className="bg-surface border border-outline-variant rounded-lg p-md text-body-md focus:border-primary focus:ring-1 focus:ring-primary outline-none" type="text" value={settings.org_name ?? ''} onChange={e => set('org_name', e.target.value)} />
              </div>
              <div className="col-span-2 md:col-span-1 flex flex-col gap-xs">
                <label className="text-label-md text-on-surface-variant px-xs">Registration Number</label>
                <input className="bg-surface border border-outline-variant rounded-lg p-md text-body-md focus:border-primary focus:ring-1 focus:ring-primary outline-none" type="text" value={settings.reg_number ?? ''} onChange={e => set('reg_number', e.target.value)} />
              </div>
              <div className="col-span-2 flex flex-col gap-xs">
                <label className="text-label-md text-on-surface-variant px-xs">Primary Headquarters</label>
                <input className="bg-surface border border-outline-variant rounded-lg p-md text-body-md focus:border-primary focus:ring-1 focus:ring-primary outline-none" type="text" value={settings.headquarters ?? ''} onChange={e => set('headquarters', e.target.value)} />
              </div>
            </div>
            <div className="mt-lg pt-lg border-t border-outline-variant flex flex-col sm:flex-row sm:items-center gap-lg">
              <div className="w-24 h-24 rounded-xl border border-outline-variant bg-surface-container flex items-center justify-center overflow-hidden shrink-0">
                {logoPreview ? <img src={logoPreview} alt="Logo preview" className="w-full h-full object-cover" /> : <span className="material-symbols-outlined text-[48px] text-on-surface-variant">corporate_fare</span>}
              </div>
              <div>
                <p className="font-semibold">Organization Logo</p>
                <p className="text-body-md text-on-surface-variant">SVG, PNG, JPG or GIF (max. 800x800px)</p>
                <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleLogoChange} />
                <button onClick={() => fileInputRef.current.click()} className="mt-sm text-primary text-label-md flex items-center gap-xs hover:underline"><span className="material-symbols-outlined text-sm">upload</span> Change Logo</button>
              </div>
            </div>
          </section>

          {/* Language & Theme */}
          <div className="grid grid-cols-2 gap-gutter">
            <section className="col-span-2 lg:col-span-1 bg-surface-container-lowest border border-outline-variant rounded-xl p-lg shadow-sm">
              <h3 className="text-headline-md text-on-surface mb-md">Language</h3>
              <div className="space-y-md">
                {[{ label: 'English (United States)', value: 'en' }, { label: 'Khmer (Cambodia)', value: 'kh' }].map(lang => (
                  <label key={lang.value} onClick={() => set('language', lang.value)} className={`flex items-center justify-between p-md border rounded-xl cursor-pointer transition-colors ${settings.language === lang.value ? 'border-primary bg-primary-fixed-dim/10' : 'border-outline-variant hover:bg-surface-container-low'}`}>
                    <div className="flex items-center gap-md">
                      <span className={`material-symbols-outlined ${settings.language === lang.value ? 'text-primary' : 'text-on-surface-variant'}`}>translate</span>
                      <span className="text-body-md">{lang.label}</span>
                    </div>
                    <input readOnly checked={settings.language === lang.value} className="text-primary focus:ring-primary h-5 w-5" name="lang" type="radio" />
                  </label>
                ))}
              </div>
            </section>
            <section className="col-span-2 lg:col-span-1 bg-surface-container-lowest border border-outline-variant rounded-xl p-lg shadow-sm">
              <h3 className="text-headline-md text-on-surface mb-md">Theme Selection</h3>
              <div className="grid grid-cols-3 gap-sm">
                {[{ value: 'light', icon: 'light_mode', label: 'Light' }, { value: 'dark', icon: 'dark_mode', label: 'Dark' }, { value: 'system', icon: 'settings_brightness', label: 'System' }].map(theme => (
                  <button key={theme.value} onClick={() => setTheme(theme.value)} className={`flex flex-col items-center gap-sm p-md rounded-xl transition-all ${selectedTheme === theme.value ? 'border-2 border-primary bg-primary/5' : 'border border-outline-variant hover:border-primary'}`}>
                    <span className={`material-symbols-outlined text-[36px] ${selectedTheme === theme.value ? 'text-primary' : ''}`}>{theme.icon}</span>
                    <span className={`text-label-sm uppercase ${selectedTheme === theme.value ? 'text-primary font-bold' : ''}`}>{theme.label}</span>
                  </button>
                ))}
              </div>
            </section>
          </div>

          {/* Notifications */}
          <section className="bg-surface-container-lowest border border-outline-variant rounded-xl p-lg shadow-sm">
            <h3 className="text-headline-md text-on-surface mb-lg">Notification Channels</h3>
            <div className="flex flex-wrap gap-md">
              {[
                { icon: 'mail', label: 'Email', key: 'email_notifications' },
                { icon: 'sms', label: 'SMS', key: 'sms_notifications' },
                { icon: 'notifications', label: 'Push', key: 'push_notifications' },
              ].map(ch => (
                <button key={ch.label} onClick={() => set(ch.key, !settings[ch.key])} className={`flex items-center gap-xs px-md py-sm rounded-full text-label-md transition-all ${settings[ch.key] ? 'bg-secondary-container text-on-secondary-container' : 'bg-surface-container-high text-on-surface-variant opacity-50 hover:opacity-75'}`}>
                  <span className="material-symbols-outlined text-sm">{ch.icon}</span>
                  {ch.label}
                  {settings[ch.key] && <span className="material-symbols-outlined text-[14px]">check</span>}
                </button>
              ))}
            </div>
          </section>

          {/* Security */}
          <section className="bg-surface-container-lowest border border-outline-variant rounded-xl p-lg shadow-sm">
            <h3 className="text-headline-md text-on-surface mb-lg">Security &amp; Privacy</h3>
            <div className="space-y-lg">
              {[
                { key: 'two_fa_enabled', label: 'Two-Factor Authentication (2FA)', desc: 'Add an extra layer of security to all administrative accounts.' },
                { key: 'backups_enabled', label: 'Automated Daily Backups', desc: 'Securely backup HR and payroll data every 24 hours.' },
              ].map(s => (
                <div key={s.key} className="flex items-start justify-between gap-md border-b border-outline-variant last:border-0 pb-lg last:pb-0">
                  <div>
                    <p className="font-bold text-body-lg">{s.label}</p>
                    <p className="text-body-md text-on-surface-variant">{s.desc}</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer shrink-0">
                    <input checked={settings[s.key]} onChange={() => set(s.key, !settings[s.key])} className="sr-only peer" type="checkbox" />
                    <div className="w-12 h-6 bg-surface-variant rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
                  </label>
                </div>
              ))}
            </div>
          </section>

          {/* Danger Zone */}
          <div className="bg-error-container/20 border border-error/20 rounded-xl p-lg">
            <div className="flex items-start gap-md">
              <span className="material-symbols-outlined text-error mt-xs">warning</span>
              <div>
                <h3 className="font-bold text-error">Danger Zone</h3>
                <p className="text-body-md text-on-error-container mb-md">Permanently delete all organization records and system configuration. This action cannot be undone.</p>
                <button onClick={() => setShowResetConfirm(true)} className="border border-error text-error px-lg py-sm rounded-lg text-label-md hover:bg-error hover:text-on-error active:scale-95 transition-all">Reset All System Data</button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
