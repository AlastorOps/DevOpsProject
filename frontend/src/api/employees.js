import { client } from './client.js'

export const employeeService = {
  list: ({ page = 1, limit = 10, search = '', dept = '', status = '' } = {}) => {
    const p = new URLSearchParams({ page, limit })
    if (search) p.set('search', search)
    if (dept) p.set('dept', dept)
    if (status) p.set('status', status)
    return client.get(`/employees?${p}`)
  },
  get: (id) => client.get(`/employees/${id}`),
  create: (data) => client.post('/employees', data),
  update: (id, data) => client.put(`/employees/${id}`, data),
  remove: (id) => client.delete(`/employees/${id}`),
  uploadPhoto: (id, formData) => client.upload(`/employees/${id}/photo`, formData),
}
