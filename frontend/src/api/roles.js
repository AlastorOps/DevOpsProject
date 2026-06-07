import { client } from './client.js'

export const rolesService = {
  list: () => client.get('/roles'),
  getPermissions: (roleName) =>
    client.get(`/roles/${encodeURIComponent(roleName)}/permissions`),
  create: (data) => client.post('/roles', data),
  updatePermissions: (roleName, data) =>
    client.put(`/roles/${encodeURIComponent(roleName)}`, data),
  remove: (roleName) => client.delete(`/roles/${encodeURIComponent(roleName)}`),
}
