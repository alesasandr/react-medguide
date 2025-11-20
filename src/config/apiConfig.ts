// src/config/apiConfig.ts
// Общая конфигурация API: базовый URL, таймауты и ключи хранения.
//
// ВАЖНО: здесь *нет* жёстко прописанного IP-адреса.
// В реальном проекте базовый URL нужно передавать через переменные окружения
// (EXPO_PUBLIC_API_URL / .env и т.п.), а не хардкодить.

export const API_BASE_URL =
  process.env.EXPO_PUBLIC_API_URL || 'http://127.0.0.1:8081/';

// Ключ, под которым в AsyncStorage хранится токен
export const ACCESS_TOKEN_KEY = '@medguide_access_token';

// Если у тебя refresh-токен или что-то ещё — можешь добавить сюда
export const REFRESH_TOKEN_KEY = '@medguide_refresh_token';

// Общие настройки для axios (можно использовать в client.ts)
export const API_TIMEOUT = 15000; // 15 секунд

// Список эндпоинтов (пример, под себя подправишь)
export const API_ENDPOINTS = {
  login: '/api/auth/login/',
  logout: '/api/auth/logout/',
  register: '/api/auth/register/',
  me: '/api/auth/me/',
  messages: '/api/messages/',
  patients: '/api/patients/',
};
