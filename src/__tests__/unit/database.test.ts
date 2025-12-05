/**
 * Модульные тесты для database.ts
 * Тестирует работу с SQLite базой данных
 */

// Мокаем expo-sqlite перед импортом database
// Переопределяем мок из jest.setup.js для более точного контроля в этом тесте
jest.mock("expo-sqlite", () => {
  return {
    openDatabaseSync: jest.fn(),
  };
});

describe("database - Unit Tests", () => {
  let mockDb: any;
  let databaseModule: any;
  let mockOpenDatabaseSync: jest.MockedFunction<any>;

  beforeEach(() => {
    jest.clearAllMocks();
    
    // Импортируем моки (мок уже определен через jest.mock выше)
    const SQLite = require("expo-sqlite");
    mockOpenDatabaseSync = SQLite.openDatabaseSync;
    
    // Создаем новый mockDb для каждого теста
    mockDb = {
      runAsync: jest.fn(() => Promise.resolve()),
      getAllAsync: jest.fn(() => Promise.resolve([])),
      execAsync: jest.fn(() => Promise.resolve()),
    };
    mockOpenDatabaseSync.mockReturnValue(mockDb);
    
    // Импортируем модуль (если еще не импортирован)
    if (!databaseModule) {
      databaseModule = require("../../db/database");
    }
    
    // Сбрасываем кэш БД в модуле
    databaseModule.resetDbCache();
  });

  describe("getDb", () => {
    it("должен открыть базу данных при первом вызове", () => {
      // Act
      const db = databaseModule.getDb();

      // Assert
      expect(mockOpenDatabaseSync).toHaveBeenCalledWith("medguide.db");
      expect(db).toBe(mockDb);
    });

    it("должен возвращать кэшированное подключение при повторных вызовах", () => {
      // Act
      const db1 = databaseModule.getDb();
      const db2 = databaseModule.getDb();

      // Assert
      expect(mockOpenDatabaseSync).toHaveBeenCalledTimes(1);
      expect(db1).toBe(db2);
    });
  });

  describe("executeRun", () => {
    it("должен выполнить SQL запрос через runAsync", async () => {
      // Arrange
      const sql = "INSERT INTO users (email) VALUES (?)";
      const params = ["test@example.com"];

      // Act
      await databaseModule.executeRun(sql, params);

      // Assert
      expect(mockDb.runAsync).toHaveBeenCalledWith(sql, params);
    });

    it("должен использовать execAsync если runAsync недоступен", async () => {
      // Arrange - создаем новый мок без runAsync
      databaseModule.resetDbCache();
      const newMockDb = {
        getAllAsync: jest.fn(() => Promise.resolve([])),
        execAsync: jest.fn(() => Promise.resolve()),
      };
      mockOpenDatabaseSync.mockReturnValueOnce(newMockDb);
      
      const sql = "CREATE TABLE test (id INTEGER)";
      const params: any[] = [];

      // Act
      await databaseModule.executeRun(sql, params);

      // Assert
      expect(newMockDb.execAsync).toHaveBeenCalledWith([{ sql, args: params }]);
    });

    it("должен выбросить ошибку если API недоступен", async () => {
      // Arrange - создаем новый мок без методов
      databaseModule.resetDbCache();
      const newMockDb = {
        getAllAsync: jest.fn(() => Promise.resolve([])),
      };
      mockOpenDatabaseSync.mockReturnValueOnce(newMockDb);

      // Act & Assert
      await expect(databaseModule.executeRun("SELECT 1", [])).rejects.toThrow(
        "expo-sqlite: async API"
      );
    });
  });

  describe("executeSelect", () => {
    it("должен выполнить SELECT запрос и вернуть результаты", async () => {
      // Arrange
      const mockRows = [
        { id: 1, email: "test@example.com" },
        { id: 2, email: "test2@example.com" },
      ];
      mockDb.getAllAsync.mockResolvedValueOnce(mockRows);

      // Act
      const result = await databaseModule.executeSelect("SELECT * FROM users");

      // Assert
      expect(mockDb.getAllAsync).toHaveBeenCalledWith(
        "SELECT * FROM users",
        []
      );
      expect(result).toEqual(mockRows);
    });

    it("должен передавать параметры в запрос", async () => {
      // Arrange
      const sql = "SELECT * FROM users WHERE email = ?";
      const params = ["test@example.com"];
      mockDb.getAllAsync.mockResolvedValueOnce([]);

      // Act
      await databaseModule.executeSelect(sql, params);

      // Assert
      expect(mockDb.getAllAsync).toHaveBeenCalledWith(sql, params);
    });

    it("должен выбросить ошибку если getAllAsync недоступен", async () => {
      // Arrange - создаем новый мок без getAllAsync
      databaseModule.resetDbCache();
      const newMockDb = {
        runAsync: jest.fn(() => Promise.resolve()),
        execAsync: jest.fn(() => Promise.resolve()),
      };
      mockOpenDatabaseSync.mockReturnValueOnce(newMockDb);

      // Act & Assert
      await expect(databaseModule.executeSelect("SELECT 1")).rejects.toThrow(
        "expo-sqlite: getAllAsync"
      );
    });
  });

  describe("initDb", () => {
    it("должен создать таблицу users если её нет", async () => {
      // Act
      await databaseModule.initDb();

      // Assert - проверяем что SQL содержит нужную строку (игнорируя пробелы)
      const callArgs = mockDb.runAsync.mock.calls[0];
      expect(callArgs[0]).toContain("CREATE TABLE IF NOT EXISTS users");
    });
  });
});

