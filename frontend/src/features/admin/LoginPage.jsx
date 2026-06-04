import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useTheme } from '../../hooks/useTheme'
import { useAuth } from '../../context/AuthContext'

const BASE = import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:8000'

function Modal({ onClose, title, children, maxWidth = 'max-w-md' }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-md">
      <div className="absolute inset-0 bg-on-background/40 backdrop-blur-sm" onClick={onClose} />
      <div className={`relative w-full ${maxWidth} bg-surface-container-lowest rounded-xl border border-outline-variant shadow-2xl`}>
        <div className="flex items-center justify-between px-xl pt-xl pb-md">
          <h3 className="text-headline-md text-on-surface">{title}</h3>
          <button
            onClick={onClose}
            className="text-outline hover:text-on-surface transition-colors p-xs rounded-lg hover:bg-surface-container"
            type="button"
          >
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>
        <div className="px-xl pb-xl">{children}</div>
      </div>
    </div>
  )
}

function ForgotPasswordModal({ onClose }) {
  const [email, setEmail] = useState('')
  const [status, setStatus] = useState(null) // null | 'loading' | 'sent' | error string

  const handleSubmit = async (e) => {
    e.preventDefault()
    setStatus('loading')
    try {
      const res = await fetch(`${BASE}/auth/forgot-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      })
      if (!res.ok) {
        const err = await res.json().catch(() => ({}))
        throw new Error(err.detail ?? 'Request failed. Please try again.')
      }
      setStatus('sent')
    } catch (err) {
      setStatus(err.message)
    }
  }

  if (status === 'sent') {
    return (
      <div className="text-center space-y-md py-sm">
        <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-secondary/10 mb-sm">
          <span
            className="material-symbols-outlined text-secondary text-[32px]"
            style={{ fontVariationSettings: "'FILL' 1" }}
          >check_circle</span>
        </div>
        <p className="text-body-md text-on-surface">
          If <span className="font-semibold">{email}</span> is registered, you'll receive a reset link shortly.
        </p>
        <p className="text-body-md text-on-surface-variant">
          Check your inbox and follow the instructions in the email. The link expires in 30 minutes.
        </p>
        <button
          onClick={onClose}
          className="w-full mt-sm py-md bg-primary text-on-primary text-label-md rounded-lg hover:opacity-90 transition-all"
          type="button"
        >
          Back to Login
        </button>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-lg">
      <p className="text-body-md text-on-surface-variant">
        Enter your work email and we'll send you a secure link to reset your password.
      </p>
      {typeof status === 'string' && status !== 'loading' && (
        <div className="flex items-center gap-sm p-md bg-error/10 border border-error/30 rounded-lg text-body-sm text-error">
          <span className="material-symbols-outlined text-[18px] shrink-0">error</span>
          {status}
        </div>
      )}
      <div className="space-y-xs">
        <label className="text-label-md text-on-surface ml-xs block" htmlFor="forgot-email">Work Email</label>
        <div className="relative">
          <span className="material-symbols-outlined absolute left-md top-1/2 -translate-y-1/2 text-outline text-[20px]">mail</span>
          <input
            autoFocus
            className="w-full pl-[48px] pr-md py-md bg-surface-container-low border border-outline-variant rounded-lg focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all text-body-md placeholder:text-outline/60"
            id="forgot-email"
            placeholder="you@organization.com"
            required
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>
      </div>
      <button
        className="w-full py-md bg-primary text-on-primary text-label-md rounded-lg hover:opacity-90 active:scale-[0.98] transition-all flex items-center justify-center gap-sm disabled:opacity-60 disabled:cursor-not-allowed"
        disabled={status === 'loading'}
        type="submit"
      >
        {status === 'loading' ? 'Sending…' : 'Send Reset Link'}
        {status !== 'loading' && <span className="material-symbols-outlined text-[18px]">send</span>}
      </button>
    </form>
  )
}

function PrivacyPolicyModal() {
  const sections = [
    {
      title: 'Information We Collect',
      body: 'We collect personal information you provide directly, such as name, email address, job title, and employment details. We also collect usage data including login timestamps, IP addresses, and activity logs for security and audit purposes.',
    },
    {
      title: 'How We Use Your Information',
      body: 'Your information is used to operate the HR platform, process payroll, manage leave and attendance, generate reports, and communicate important administrative updates. We do not sell or share your personal data with third parties for marketing.',
    },
    {
      title: 'Data Retention',
      body: 'Employee records are retained for the duration of employment plus seven years to comply with applicable labor and tax regulations. You may request access to, correction of, or deletion of your personal data subject to legal retention obligations.',
    },
    {
      title: 'Security',
      body: 'All data is encrypted in transit (TLS 1.3) and at rest (AES-256). Access is restricted by role-based permissions. We conduct regular security audits and maintain an incident response plan.',
    },
    {
      title: 'Cookies',
      body: 'We use session cookies strictly necessary for authentication. No tracking or advertising cookies are used. Cookies are cleared on logout.',
    },
    {
      title: 'Contact',
      body: 'For privacy-related inquiries, contact your organization\'s HR administrator or reach our Data Protection Officer at privacy@ems-ops.com.',
    },
  ]

  return (
    <div className="space-y-lg max-h-[60vh] overflow-y-auto pr-xs">
      <p className="text-body-md text-on-surface-variant">Last updated: January 1, 2025</p>
      {sections.map((s) => (
        <div key={s.title} className="space-y-xs">
          <h4 className="text-label-md text-on-surface font-semibold">{s.title}</h4>
          <p className="text-body-md text-on-surface-variant leading-relaxed">{s.body}</p>
        </div>
      ))}
    </div>
  )
}

function TermsOfServiceModal() {
  const sections = [
    {
      title: 'Acceptance of Terms',
      body: 'By accessing EMS-Ops, you agree to these Terms of Service. Use of the platform is permitted only for authorized employees and administrators of your organization.',
    },
    {
      title: 'Authorized Use',
      body: 'You may use EMS-Ops solely for lawful, work-related purposes. You must not attempt to gain unauthorized access, reverse-engineer the platform, or use it to harass or harm others.',
    },
    {
      title: 'Account Responsibilities',
      body: 'You are responsible for maintaining the confidentiality of your credentials. Report any suspected unauthorized access immediately to your system administrator. Do not share login credentials.',
    },
    {
      title: 'Data Accuracy',
      body: 'You are responsible for the accuracy of data you submit. Providing false information, particularly in payroll and attendance records, may result in disciplinary action.',
    },
    {
      title: 'Intellectual Property',
      body: 'EMS-Ops and all associated content, features, and functionality are owned by EMS-Ops and are protected by international copyright and intellectual property laws.',
    },
    {
      title: 'Limitation of Liability',
      body: 'To the maximum extent permitted by law, EMS-Ops shall not be liable for indirect, incidental, or consequential damages arising from use of or inability to use the platform.',
    },
    {
      title: 'Modifications',
      body: 'We reserve the right to modify these terms at any time. Continued use of the platform after changes constitutes acceptance of the revised terms.',
    },
  ]

  return (
    <div className="space-y-lg max-h-[60vh] overflow-y-auto pr-xs">
      <p className="text-body-md text-on-surface-variant">Last updated: January 1, 2025</p>
      {sections.map((s) => (
        <div key={s.title} className="space-y-xs">
          <h4 className="text-label-md text-on-surface font-semibold">{s.title}</h4>
          <p className="text-body-md text-on-surface-variant leading-relaxed">{s.body}</p>
        </div>
      ))}
    </div>
  )
}

function SupportCenterModal() {
  const channels = [
    {
      icon: 'mail',
      label: 'Email Support',
      value: 'support@ems-ops.com',
      note: 'Response within 1 business day',
      href: 'mailto:support@ems-ops.com',
    },
    {
      icon: 'phone',
      label: 'Phone Support',
      value: '+1 (800) 546-3842',
      note: 'Mon – Fri, 9 am – 6 pm EST',
      href: 'tel:+18005463842',
    },
    {
      icon: 'chat',
      label: 'Live Chat',
      value: 'Available in-app',
      note: 'For logged-in users only',
      href: null,
    },
    {
      icon: 'menu_book',
      label: 'Documentation',
      value: 'docs.ems-ops.com',
      note: 'Guides, FAQs, and release notes',
      href: null,
    },
  ]

  return (
    <div className="space-y-lg">
      <p className="text-body-md text-on-surface-variant">
        Having trouble logging in? Contact your HR administrator or reach our support team through any of the channels below.
      </p>
      <div className="space-y-sm">
        {channels.map((c) => (
          <div key={c.label} className="flex items-start gap-md p-md rounded-lg bg-surface-container-low border border-outline-variant">
            <div className="flex-shrink-0 w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center">
              <span className="material-symbols-outlined text-primary text-[20px]">{c.icon}</span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-label-md text-on-surface">{c.label}</p>
              {c.href ? (
                <a href={c.href} className="text-body-md text-primary hover:underline break-all">{c.value}</a>
              ) : (
                <p className="text-body-md text-on-surface">{c.value}</p>
              )}
              <p className="text-label-sm text-outline mt-xs">{c.note}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

export default function LoginPage() {
  const navigate = useNavigate()
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [modal, setModal] = useState(null) // null | 'forgot-password' | 'privacy' | 'terms' | 'support'
  const { theme, setTheme } = useTheme()
  const themeOrder = ['light', 'dark', 'system']
  const nextTheme = themeOrder[(themeOrder.indexOf(theme) + 1) % themeOrder.length]
  const themeIcons = { light: 'light_mode', dark: 'dark_mode', system: 'brightness_auto' }
  const themeLabels = { light: 'Light', dark: 'Dark', system: 'System' }
  const { login } = useAuth()

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    const form = new FormData(e.target)
    try {
      const user = await login(form.get('email'), form.get('password'))
      navigate(user.role === 'Employee' ? '/my-dashboard' : '/dashboard', { replace: true })
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      <main className="flex min-h-screen w-full overflow-y-auto lg:overflow-hidden bg-background text-on-background">
        {/* Visual Column */}
        <div className="hidden lg:flex lg:w-1/2 relative bg-primary items-center justify-center p-xl overflow-hidden">
          <div className="absolute inset-0 opacity-10 pointer-events-none">
            <div className="absolute top-0 right-0 w-96 h-96 bg-white rounded-full -translate-y-1/2 translate-x-1/2 blur-3xl"></div>
            <div className="absolute bottom-0 left-0 w-64 h-64 bg-secondary rounded-full translate-y-1/2 -translate-x-1/2 blur-2xl"></div>
          </div>
          <div className="relative z-10 w-full max-w-xl">
            <div className="mb-xl">
              <h1 className="font-display text-display text-on-primary mb-md">Empowering Your Workforce.</h1>
              <p className="text-body-lg text-on-primary/75 leading-relaxed">
                Streamline HR operations, manage payroll with precision, and foster a collaborative culture with the EMS-Ops Admin Center.
              </p>
            </div>
            <div className="rounded-xl overflow-hidden shadow-2xl border border-white/10 aspect-video">
              <div className="w-full h-full bg-primary-container/30 flex items-center justify-center">
                <span className="material-symbols-outlined text-on-primary/40 text-[80px]">groups</span>
              </div>
            </div>
            <div className="mt-xl flex items-center gap-md">
              <div className="flex -space-x-3">
                <div className="h-10 w-10 rounded-full border-2 border-on-primary/30 bg-primary-fixed-dim flex items-center justify-center text-on-primary-fixed-variant font-bold text-sm">AK</div>
                <div className="h-10 w-10 rounded-full border-2 border-on-primary/30 bg-secondary-container flex items-center justify-center text-on-secondary-container font-bold text-sm">MJ</div>
                <div className="h-10 w-10 rounded-full border-2 border-on-primary/30 bg-tertiary-fixed flex items-center justify-center text-on-tertiary-fixed font-bold text-sm">SC</div>
              </div>
              <p className="text-label-sm text-on-primary/75">Joined by 500+ global organizations</p>
            </div>
          </div>
        </div>

        {/* Form Column */}
        <div className="w-full lg:w-1/2 flex flex-col items-center justify-center relative p-margin-mobile md:p-margin-desktop py-xl bg-surface-container-low">
          <div className="absolute top-md right-md flex items-center gap-sm">
            <div className="relative group">
              <button className="flex items-center gap-xs px-sm py-xs bg-surface-container-lowest border border-outline-variant rounded-lg text-label-md text-on-surface hover:bg-surface-container transition-colors">
                <span className="material-symbols-outlined text-[18px]">language</span>
                <span>English</span>
                <span className="material-symbols-outlined text-[18px]">expand_more</span>
              </button>
            </div>
            <button
              aria-label={`Theme: ${themeLabels[theme]}. Switch to ${themeLabels[nextTheme]}`}
              className="p-xs bg-surface-container-lowest border border-outline-variant rounded-lg text-on-surface-variant hover:text-primary transition-colors flex items-center justify-center"
              onClick={() => setTheme(nextTheme)}
              title={`Theme: ${themeLabels[theme]}. Switch to ${themeLabels[nextTheme]}`}
              type="button"
            >
              <span className="material-symbols-outlined">{themeIcons[theme]}</span>
            </button>
          </div>

          <div className="w-full max-w-[440px]">
            <div className="mb-xl text-center">
              <div className="inline-flex items-center justify-center p-sm bg-primary rounded-xl mb-md">
                <span className="material-symbols-outlined text-on-primary text-[32px]" style={{ fontVariationSettings: "'FILL' 1" }}>electric_bolt</span>
              </div>
              <h2 className="text-headline-lg text-on-background">EMS-Ops</h2>
              <p className="text-body-md text-on-surface-variant mt-xs">Admin Center Login</p>
            </div>

            <div className="bg-surface-container-lowest p-xl rounded-xl border border-outline-variant shadow-sm">
              <form className="space-y-lg" onSubmit={handleSubmit}>
                {error && (
                  <div className="flex items-center gap-sm p-md bg-error/10 border border-error/30 rounded-lg text-body-sm text-error">
                    <span className="material-symbols-outlined text-[18px] shrink-0">error</span>
                    {error}
                  </div>
                )}
                <div className="space-y-xs">
                  <label className="text-label-md text-on-surface ml-xs block" htmlFor="email">Email Address</label>
                  <div className="relative">
                    <span className="material-symbols-outlined absolute left-md top-1/2 -translate-y-1/2 text-outline text-[20px]">mail</span>
                    <input
                      className="w-full pl-[48px] pr-md py-md bg-surface-container-low border border-outline-variant rounded-lg focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all text-body-md placeholder:text-outline/60"
                      id="email"
                      name="email"
                      placeholder="admin@organization.com"
                      type="email"
                    />
                  </div>
                </div>

                <div className="space-y-xs">
                  <div className="flex justify-between items-center ml-xs">
                    <label className="text-label-md text-on-surface block" htmlFor="password">Password</label>
                    <button
                      className="text-label-md text-primary hover:underline"
                      onClick={() => setModal('forgot-password')}
                      type="button"
                    >
                      Forgot password?
                    </button>
                  </div>
                  <div className="relative">
                    <span className="material-symbols-outlined absolute left-md top-1/2 -translate-y-1/2 text-outline text-[20px]">lock</span>
                    <input
                      className="w-full pl-[48px] pr-[48px] py-md bg-surface-container-low border border-outline-variant rounded-lg focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all text-body-md placeholder:text-outline/60"
                      id="password"
                      name="password"
                      placeholder="••••••••"
                      type={showPassword ? 'text' : 'password'}
                    />
                    <button className="absolute right-md top-1/2 -translate-y-1/2 text-outline hover:text-on-surface transition-colors" type="button" onClick={() => setShowPassword(v => !v)}>
                      <span className="material-symbols-outlined text-[20px]">{showPassword ? 'visibility_off' : 'visibility'}</span>
                    </button>
                  </div>
                </div>

                <div className="flex items-center gap-sm">
                  <input className="w-4 h-4 rounded border-outline-variant text-primary focus:ring-primary cursor-pointer" id="remember" name="remember" type="checkbox" />
                  <label className="text-body-md text-on-surface-variant cursor-pointer select-none" htmlFor="remember">Keep me logged in</label>
                </div>

                <button
                  className="w-full py-md bg-primary text-on-primary text-label-md rounded-lg shadow-sm hover:opacity-90 active:scale-[0.98] transition-all flex items-center justify-center gap-sm disabled:opacity-60 disabled:cursor-not-allowed"
                  disabled={loading}
                  type="submit"
                >
                  {loading ? 'Signing in…' : 'Login to Dashboard'}
                  {!loading && <span className="material-symbols-outlined text-[18px]">arrow_forward</span>}
                </button>
              </form>

              <div className="my-xl flex items-center gap-md">
                <div className="h-px flex-1 bg-outline-variant"></div>
                <span className="text-label-sm text-outline uppercase tracking-wider">or secure access</span>
                <div className="h-px flex-1 bg-outline-variant"></div>
              </div>

              <button className="w-full py-md bg-surface-container-lowest border border-outline-variant text-on-surface text-label-md rounded-lg hover:bg-surface-container transition-all flex items-center justify-center gap-sm">
                <svg className="w-5 h-5" viewBox="0 0 24 24">
                  <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                  <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                  <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                  <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.34-4.53z" fill="#EA4335" />
                </svg>
                Sign in with Single Sign-On
              </button>
            </div>

            <div className="mt-xl flex flex-wrap justify-center gap-x-xl gap-y-sm">
              <button className="text-label-sm text-outline hover:text-primary transition-colors" onClick={() => setModal('privacy')} type="button">Privacy Policy</button>
              <button className="text-label-sm text-outline hover:text-primary transition-colors" onClick={() => setModal('terms')} type="button">Terms of Service</button>
              <button className="text-label-sm text-outline hover:text-primary transition-colors" onClick={() => setModal('support')} type="button">Support Center</button>
            </div>
          </div>

          <div className="mt-xl text-center pointer-events-none">
            <p className="text-label-sm text-outline/40">EMS-Ops Admin Center v2.4.1 © {new Date().getFullYear()}</p>
          </div>
        </div>
      </main>

      {modal === 'forgot-password' && (
        <Modal title="Reset Password" onClose={() => setModal(null)}>
          <ForgotPasswordModal onClose={() => setModal(null)} />
        </Modal>
      )}

      {modal === 'privacy' && (
        <Modal title="Privacy Policy" maxWidth="max-w-lg" onClose={() => setModal(null)}>
          <PrivacyPolicyModal />
        </Modal>
      )}

      {modal === 'terms' && (
        <Modal title="Terms of Service" maxWidth="max-w-lg" onClose={() => setModal(null)}>
          <TermsOfServiceModal />
        </Modal>
      )}

      {modal === 'support' && (
        <Modal title="Support Center" onClose={() => setModal(null)}>
          <SupportCenterModal />
        </Modal>
      )}
    </>
  )
}
