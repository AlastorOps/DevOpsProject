import { client } from './client.js'

export const performanceService = {
  stats: () => client.get('/performance/stats'),
  list: ({ page = 1, limit = 20, search = '', dept = '', rating = '' } = {}) => {
    const p = new URLSearchParams({ page, limit })
    if (search) p.set('search', search)
    if (dept) p.set('dept', dept)
    if (rating) p.set('rating', rating)
    return client.get(`/performance?${p}`)
  },
  create: (data) => client.post('/performance', data),
  listByEmployee: (employeeId, { limit = 20 } = {}) =>
    client.get(`/performance/employee/${employeeId}?limit=${limit}`),
}
