export default function PersonalProfile() {
  return (
    <div className="pt-8 px-margin-mobile md:px-margin-desktop max-w-6xl mx-auto pb-xl">
      {/* Hero */}
      <div className="bg-surface-container-lowest rounded-xl border border-outline-variant p-xl mb-lg relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-32 bg-primary/5"></div>
        <div className="relative flex flex-col md:flex-row items-start md:items-end gap-lg">
          <div className="relative group">
            <div className="w-32 h-32 md:w-40 md:h-40 rounded-xl bg-primary/10 flex items-center justify-center text-primary border-4 border-surface-container-lowest shadow-md">
              <span className="material-symbols-outlined text-[80px]" style={{ fontVariationSettings: "'FILL' 1" }}>person</span>
            </div>
            <button className="absolute bottom-2 right-2 bg-primary text-white p-2 rounded-lg shadow-lg hover:bg-primary-container transition-colors">
              <span className="material-symbols-outlined text-[20px]">photo_camera</span>
            </button>
          </div>
          <div className="flex-1 pb-xs">
            <h1 className="text-display text-on-surface">Alexander Pierce</h1>
            <p className="text-headline-md text-primary mt-1">Senior HR Administrator</p>
            <div className="flex flex-wrap gap-md mt-md">
              <span className="inline-flex items-center px-sm py-xs rounded-lg bg-secondary-container/20 text-on-secondary-container text-label-md">
                <span className="material-symbols-outlined text-[16px] mr-xs" style={{ fontVariationSettings: "'FILL' 1" }}>verified</span> Verified Employee
              </span>
              <span className="inline-flex items-center px-sm py-xs rounded-lg bg-surface-container text-on-surface-variant text-label-md">
                <span className="material-symbols-outlined text-[16px] mr-xs">location_on</span> San Francisco, CA
              </span>
            </div>
          </div>
          <div className="flex flex-wrap gap-md pb-xs">
            <button className="px-lg py-md bg-primary text-on-primary rounded-lg text-label-md hover:opacity-90 active:scale-95 transition-all flex items-center gap-xs">
              <span className="material-symbols-outlined text-[18px]">edit</span> Edit Profile
            </button>
          </div>
        </div>
      </div>

      {/* Bento Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-lg">
        {/* Contact & Social */}
        <div className="md:col-span-1 space-y-lg">
          <div className="bg-surface-container-lowest rounded-xl border border-outline-variant p-lg hover:border-primary/30 transition-colors">
            <div className="flex items-center justify-between mb-lg">
              <h3 className="text-headline-md text-on-surface">Contact Information</h3>
              <span className="material-symbols-outlined text-outline">alternate_email</span>
            </div>
            <div className="space-y-md">
              {[
                { label: 'Email Address', val: 'a.pierce@admincenter.com' },
                { label: 'Phone Number', val: '+1 (555) 0123-4567' },
                { label: 'Work Extension', val: 'EXT-992' },
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
              <h3 className="text-headline-md text-on-surface">Social Profiles</h3>
              <span className="material-symbols-outlined text-outline">share</span>
            </div>
            <div className="space-y-md">
              {['LinkedIn', 'Internal Slack'].map(platform => (
                <a key={platform} href="#" className="flex items-center justify-between group">
                  <span className="text-body-md text-on-surface-variant group-hover:text-primary transition-colors">{platform}</span>
                  <span className="material-symbols-outlined text-outline group-hover:text-primary">open_in_new</span>
                </a>
              ))}
            </div>
          </div>
        </div>

        {/* Work Info */}
        <div className="md:col-span-2 space-y-lg">
          <div className="bg-surface-container-lowest rounded-xl border border-outline-variant p-lg hover:border-primary/30 transition-colors h-full">
            <div className="flex items-center justify-between mb-lg">
              <h3 className="text-headline-md text-on-surface">Work Information</h3>
              <span className="material-symbols-outlined text-outline">business_center</span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-xl">
              <div>
                <label className="text-label-sm text-outline uppercase tracking-wider">Current Position</label>
                <p className="text-body-lg font-medium text-on-surface mt-xs">Senior HR Administrator</p>
                <p className="text-label-sm text-on-surface-variant">Level 4 Management</p>
              </div>
              <div>
                <label className="text-label-sm text-outline uppercase tracking-wider">Department</label>
                <p className="text-body-lg font-medium text-on-surface mt-xs">People &amp; Culture</p>
                <p className="text-label-sm text-on-surface-variant">Operations Unit</p>
              </div>
              <div>
                <label className="text-label-sm text-outline uppercase tracking-wider">Join Date</label>
                <p className="text-body-lg font-medium text-on-surface mt-xs">October 12, 2018</p>
                <p className="text-label-sm text-on-surface-variant">5 Years, 4 Months</p>
              </div>
              <div>
                <label className="text-label-sm text-outline uppercase tracking-wider">Reporting To</label>
                <div className="flex items-center gap-sm mt-xs">
                  <div className="w-6 h-6 rounded-full bg-tertiary-fixed text-on-tertiary-fixed flex items-center justify-center text-[10px] font-bold">SM</div>
                  <p className="text-body-md font-medium text-on-surface">Sarah Mitchell</p>
                </div>
              </div>
              <div className="sm:col-span-2">
                <label className="text-label-sm text-outline uppercase tracking-wider">Responsibilities</label>
                <div className="flex flex-wrap gap-sm mt-md">
                  {['Payroll Oversight', 'Policy Compliance', 'Conflict Resolution', 'Onboarding Strategy'].map(r => (
                    <span key={r} className="px-sm py-xs bg-surface-container rounded-lg text-label-md text-on-surface-variant">{r}</span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Security */}
        <div className="md:col-span-3">
          <div className="bg-surface-container-lowest rounded-xl border border-outline-variant overflow-hidden hover:border-primary/30 transition-colors">
            <div className="p-lg border-b border-outline-variant flex items-center justify-between">
              <div>
                <h3 className="text-headline-md text-on-surface">Security &amp; Password</h3>
                <p className="text-body-md text-on-surface-variant">Protect your account and manage access credentials.</p>
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
                    <p className="text-label-md text-on-surface-variant">Highly recommended for administrators to prevent unauthorized access.</p>
                    <button className="mt-md text-primary font-bold text-label-md hover:underline">Enable 2FA Now</button>
                  </div>
                </div>
                <div className="flex items-start gap-md">
                  <div className="w-10 h-10 rounded-full bg-surface-container flex items-center justify-center flex-shrink-0">
                    <span className="material-symbols-outlined text-on-surface-variant">devices</span>
                  </div>
                  <div>
                    <p className="font-medium text-on-surface">Last Active Session</p>
                    <p className="text-label-md text-on-surface-variant">MacBook Pro 14" • San Francisco, CA • Active Now</p>
                    <button className="mt-md text-primary font-bold text-label-md hover:underline">View All Sessions</button>
                  </div>
                </div>
              </div>
              <div className="bg-surface-container/30 p-lg rounded-xl space-y-md">
                <h4 className="font-bold text-on-surface">Change Password</h4>
                <div className="space-y-xs">
                  <label className="text-label-sm text-on-surface-variant">Current Password</label>
                  <input className="w-full bg-surface border border-outline-variant rounded-lg p-md focus:ring-2 focus:ring-primary focus:border-primary transition-all outline-none" placeholder="••••••••" type="password" />
                </div>
                <div className="space-y-xs">
                  <label className="text-label-sm text-on-surface-variant">New Password</label>
                  <input className="w-full bg-surface border border-outline-variant rounded-lg p-md focus:ring-2 focus:ring-primary focus:border-primary transition-all outline-none" placeholder="Enter new password" type="password" />
                </div>
                <button className="w-full py-md bg-secondary text-on-secondary rounded-lg text-label-md hover:opacity-90 active:scale-95 transition-all">
                  Update Password
                </button>
                <p className="text-center text-[11px] text-on-surface-variant italic">Last changed 45 days ago</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
