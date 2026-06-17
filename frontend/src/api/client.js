const BASE = import.meta.env.VITE_API_BASE_URL ?? '/api'

// When VITE_API_BASE_URL is a same-origin path (dev proxy, nginx reverse proxy in
// Docker/K8s), /uploads/* is proxied alongside it. When it's an absolute URL
// (e.g. Render, where the frontend is a static site with no upload proxy),
// uploads must be fetched directly from the backend origin.
const UPLOAD_ORIGIN = /^https?:\/\//.test(BASE) ? new URL(BASE).origin : ''

export function getUploadUrl(photoPath) {
  if (!photoPath) return null
  return `${UPLOAD_ORIGIN}/uploads/${photoPath}`
}

export function getToken() {
  return localStorage.getItem('access_token')
}

export function getRefreshToken() {
  return localStorage.getItem('refresh_token')
}

export function saveTokens({ access_token, refresh_token, user }) {
  localStorage.setItem('access_token', access_token)
  localStorage.setItem('refresh_token', refresh_token)
  if (user !== undefined) localStorage.setItem('auth_user', JSON.stringify(user))
}

export function clearTokens() {
  localStorage.removeItem('access_token')
  localStorage.removeItem('refresh_token')
  localStorage.removeItem('auth_user')
}

async function tryRefresh() {
  const refreshToken = getRefreshToken()
  if (!refreshToken) return false
  try {
    const res = await fetch(`${BASE}/auth/refresh`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ refresh_token: refreshToken }),
    })
    if (!res.ok) return false
    saveTokens(await res.json())
    return true
  } catch {
    return false
  }
}

async function request(path, options = {}) {
  const token = getToken()
  const headers = { 'Content-Type': 'application/json', ...options.headers }
  if (token) headers['Authorization'] = `Bearer ${token}`

  let res = await fetch(`${BASE}${path}`, { ...options, headers })

  // Only intercept 401 when a token was sent (session expiry).
  // If no token was sent (e.g. the login request itself), return the 401
  // directly so the caller can surface the "Invalid credentials" error.
  if (res.status === 401 && token) {
    const refreshed = await tryRefresh()
    if (refreshed) {
      headers['Authorization'] = `Bearer ${getToken()}`
      res = await fetch(`${BASE}${path}`, { ...options, headers })
    } else {
      clearTokens()
      window.location.href = '/login'
      return res
    }
  }

  return res
}

export async function upload(path, formData, method = 'POST') {
  const token = getToken()
  const headers = {}
  if (token) headers['Authorization'] = `Bearer ${token}`

  let res = await fetch(`${BASE}${path}`, { method, headers, body: formData })

  if (res.status === 401) {
    const refreshed = await tryRefresh()
    if (refreshed) {
      headers['Authorization'] = `Bearer ${getToken()}`
      res = await fetch(`${BASE}${path}`, { method, headers, body: formData })
    } else {
      clearTokens()
      window.location.href = '/login'
      return res
    }
  }
  return res
}

export async function download(path) {
  const token = getToken()
  const headers = {}
  if (token) headers['Authorization'] = `Bearer ${token}`
  return fetch(`${BASE}${path}`, { headers })
}

export const client = {
  get:    (path, opts)       => request(path, { ...opts, method: 'GET' }),
  post:   (path, body, opts) => request(path, { ...opts, method: 'POST',  body: JSON.stringify(body) }),
  put:    (path, body, opts) => request(path, { ...opts, method: 'PUT',   body: JSON.stringify(body) }),
  patch:  (path, body, opts) => request(path, { ...opts, method: 'PATCH', body: JSON.stringify(body) }),
  delete: (path, opts)       => request(path, { ...opts, method: 'DELETE' }),
  upload,
  download,
  BASE,
  getToken,
  saveTokens,
  clearTokens,
  getUploadUrl,
}
