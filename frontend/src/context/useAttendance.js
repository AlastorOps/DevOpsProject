import { useContext } from 'react'
import AttendanceContext from './AttendanceContext'

export function useAttendance() {
  const ctx = useContext(AttendanceContext)
  if (!ctx) throw new Error('useAttendance must be used inside AttendanceProvider')
  return ctx
}
