import { createContext, useContext, useState, useEffect, useCallback } from 'react'
import { useAuth } from './AuthContext'
import { attendanceService } from '../api/attendance.js'

const AttendanceContext = createContext(null)

export function AttendanceProvider({ children }) {
  const { user } = useAuth()
  const [todayAtt, setTodayAtt]   = useState(null)
  const [seconds, setSeconds]     = useState(0)
  const [attLoading, setAttLoading] = useState(false)
  const [busy, setBusy]           = useState(false)

  const isEmployee = user?.role === 'Employee'

  const loadToday = useCallback(async () => {
    if (!user || !isEmployee) return
    setAttLoading(true)
    try {
      const res = await attendanceService.getToday()
      if (res.ok) {
        const d = await res.json()
        setTodayAtt(d)
        if (d.check_in && !d.check_out && d.elapsed_seconds != null) {
          setSeconds(d.elapsed_seconds)
        } else if (d.check_out && d.elapsed_seconds != null) {
          setSeconds(d.elapsed_seconds)
        }
      }
    } catch { /* ignore */ }
    setAttLoading(false)
  }, [user, isEmployee])

  // Load once on mount (and when user changes)
  useEffect(() => { loadToday() }, [loadToday])

  // Live timer — runs while checked in and not yet checked out, even across page navigations
  useEffect(() => {
    if (!todayAtt?.check_in || todayAtt?.check_out) return
    const id = setInterval(() => setSeconds(s => s + 1), 1000)
    return () => clearInterval(id)
  }, [todayAtt?.check_in, todayAtt?.check_out])

  const checkIn = async () => {
    setBusy(true)
    try {
      const res = await attendanceService.checkIn()
      if (res.ok || res.status === 201) {
        const d = await res.json()
        setTodayAtt(d)
        setSeconds(0)
        return { ok: true }
      }
      const err = await res.json().catch(() => ({}))
      return { ok: false, error: err.detail || 'Check-in failed.' }
    } catch {
      return { ok: false, error: 'Network error.' }
    } finally {
      setBusy(false)
    }
  }

  const checkOut = async () => {
    setBusy(true)
    try {
      const res = await attendanceService.checkOut()
      if (res.ok) {
        const d = await res.json()
        setTodayAtt(d)
        return { ok: true }
      }
      const err = await res.json().catch(() => ({}))
      return { ok: false, error: err.detail || 'Check-out failed.' }
    } catch {
      return { ok: false, error: 'Network error.' }
    } finally {
      setBusy(false)
    }
  }

  return (
    <AttendanceContext.Provider value={{ todayAtt, seconds, attLoading, busy, checkIn, checkOut }}>
      {children}
    </AttendanceContext.Provider>
  )
}

export function useAttendance() {
  const ctx = useContext(AttendanceContext)
  if (!ctx) throw new Error('useAttendance must be used inside AttendanceProvider')
  return ctx
}
