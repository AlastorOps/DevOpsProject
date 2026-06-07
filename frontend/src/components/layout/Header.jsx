import { useState, useRef, useEffect, useCallback } from 'react'
import { NavLink, useNavigate } from 'react-router-dom'
import { useTheme } from '../../hooks/useTheme'
import { useAuth } from '../../context/AuthContext'
import { notificationService } from '../../api/notifications.js'
import { client, getToken } from '../../api/client.js'

function initials(name = '') {
  return name.split(' ').map(w => w[0]).slice(0, 2).join('').toUpperCase()
}

const LANGUAGES = [
  { code: 'en', label: 'English',  flag: '🇺🇸', htmlLang: 'en' },
  { code: 'kh', label: 'ខ្មែរ',     flag: '🇰🇭', htmlLang: 'km' },
]

function applyLang(code) {
  const lang = LANGUAGES.find(l => l.code === code)
  if (code === 'kh') {
    document.documentElement.classList.add('lang-kh')
  } else {
    document.documentElement.classList.remove('lang-kh')
  }
  document.documentElement.lang = lang?.htmlLang ?? 'en'
}

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
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  const handleLogout = () => { logout(); navigate('/login', { replace: true }) }

  /* ── Notifications ── */
  const [notifications, setNotifications] = useState([])
  const [unreadCount, setUnreadCount]     = useState(0)
  const [showNotif, setShowNotif]         = useState(false)
  const [notifLoading, setNotifLoading]   = useState(false)
  const notifRef = useRef(null)
  useOutsideClick(notifRef, () => setShowNotif(false))

  const fetchNotifications = useCallback(async () => {
    setNotifLoading(true)
    try {
      const res = await notificationService.list()
      if (res.ok) {
        const data = await res.json()
        setNotifications(data)
        setUnreadCount(data.filter(n => !n.read).length)
      }
    } catch { /* ignore */ }
    setNotifLoading(false)
  }, [])

  // Initial load of existing notifications
  useEffect(() => { fetchNotifications() }, [fetchNotifications])

  // SSE for real-time new notifications
  useEffect(() => {
    const token = getToken()
    if (!token) return

    let es
    let retryTimer

    const connect = () => {
      es = new EventSource(`${client.BASE}/notifications/stream?token=${encodeURIComponent(token)}`)

      es.onmessage = (e) => {
        const incoming = JSON.parse(e.data)
        setNotifications(prev => {
          const existing = new Set(prev.map(n => n.id))
          const fresh = incoming.filter(n => !existing.has(n.id))
          if (!fresh.length) return prev
          return [...fresh, ...prev]
        })
        setUnreadCount(prev => prev + incoming.filter(n => !n.read).length)
      }

      es.onerror = () => {
        es.close()
        retryTimer = setTimeout(connect, 5000)
      }
    }

    connect()
    return () => { es?.close(); clearTimeout(retryTimer) }
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  const markRead = async (id) => {
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n))
    setUnreadCount(prev => Math.max(0, prev - 1))
    try { await notificationService.markRead(id) } catch { /* ignore */ }
  }

  const markAllRead = async () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })))
    setUnreadCount(0)
    try { await notificationService.markAllRead() } catch { /* ignore */ }
  }

  const iconColor = (n) => {
    const map = { check_circle: 'text-secondary bg-secondary/10', cancel: 'text-error bg-error/10', payments: 'text-primary bg-primary/10', notifications: 'text-outline bg-surface-container' }
    return map[n.icon] ?? 'text-primary bg-primary/10'
  }

  function relativeTime(iso) {
    if (!iso) return ''
    const diff = Date.now() - new Date(iso).getTime()
    const m = Math.floor(diff / 60_000)
    if (m < 1)  return 'just now'
    if (m < 60) return `${m}m ago`
    const h = Math.floor(m / 60)
    if (h < 24) return `${h}h ago`
    return `${Math.floor(h / 24)}d ago`
  }

  /* ── Language ── */
  const [lang, setLang]     = useState(() => localStorage.getItem('app-lang') ?? 'en')
  const [showLang, setShowLang] = useState(false)
  const langRef = useRef(null)
  useOutsideClick(langRef, () => setShowLang(false))

  // Apply stored language on first render
  useEffect(() => { applyLang(lang) }, []) // eslint-disable-line react-hooks/exhaustive-deps

  const selectLang = (code) => {
    setLang(code)
    localStorage.setItem('app-lang', code)
    applyLang(code)
    setShowLang(false)
  }

  const currentLang = LANGUAGES.find(l => l.code === lang)

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
            {unreadCount > 0 && (
              <span className="absolute top-1 right-1 w-4 h-4 rounded-full bg-error text-on-error text-[10px] font-bold flex items-center justify-center leading-none">
                {unreadCount > 9 ? '9+' : unreadCount}
              </span>
            )}
          </button>

          {showNotif && (
            <div className="absolute right-0 top-12 w-80 bg-surface-container-lowest border border-outline-variant rounded-2xl shadow-2xl overflow-hidden">
              <div className="flex items-center justify-between px-lg py-md border-b border-outline-variant">
                <span className="text-label-lg font-bold">Notifications</span>
                {unreadCount > 0 && (
                  <button onClick={markAllRead} className="text-label-sm text-primary hover:underline">
                    Mark all read
                  </button>
                )}
              </div>

              {notifLoading && notifications.length === 0 ? (
                <div className="px-lg py-xl text-center text-on-surface-variant text-body-sm">Loading…</div>
              ) : notifications.length === 0 ? (
                <div className="px-lg py-xl text-center text-on-surface-variant text-body-sm">
                  <span className="material-symbols-outlined text-[32px] block mb-sm opacity-30">notifications_none</span>
                  No notifications yet
                </div>
              ) : (
                <ul className="max-h-80 overflow-y-auto divide-y divide-outline-variant">
                  {notifications.map(n => (
                    <li
                      key={n.id}
                      onClick={() => !n.read && markRead(n.id)}
                      className={`flex items-start gap-md px-lg py-md cursor-pointer transition-colors hover:bg-surface-container ${!n.read ? 'bg-primary/5' : ''}`}
                    >
                      <div className={`mt-0.5 w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${iconColor(n)}`}>
                        <span className="material-symbols-outlined text-[16px]">{n.icon ?? 'notifications'}</span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className={`text-label-md leading-snug ${!n.read ? 'font-bold' : ''}`}>{n.title}</p>
                        <p className="text-body-sm text-on-surface-variant truncate">{n.body}</p>
                        <p className="text-[11px] text-outline mt-0.5">{relativeTime(n.time)}</p>
                      </div>
                      {!n.read && <span className="mt-2 w-2 h-2 rounded-full bg-primary shrink-0"></span>}
                    </li>
                  ))}
                </ul>
              )}

              <div className="px-lg py-md border-t border-outline-variant text-center">
                <button
                  onClick={() => { fetchNotifications(); setShowNotif(false) }}
                  className="text-label-sm text-primary hover:underline"
                >
                  Refresh
                </button>
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
            <div className="absolute right-0 top-12 w-48 bg-surface-container-lowest border border-outline-variant rounded-2xl shadow-2xl overflow-hidden">
              <div className="px-lg py-md border-b border-outline-variant">
                <span className="text-label-lg font-bold">Language</span>
              </div>
              <ul>
                {LANGUAGES.map(l => (
                  <li key={l.code}>
                    <button
                      onClick={() => selectLang(l.code)}
                      className={`w-full flex items-center gap-md px-lg py-sm text-left hover:bg-surface-container transition-colors ${lang === l.code ? 'text-primary font-bold' : 'text-body-md'}`}
                    >
                      <span className="text-lg">{l.flag}</span>
                      <span className={l.code === 'kh' ? 'font-khmer' : ''}>{l.label}</span>
                      {lang === l.code && <span className="material-symbols-outlined text-[16px] ml-auto">check</span>}
                    </button>
                  </li>
                ))}
              </ul>
              {lang === 'kh' && (
                <div className="px-lg py-sm border-t border-outline-variant bg-primary/5">
                  <p className="text-[11px] text-primary font-bold">ពុម្ពអក្សរ: Noto Sans Khmer</p>
                </div>
              )}
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
            {initials(user?.name)}
          </div>
          <div className="hidden lg:flex flex-col">
            <span className="text-label-md font-bold leading-tight">{user?.name ?? ''}</span>
            <span className="text-[10px] text-outline uppercase tracking-wider">{user?.role ?? ''}</span>
          </div>
        </NavLink>

        <button
          aria-label="Logout"
          className="flex hover:bg-error/10 rounded-full p-2 text-on-surface-variant hover:text-error transition-all"
          onClick={handleLogout}
          title="Logout"
          type="button"
        >
          <span className="material-symbols-outlined">logout</span>
        </button>
      </div>
    </header>
  )
}
