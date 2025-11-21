// src/services/authService.ts
import { executeRun, executeSelect, initDb } from "../db/database";

export type LocalUser = {
  id: number;
  email: string;
  full_name: string | null;
  is_staff: boolean;
};

// ❗ В учебном проекте можно хранить пароль в открытом виде,
// но в реальных проектах — только хэш!
export async function registerUser(params: {
  email: string;
  password: string;
  fullName: string;
  isStaff: boolean;
}): Promise<LocalUser> {
  const { email, password, fullName, isStaff } = params;

  // ГАРАНТИРУЕМ, что таблица users есть
  await initDb();

  // Проверяем, что email ещё не занят
  const existing = await executeSelect<{ id: number }>(
    "SELECT id FROM users WHERE email = ?",
    [email]
  );

  if (existing.length > 0) {
    const error = new Error("EMAIL_EXISTS");
    (error as any).code = "EMAIL_EXISTS";
    throw error;
  }

  // Вставка нового пользователя
  await executeRun(
    `INSERT INTO users (email, password, full_name, is_staff)
     VALUES (?, ?, ?, ?);`,
    [email, password, fullName, isStaff ? 1 : 0]
  );

  // Читаем только что созданного пользователя
  const rows = await executeSelect<{
    id: number;
    email: string;
    full_name: string | null;
    is_staff: number;
  }>(
    `SELECT id, email, full_name, is_staff
     FROM users
     WHERE email = ?`,
    [email]
  );

  const row = rows[0];

  return {
    id: row.id,
    email: row.email,
    full_name: row.full_name,
    is_staff: !!row.is_staff,
  };
}

export async function loginUser(params: {
  email: string;
  password: string;
}): Promise<LocalUser> {
  const { email, password } = params;

  // На всякий случай тоже убеждаемся, что БД и таблица есть
  await initDb();

  const rows = await executeSelect<{
    id: number;
    email: string;
    password: string;
    full_name: string | null;
    is_staff: number;
  }>(
    `SELECT id, email, password, full_name, is_staff
     FROM users
     WHERE email = ?`,
    [email]
  );

  if (rows.length === 0) {
    const error = new Error("USER_NOT_FOUND");
    (error as any).code = "USER_NOT_FOUND";
    throw error;
  }

  const row = rows[0];

  if (row.password !== password) {
    const error = new Error("WRONG_PASSWORD");
    (error as any).code = "WRONG_PASSWORD";
    throw error;
  }

  return {
    id: row.id,
    email: row.email,
    full_name: row.full_name,
    is_staff: !!row.is_staff,
  };
}
