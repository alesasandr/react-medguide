/**
 * Модульные тесты для authService
 * Тестирует изолированную работу сервиса аутентификации
 */

import {
  registerUser,
  loginUser,
  type LocalUser,
} from "../../services/authService";
import { executeRun, executeSelect, initDb } from "../../db/database";
import * as Crypto from "expo-crypto";

// Мокаем зависимости
// expo-sqlite уже замокан в jest.setup.js
jest.mock("../../db/database");
jest.mock("expo-crypto");

const mockExecuteRun = executeRun as jest.MockedFunction<typeof executeRun>;
const mockExecuteSelect = executeSelect as jest.MockedFunction<
  typeof executeSelect
>;
const mockInitDb = initDb as jest.MockedFunction<typeof initDb>;
const mockDigestStringAsync = Crypto.digestStringAsync as jest.MockedFunction<
  typeof Crypto.digestStringAsync
>;

describe("authService - Unit Tests", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockInitDb.mockResolvedValue(undefined);
  });

  describe("registerUser", () => {
    it("должен успешно зарегистрировать нового пользователя", async () => {
      // Arrange
      const email = "test@example.com";
      const password = "password123";
      const fullName = "Test User";
      const isStaff = false;

      mockExecuteSelect.mockResolvedValueOnce([]); // Email не занят
      mockDigestStringAsync.mockResolvedValueOnce("hashedpassword123");
      mockExecuteRun.mockResolvedValueOnce(undefined);
      mockExecuteSelect.mockResolvedValueOnce([
        {
          id: 1,
          email,
          full_name: fullName,
          is_staff: 0,
        },
      ]);

      // Act
      const result = await registerUser({
        email,
        password,
        fullName,
        isStaff,
      });

      // Assert
      expect(result).toEqual({
        id: 1,
        email,
        full_name: fullName,
        is_staff: false,
      });
      expect(mockInitDb).toHaveBeenCalled();
      expect(mockExecuteSelect).toHaveBeenCalledWith(
        "SELECT id FROM users WHERE email = ?",
        [email]
      );
      expect(mockDigestStringAsync).toHaveBeenCalled();
      expect(mockExecuteRun).toHaveBeenCalled();
    });

    it("должен выбросить ошибку если email уже существует", async () => {
      // Arrange
      const email = "existing@example.com";
      mockExecuteSelect.mockResolvedValueOnce([{ id: 1 }]); // Email занят

      // Act & Assert
      await expect(
        registerUser({
          email,
          password: "password123",
          fullName: "Test",
          isStaff: false,
        })
      ).rejects.toThrow("EMAIL_EXISTS");

      expect(mockExecuteSelect).toHaveBeenCalled();
      expect(mockDigestStringAsync).not.toHaveBeenCalled();
    });

    it("должен корректно хэшировать пароль с солью", async () => {
      // Arrange
      const password = "SecurePass123";
      mockExecuteSelect
        .mockResolvedValueOnce([]) // Email свободен
        .mockResolvedValueOnce([
          {
            id: 1,
            email: "test@example.com",
            full_name: "Test",
            is_staff: 0,
          },
        ]);
      mockDigestStringAsync.mockResolvedValueOnce("hashedvalue");
      mockExecuteRun.mockResolvedValueOnce(undefined);

      // Act
      await registerUser({
        email: "test@example.com",
        password,
        fullName: "Test",
        isStaff: false,
      });

      // Assert
      expect(mockDigestStringAsync).toHaveBeenCalledWith(
        Crypto.CryptoDigestAlgorithm.SHA256,
        expect.stringContaining(password)
      );
    });
  });

  describe("loginUser", () => {
    it("должен успешно войти с правильными данными", async () => {
      // Arrange
      const email = "test@example.com";
      const password = "password123";
      const storedHash = "hashedpassword123:randomsalt";

      mockExecuteSelect.mockResolvedValueOnce([
        {
          id: 1,
          email,
          password: storedHash,
          full_name: "Test User",
          is_staff: 0,
        },
      ]);
      mockDigestStringAsync.mockResolvedValueOnce("hashedpassword123");

      // Act
      const result = await loginUser({ email, password });

      // Assert
      expect(result).toEqual({
        id: 1,
        email,
        full_name: "Test User",
        is_staff: false,
      });
      expect(mockExecuteSelect).toHaveBeenCalledWith(
        expect.stringContaining("SELECT"),
        [email]
      );
    });

    it("должен выбросить ошибку если пользователь не найден", async () => {
      // Arrange
      mockExecuteSelect.mockResolvedValueOnce([]);

      // Act & Assert
      await expect(
        loginUser({
          email: "nonexistent@example.com",
          password: "password123",
        })
      ).rejects.toThrow("USER_NOT_FOUND");
    });

    it("должен выбросить ошибку если пароль неверный", async () => {
      // Arrange
      const email = "test@example.com";
      const wrongPassword = "wrongpassword";
      const storedHash = "correcthash:randomsalt";

      mockExecuteSelect.mockResolvedValueOnce([
        {
          id: 1,
          email,
          password: storedHash,
          full_name: "Test",
          is_staff: 0,
        },
      ]);
      mockDigestStringAsync.mockResolvedValueOnce("wronghash");

      // Act & Assert
      await expect(
        loginUser({ email, password: wrongPassword })
      ).rejects.toThrow("WRONG_PASSWORD");
    });

    it("должен корректно проверять пароль с солью", async () => {
      // Arrange
      const email = "test@example.com";
      const password = "password123";
      const salt = "randomsalt";
      const correctHash = "correcthash";
      const storedHash = `${correctHash}:${salt}`;

      mockExecuteSelect.mockResolvedValueOnce([
        {
          id: 1,
          email,
          password: storedHash,
          full_name: "Test",
          is_staff: 0,
        },
      ]);
      mockDigestStringAsync.mockResolvedValueOnce(correctHash);

      // Act
      const result = await loginUser({ email, password });

      // Assert
      expect(result).toBeDefined();
      expect(mockDigestStringAsync).toHaveBeenCalledWith(
        Crypto.CryptoDigestAlgorithm.SHA256,
        `${password}${salt}`
      );
    });
  });
});


