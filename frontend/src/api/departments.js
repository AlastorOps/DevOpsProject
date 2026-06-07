import { client } from './client.js'

export const departmentService = {
  list: ({ page = 1, limit = 100, search = '' } = {}) => {
    const p = new URLSearchParams({ page, limit })
    if (search) p.set('search', search)
    return client.get(`/departments?${p}`)
  },
  get: (id) => client.get(`/departments/${id}`),
  create: (data) => client.post('/departments', data),
  update: (id, data) => client.put(`/departments/${id}`, data),
  remove: (id) => client.delete(`/departments/${id}`),
}
