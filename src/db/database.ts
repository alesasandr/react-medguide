// src/db/database.ts
import * as SQLite from "expo-sqlite";

// Обходим строгие типы expo-sqlite: работаем через any,
// потому что старый API (openDatabase, transaction, executeSql)
// в рантайме есть, но типы под него уже не выдают.
const SQLiteAny: any = SQLite;

let db: any = null;

// Открытие / кеширование подключения к БД
export function getDb(): any {
  if (!db) {
    // старый проверенный API
    db = SQLiteAny.openDatabase("medguide.db");
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

  return new Promise<void>((resolve, reject) => {
    database.transaction(
      (tx: any) => {
        tx.executeSql(
          sql,
          params,
          (_tx: any, _result: any) => {
            resolve();
          },
          (_tx: any, error: any) => {
            reject(error);
            return false;
          }
        );
      },
      (error: any) => {
        reject(error);
      }
    );
  });
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

  return new Promise<T[]>((resolve, reject) => {
    database.transaction(
      (tx: any) => {
        tx.executeSql(
          sql,
          params,
          (_tx: any, result: any) => {
            const rows: T[] = [];
            const len = result.rows.length;
            for (let i = 0; i < len; i++) {
              rows.push(result.rows.item(i));
            }
            resolve(rows);
          },
          (_tx: any, error: any) => {
            reject(error);
            return false;
          }
        );
      },
      (error: any) => {
        reject(error);
      }
    );
  });
}

// Инициализация схемы БД (создаём таблицы, если ещё нет)
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
