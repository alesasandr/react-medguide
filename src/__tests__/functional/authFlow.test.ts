/**
 * Функциональные тесты для потока аутентификации
 * Тестирует полные пользовательские сценарии
 */

import {
  registerUser,
  loginUser,
  type LocalUser,
} from "../../services/authService";
import { saveAuthUser, loadAuthUser, clearAuthUser } from "../../storage/authStorage";
import { executeRun, executeSelect, initDb } from "../../db/database";
import * as Crypto from "expo-crypto";
import AsyncStorage from "@react-native-async-storage/async-storage";

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

describe("Auth Flow - Functional Tests", () => {
  beforeEach(async () => {
    jest.clearAllMocks();
    await AsyncStorage.clear();
    mockInitDb.mockResolvedValue(undefined);
  });

  describe("Сценарий: Новый пользователь регистрируется", () => {
    it("должен успешно пройти полный процесс регистрации", async () => {
      // Arrange
      const userData = {
        email: "newuser@example.com",
        password: "SecurePass123!",
        fullName: "Иван Иванов",
        isStaff: false,
      };

      mockExecuteSelect
        .mockResolvedValueOnce([]) // Email свободен
        .mockResolvedValueOnce([
          {
            id: 1,
            email: userData.email,
            full_name: userData.fullName,
            is_staff: 0,
          },
        ]);
      mockDigestStringAsync.mockResolvedValueOnce("hashedpassword:salt");
      mockExecuteRun.mockResolvedValueOnce(undefined);

      // Act
      const registeredUser = await registerUser(userData);

      // Assert
      expect(registeredUser).toBeDefined();
      expect(registeredUser.email).toBe(userData.email);
      expect(registeredUser.full_name).toBe(userData.fullName);
      expect(registeredUser.is_staff).toBe(false);
      expect(mockExecuteSelect).toHaveBeenCalledWith(
        expect.stringContaining("SELECT id FROM users WHERE email"),
        [userData.email]
      );
    });

    it("должен предотвратить регистрацию с существующим email", async () => {
      // Arrange
      const existingEmail = "existing@example.com";
      mockExecuteSelect.mockResolvedValueOnce([{ id: 1 }]); // Email занят

      // Act & Assert
      await expect(
        registerUser({
          email: existingEmail,
          password: "password",
          fullName: "Test",
          isStaff: false,
        })
      ).rejects.toThrow("EMAIL_EXISTS");
    });
  });

  describe("Сценарий: Пользователь входит в систему", () => {
    it("должен успешно войти с правильными учетными данными", async () => {
      // Arrange
      const email = "user@example.com";
      const password = "correctpassword";
      const hash = "correcthash";
      const salt = "randomsalt";

      mockExecuteSelect.mockResolvedValueOnce([
        {
          id: 1,
          email,
          password: `${hash}:${salt}`,
          full_name: "Test User",
          is_staff: 0,
        },
      ]);
      mockDigestStringAsync.mockResolvedValueOnce(hash);

      // Act
      const user = await loginUser({ email, password });

      // Assert
      expect(user).toBeDefined();
      expect(user.email).toBe(email);
    });

    it("должен отклонить вход с неверным паролем", async () => {
      // Arrange
      const email = "user@example.com";
      const wrongPassword = "wrongpassword";
      const correctHash = "correcthash";
      const salt = "randomsalt";

      mockExecuteSelect.mockResolvedValueOnce([
        {
          id: 1,
          email,
          password: `${correctHash}:${salt}`,
          full_name: "Test",
          is_staff: 0,
        },
      ]);
      mockDigestStringAsync.mockResolvedValueOnce("wronghash");

      // Act & Assert
      await expect(loginUser({ email, password: wrongPassword })).rejects.toThrow(
        "WRONG_PASSWORD"
      );
    });

    it("должен отклонить вход несуществующего пользователя", async () => {
      // Arrange
      mockExecuteSelect.mockResolvedValueOnce([]);

      // Act & Assert
      await expect(
        loginUser({
          email: "nonexistent@example.com",
          password: "password",
        })
      ).rejects.toThrow("USER_NOT_FOUND");
    });
  });

  describe("Сценарий: Пользователь выходит из системы", () => {
    it("должен очистить данные пользователя при выходе", async () => {
      // Arrange
      await saveAuthUser({
        id: 1,
        email: "test@example.com",
        name: "Test",
        avatarUri: null,
        isStaff: false,
        token: "token",
      });

      // Act
      await clearAuthUser();

      // Assert
      const user = await loadAuthUser();
      expect(user).toBeNull();
    });
  });

  describe("Сценарий: Сессия пользователя", () => {
    it("должен сохранить и восстановить сессию пользователя", async () => {
      // Arrange
      const email = "user@example.com";
      const password = "password";
      const hash = "hash";
      const salt = "salt";

      mockExecuteSelect.mockResolvedValueOnce([
        {
          id: 1,
          email,
          password: `${hash}:${salt}`,
          full_name: "Test User",
          is_staff: 1,
        },
      ]);
      mockDigestStringAsync.mockResolvedValueOnce(hash);

      // Act - Вход
      const loggedInUser = await loginUser({ email, password });
      await saveAuthUser({
        id: loggedInUser.id,
        email: loggedInUser.email,
        name: loggedInUser.full_name,
        avatarUri: null,
        isStaff: loggedInUser.is_staff,
        token: "session-token",
      });

      // Act - Восстановление сессии
      const savedUser = await loadAuthUser();

      // Assert
      expect(savedUser).toBeDefined();
      expect(savedUser?.email).toBe(email);
      expect(savedUser?.isStaff).toBe(true);
    });
  });

  describe("Сценарий: Обработка ошибок", () => {
    it("должен корректно обрабатывать ошибки базы данных", async () => {
      // Arrange
      mockExecuteSelect.mockRejectedValueOnce(
        new Error("Database error")
      );

      // Act & Assert
      await expect(
        loginUser({
          email: "test@example.com",
          password: "password",
        })
      ).rejects.toThrow();
    });

    it("должен корректно обрабатывать некорректный формат хэша", async () => {
      // Arrange
      const email = "test@example.com";
      mockExecuteSelect.mockResolvedValueOnce([
        {
          id: 1,
          email,
          password: "invalid-hash-format", // Нет двоеточия
          full_name: "Test",
          is_staff: 0,
        },
      ]);
      mockDigestStringAsync.mockResolvedValueOnce("hash");

      // Act & Assert
      await expect(
        loginUser({ email, password: "password" })
      ).rejects.toThrow("WRONG_PASSWORD");
    });
  });
});


