/**
 * 📝 Централизованное логирование приложения
 *
 * Использование:
 * - logger.info('Пользователь залогирован', { userId: 123 })
 * - logger.warn('Низкий остаток препарата', { medicineId: 5 })
 * - logger.error('Ошибка API', { status: 500, endpoint: '/api/medicines' })
 */

export enum LogLevel {
  DEBUG = "DEBUG",
  INFO = "INFO",
  WARN = "WARN",
  ERROR = "ERROR",
}

interface LogEntry {
  timestamp: string;
  level: LogLevel;
  message: string;
  data?: Record<string, any>;
}

class Logger {
  private logs: LogEntry[] = [];
  private maxLogs = 1000; // Хранить последние 1000 записей в памяти

  private formatTime(): string {
    return new Date().toISOString();
  }

  private addLog(level: LogLevel, message: string, data?: Record<string, any>) {
    const entry: LogEntry = {
      timestamp: this.formatTime(),
      level,
      message,
      data,
    };

    this.logs.push(entry);

    // Удаляем старые логи если превышен лимит
    if (this.logs.length > this.maxLogs) {
      this.logs = this.logs.slice(-this.maxLogs);
    }

    // Консоль вывод для development
    if (__DEV__) {
      const prefix = `[${entry.timestamp}] ${level}`;
      const args = data ? [prefix, message, data] : [prefix, message];

      switch (level) {
        case LogLevel.DEBUG:
          console.log(...args);
          break;
        case LogLevel.INFO:
          console.log(...args);
          break;
        case LogLevel.WARN:
          // В RN/Expo `console.warn/error` может показываться как всплывающий баннер в UI.
          // Нам нужен лог для разработки, но без "toast ERROR/WARN" в интерфейсе.
          console.log(...args);
          break;
        case LogLevel.ERROR:
          // См. комментарий выше: не используем console.error, чтобы не появлялся баннер "ERROR" в UI.
          console.log(...args);
          break;
      }
    }
  }

  debug(message: string, data?: Record<string, any>) {
    this.addLog(LogLevel.DEBUG, message, data);
  }

  info(message: string, data?: Record<string, any>) {
    this.addLog(LogLevel.INFO, message, data);
  }

  warn(message: string, data?: Record<string, any>) {
    this.addLog(LogLevel.WARN, message, data);
  }

  error(message: string, data?: Record<string, any>) {
    this.addLog(LogLevel.ERROR, message, data);
  }

  /**
   * Получить все логи
   */
  getLogs(): LogEntry[] {
    return [...this.logs];
  }

  /**
   * Получить логи по уровню
   */
  getLogsByLevel(level: LogLevel): LogEntry[] {
    return this.logs.filter((log) => log.level === level);
  }

  /**
   * Очистить все логи
   */
  clear() {
    this.logs = [];
  }

  /**
   * Экспортировать логи в текстовый формат
   */
  exportAsText(): string {
    return this.logs
      .map(
        (log) =>
          `[${log.timestamp}] ${log.level}: ${log.message}${
            log.data ? " " + JSON.stringify(log.data) : ""
          }`
      )
      .join("\n");
  }
}

export const logger = new Logger();
