/**
 * 🔐 Secure Storage Service
 *
 * Использует expo-secure-store вместо AsyncStorage для чувствительных данных
 *
 * Установка:
 * - npx expo install expo-secure-store
 *
 * Использование:
 * - secureStorage.setPassword(password)
 * - secureStorage.getPassword()
 * - secureStorage.removePassword()
 */

import * as SecureStore from "expo-secure-store";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { logger } from "./logger";

const PASSWORD_KEY = "user_password";
const BIOMETRIC_KEY = "biometric_enabled";

class SecureStorage {
  /**
   * Сохранить пароль в защищённом хранилище
   */
  async setPassword(password: string, label?: string): Promise<void> {
    try {
      await SecureStore.setItemAsync(PASSWORD_KEY, password);
      logger.info("✅ Password stored securely");
    } catch (e) {
      logger.error("Failed to store password securely", {
        error: e instanceof Error ? e.message : String(e),
      });
      throw e;
    }
  }

  /**
   * Получить пароль из защищённого хранилища
   */
  async getPassword(): Promise<string | null> {
    try {
      const password = await SecureStore.getItemAsync(PASSWORD_KEY);
      if (password) {
        logger.debug("Password retrieved from secure storage");
      }
      return password || null;
    } catch (e) {
      logger.error("Failed to retrieve password from secure storage", {
        error: e instanceof Error ? e.message : String(e),
      });
      return null;
    }
  }

  /**
   * Удалить пароль из защищённого хранилища
   */
  async removePassword(): Promise<void> {
    try {
      await SecureStore.deleteItemAsync(PASSWORD_KEY);
      logger.info("✅ Password removed from secure storage");
    } catch (e) {
      logger.error("Failed to remove password from secure storage", {
        error: e instanceof Error ? e.message : String(e),
      });
    }
  }

  /**
   * Проверить, доступно ли защищённое хранилище
   */
  async isAvailable(): Promise<boolean> {
    try {
      const available = await SecureStore.isAvailableAsync();
      if (!available) {
        logger.warn("⚠️ Secure storage is not available on this device");
      }
      return available;
    } catch (e) {
      logger.error("Failed to check secure storage availability", {
        error: e instanceof Error ? e.message : String(e),
      });
      return false;
    }
  }

  /**
   * Сохранить в регулярный AsyncStorage (для некритичных данных)
   */
  async setItem(key: string, value: string): Promise<void> {
    try {
      await AsyncStorage.setItem(key, value);
      logger.debug("Item stored in AsyncStorage", { key });
    } catch (e) {
      logger.error("Failed to store item in AsyncStorage", {
        key,
        error: e instanceof Error ? e.message : String(e),
      });
      throw e;
    }
  }

  /**
   * Получить из регулярного AsyncStorage
   */
  async getItem(key: string): Promise<string | null> {
    try {
      return await AsyncStorage.getItem(key);
    } catch (e) {
      logger.error("Failed to retrieve item from AsyncStorage", {
        key,
        error: e instanceof Error ? e.message : String(e),
      });
      return null;
    }
  }

  /**
   * Удалить из регулярного AsyncStorage
   */
  async removeItem(key: string): Promise<void> {
    try {
      await AsyncStorage.removeItem(key);
      logger.debug("Item removed from AsyncStorage", { key });
    } catch (e) {
      logger.error("Failed to remove item from AsyncStorage", {
        key,
        error: e instanceof Error ? e.message : String(e),
      });
    }
  }

  /**
   * Очистить всё защищённое хранилище
   */
  async clearAll(): Promise<void> {
    try {
      await this.removePassword();
      logger.info("✅ Secure storage cleared");
    } catch (e) {
      logger.error("Failed to clear secure storage", {
        error: e instanceof Error ? e.message : String(e),
      });
    }
  }
}

export const secureStorage = new SecureStorage();
