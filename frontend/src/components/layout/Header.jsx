import { useState, useRef, useEffect } from 'react'
import { NavLink } from 'react-router-dom'
import { useTheme } from '../../hooks/useTheme'

const LANGUAGES = [
  { code: 'en', label: 'English',  flag: '🇺🇸' },
  { code: 'kh', label: 'ខ្មែរ',     flag: '🇰🇭' },
]

const INITIAL_NOTIFICATIONS = [
  { id: 1, icon: 'person_add',   color: 'text-primary bg-primary/10',     title: 'New employee added',       body: 'Sarah Jenkins joined Engineering.',        time: '2m ago',    read: false },
  { id: 2, icon: 'event_busy',   color: 'text-tertiary bg-tertiary/10',   title: 'Leave request pending',    body: 'Michael Ross requested 3 days off.',       time: '1h ago',    read: false },
  { id: 3, icon: 'payments',     color: 'text-secondary bg-secondary/10', title: 'Payroll processed',        body: 'June payroll has been disbursed.',          time: '3h ago',    read: false },
  { id: 4, icon: 'warning',      color: 'text-error bg-error/10',         title: 'Contract expiring soon',   body: "Alicia Lee's contract expires in 7 days.", time: 'Yesterday', read: true  },
  { id: 5, icon: 'check_circle', color: 'text-secondary bg-secondary/10', title: 'Performance review done', body: 'Q2 reviews have been completed.',           time: '2d ago',    read: true  },
]

function useOutsideClick(ref, onClose) {
  useEffect(() => {
    const handler = (e) => { if (ref.current && !ref.current.contains(e.target)) onClose() }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [ref, onClose])
}

export default function Header({ onMenuClick }) {
  const { resolvedTheme, setTheme } = useTheme()
  const nextTheme = resolvedTheme === 'dark' ? 'light' : 'dark'
  const [notifications, setNotifications] = useState(INITIAL_NOTIFICATIONS)
  const [showNotif, setShowNotif] = useState(false)
  const notifRef = useRef(null)
  useOutsideClick(notifRef, () => setShowNotif(false))

  const [lang, setLang] = useState(() => localStorage.getItem('app-lang') ?? 'en')
  const [showLang, setShowLang] = useState(false)
  const langRef = useRef(null)
  useOutsideClick(langRef, () => setShowLang(false))

  const unread = notifications.filter(n => !n.read).length
  const currentLang = LANGUAGES.find(l => l.code === lang)

  const markAllRead = () => setNotifications(prev => prev.map(n => ({ ...n, read: true })))
  const markRead = (id) => setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n))

  const selectLang = (code) => {
    setLang(code)
    localStorage.setItem('app-lang', code)
    setShowLang(false)
  }

  return (
    <header className="fixed top-0 right-0 left-0 lg:left-sidebar-width h-16 z-40 bg-surface/90 backdrop-blur-md border-b border-outline-variant flex items-center justify-between gap-md px-margin-mobile md:px-margin-desktop shadow-sm">
      <div className="flex items-center gap-md flex-1 min-w-0">
        <button
          aria-label="Open navigation"
          className="lg:hidden shrink-0 rounded-lg p-2 text-on-surface-variant hover:bg-surface-container transition-colors"
          onClick={onMenuClick}
          type="button"
        >
          <span className="material-symbols-outlined">menu</span>
        </button>
        <div className="hidden lg:flex flex-col">
          <span className="text-label-lg font-bold text-on-surface leading-tight">HR Management</span>
          <span className="text-[11px] text-outline uppercase tracking-wider">Admin Portal</span>
        </div>
      </div>

      <div className="flex items-center gap-xs md:gap-md shrink-0">

        {/* Notifications */}
        <div className="relative hidden sm:block" ref={notifRef}>
          <button
            onClick={() => { setShowNotif(v => !v); setShowLang(false) }}
            className="relative hover:bg-surface-container rounded-full p-2 text-on-surface-variant transition-all"
          >
            <span className="material-symbols-outlined">notifications</span>
            {unread > 0 && (
              <span className="absolute top-1 right-1 w-4 h-4 rounded-full bg-error text-on-error text-[10px] font-bold flex items-center justify-center leading-none">
                {unread}
              </span>
            )}
          </button>

          {showNotif && (
            <div className="absolute right-0 top-12 w-80 bg-surface-container-lowest border border-outline-variant rounded-2xl shadow-2xl overflow-hidden">
              <div className="flex items-center justify-between px-lg py-md border-b border-outline-variant">
                <span className="text-label-lg font-bold">Notifications</span>
                {unread > 0 && (
                  <button onClick={markAllRead} className="text-label-sm text-primary hover:underline">
                    Mark all read
                  </button>
                )}
              </div>
              <ul className="max-h-80 overflow-y-auto divide-y divide-outline-variant">
                {notifications.map(n => (
                  <li
                    key={n.id}
                    onClick={() => markRead(n.id)}
                    className={`flex items-start gap-md px-lg py-md cursor-pointer transition-colors hover:bg-surface-container ${!n.read ? 'bg-primary/5' : ''}`}
                  >
                    <div className={`mt-0.5 w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${n.color}`}>
                      <span className="material-symbols-outlined text-[16px]">{n.icon}</span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className={`text-label-md leading-snug ${!n.read ? 'font-bold' : ''}`}>{n.title}</p>
                      <p className="text-body-sm text-on-surface-variant truncate">{n.body}</p>
                      <p className="text-[11px] text-outline mt-0.5">{n.time}</p>
                    </div>
                    {!n.read && <span className="mt-2 w-2 h-2 rounded-full bg-primary shrink-0"></span>}
                  </li>
                ))}
              </ul>
              <div className="px-lg py-md border-t border-outline-variant text-center">
                <button className="text-label-sm text-primary hover:underline">View all notifications</button>
              </div>
            </div>
          )}
        </div>

        {/* Language */}
        <div className="relative hidden md:block" ref={langRef}>
          <button
            onClick={() => { setShowLang(v => !v); setShowNotif(false) }}
            className="flex items-center gap-xs hover:bg-surface-container rounded-full p-2 text-on-surface-variant transition-all"
            title="Change language"
          >
            <span className="text-base leading-none">{currentLang?.flag}</span>
            <span className="text-label-sm font-bold uppercase">{currentLang?.code}</span>
          </button>

          {showLang && (
            <div className="absolute right-0 top-12 w-44 bg-surface-container-lowest border border-outline-variant rounded-2xl shadow-2xl overflow-hidden">
              <div className="px-lg py-md border-b border-outline-variant">
                <span className="text-label-lg font-bold">Language</span>
              </div>
              <ul>
                {LANGUAGES.map(l => (
                  <li key={l.code}>
                    <button
                      onClick={() => selectLang(l.code)}
                      className={`w-full flex items-center gap-md px-lg py-sm text-left text-body-md hover:bg-surface-container transition-colors ${lang === l.code ? 'text-primary font-bold' : ''}`}
                    >
                      <span className="text-lg">{l.flag}</span>
                      {l.label}
                      {lang === l.code && <span className="material-symbols-outlined text-[16px] ml-auto">check</span>}
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>

        {/* Theme toggle */}
        <button
          aria-label={`Switch to ${nextTheme} mode`}
          className="flex hover:bg-surface-container rounded-full p-2 text-on-surface-variant transition-all"
          onClick={() => setTheme(nextTheme)}
          title={`Switch to ${nextTheme} mode`}
          type="button"
        >
          <span className="material-symbols-outlined">{resolvedTheme === 'dark' ? 'light_mode' : 'dark_mode'}</span>
        </button>

        <div className="hidden sm:block h-8 w-px bg-outline-variant mx-xs"></div>

        <NavLink
          to="/profile"
          className="flex items-center gap-sm cursor-pointer hover:bg-surface-container py-1 px-1 sm:px-2 rounded-full transition-all"
        >
          <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-on-primary font-bold text-sm">
            JD
          </div>
          <div className="hidden lg:flex flex-col">
            <span className="text-label-md font-bold leading-tight">James Dalton</span>
            <span className="text-[10px] text-outline uppercase tracking-wider">HR Director</span>
          </div>
        </NavLink>
      </div>
    </header>
  )
}
