import { useState, useRef, useEffect } from 'react'
import { useTheme } from '../../hooks/useTheme'

export default function SystemSettings() {
  const [toast, setToast]                   = useState(null)
  const [logoPreview, setLogoPreview]       = useState(null)
  const { theme: selectedTheme, setTheme }  = useTheme()
  const [twoFA, setTwoFA]                   = useState(true)
  const [backups, setBackups]               = useState(false)
  const [channels, setChannels]             = useState({ Email: true, SMS: true, Push: false })
  const [showResetConfirm, setShowResetConfirm] = useState(false)
  const [selectedLang, setSelectedLang]     = useState('en')

  const fileInputRef = useRef(null)

  const showToast = (message, type = 'success') => {
    setToast({ message, type })
    setTimeout(() => setToast(null), 3000)
  }

  const handleSave = () => showToast('Settings saved successfully.')

  const handleLogoChange = (e) => {
    const file = e.target.files[0]
    if (file) setLogoPreview(URL.createObjectURL(file))
  }

  const toggleChannel = (label) => {
    setChannels(prev => ({ ...prev, [label]: !prev[label] }))
  }

  const handleReset = () => {
    setShowResetConfirm(false)
    showToast('All system data has been reset.', 'error')
  }

  useEffect(() => {
    return () => { if (logoPreview) URL.revokeObjectURL(logoPreview) }
  }, [logoPreview])

  return (
    <div className="p-margin-mobile md:p-margin-desktop max-w-6xl mx-auto">
      {/* Toast */}
      {toast && (
        <div className={`fixed top-20 right-6 z-50 flex items-center gap-md px-lg py-md rounded-xl shadow-lg border text-label-md font-bold transition-all ${
          toast.type === 'error'
            ? 'bg-error-container text-on-error-container border-error/30'
            : 'bg-secondary-container text-on-secondary-container border-secondary/30'
        }`}>
          <span className="material-symbols-outlined text-[20px]">
            {toast.type === 'error' ? 'error' : 'check_circle'}
          </span>
          {toast.message}
        </div>
      )}

      {/* Reset Confirm Dialog */}
      {showResetConfirm && (
        <div className="fixed inset-0 z-50 bg-on-background/40 backdrop-blur-sm flex items-center justify-center p-margin-mobile">
          <div className="bg-surface-container-lowest border border-outline-variant rounded-2xl p-xl shadow-2xl max-w-md w-full">
            <div className="flex items-center gap-md mb-md">
              <div className="w-12 h-12 rounded-full bg-error/10 flex items-center justify-center shrink-0">
                <span className="material-symbols-outlined text-error">warning</span>
              </div>
              <h3 className="text-headline-md text-on-surface">Reset All System Data?</h3>
            </div>
            <p className="text-body-md text-on-surface-variant mb-xl">
              This will permanently delete all organization records and system configuration. This action <strong>cannot be undone</strong>.
            </p>
            <div className="flex gap-sm justify-end">
              <button
                onClick={() => setShowResetConfirm(false)}
                className="px-lg py-sm bg-surface-container border border-outline-variant text-on-surface rounded-lg text-label-md hover:bg-surface-container-high transition-all"
              >
                Cancel
              </button>
              <button
                onClick={handleReset}
                className="px-lg py-sm bg-error text-on-error rounded-lg text-label-md hover:opacity-90 transition-all"
              >
                Yes, Reset Everything
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="mb-xl">
        <h2 className="text-display text-on-background">System Settings</h2>
        <p className="text-body-lg text-on-surface-variant mt-xs">Manage your organizational preferences, security protocols, and system appearance.</p>
      </div>

      <div className="grid grid-cols-12 gap-gutter">
        {/* Main Content */}
        <div className="col-span-12 space-y-gutter">

          {/* Company Profile */}
          <section id="company-profile" className="bg-surface-container-lowest border border-outline-variant rounded-xl p-lg shadow-sm scroll-mt-20">
            <div className="flex flex-col gap-md sm:flex-row sm:items-center sm:justify-between mb-lg">
              <h3 className="text-headline-md text-on-surface">Company Profile</h3>
              <button
                onClick={handleSave}
                className="bg-primary text-on-primary px-lg py-sm rounded-lg text-label-md hover:brightness-110 active:scale-95 transition-all"
              >
                Save Changes
              </button>
            </div>
            <div className="grid grid-cols-2 gap-lg">
              <div className="col-span-2 md:col-span-1 flex flex-col gap-xs">
                <label className="text-label-md text-on-surface-variant px-xs">Organization Name</label>
                <input className="bg-surface border border-outline-variant rounded-lg p-md text-body-md focus:border-primary focus:ring-1 focus:ring-primary outline-none" type="text" defaultValue="Global Dynamics Corp" />
              </div>
              <div className="col-span-2 md:col-span-1 flex flex-col gap-xs">
                <label className="text-label-md text-on-surface-variant px-xs">Registration Number</label>
                <input className="bg-surface border border-outline-variant rounded-lg p-md text-body-md focus:border-primary focus:ring-1 focus:ring-primary outline-none" type="text" defaultValue="GD-882-9021" />
              </div>
              <div className="col-span-2 flex flex-col gap-xs">
                <label className="text-label-md text-on-surface-variant px-xs">Primary Headquarters</label>
                <input className="bg-surface border border-outline-variant rounded-lg p-md text-body-md focus:border-primary focus:ring-1 focus:ring-primary outline-none" type="text" defaultValue="1200 Innovation Drive, Silicon Valley, CA 94025" />
              </div>
            </div>
            <div className="mt-lg pt-lg border-t border-outline-variant flex flex-col sm:flex-row sm:items-center gap-lg">
              <div className="w-24 h-24 rounded-xl border border-outline-variant bg-surface-container flex items-center justify-center overflow-hidden shrink-0">
                {logoPreview
                  ? <img src={logoPreview} alt="Logo preview" className="w-full h-full object-cover" />
                  : <span className="material-symbols-outlined text-[48px] text-on-surface-variant">corporate_fare</span>
                }
              </div>
              <div>
                <p className="font-semibold">Organization Logo</p>
                <p className="text-body-md text-on-surface-variant">SVG, PNG, JPG or GIF (max. 800x800px)</p>
                <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleLogoChange} />
                <button
                  onClick={() => fileInputRef.current.click()}
                  className="mt-sm text-primary text-label-md flex items-center gap-xs hover:underline"
                >
                  <span className="material-symbols-outlined text-sm">upload</span> Change Logo
                </button>
              </div>
            </div>
          </section>

          {/* Language & Theme */}
          <div className="grid grid-cols-2 gap-gutter">
            <section id="language" className="col-span-2 lg:col-span-1 bg-surface-container-lowest border border-outline-variant rounded-xl p-lg shadow-sm scroll-mt-20">
              <h3 className="text-headline-md text-on-surface mb-md">Language</h3>
              <div className="space-y-md">
                {[
                  { label: 'English (United States)', value: 'en' },
                  { label: 'Khmer (Cambodia)',         value: 'kh' },
                ].map(lang => (
                  <label
                    key={lang.value}
                    onClick={() => setSelectedLang(lang.value)}
                    className={`flex items-center justify-between p-md border rounded-xl cursor-pointer transition-colors ${
                      selectedLang === lang.value
                        ? 'border-primary bg-primary-fixed-dim/10'
                        : 'border-outline-variant hover:bg-surface-container-low'
                    }`}
                  >
                    <div className="flex items-center gap-md">
                      <span className={`material-symbols-outlined ${selectedLang === lang.value ? 'text-primary' : 'text-on-surface-variant'}`}>translate</span>
                      <span className="text-body-md">{lang.label}</span>
                    </div>
                    <input
                      readOnly
                      checked={selectedLang === lang.value}
                      className="text-primary focus:ring-primary h-5 w-5"
                      name="lang"
                      type="radio"
                    />
                  </label>
                ))}
              </div>
            </section>

            <section id="theme" className="col-span-2 lg:col-span-1 bg-surface-container-lowest border border-outline-variant rounded-xl p-lg shadow-sm scroll-mt-20">
              <h3 className="text-headline-md text-on-surface mb-md">Theme Selection</h3>
              <div className="grid grid-cols-3 gap-sm">
                {[
                  { value: 'light',  icon: 'light_mode',         label: 'Light' },
                  { value: 'dark',   icon: 'dark_mode',          label: 'Dark' },
                  { value: 'system', icon: 'settings_brightness', label: 'System' },
                ].map(theme => (
                  <button
                    key={theme.value}
                    onClick={() => setTheme(theme.value)}
                    className={`flex flex-col items-center gap-sm p-md rounded-xl transition-all ${
                      selectedTheme === theme.value
                        ? 'border-2 border-primary bg-primary/5'
                        : 'border border-outline-variant hover:border-primary'
                    }`}
                  >
                    <span className={`material-symbols-outlined text-[36px] ${selectedTheme === theme.value ? 'text-primary' : ''}`}>{theme.icon}</span>
                    <span className={`text-label-sm uppercase ${selectedTheme === theme.value ? 'text-primary font-bold' : ''}`}>{theme.label}</span>
                  </button>
                ))}
              </div>
            </section>
          </div>

          {/* Notifications */}
          <section id="notifications" className="bg-surface-container-lowest border border-outline-variant rounded-xl p-lg shadow-sm scroll-mt-20">
            <h3 className="text-headline-md text-on-surface mb-lg">Notification Channels</h3>
            <div className="flex flex-wrap gap-md">
              {[
                { icon: 'mail',          label: 'Email' },
                { icon: 'sms',           label: 'SMS' },
                { icon: 'notifications', label: 'Push' },
              ].map(ch => (
                <button
                  key={ch.label}
                  onClick={() => toggleChannel(ch.label)}
                  className={`flex items-center gap-xs px-md py-sm rounded-full text-label-md transition-all ${
                    channels[ch.label]
                      ? 'bg-secondary-container text-on-secondary-container'
                      : 'bg-surface-container-high text-on-surface-variant opacity-50 hover:opacity-75'
                  }`}
                >
                  <span className="material-symbols-outlined text-sm">{ch.icon}</span>
                  {ch.label}
                  {channels[ch.label] && <span className="material-symbols-outlined text-[14px]">check</span>}
                </button>
              ))}
            </div>
          </section>

          {/* Security */}
          <section id="security" className="bg-surface-container-lowest border border-outline-variant rounded-xl p-lg shadow-sm scroll-mt-20">
            <h3 className="text-headline-md text-on-surface mb-lg">Security &amp; Privacy</h3>
            <div className="space-y-lg">
              <div className="flex items-start justify-between gap-md">
                <div>
                  <p className="font-bold text-body-lg">Two-Factor Authentication (2FA)</p>
                  <p className="text-body-md text-on-surface-variant">Add an extra layer of security to all administrative accounts.</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer shrink-0">
                  <input checked={twoFA} onChange={() => setTwoFA(v => !v)} className="sr-only peer" type="checkbox" />
                  <div className="w-12 h-6 bg-surface-variant rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
                </label>
              </div>
              <div className="border-t border-outline-variant pt-lg flex items-start justify-between gap-md">
                <div>
                  <p className="font-bold text-body-lg">Automated Daily Backups</p>
                  <p className="text-body-md text-on-surface-variant">Securely backup HR and payroll data every 24 hours to encrypted cloud storage.</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer shrink-0">
                  <input checked={backups} onChange={() => setBackups(v => !v)} className="sr-only peer" type="checkbox" />
                  <div className="w-12 h-6 bg-surface-variant rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
                </label>
              </div>
            </div>
          </section>

          {/* Danger Zone */}
          <div className="bg-error-container/20 border border-error/20 rounded-xl p-lg">
            <div className="flex items-start gap-md">
              <span className="material-symbols-outlined text-error mt-xs">warning</span>
              <div>
                <h3 className="font-bold text-error">Danger Zone</h3>
                <p className="text-body-md text-on-error-container mb-md">Permanently delete all organization records and system configuration. This action cannot be undone.</p>
                <button
                  onClick={() => setShowResetConfirm(true)}
                  className="border border-error text-error px-lg py-sm rounded-lg text-label-md hover:bg-error hover:text-on-error active:scale-95 transition-all"
                >
                  Reset All System Data
                </button>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  )
}
