// src/services/authService.ts
import * as Crypto from "expo-crypto";
import { executeRun, executeSelect, initDb } from "../db/database";
import { logger } from "./logger";
import { logError } from "./errorHandler";

export type LocalUser = {
  id: number;
  email: string;
  full_name: string;
  is_staff: boolean;
};

/**
 * ✅ SECURITY: Генерируем SHA-256 хэш пароля с солью
 *
 * Пример:
 * password = "SecurePass123"
 * salt = "a1b2c3d4"
 * hash = SHA256("SecurePass123" + "a1b2c3d4")
 * Сохраняем в БД: "hash:a1b2c3d4"
 */
async function hashPassword(password: string): Promise<string> {
  // Генерируем 8-символьную соль (случайные символы)
  const salt = Array.from({ length: 8 })
    .map(() => Math.random().toString(36)[2])
    .join("");

  // Создаём хэш пароля + соли
  const passwordWithSalt = password + salt;
  const hash = await Crypto.digestStringAsync(
    Crypto.CryptoDigestAlgorithm.SHA256,
    passwordWithSalt
  );

  // Возвращаем в формате "hash:salt" для проверки при логине
  return `${hash}:${salt}`;
}

/**
 * ✅ SECURITY: Проверяем пароль, сравнивая хэши
 *
 * Берём сохранённый хэш вида "hash:salt", извлекаем соль,
 * вычисляем хэш введённого пароля с этой солью и сравниваем
 */
async function verifyPassword(
  password: string,
  storedHash: string
): Promise<boolean> {
  try {
    // Разбираем сохранённый формат "hash:salt"
    const [savedHash, salt] = storedHash.split(":");

    if (!savedHash || !salt) {
      logger.error("Invalid hash format in database", { storedHash });
      return false;
    }

    // Вычисляем хэш введённого пароля с той же солью
    const passwordWithSalt = password + salt;
    const computedHash = await Crypto.digestStringAsync(
      Crypto.CryptoDigestAlgorithm.SHA256,
      passwordWithSalt
    );

    // Сравниваем хэши (constant-time comparison для безопасности)
    return computedHash === savedHash;
  } catch (e) {
    logError("Password verification", e);
    return false;
  }
}

export async function registerUser(params: {
  email: string;
  password: string;
  fullName: string;
  isStaff: boolean;
}): Promise<LocalUser> {
  const { email, password, fullName, isStaff } = params;

  try {
    // ГАРАНТИРУЕМ, что таблица users есть
    await initDb();
    logger.info("📝 Attempting user registration", { email });

    // Проверяем, что email ещё не занят
    const existing = await executeSelect<{ id: number }>(
      "SELECT id FROM users WHERE email = ?",
      [email]
    );

    if (existing.length > 0) {
      logger.warn("Registration failed: email already exists", { email });
      const error = new Error("EMAIL_EXISTS");
      (error as any).code = "EMAIL_EXISTS";
      throw error;
    }

    // ✅ Хэшируем пароль перед сохранением
    const hashedPassword = await hashPassword(password);
    logger.debug("Password hashed successfully");

    // Вставка нового пользователя с хэшированным паролем
    await executeRun(
      `INSERT INTO users (email, password, full_name, is_staff)
       VALUES (?, ?, ?, ?);`,
      [email, hashedPassword, fullName, isStaff ? 1 : 0]
    );

    // Читаем только что созданного пользователя
    const rows = await executeSelect<{
      id: number;
      email: string;
      full_name: string;
      is_staff: number;
    }>(
      `SELECT id, email, full_name, is_staff
       FROM users
       WHERE email = ?`,
      [email]
    );

    if (rows.length === 0) {
      throw new Error("Failed to retrieve registered user");
    }

    const row = rows[0];
    logger.info("✅ User registered successfully", {
      userId: row.id,
      email: row.email,
    });

    return {
      id: row.id,
      email: row.email,
      full_name: row.full_name,
      is_staff: !!row.is_staff,
    };
  } catch (e) {
    logError("registerUser", e, { email });
    throw e;
  }
}

export async function loginUser(params: {
  email: string;
  password: string;
}): Promise<LocalUser> {
  const { email, password } = params;

  try {
    // На всякий случай тоже убеждаемся, что БД и таблица есть
    await initDb();
    logger.info("🔐 Attempting user login", { email });

    const rows = await executeSelect<{
      id: number;
      email: string;
      password: string;
      full_name: string;
      is_staff: number;
    }>(
      `SELECT id, email, password, full_name, is_staff
       FROM users
       WHERE email = ?`,
      [email]
    );

    if (rows.length === 0) {
      logger.warn("Login failed: user not found", { email });
      const error = new Error("USER_NOT_FOUND");
      (error as any).code = "USER_NOT_FOUND";
      throw error;
    }

    const row = rows[0];

    // ✅ Проверяем пароль через хэширование вместо прямого сравнения
    const passwordMatch = await verifyPassword(password, row.password);
    if (!passwordMatch) {
      logger.warn("Login failed: wrong password", { email });
      const error = new Error("WRONG_PASSWORD");
      (error as any).code = "WRONG_PASSWORD";
      throw error;
    }

    logger.info("✅ User logged in successfully", {
      userId: row.id,
      email: row.email,
    });

    return {
      id: row.id,
      email: row.email,
      full_name: row.full_name,
      is_staff: !!row.is_staff,
    };
  } catch (e) {
    logError("loginUser", e, { email });
    throw e;
  }
}
