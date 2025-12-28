/**
 * 📊 Sentry Integration для отслеживания ошибок в production
 *
 * Установка:
 * - npx expo install @sentry/react-native
 *
 * Использование:
 * - Автоматически перехватывает необработанные исключения
 * - Используйте captureError/captureMessage для явного логирования
 */

import { logger } from "./logger";

// Опциональный импорт Sentry (может быть не установлен)
let Sentry: any = null;
try {
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  Sentry = require("@sentry/react-native");
} catch {
  logger.warn("⚠️ @sentry/react-native not installed");
}

const SENTRY_DSN = process.env.EXPO_PUBLIC_SENTRY_DSN || "";

/**
 * Инициализация Sentry
 * Должна быть вызвана в начале приложения (App.tsx)
 */
export function initSentry(): void {
  if (!Sentry) {
    logger.warn("⚠️ Sentry not available, install @sentry/react-native");
    return;
  }

  if (!SENTRY_DSN) {
    logger.warn("⚠️ Sentry DSN not provided, error tracking disabled");
    return;
  }

  Sentry.init({
    dsn: SENTRY_DSN,
    tracesSampleRate: __DEV__ ? 0.1 : 0.01,
    beforeSend(event: any) {
      if (__DEV__) {
        return event;
      }
      return Math.random() < 0.01 ? event : null;
    },
    environment: __DEV__ ? "development" : "production",
  });

  logger.info("✅ Sentry initialized", {
    environment: __DEV__ ? "development" : "production",
    dsn: SENTRY_DSN.substring(0, 20) + "...",
  });
}

/**
 * Явно отправить ошибку в Sentry
 */
export function captureError(
  error: Error,
  context?: Record<string, any>
): void {
  if (!Sentry) {
    logger.error("Sentry not available", { error: error.message });
    return;
  }

  try {
    Sentry.captureException(error, { extra: context });
    logger.error("Error sent to Sentry", { message: error.message, context });
  } catch (e) {
    logger.error("Failed to send error to Sentry", {
      error: e instanceof Error ? e.message : String(e),
    });
  }
}

/**
 * Отправить сообщение в Sentry
 */
export function captureMessage(
  message: string,
  level: "fatal" | "error" | "warning" | "info" = "info",
  context?: Record<string, any>
): void {
  if (!Sentry) {
    logger.info("Sentry not available, message not sent", { message });
    return;
  }

  try {
    Sentry.captureMessage(message, level);
    if (context) {
      Sentry.setContext("extra", context);
    }
    logger.info(`Message sent to Sentry (${level})`, { message, context });
  } catch (e) {
    logger.error("Failed to send message to Sentry", {
      error: e instanceof Error ? e.message : String(e),
    });
  }
}

/**
 * Установить пользовательский контекст
 * Вызовите после логина с информацией о пользователе
 */
export function setSentryUser(userId: string, email?: string): void {
  if (!Sentry) {
    return;
  }

  try {
    Sentry.setUser({ id: userId, email });
    logger.info("Sentry user context set", { userId, email });
  } catch (e) {
    logger.error("Failed to set Sentry user context", {
      error: e instanceof Error ? e.message : String(e),
    });
  }
}

/**
 * Очистить пользовательский контекст
 * Вызовите при логауте
 */
export function clearSentryUser(): void {
  if (!Sentry) {
    return;
  }

  try {
    Sentry.setUser(null);
    logger.info("Sentry user context cleared");
  } catch (e) {
    logger.error("Failed to clear Sentry user context", {
      error: e instanceof Error ? e.message : String(e),
    });
  }
}

/**
 * Начать транзакцию для отслеживания перформанса
 */
export function startPerformanceTransaction(name: string, op: string): any {
  if (!Sentry) {
    return null;
  }

  try {
    return Sentry.startTransaction({ name, op });
  } catch (e) {
    logger.error("Failed to start performance transaction", {
      error: e instanceof Error ? e.message : String(e),
    });
    return null;
  }
}
