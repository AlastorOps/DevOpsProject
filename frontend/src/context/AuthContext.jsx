/* eslint-disable react-refresh/only-export-components */
import { createContext, useContext, useState } from 'react'
import { authService } from '../api/auth.js'
import { client } from '../api/client.js'

const AuthContext = createContext(null)

function loadUser() {
  try {
    const stored = localStorage.getItem('auth_user')
    return stored ? JSON.parse(stored) : null
  } catch {
    return null
  }
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(loadUser)

  async function login(email, password) {
    const res = await authService.login(email, password)
    if (!res.ok) {
      const err = await res.json().catch(() => ({}))
      throw new Error(err.detail ?? 'Login failed')
    }
    const data = await res.json()
    client.saveTokens(data)
    setUser(data.user)
    return data.user
  }

  function logout() {
    client.clearTokens()
    setUser(null)
  }

  function updateUser(updatedFields) {
    setUser(prev => {
      const merged = { ...prev, ...updatedFields }
      localStorage.setItem('auth_user', JSON.stringify(merged))
      return merged
    })
  }

  return (
    <AuthContext.Provider value={{ user, login, logout, updateUser, isAuthenticated: !!user }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider')
  return ctx
}
