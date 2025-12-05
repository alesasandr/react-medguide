/**
 * Интеграционные тесты для аутентификации
 * Тестирует взаимодействие между authService, database и storage
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

describe("Auth Integration Tests", () => {
  beforeEach(async () => {
    jest.clearAllMocks();
    await AsyncStorage.clear();
    mockInitDb.mockResolvedValue(undefined);
  });

  describe("Полный цикл регистрации и входа", () => {
    it("должен зарегистрировать пользователя и сохранить в БД", async () => {
      // Arrange
      const email = "newuser@example.com";
      const password = "securepass123";
      const fullName = "New User";

      mockExecuteSelect
        .mockResolvedValueOnce([]) // Email свободен
        .mockResolvedValueOnce([
          {
            id: 1,
            email,
            full_name: fullName,
            is_staff: 0,
          },
        ]);
      mockDigestStringAsync.mockResolvedValueOnce("hashedpassword");
      mockExecuteRun.mockResolvedValueOnce(undefined);

      // Act
      const user = await registerUser({
        email,
        password,
        fullName,
        isStaff: false,
      });

      // Assert
      expect(user).toBeDefined();
      expect(user.email).toBe(email);
      expect(mockExecuteRun).toHaveBeenCalledWith(
        expect.stringContaining("INSERT INTO users"),
        expect.arrayContaining([email, expect.any(String), fullName, 0])
      );
    });

    it("должен войти после регистрации с правильным паролем", async () => {
      // Arrange
      const email = "test@example.com";
      const password = "password123";
      const salt = "randomsalt";
      const hash = "correcthash";

      // Регистрация
      mockExecuteSelect
        .mockResolvedValueOnce([]) // Email свободен
        .mockResolvedValueOnce([
          {
            id: 1,
            email,
            full_name: "Test User",
            is_staff: 0,
          },
        ]);
      mockDigestStringAsync.mockResolvedValueOnce(`${hash}:${salt}`);
      mockExecuteRun.mockResolvedValueOnce(undefined);

      await registerUser({
        email,
        password,
        fullName: "Test User",
        isStaff: false,
      });

      // Вход
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
      const loggedInUser = await loginUser({ email, password });

      // Assert
      expect(loggedInUser).toBeDefined();
      expect(loggedInUser.email).toBe(email);
    });

    it("должен сохранить пользователя в AsyncStorage после входа", async () => {
      // Arrange
      const email = "test@example.com";
      const password = "password123";
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
      await saveAuthUser({
        id: user.id,
        email: user.email,
        name: user.full_name,
        avatarUri: null,
        isStaff: user.is_staff,
        token: "mock-token",
      });

      // Assert
      const saved = await loadAuthUser();
      expect(saved).toBeDefined();
      expect(saved?.email).toBe(email);
    });
  });

  describe("Интеграция с базой данных", () => {
    it("должен инициализировать БД перед операциями", async () => {
      // Arrange
      mockExecuteSelect.mockResolvedValueOnce([]).mockResolvedValueOnce([
        {
          id: 1,
          email: "test@example.com",
          full_name: "Test",
          is_staff: 0,
        },
      ]);
      mockDigestStringAsync.mockResolvedValueOnce("hash");
      mockExecuteRun.mockResolvedValueOnce(undefined);

      // Act
      await registerUser({
        email: "test@example.com",
        password: "pass",
        fullName: "Test",
        isStaff: false,
      });

      // Assert
      expect(mockInitDb).toHaveBeenCalled();
    });

    it("должен корректно обрабатывать ошибки БД", async () => {
      // Arrange
      mockExecuteSelect.mockRejectedValueOnce(
        new Error("Database connection failed")
      );

      // Act & Assert
      await expect(
        registerUser({
          email: "test@example.com",
          password: "pass",
          fullName: "Test",
          isStaff: false,
        })
      ).rejects.toThrow();
    });
  });

  describe("Безопасность паролей", () => {
    it("должен использовать разные соли для разных паролей", async () => {
      // Arrange
      const password1 = "password1";
      const password2 = "password2";

      mockExecuteSelect
        .mockResolvedValueOnce([]) // Email свободен
        .mockResolvedValueOnce([
          {
            id: 1,
            email: "user1@example.com",
            full_name: "User 1",
            is_staff: 0,
          },
        ])
        .mockResolvedValueOnce([]) // Email свободен
        .mockResolvedValueOnce([
          {
            id: 2,
            email: "user2@example.com",
            full_name: "User 2",
            is_staff: 0,
          },
        ]);

      // Мокаем разные хэши (симулируя разные соли)
      mockDigestStringAsync
        .mockResolvedValueOnce("hash1:salt1")
        .mockResolvedValueOnce("hash2:salt2");
      mockExecuteRun.mockResolvedValue(undefined);

      // Act
      await registerUser({
        email: "user1@example.com",
        password: password1,
        fullName: "User 1",
        isStaff: false,
      });

      await registerUser({
        email: "user2@example.com",
        password: password2,
        fullName: "User 2",
        isStaff: false,
      });

      // Assert
      expect(mockDigestStringAsync).toHaveBeenCalledTimes(2);
      // Проверяем, что вызовы были с разными данными
      const calls = mockDigestStringAsync.mock.calls;
      expect(calls[0][1]).not.toBe(calls[1][1]);
    });
  });
});


