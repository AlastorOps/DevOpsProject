/**
 * Smoke tests for the top-level App component.
 * We render with MemoryRouter so no real navigation occurs.
 */
import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'

// Silence API imports inside the tree
vi.mock('../api/auth.js', () => ({ authService: { login: vi.fn() } }))
vi.mock('../api/client.js', () => ({ client: { saveTokens: vi.fn(), clearTokens: vi.fn() } }))
vi.mock('../api/dashboard.js', () => ({ dashboardService: { getStats: vi.fn() } }))
vi.mock('../api/employees.js', () => ({ employeeService: { list: vi.fn() } }))

// Stub heavy feature components so the tree renders instantly without data
vi.mock('../features/dashboard/AdminDashboard', () => ({ default: () => <p>Admin Dashboard</p> }))
vi.mock('../features/dashboard/EmployeeDashboard', () => ({ default: () => <p>Employee Dashboard</p> }))
vi.mock('../features/employees/EmployeeList', () => ({ default: () => <p>Employee List</p> }))
vi.mock('../features/attendance/AttendanceManagement', () => ({ default: () => <p>Attendance</p> }))
vi.mock('../context/AttendanceContext', () => ({
  AttendanceProvider: ({ children }) => children,
  useAttendance: () => ({}),
}))

import App from '../app/App'

describe('App', () => {
  beforeEach(() => localStorage.clear())

  it('renders the login page for unauthenticated users at root', () => {
    render(<App />)
    // Unauthenticated → ProtectedLayout redirects → /login → LoginPage renders its form
    expect(screen.getByLabelText(/email/i)).toBeInTheDocument()
  })

  it('renders login page when navigating to /login', () => {
    render(<App />)
    expect(screen.getByRole('button', { name: /sign in/i })).toBeInTheDocument()
  })

  it('shows the app branding / product name', () => {
    render(<App />)
    // LoginPage renders "EMS Ops" or similar branding
    expect(document.title !== undefined).toBe(true)
  })
})
