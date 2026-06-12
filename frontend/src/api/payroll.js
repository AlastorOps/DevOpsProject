import { client } from './client.js'

export const payrollService = {
  stats: () => client.get('/payroll/stats'),
  list: ({ page = 1, limit = 20, status = '', dept = '', month = '', search = '' } = {}) => {
    const p = new URLSearchParams({ page, limit })
    if (status) p.set('status', status)
    if (dept) p.set('dept', dept)
    if (month) p.set('month', month)
    if (search) p.set('search', search)
    return client.get(`/payroll?${p}`)
  },
  create: (data) => client.post('/payroll', data),
  approve: (id) => client.put(`/payroll/${id}/approve`, {}),
  remove: (id) => client.delete(`/payroll/${id}`),
  getPayslip: (id) => client.get(`/payroll/${id}/payslip`),
  listByEmployee: (employeeId, { limit = 20 } = {}) =>
    client.get(`/payroll/employee/${employeeId}?limit=${limit}`),
}
