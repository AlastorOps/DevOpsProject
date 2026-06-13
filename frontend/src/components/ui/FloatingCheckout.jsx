import { useState } from 'react'
import { useAuth } from '../../context/AuthContext'
import { useAttendance } from '../../context/useAttendance.js'

const fmt = (s) => {
  const h = Math.floor(s / 3600)
  const m = Math.floor((s % 3600) / 60)
  const sec = s % 60
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:${String(sec).padStart(2, '0')}`
}

export default function FloatingCheckout() {
  const { user } = useAuth()
  const { todayAtt, seconds, busy, checkOut } = useAttendance()
  const [error, setError] = useState('')

  if (user?.role !== 'Employee') return null
  if (!todayAtt?.check_in || todayAtt?.check_out) return null

  const handleCheckOut = async () => {
    setError('')
    const result = await checkOut()
    if (!result.ok) setError(result.error)
  }

  return (
    <div className="fixed bottom-0 left-0 right-0 lg:left-[240px] z-40 bg-primary text-on-primary shadow-2xl border-t-2 border-primary-container">
      <div className="px-lg py-sm flex items-center justify-between gap-md">
        <div className="flex items-center gap-lg">
          <div className="flex items-center gap-xs">
            <span
              className="w-2.5 h-2.5 rounded-full bg-on-primary opacity-80"
              style={{ animation: 'ping 1.5s cubic-bezier(0,0,0.2,1) infinite' }}
            />
            <span className="text-label-sm font-bold uppercase tracking-widest opacity-75 hidden sm:block">
              Clocked In
            </span>
          </div>
          <span className="text-headline-md font-mono font-bold tabular-nums">{fmt(seconds)}</span>
          {todayAtt.status && (
            <span className={`text-label-sm font-bold px-sm py-0.5 rounded-full ${todayAtt.status === 'Late' ? 'bg-error/30 text-on-primary' : 'bg-on-primary/20 text-on-primary'}`}>
              {todayAtt.status}
            </span>
          )}
        </div>
        <div className="flex items-center gap-md">
          {error && (
            <span className="text-label-sm text-on-primary opacity-80 hidden sm:block">{error}</span>
          )}
          <button
            onClick={handleCheckOut}
            disabled={busy}
            className="flex items-center gap-xs px-lg py-sm bg-on-primary text-primary rounded-lg text-label-md font-bold hover:opacity-90 active:scale-95 transition-all disabled:opacity-50 shadow-sm"
          >
            <span className="material-symbols-outlined text-[18px]">logout</span>
            {busy ? 'Checking out…' : 'Check Out'}
          </button>
        </div>
      </div>
    </div>
  )
}
