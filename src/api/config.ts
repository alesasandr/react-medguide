import { Platform } from "react-native";

/**
 * Базовый URL бэкенда (без суффикса /api/).
 * - Задайте EXPO_PUBLIC_API_BASE_URL в .env для своего ПК (например http://192.168.1.100:8000).
 * - В режиме разработки без переменной: Android-эмулятор → 10.0.2.2:8000, остальное → localhost:8000.
 */
function getApiBaseUrl(): string {
  const fromEnv = process.env.EXPO_PUBLIC_API_BASE_URL;
  if (fromEnv) {
    return fromEnv.replace(/\/$/, "");
  }
  if (__DEV__) {
    if (Platform.OS === "android") {
      return "http://192.168.71.90:8000";
    }
    return "http://localhost:8000";
  }
  return "http://localhost:8000";
}

const API_BASE_URL = getApiBaseUrl();

export default API_BASE_URL;

/** URL для axios (baseURL): базовый адрес + /api/ */
export const getAxiosBaseUrl = (): string => `${API_BASE_URL}/api/`;
