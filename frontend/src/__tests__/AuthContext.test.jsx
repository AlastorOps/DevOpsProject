import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, act } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { AuthProvider, useAuth } from '../context/AuthContext'

// Mock the API modules so tests don't make real HTTP calls
vi.mock('../api/auth.js', () => ({
  authService: {
    login: vi.fn(),
    logout: vi.fn(),
  },
}))
vi.mock('../api/client.js', () => ({
  client: {
    saveTokens: vi.fn(),
    clearTokens: vi.fn(),
  },
}))

import { authService } from '../api/auth.js'
import { client } from '../api/client.js'

function AuthConsumer() {
  const { user, isAuthenticated, login, logout } = useAuth()
  return (
    <div>
      <p data-testid="auth-status">{isAuthenticated ? 'authenticated' : 'unauthenticated'}</p>
      <p data-testid="user-email">{user?.email ?? 'none'}</p>
      <button onClick={() => login('test@example.com', 'password')}>Login</button>
      <button onClick={logout}>Logout</button>
    </div>
  )
}

describe('AuthContext', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    localStorage.clear()
  })

  it('starts unauthenticated when no stored user', () => {
    render(
      <AuthProvider>
        <AuthConsumer />
      </AuthProvider>
    )
    expect(screen.getByTestId('auth-status')).toHaveTextContent('unauthenticated')
    expect(screen.getByTestId('user-email')).toHaveTextContent('none')
  })

  it('becomes authenticated after successful login', async () => {
    const fakeUser = { id: '1', email: 'admin@company.com', role: 'Admin' }
    authService.login.mockResolvedValue({
      ok: true,
      json: async () => ({ access_token: 'tok', refresh_token: 'ref', user: fakeUser }),
    })

    render(
      <AuthProvider>
        <AuthConsumer />
      </AuthProvider>
    )

    await act(async () => {
      await userEvent.click(screen.getByText('Login'))
    })

    expect(screen.getByTestId('auth-status')).toHaveTextContent('authenticated')
    expect(screen.getByTestId('user-email')).toHaveTextContent('admin@company.com')
    expect(client.saveTokens).toHaveBeenCalledOnce()
  })

  it('throws on failed login', async () => {
    authService.login.mockResolvedValue({
      ok: false,
      json: async () => ({ detail: 'Invalid credentials' }),
    })

    render(
      <AuthProvider>
        <AuthConsumer />
      </AuthProvider>
    )

    await expect(
      act(async () => {
        await userEvent.click(screen.getByText('Login'))
      })
    ).rejects.toThrow('Invalid credentials')
  })

  it('clears user on logout', async () => {
    const fakeUser = { id: '1', email: 'admin@company.com', role: 'Admin' }
    authService.login.mockResolvedValue({
      ok: true,
      json: async () => ({ access_token: 'tok', refresh_token: 'ref', user: fakeUser }),
    })

    render(
      <AuthProvider>
        <AuthConsumer />
      </AuthProvider>
    )

    await act(async () => {
      await userEvent.click(screen.getByText('Login'))
    })
    expect(screen.getByTestId('auth-status')).toHaveTextContent('authenticated')

    await act(async () => {
      await userEvent.click(screen.getByText('Logout'))
    })
    expect(screen.getByTestId('auth-status')).toHaveTextContent('unauthenticated')
    expect(client.clearTokens).toHaveBeenCalledOnce()
  })

  it('restores user from localStorage on mount', () => {
    const stored = { id: '2', email: 'stored@example.com', role: 'Employee' }
    localStorage.setItem('auth_user', JSON.stringify(stored))

    render(
      <AuthProvider>
        <AuthConsumer />
      </AuthProvider>
    )

    expect(screen.getByTestId('auth-status')).toHaveTextContent('authenticated')
    expect(screen.getByTestId('user-email')).toHaveTextContent('stored@example.com')
  })
})
