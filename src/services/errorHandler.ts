/**
 * 🛡️ Централизованная обработка ошибок приложения
 *
 * Типы ошибок:
 * - ApiError: ошибки при работе с API
 * - ValidationError: ошибки валидации данных
 * - StorageError: ошибки при работе с локальным хранилищем
 * - AuthError: ошибки аутентификации
 * - NetworkError: ошибки сети
 */

import { logger } from "./logger";

export enum ErrorType {
  API = "API_ERROR",
  VALIDATION = "VALIDATION_ERROR",
  STORAGE = "STORAGE_ERROR",
  AUTH = "AUTH_ERROR",
  NETWORK = "NETWORK_ERROR",
  UNKNOWN = "UNKNOWN_ERROR",
}

export interface AppError {
  type: ErrorType;
  message: string;
  code?: string;
  originalError?: Error;
  details?: Record<string, any>;
}

/**
 * Парсит ошибку и возвращает типизированный объект
 */
export function parseError(error: any): AppError {
  let appError: AppError;

  if (error instanceof Error) {
    // Сетевые ошибки
    if (
      error.message.includes("Network") ||
      error.message.includes("timeout")
    ) {
      appError = {
        type: ErrorType.NETWORK,
        message: "Ошибка сети. Проверьте подключение к интернету.",
        code: error.message,
        originalError: error,
      };
    }
    // Ошибки API (fetch)
    else if (error.message.includes("Failed to")) {
      appError = {
        type: ErrorType.API,
        message: "Ошибка при загрузке данных с сервера",
        code: error.message,
        originalError: error,
      };
    }
    // Ошибки Auth
    else if (
      (error as any).code === "USER_NOT_FOUND" ||
      (error as any).code === "WRONG_PASSWORD"
    ) {
      appError = {
        type: ErrorType.AUTH,
        message: error.message,
        code: (error as any).code,
        originalError: error,
      };
    } else {
      appError = {
        type: ErrorType.UNKNOWN,
        message: error.message || "Неизвестная ошибка",
        originalError: error,
      };
    }
  } else if (typeof error === "string") {
    appError = {
      type: ErrorType.UNKNOWN,
      message: error,
    };
  } else if (error && typeof error === "object") {
    appError = {
      type: ErrorType.API,
      message: (error as any).message || "Ошибка сервера",
      details: error,
    };
  } else {
    appError = {
      type: ErrorType.UNKNOWN,
      message: "Неизвестная ошибка произошла",
    };
  }

  return appError;
}

/**
 * Логирует ошибку с информацией о контексте
 */
export function logError(
  context: string,
  error: any,
  additionalData?: Record<string, any>
) {
  const appError = parseError(error);

  logger.error(`[${context}] ${appError.message}`, {
    type: appError.type,
    code: appError.code,
    details: appError.details,
    ...additionalData,
  });

  return appError;
}

/**
 * Преобразует ошибку в пользовательское сообщение
 */
export function getUserMessage(error: AppError): string {
  const messages: Record<ErrorType, string> = {
    [ErrorType.NETWORK]: "Проверьте интернет-соединение",
    [ErrorType.API]: "Ошибка сервера. Попробуйте позже",
    [ErrorType.AUTH]: error.message || "Ошибка аутентификации",
    [ErrorType.VALIDATION]: "Проверьте введённые данные",
    [ErrorType.STORAGE]: "Ошибка при сохранении данных",
    [ErrorType.UNKNOWN]: "Неизвестная ошибка",
  };

  return messages[error.type];
}
