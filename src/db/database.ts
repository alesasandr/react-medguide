// src/db/database.ts
import * as SQLite from "expo-sqlite";

// Обходим типы expo-sqlite через any, чтобы не ругался TS на новые методы
const SQLiteAny: any = SQLite;

let db: any = null;

// Открытие / кеширование подключения к БД
export function getDb(): any {
  if (!db) {
    if (!SQLiteAny.openDatabaseSync) {
      // Если сюда попадём — видно будет в ошибке
      throw new Error("expo-sqlite: openDatabaseSync is not available");
    }

    // Новый API: синхронное открытие базы
    db = SQLiteAny.openDatabaseSync("medguide.db");
  }
  return db;
}

/**
 * Выполнение запросов, которые НЕ возвращают строки
 * (CREATE TABLE, INSERT, UPDATE, DELETE и т.п.)
 */
export async function executeRun(
  sql: string,
  params: any[] = []
): Promise<void> {
  const database = getDb();
  const dbAny: any = database;

  if (typeof dbAny.runAsync === "function") {
    // Новый нормальный путь
    await dbAny.runAsync(sql, params);
    return;
  }

  if (typeof dbAny.execAsync === "function") {
    // Fallback-режим: execAsync принимает массив команд
    await dbAny.execAsync([{ sql, args: params }]);
    return;
  }

  throw new Error("expo-sqlite: async API (runAsync/execAsync) is not available");
}

/**
 * Выполнение SELECT-запросов.
 * Возвращает массив объектов-строк.
 */
export async function executeSelect<T = any>(
  sql: string,
  params: any[] = []
): Promise<T[]> {
  const database = getDb();
  const dbAny: any = database;

  if (typeof dbAny.getAllAsync === "function") {
    const rows = await dbAny.getAllAsync(sql, params);
    // getAllAsync обычно сразу отдаёт массив объектов
    return rows as T[];
  }

  throw new Error("expo-sqlite: getAllAsync is not available");
}

/**
 * Инициализация схемы БД (создаём таблицы, если ещё нет)
 */
export async function initDb() {
  await executeRun(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      email TEXT UNIQUE NOT NULL,
      password TEXT NOT NULL,
      full_name TEXT,
      is_staff INTEGER DEFAULT 0,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP
    );
  `);
}
