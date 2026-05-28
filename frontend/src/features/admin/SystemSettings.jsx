export default function SystemSettings() {
  return (
    <div className="p-margin-mobile md:p-margin-desktop max-w-6xl mx-auto">
      <div className="mb-xl">
        <h2 className="text-display text-on-background">System Settings</h2>
        <p className="text-body-lg text-on-surface-variant mt-xs">Manage your organizational preferences, security protocols, and system appearance.</p>
      </div>

      <div className="grid grid-cols-12 gap-gutter">
        {/* Sidebar Nav */}
        <div className="col-span-12 md:col-span-3">
          <div className="flex flex-col gap-sm">
            <button className="flex items-center gap-md p-md bg-primary-container text-on-primary font-bold rounded-xl shadow-sm text-left transition-all">
              <span className="material-symbols-outlined">domain</span>
              <span className="text-body-md">Company Profile</span>
            </button>
            {[
              { icon: 'translate', label: 'Language' },
              { icon: 'palette', label: 'Theme' },
              { icon: 'notifications_active', label: 'Notifications' },
              { icon: 'cloud_sync', label: 'Backup' },
              { icon: 'security', label: 'Security' },
            ].map(item => (
              <button key={item.label} className="flex items-center gap-md p-md hover:bg-surface-container rounded-xl text-on-surface-variant text-left transition-all">
                <span className="material-symbols-outlined">{item.icon}</span>
                <span className="text-body-md">{item.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Main Content */}
        <div className="col-span-12 md:col-span-9 space-y-gutter">
          {/* Company Profile */}
          <div className="bg-surface-container-lowest border border-outline-variant rounded-xl p-lg shadow-sm">
            <div className="flex flex-col gap-md sm:flex-row sm:items-center sm:justify-between mb-lg">
              <h3 className="text-headline-md text-on-surface">Company Profile</h3>
              <button className="bg-primary text-on-primary px-lg py-sm rounded-lg text-label-md hover:opacity-90 transition-opacity">Save Changes</button>
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
              <div className="w-24 h-24 rounded-xl border border-outline-variant bg-surface-container flex items-center justify-center text-on-surface-variant">
                <span className="material-symbols-outlined text-[48px]">corporate_fare</span>
              </div>
              <div>
                <p className="font-semibold">Organization Logo</p>
                <p className="text-body-md text-on-surface-variant">SVG, PNG, JPG or GIF (max. 800x800px)</p>
                <button className="mt-sm text-primary text-label-md flex items-center gap-xs">
                  <span className="material-symbols-outlined text-sm">upload</span> Change Logo
                </button>
              </div>
            </div>
          </div>

          {/* Language & Theme */}
          <div className="grid grid-cols-2 gap-gutter">
            <div className="col-span-2 lg:col-span-1 bg-surface-container-lowest border border-outline-variant rounded-xl p-lg shadow-sm">
              <h3 className="text-headline-md text-on-surface mb-md">Language</h3>
              <div className="space-y-md">
                <label className="flex items-center justify-between p-md border border-primary bg-primary-fixed-dim/10 rounded-xl cursor-pointer">
                  <div className="flex items-center gap-md">
                    <span className="material-symbols-outlined text-primary">translate</span>
                    <span className="text-body-md">English (United States)</span>
                  </div>
                  <input defaultChecked className="text-primary focus:ring-primary h-5 w-5" name="lang" type="radio" />
                </label>
                <label className="flex items-center justify-between p-md border border-outline-variant rounded-xl cursor-pointer hover:bg-surface-container-low transition-colors">
                  <div className="flex items-center gap-md">
                    <span className="material-symbols-outlined text-on-surface-variant">translate</span>
                    <span className="text-body-md">Khmer (Cambodia)</span>
                  </div>
                  <input className="text-primary focus:ring-primary h-5 w-5" name="lang" type="radio" />
                </label>
              </div>
            </div>
            <div className="col-span-2 lg:col-span-1 bg-surface-container-lowest border border-outline-variant rounded-xl p-lg shadow-sm">
              <h3 className="text-headline-md text-on-surface mb-md">Theme Selection</h3>
              <div className="grid grid-cols-3 gap-sm">
                <button className="flex flex-col items-center gap-sm p-md border border-outline-variant rounded-xl hover:border-primary transition-all">
                  <span className="material-symbols-outlined text-[36px]">light_mode</span>
                  <span className="text-label-sm uppercase">Light</span>
                </button>
                <button className="flex flex-col items-center gap-sm p-md border-2 border-primary bg-primary/5 rounded-xl transition-all">
                  <span className="material-symbols-outlined text-[36px] text-primary">dark_mode</span>
                  <span className="text-label-sm uppercase text-primary">Dark</span>
                </button>
                <button className="flex flex-col items-center gap-sm p-md border border-outline-variant rounded-xl hover:border-primary transition-all">
                  <span className="material-symbols-outlined text-[36px]">settings_brightness</span>
                  <span className="text-label-sm uppercase">System</span>
                </button>
              </div>
            </div>
          </div>

          {/* Security */}
          <div className="bg-surface-container-lowest border border-outline-variant rounded-xl p-lg shadow-sm">
            <h3 className="text-headline-md text-on-surface mb-lg">Security &amp; Privacy</h3>
            <div className="space-y-lg">
              <div className="flex items-start justify-between gap-md">
                <div>
                  <p className="font-bold text-body-lg">Two-Factor Authentication (2FA)</p>
                  <p className="text-body-md text-on-surface-variant">Add an extra layer of security to all administrative accounts.</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input defaultChecked className="sr-only peer" type="checkbox" />
                  <div className="w-12 h-6 bg-surface-variant rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
                </label>
              </div>
              <div className="border-t border-outline-variant pt-lg flex items-start justify-between gap-md">
                <div>
                  <p className="font-bold text-body-lg">Automated Daily Backups</p>
                  <p className="text-body-md text-on-surface-variant">Securely backup HR and payroll data every 24 hours to encrypted cloud storage.</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input className="sr-only peer" type="checkbox" />
                  <div className="w-12 h-6 bg-surface-variant rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
                </label>
              </div>
              <div className="border-t border-outline-variant pt-lg">
                <p className="font-bold text-body-lg mb-md">Notification Channels</p>
                <div className="flex flex-wrap gap-md">
                  {[
                    { icon: 'mail', label: 'Email', active: true },
                    { icon: 'sms', label: 'SMS', active: true },
                    { icon: 'notifications', label: 'Push', active: false },
                  ].map(ch => (
                    <span key={ch.label} className={`flex items-center gap-xs px-md py-sm rounded-full text-label-md ${ch.active ? 'bg-secondary-container text-on-secondary-container' : 'bg-surface-container-high text-on-surface-variant opacity-50'}`}>
                      <span className="material-symbols-outlined text-sm">{ch.icon}</span> {ch.label}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Danger Zone */}
          <div className="bg-error-container/20 border border-error/20 rounded-xl p-lg">
            <div className="flex items-start gap-md">
              <span className="material-symbols-outlined text-error mt-xs">warning</span>
              <div>
                <h3 className="font-bold text-error">Danger Zone</h3>
                <p className="text-body-md text-on-error-container mb-md">Permanently delete all organization records and system configuration. This action cannot be undone.</p>
                <button className="border border-error text-error px-lg py-sm rounded-lg text-label-md hover:bg-error hover:text-on-error transition-all">Reset All System Data</button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
