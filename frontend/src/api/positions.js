import { client } from './client.js'

export const positionService = {
  list: ({ page = 1, limit = 100, search = '', dept = '', level = '' } = {}) => {
    const p = new URLSearchParams({ page, limit })
    if (search) p.set('search', search)
    if (dept) p.set('dept', dept)
    if (level) p.set('level', level)
    return client.get(`/positions?${p}`)
  },
  create: (data) => client.post('/positions', data),
  update: (id, data) => client.put(`/positions/${id}`, data),
  remove: (id) => client.delete(`/positions/${id}`),
}
