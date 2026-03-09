// src/api/client.tsx
import axios from "axios";
import { Platform } from "react-native";
import { getAxiosBaseUrl } from "./config";
import { logger } from "../services/logger";
import { tokenService } from "../services/tokenService";

// Поддержка старой переменной EXPO_PUBLIC_API_URL (полный URL с /api/)
const baseURL =
  process.env.EXPO_PUBLIC_API_URL || getAxiosBaseUrl();

logger.info("🌐 API configured", {
  baseURL,
  platform: Platform.OS,
  environment: __DEV__ ? "development" : "production",
});

export const api = axios.create({
  baseURL,
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
