// src/api/client.ts
import axios from 'axios'

/**
 * ВАЖНО:
 * - адрес бэкенда берём из env-переменной EXPO_PUBLIC_API_URL
 * - если она не задана, в dev по умолчанию будет http://localhost:8000/api
 *   (удобно для запуска через Expo Web в браузере)
 */
const devBaseUrl =
  process.env.EXPO_PUBLIC_API_URL ?? 'http://localhost:8000/api'

// Просто чтобы видеть, какой URL реально используется
if (__DEV__) {
  console.log('API base URL:', devBaseUrl)
}

export const api = axios.create({
  baseURL: devBaseUrl,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json'
  }
})
