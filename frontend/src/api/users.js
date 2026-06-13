import { client, upload, download } from './client.js'

export const usersService = {
  list: ({ page = 1, limit = 20, search = '', role = '', status = '' } = {}) => {
    const p = new URLSearchParams({ page, limit })
    if (search) p.set('search', search)
    if (role) p.set('role', role)
    if (status) p.set('status', status)
    return client.get(`/users?${p}`)
  },
  create: (data) => client.post('/users', data),
  update: (id, data) => client.put(`/users/${id}`, data),
  updateStatus: (id, status) => client.put(`/users/${id}/status`, { status }),
  remove: (id) => client.delete(`/users/${id}`),
  export: () => download('/users/export'),
}

export const profileService = {
  get: async () => {
    const res = await client.get('/users/profile/me')
    if (!res.ok) { const e = await res.json().catch(() => ({})); throw new Error(e.detail ?? 'Request failed') }
    return res.json()
  },
  getEmployee: async (employeeId) => {
    const res = await client.get(`/employees/${employeeId}`)
    if (!res.ok) { const e = await res.json().catch(() => ({})); throw new Error(e.detail ?? 'Request failed') }
    return res.json()
  },
  getMyEmployee: async () => {
    const res = await client.get('/employees/me')
    if (!res.ok) { const e = await res.json().catch(() => ({})); throw new Error(e.detail ?? 'Request failed') }
    return res.json()
  },
  update: async (data) => {
    const res = await client.put('/users/profile/me', data)
    if (!res.ok) { const e = await res.json().catch(() => ({})); throw new Error(e.detail ?? 'Request failed') }
    return res.json()
  },
  changePassword: async (data) => {
    const res = await client.put('/users/profile/password', data)
    if (!res.ok) { const e = await res.json().catch(() => ({})); throw new Error(e.detail ?? 'Request failed') }
    return null
  },
  updateMyEmployee: async (data) => {
    const res = await client.put('/employees/me', data)
    if (!res.ok) { const e = await res.json().catch(() => ({})); throw new Error(e.detail ?? 'Request failed') }
    return res.json()
  },
  uploadMyPhoto: async (formData) => {
    const res = await upload('/employees/me/photo', formData)
    if (!res.ok) { const e = await res.json().catch(() => ({})); throw new Error(e.detail ?? 'Request failed') }
    return res.json()
  },
}
