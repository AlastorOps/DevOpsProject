import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import { MemoryRouter, Routes, Route } from 'react-router-dom'
import { AuthProvider } from '../context/AuthContext'

// Keep API modules silent
vi.mock('../api/auth.js', () => ({ authService: { login: vi.fn() } }))
vi.mock('../api/client.js', () => ({ client: { saveTokens: vi.fn(), clearTokens: vi.fn() } }))

// Inline the guard logic matching App.jsx's ProtectedLayout
import { useAuth } from '../context/AuthContext'
import { Navigate } from 'react-router-dom'

function ProtectedLayout() {
  const { isAuthenticated } = useAuth()
  if (!isAuthenticated) return <Navigate to="/login" replace />
  return <p>Protected content</p>
}

function LoginPage() {
  return <p>Login page</p>
}

function TestApp({ initialEntries = ['/'] }) {
  return (
    <AuthProvider>
      <MemoryRouter initialEntries={initialEntries}>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/" element={<ProtectedLayout />} />
        </Routes>
      </MemoryRouter>
    </AuthProvider>
  )
}

describe('ProtectedRoute', () => {
  it('redirects unauthenticated users to /login', () => {
    render(<TestApp initialEntries={['/']} />)
    expect(screen.getByText('Login page')).toBeInTheDocument()
    expect(screen.queryByText('Protected content')).not.toBeInTheDocument()
  })

  it('shows protected content to authenticated users', () => {
    // Seed localStorage so AuthContext restores the user
    localStorage.setItem('auth_user', JSON.stringify({ id: '1', email: 'a@b.com', role: 'Admin' }))
    render(<TestApp initialEntries={['/']} />)
    expect(screen.getByText('Protected content')).toBeInTheDocument()
    expect(screen.queryByText('Login page')).not.toBeInTheDocument()
    localStorage.clear()
  })

  it('renders login page when navigating directly to /login', () => {
    render(<TestApp initialEntries={['/login']} />)
    expect(screen.getByText('Login page')).toBeInTheDocument()
  })
})
