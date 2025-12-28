/**
 * Модульные тесты для storage модулей
 * Тестирует работу с AsyncStorage
 */

import AsyncStorage from "@react-native-async-storage/async-storage";
import {
  saveAuthUser,
  loadAuthUser,
  clearAuthUser,
  type AuthUser,
} from "../../storage/authStorage";
import {
  saveUserProfile,
  loadUserProfile,
  addIssuedRecord,
  getIssuedHistory,
  clearUserProfile,
  type UserProfile,
  type MedicineIssuedRecord,
} from "../../storage/userStorage";

describe("storage - Unit Tests", () => {
  beforeEach(async () => {
    await AsyncStorage.clear();
  });

  describe("authStorage", () => {
    const mockUser: AuthUser = {
      id: 1,
      email: "test@example.com",
      name: "Test User",
      avatarUri: null,
      isStaff: false,
      token: "mock-token",
    };

    it("должен сохранить пользователя", async () => {
      // Act
      await saveAuthUser(mockUser);

      // Assert
      const stored = await AsyncStorage.getItem("auth_user");
      expect(stored).toBeTruthy();
      const parsed = JSON.parse(stored!);
      expect(parsed.email).toBe(mockUser.email);
    });

    it("должен загрузить сохраненного пользователя", async () => {
      // Arrange
      await saveAuthUser(mockUser);

      // Act
      const loaded = await loadAuthUser();

      // Assert
      expect(loaded).toBeDefined();
      expect(loaded?.email).toBe(mockUser.email);
      expect(loaded?.id).toBe(mockUser.id);
    });

    it("должен вернуть null если пользователь не сохранен", async () => {
      // Act
      const loaded = await loadAuthUser();

      // Assert
      expect(loaded).toBeNull();
    });

    it("должен очистить сохраненного пользователя", async () => {
      // Arrange
      await saveAuthUser(mockUser);

      // Act
      await clearAuthUser();

      // Assert
      const loaded = await loadAuthUser();
      expect(loaded).toBeNull();
    });
  });

  describe("userStorage", () => {
    const mockProfile: Partial<UserProfile> = {
      name: "Dr. Test",
      isStaff: true,
      specialty: "Кардиолог",
      workLocation: "Больница №1",
    };

    it("должен сохранить профиль пользователя", async () => {
      // Act
      await saveUserProfile(mockProfile);

      // Assert
      const loaded = await loadUserProfile();
      expect(loaded).toBeDefined();
      expect(loaded?.name).toBe(mockProfile.name);
      expect(loaded?.specialty).toBe(mockProfile.specialty);
    });

    it("должен использовать значения по умолчанию", async () => {
      // Act
      await saveUserProfile({ name: "Test" });

      // Assert
      const loaded = await loadUserProfile();
      expect(loaded?.specialty).toBe("Терапевт");
      expect(loaded?.isStaff).toBe(false);
      expect(loaded?.employeeId).toMatch(/^DOC-/);
    });

    it("должен сохранить employeeId при первом сохранении", async () => {
      // Act
      await saveUserProfile({ name: "Test" });
      const firstLoad = await loadUserProfile();
      const firstEmployeeId = firstLoad?.employeeId;

      await saveUserProfile({ name: "Test Updated" });
      const secondLoad = await loadUserProfile();

      // Assert
      expect(firstEmployeeId).toBeDefined();
      expect(secondLoad?.employeeId).toBe(firstEmployeeId);
    });

    it("должен добавить запись о выданном препарате", async () => {
      // Arrange
      await saveUserProfile({ name: "Dr. Test" });
      const record: MedicineIssuedRecord = {
        id: "record-1",
        medicineId: 1,
        medicineName: "Аспирин",
        quantity: 10,
        issuedAt: new Date().toISOString(),
        doctorId: "doc-1",
        doctorName: "Dr. Test",
      };

      // Act
      await addIssuedRecord(record);

      // Assert
      const history = await getIssuedHistory();
      expect(history).toHaveLength(1);
      expect(history[0].medicineName).toBe("Аспирин");
    });

    it("должен вернуть пустой массив если профиль не существует", async () => {
      // Act
      const history = await getIssuedHistory();

      // Assert
      expect(history).toEqual([]);
    });

    it("должен очистить профиль пользователя", async () => {
      // Arrange
      await saveUserProfile(mockProfile);

      // Act
      await clearUserProfile();

      // Assert
      const loaded = await loadUserProfile();
      expect(loaded).toBeNull();
    });
  });
});





