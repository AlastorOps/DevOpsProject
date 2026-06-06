import { client } from './client.js'

export const authService = {
  login: (email, password) =>
    client.post('/auth/login', { email, password }),

  forgotPassword: (email) =>
    client.post('/auth/forgot-password', { email }),

  logout: () => client.post('/auth/logout', {}),

  me: () => client.get('/auth/me'),
}
