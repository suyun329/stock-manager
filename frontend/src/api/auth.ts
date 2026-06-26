import api from './client'

export interface AuthUser {
  username: string
  name: string
}

export const signup = async (username: string, name: string, password: string): Promise<void> => {
  await api.post('/auth/signup', { username, name, password })
}

export const login = async (username: string, password: string): Promise<{ access_token: string; name: string }> => {
  const { data } = await api.post('/auth/login', { username, password })
  return data
}
