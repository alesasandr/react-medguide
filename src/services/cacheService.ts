/**
 * 💾 API Response Caching Service
 *
 * Кэширует ответы API для улучшения перформанса и снижения нагрузки на сеть
 *
 * Использование:
 * - cache.get(key) - получить из кэша
 * - cache.set(key, data, ttl) - сохранить в кэш с TTL
 * - cache.invalidate(pattern) - очистить кэш по паттерну
 * - cache.clear() - полностью очистить кэш
 */

import AsyncStorage from "@react-native-async-storage/async-storage";
import { logger } from "./logger";

const CACHE_PREFIX = "@medguide_cache_";
const CACHE_TTL_KEY = "@medguide_cache_ttl_";

export interface CacheEntry<T> {
  data: T;
  timestamp: number;
  ttl: number; // TTL в миллисекундах
}

class CacheService {
  private memoryCache = new Map<string, CacheEntry<any>>();
  private readonly MAX_MEMORY_ITEMS = 50;

  /**
   * Получить данные из кэша
   */
  async get<T>(key: string): Promise<T | null> {
    try {
      // Сначала проверяем память
      const memEntry = this.memoryCache.get(key);
      if (memEntry && !this.isExpired(memEntry)) {
        logger.debug("Cache hit (memory)", { key });
        return memEntry.data as T;
      }

      // Затем проверяем AsyncStorage
      const storageKey = CACHE_PREFIX + key;
      const cachedData = await AsyncStorage.getItem(storageKey);

      if (cachedData) {
        try {
          const entry: CacheEntry<T> = JSON.parse(cachedData);

          if (!this.isExpired(entry)) {
            logger.debug("Cache hit (storage)", { key });
            // Кэшируем в памяти для быстрого доступа
            this.addToMemoryCache(key, entry);
            return entry.data;
          } else {
            // Кэш истёк, удаляем
            await AsyncStorage.removeItem(storageKey);
            logger.debug("Cache expired and removed", { key });
          }
        } catch (e) {
          logger.error("Failed to parse cached data", { key });
          await AsyncStorage.removeItem(storageKey);
        }
      }

      logger.debug("Cache miss", { key });
      return null;
    } catch (e) {
      logger.error("Failed to get from cache", {
        key,
        error: e instanceof Error ? e.message : String(e),
      });
      return null;
    }
  }

  /**
   * Сохранить данные в кэш
   */
  async set<T>(
    key: string,
    data: T,
    ttlMs: number = 5 * 60 * 1000 // По умолчанию 5 минут
  ): Promise<void> {
    try {
      const entry: CacheEntry<T> = {
        data,
        timestamp: Date.now(),
        ttl: ttlMs,
      };

      // Сохраняем в памяти
      this.addToMemoryCache(key, entry);

      // Сохраняем в AsyncStorage
      const storageKey = CACHE_PREFIX + key;
      await AsyncStorage.setItem(storageKey, JSON.stringify(entry));

      logger.debug("Cache set", {
        key,
        ttlSeconds: Math.round(ttlMs / 1000),
      });
    } catch (e) {
      logger.error("Failed to set cache", {
        key,
        error: e instanceof Error ? e.message : String(e),
      });
    }
  }

  /**
   * Удалить из кэша
   */
  async remove(key: string): Promise<void> {
    try {
      this.memoryCache.delete(key);
      await AsyncStorage.removeItem(CACHE_PREFIX + key);
      logger.debug("Cache removed", { key });
    } catch (e) {
      logger.error("Failed to remove from cache", {
        key,
        error: e instanceof Error ? e.message : String(e),
      });
    }
  }

  /**
   * Очистить кэш по паттерну
   */
  async invalidate(pattern: string): Promise<void> {
    try {
      // Очищаем из памяти
      for (const key of this.memoryCache.keys()) {
        if (key.includes(pattern)) {
          this.memoryCache.delete(key);
        }
      }

      // Очищаем из AsyncStorage
      const keys = await AsyncStorage.getAllKeys();
      const cacheKeys = keys.filter(
        (k) => k.startsWith(CACHE_PREFIX) && k.includes(pattern)
      );

      await AsyncStorage.multiRemove(cacheKeys);
      logger.info("Cache invalidated", { pattern, count: cacheKeys.length });
    } catch (e) {
      logger.error("Failed to invalidate cache", {
        pattern,
        error: e instanceof Error ? e.message : String(e),
      });
    }
  }

  /**
   * Полностью очистить кэш
   */
  async clear(): Promise<void> {
    try {
      this.memoryCache.clear();

      const keys = await AsyncStorage.getAllKeys();
      const cacheKeys = keys.filter((k) => k.startsWith(CACHE_PREFIX));

      await AsyncStorage.multiRemove(cacheKeys);
      logger.info("Cache cleared completely", { count: cacheKeys.length });
    } catch (e) {
      logger.error("Failed to clear cache", {
        error: e instanceof Error ? e.message : String(e),
      });
    }
  }

  /**
   * Получить статистику кэша
   */
  async getStats(): Promise<{
    memoryItems: number;
    storageItems: number;
  }> {
    try {
      const keys = await AsyncStorage.getAllKeys();
      const cacheKeys = keys.filter((k) => k.startsWith(CACHE_PREFIX));

      return {
        memoryItems: this.memoryCache.size,
        storageItems: cacheKeys.length,
      };
    } catch (e) {
      logger.error("Failed to get cache stats", {
        error: e instanceof Error ? e.message : String(e),
      });
      return { memoryItems: 0, storageItems: 0 };
    }
  }

  /**
   * Проверить, истёк ли кэш
   */
  private isExpired(entry: CacheEntry<any>): boolean {
    const now = Date.now();
    const expiresAt = entry.timestamp + entry.ttl;
    return now > expiresAt;
  }

  /**
   * Добавить в кэш памяти с ограничением размера
   */
  private addToMemoryCache(key: string, entry: CacheEntry<any>): void {
    if (this.memoryCache.size >= this.MAX_MEMORY_ITEMS) {
      // Удаляем первый элемент
      const firstKey = this.memoryCache.keys().next().value as
        | string
        | undefined;
      if (firstKey) {
        this.memoryCache.delete(firstKey);
      }
    }

    this.memoryCache.set(key, entry);
  }
}

export const cache = new CacheService();
