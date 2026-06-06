import { client } from './client.js'

export const reportsService = {
  listTypes: () => client.get('/reports'),
  generate: ({ reportType, deptFilter = '', periodFilter = '' }) => {
    const p = new URLSearchParams({ report_type: reportType })
    if (deptFilter) p.set('dept_filter', deptFilter)
    if (periodFilter) p.set('period_filter', periodFilter)
    return client.post(`/reports/generate?${p}`, {})
  },
}
