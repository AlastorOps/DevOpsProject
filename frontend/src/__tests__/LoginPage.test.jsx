import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import { AuthProvider } from '../context/AuthContext'
import LoginPage from '../features/admin/LoginPage'

vi.mock('../api/auth.js', () => ({
  authService: {
    login: vi.fn(),
    forgotPassword: vi.fn(),
  },
}))
vi.mock('../api/client.js', () => ({
  client: { saveTokens: vi.fn(), clearTokens: vi.fn() },
}))
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom')
  return { ...actual, useNavigate: () => vi.fn() }
})

import { authService } from '../api/auth.js'

function Wrapped() {
  return (
    <AuthProvider>
      <MemoryRouter>
        <LoginPage />
      </MemoryRouter>
    </AuthProvider>
  )
}

describe('LoginPage', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    localStorage.clear()
  })

  it('renders email and password inputs', () => {
    render(<Wrapped />)
    expect(screen.getByLabelText(/email/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/password/i)).toBeInTheDocument()
  })

  it('renders a login submit button', () => {
    render(<Wrapped />)
    expect(screen.getByRole('button', { name: /sign in/i })).toBeInTheDocument()
  })

  it('shows error message on invalid credentials', async () => {
    authService.login.mockResolvedValue({
      ok: false,
      json: async () => ({ detail: 'Invalid email or password' }),
    })

    render(<Wrapped />)
    await userEvent.type(screen.getByLabelText(/email/i), 'wrong@test.com')
    await userEvent.type(screen.getByLabelText(/password/i), 'wrongpass')
    await userEvent.click(screen.getByRole('button', { name: /sign in/i }))

    await waitFor(() => {
      expect(screen.getByText(/invalid email or password/i)).toBeInTheDocument()
    })
  })

  it('calls authService.login with provided credentials', async () => {
    authService.login.mockResolvedValue({
      ok: true,
      json: async () => ({
        access_token: 't',
        refresh_token: 'r',
        user: { id: '1', email: 'admin@company.com', role: 'Admin' },
      }),
    })

    render(<Wrapped />)
    await userEvent.type(screen.getByLabelText(/email/i), 'admin@company.com')
    await userEvent.type(screen.getByLabelText(/password/i), 'Admin@1234')
    await userEvent.click(screen.getByRole('button', { name: /sign in/i }))

    await waitFor(() => {
      expect(authService.login).toHaveBeenCalledWith('admin@company.com', 'Admin@1234')
    })
  })

  it('disables submit button while loading', async () => {
    // Never resolves — keeps the button in loading state
    authService.login.mockImplementation(() => new Promise(() => {}))

    render(<Wrapped />)
    await userEvent.type(screen.getByLabelText(/email/i), 'test@test.com')
    await userEvent.type(screen.getByLabelText(/password/i), 'password')
    await userEvent.click(screen.getByRole('button', { name: /sign in/i }))

    await waitFor(() => {
      expect(screen.getByRole('button', { name: /sign in/i })).toBeDisabled()
    })
  })
})
