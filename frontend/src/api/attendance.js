import { client } from './client.js'

export const attendanceService = {
  stats: (targetDate) => {
    const p = new URLSearchParams()
    if (targetDate) p.set('target_date', targetDate)
    return client.get(`/attendance/stats?${p}`)
  },
  list: ({ page = 1, limit = 20, targetDate = '', dept = '', status = '' } = {}) => {
    const p = new URLSearchParams({ page, limit })
    if (targetDate) p.set('target_date', targetDate)
    if (dept) p.set('dept', dept)
    if (status) p.set('status', status)
    return client.get(`/attendance?${p}`)
  },
  create: (data) => client.post('/attendance', data),
  update: (id, data) => client.put(`/attendance/${id}`, data),
  listByEmployee: (employeeId, { limit = 20 } = {}) =>
    client.get(`/attendance/employee/${employeeId}?limit=${limit}`),
}
