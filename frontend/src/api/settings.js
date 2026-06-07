import { client, upload } from './client.js'

export const settingsService = {
  get: () => client.get('/settings'),
  update: (data) => client.put('/settings', data),
  uploadLogo: (file) => {
    const fd = new FormData()
    fd.append('logo', file)
    return upload('/settings/logo', fd)
  },
  reset: () => client.post('/settings/reset', {}),
}
