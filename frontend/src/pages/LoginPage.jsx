import { useNavigate } from 'react-router-dom'

export default function LoginPage() {
  const navigate = useNavigate()

  const handleSubmit = (e) => {
    e.preventDefault()
    navigate('/dashboard')
  }

  return (
    <main className="flex min-h-screen w-full overflow-y-auto lg:overflow-hidden bg-background text-on-background">
      {/* Visual Column */}
      <div className="hidden lg:flex lg:w-1/2 relative bg-primary items-center justify-center p-xl overflow-hidden">
        <div className="absolute inset-0 opacity-10 pointer-events-none">
          <div className="absolute top-0 right-0 w-96 h-96 bg-white rounded-full -translate-y-1/2 translate-x-1/2 blur-3xl"></div>
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-secondary rounded-full translate-y-1/2 -translate-x-1/2 blur-2xl"></div>
        </div>
        <div className="relative z-10 w-full max-w-xl">
          <div className="mb-xl">
            <h1 className="font-display text-display text-white mb-md">Empowering Your Workforce.</h1>
            <p className="text-body-lg text-primary-fixed-dim leading-relaxed">
              Streamline HR operations, manage payroll with precision, and foster a collaborative culture with the Kinetic Admin Center.
            </p>
          </div>
          <div className="rounded-xl overflow-hidden shadow-2xl border border-white/10 aspect-video">
            <div className="w-full h-full bg-primary-container/30 flex items-center justify-center">
              <span className="material-symbols-outlined text-white text-[80px] opacity-40">groups</span>
            </div>
          </div>
          <div className="mt-xl flex items-center gap-md">
            <div className="flex -space-x-3">
              <div className="h-10 w-10 rounded-full border-2 border-primary bg-primary-fixed-dim flex items-center justify-center text-primary font-bold text-sm">AK</div>
              <div className="h-10 w-10 rounded-full border-2 border-primary bg-secondary-container flex items-center justify-center text-secondary font-bold text-sm">MJ</div>
              <div className="h-10 w-10 rounded-full border-2 border-primary bg-tertiary-fixed flex items-center justify-center text-tertiary font-bold text-sm">SC</div>
            </div>
            <p className="text-label-sm text-on-primary-container">Joined by 500+ global organizations</p>
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
          <button className="p-xs bg-surface-container-lowest border border-outline-variant rounded-lg text-on-surface-variant hover:text-primary transition-colors flex items-center justify-center">
            <span className="material-symbols-outlined">light_mode</span>
          </button>
        </div>

        <div className="w-full max-w-[440px]">
          <div className="mb-xl text-center">
            <div className="inline-flex items-center justify-center p-sm bg-primary rounded-xl mb-md">
              <span className="material-symbols-outlined text-white text-[32px]" style={{ fontVariationSettings: "'FILL' 1" }}>electric_bolt</span>
            </div>
            <h2 className="text-headline-lg text-on-background">Kinetic HR</h2>
            <p className="text-body-md text-on-surface-variant mt-xs">Admin Center Login</p>
          </div>

          <div className="bg-surface-container-lowest p-xl rounded-xl border border-outline-variant shadow-sm">
            <form className="space-y-lg" onSubmit={handleSubmit}>
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
                  <a className="text-label-md text-primary hover:underline" href="#">Forgot password?</a>
                </div>
                <div className="relative">
                  <span className="material-symbols-outlined absolute left-md top-1/2 -translate-y-1/2 text-outline text-[20px]">lock</span>
                  <input
                    className="w-full pl-[48px] pr-[48px] py-md bg-surface-container-low border border-outline-variant rounded-lg focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all text-body-md placeholder:text-outline/60"
                    id="password"
                    name="password"
                    placeholder="••••••••"
                    type="password"
                  />
                  <button className="absolute right-md top-1/2 -translate-y-1/2 text-outline hover:text-on-surface transition-colors" type="button">
                    <span className="material-symbols-outlined text-[20px]">visibility</span>
                  </button>
                </div>
              </div>

              <div className="flex items-center gap-sm">
                <input className="w-4 h-4 rounded border-outline-variant text-primary focus:ring-primary cursor-pointer" id="remember" name="remember" type="checkbox" />
                <label className="text-body-md text-on-surface-variant cursor-pointer select-none" htmlFor="remember">Keep me logged in</label>
              </div>

              <button
                className="w-full py-md bg-primary text-white text-label-md rounded-lg shadow-sm hover:bg-primary-container active:scale-[0.98] transition-all flex items-center justify-center gap-sm"
                type="submit"
              >
                Login to Dashboard
                <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
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
            <a className="text-label-sm text-outline hover:text-primary transition-colors" href="#">Privacy Policy</a>
            <a className="text-label-sm text-outline hover:text-primary transition-colors" href="#">Terms of Service</a>
            <a className="text-label-sm text-outline hover:text-primary transition-colors" href="#">Support Center</a>
          </div>
        </div>

        <div className="mt-xl text-center pointer-events-none">
          <p className="text-label-sm text-outline/40">Kinetic HR Admin Center v2.4.1 © 2024</p>
        </div>
      </div>
    </main>
  )
}
