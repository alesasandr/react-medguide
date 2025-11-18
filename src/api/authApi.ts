// пример: src/api/authApi.ts
import { api } from './client'

export type RegisterPayload = {
  username: string
  password: string
  is_staff: boolean
}

export async function registerUser(payload: RegisterPayload) {
  const res = await api.post('/auth/register/', payload)
  return res.data
}

export async function loginUser(username: string, password: string) {
  const res = await api.post('/auth/login/', { username, password })
  return res.data
}
