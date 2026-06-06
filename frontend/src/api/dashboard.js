import { client } from './client.js'

export const dashboardService = {
  adminStats: () => client.get('/dashboard/stats'),
  charts: (period = 'Weekly') => client.get(`/dashboard/charts?period=${period}`),
  employeeStats: () => client.get('/my-dashboard/stats'),
}
