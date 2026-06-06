import { client, upload } from './client.js'

export const leaveService = {
  list: ({ page = 1, limit = 20, leaveType = '', status = '', employeeId = '' } = {}) => {
    const p = new URLSearchParams({ page, limit })
    if (leaveType) p.set('leave_type', leaveType)
    if (status) p.set('status', status)
    if (employeeId) p.set('employee_id', employeeId)
    return client.get(`/leave?${p}`)
  },
  submit: (formData) => upload('/leave', formData),
  approve: (id) => client.put(`/leave/${id}/approve`, {}),
  reject: (id) => client.put(`/leave/${id}/reject`, {}),
  getBalance: (employeeId) =>
    client.get(`/leave/employee/${employeeId}/balance`),
  updateBalance: (employeeId, leaveType, data) =>
    client.put(`/leave/employee/${employeeId}/balance?leave_type=${encodeURIComponent(leaveType)}`, data),
  listByEmployee: (employeeId, { limit = 20 } = {}) =>
    client.get(`/leave/employee/${employeeId}?limit=${limit}`),
}
