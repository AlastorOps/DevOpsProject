import { client } from './client.js'

export const notificationService = {
  list: () => client.get('/notifications'),
  markRead: (id) => client.put(`/notifications/${id}/read`, {}),
  markAllRead: () => client.put('/notifications/read-all', {}),
}
