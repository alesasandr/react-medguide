// src/api/client.tsx
import axios from "axios";
import { Platform } from "react-native";
import { logger } from "../services/logger";
import { tokenService } from "../services/tokenService";

/**
 * Функция для получения правильного URL API в зависимости от платформы
 *
 * - На Android эмуляторе: http://10.0.2.2:8000/ (localhost перенаправляется)
 * - На iOS эмуляторе: http://localhost:8000/
 * - На физическом устройстве: IP адрес машины с бэкенду
 * - На Web: http://localhost:8000/
 * - В production: https://api.medguide.com/
 */
const getBaseUrl = (): string => {
  // Приоритет 1: Явно заданный URL в переменных окружения
  if (process.env.EXPO_PUBLIC_API_URL) {
    logger.info("✅ Using custom API URL from env", {
      url: process.env.EXPO_PUBLIC_API_URL,
    });
    return process.env.EXPO_PUBLIC_API_URL;
  }

  // Приоритет 2: URL в зависимости от среды
  if (__DEV__) {
    // Разработка
    // Используем локальный IP для всех платформ (более надежно, чем 10.0.2.2)
    const localIP = "192.168.1.10"; // Локальный IP вашего компьютера
    if (Platform.OS === "android") {
      // Пробуем сначала локальный IP, если не работает - используйте 10.0.2.2
      return `http://${localIP}:8000/api/`; // Локальный IP для Android эмулятора
      // Альтернатива: return "http://10.0.2.2:8000/api/";
    } else if (Platform.OS === "ios") {
      return `http://${localIP}:8000/api/`; // Локальный IP для iOS эмулятора
    } else {
      return `http://${localIP}:8000/api/`; // Локальный IP для Web
    }
  }

  // Приоритет 3: Production URL
  return "https://api.medguide.com/";
};

const devBaseUrl = getBaseUrl();

logger.info("🌐 API configured", {
  baseURL: devBaseUrl,
  platform: Platform.OS,
  environment: __DEV__ ? "development" : "production",
});

export const api = axios.create({
  baseURL: devBaseUrl,
  timeout: 15000, // ✅ Увеличили timeout с 10000
  headers: {
    "Content-Type": "application/json",
  },
});

// ✅ Интерцептор для логирования запросов и добавления JWT токена
api.interceptors.request.use(
  async (config) => {
    // ✅ Добавляем токен аутентификации в заголовок Authorization
    // DRF Token Authentication использует формат "Token <token>"
    const token = await tokenService.getToken();
    if (token) {
      config.headers.Authorization = `Token ${token}`;
      logger.debug("Auth token attached to request", {
        url: config.url,
      });
    }

    logger.debug("📤 API Request", {
      method: config.method?.toUpperCase(),
      url: config.url,
      baseURL: config.baseURL,
    });
    return config;
  },
  (error) => {
    logger.error("❌ API Request Error", {
      error: error instanceof Error ? error.message : String(error),
    });
    return Promise.reject(error);
  }
);

// ✅ Интерцептор для логирования ответов
api.interceptors.response.use(
  (response) => {
    logger.debug("📥 API Response", {
      status: response.status,
      url: response.config.url,
    });
    return response;
  },
  (error) => {
    logger.error("❌ API Response Error", {
      status: error.response?.status,
      message: error.message,
      url: error.config?.url,
    });
    return Promise.reject(error);
  }
);
