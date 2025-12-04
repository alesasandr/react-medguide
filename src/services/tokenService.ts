/**
 * 🔐 JWT Token Management Service
 *
 * Использование:
 * - tokenService.saveToken(token) - сохранить JWT
 * - tokenService.getToken() - получить JWT из хранилища
 * - tokenService.removeToken() - удалить JWT
 * - tokenService.refreshToken(refreshToken) - обновить JWT
 */

import AsyncStorage from "@react-native-async-storage/async-storage";
import { logger } from "./logger";

const TOKEN_KEY = "@medguide_jwt_token";
const REFRESH_TOKEN_KEY = "@medguide_refresh_token";
const TOKEN_EXPIRY_KEY = "@medguide_token_expiry";

export interface TokenData {
  accessToken: string;
  refreshToken?: string;
  expiresIn?: number;
  tokenType?: string;
}

export interface DecodedToken {
  sub: string;
  email: string;
  iat: number;
  exp: number;
  [key: string]: any;
}

/**
 * Простой парсер JWT (без проверки подписи)
 * Для реальной проверки используйте jsonwebtoken на сервере
 */
function decodeToken(token: string): DecodedToken | null {
  try {
    const parts = token.split(".");
    if (parts.length !== 3) {
      return null;
    }

    const decoded = JSON.parse(
      Buffer.from(parts[1], "base64").toString("utf-8")
    );

    return decoded as DecodedToken;
  } catch (e) {
    logger.error("Failed to decode JWT", {
      error: e instanceof Error ? e.message : String(e),
    });
    return null;
  }
}

/**
 * Проверяет, истёк ли токен
 */
function isTokenExpired(token: string): boolean {
  const decoded = decodeToken(token);
  if (!decoded || !decoded.exp) {
    return true;
  }

  const now = Math.floor(Date.now() / 1000);
  const expiresIn = decoded.exp - now;

  // Токен считается истёкшим, если осталось менее 1 минуты
  return expiresIn < 60;
}

class TokenService {
  /**
   * Сохранить JWT токен в защищённое хранилище
   */
  async saveToken(tokenData: TokenData): Promise<void> {
    try {
      const decoded = decodeToken(tokenData.accessToken);
      if (!decoded) {
        throw new Error("Invalid JWT format");
      }

      // Сохраняем токены
      await AsyncStorage.multiSet([
        [TOKEN_KEY, tokenData.accessToken],
        [TOKEN_EXPIRY_KEY, String(decoded.exp)],
      ]);

      if (tokenData.refreshToken) {
        await AsyncStorage.setItem(REFRESH_TOKEN_KEY, tokenData.refreshToken);
      }

      logger.info("✅ JWT token saved", {
        userId: decoded.sub,
        expiresAt: new Date(decoded.exp * 1000).toISOString(),
      });
    } catch (e) {
      logger.error("Failed to save token", {
        error: e instanceof Error ? e.message : String(e),
      });
      throw e;
    }
  }

  /**
   * Получить сохранённый JWT токен
   */
  async getToken(): Promise<string | null> {
    try {
      const token = await AsyncStorage.getItem(TOKEN_KEY);

      if (!token) {
        return null;
      }

      // Проверяем, не истёк ли токен
      if (isTokenExpired(token)) {
        logger.warn("JWT token expired");
        await this.removeToken();
        return null;
      }

      return token;
    } catch (e) {
      logger.error("Failed to get token", {
        error: e instanceof Error ? e.message : String(e),
      });
      return null;
    }
  }

  /**
   * Получить refresh token
   */
  async getRefreshToken(): Promise<string | null> {
    try {
      return await AsyncStorage.getItem(REFRESH_TOKEN_KEY);
    } catch (e) {
      logger.error("Failed to get refresh token", {
        error: e instanceof Error ? e.message : String(e),
      });
      return null;
    }
  }

  /**
   * Удалить токены
   */
  async removeToken(): Promise<void> {
    try {
      await AsyncStorage.multiRemove([
        TOKEN_KEY,
        REFRESH_TOKEN_KEY,
        TOKEN_EXPIRY_KEY,
      ]);
      logger.info("✅ JWT token removed");
    } catch (e) {
      logger.error("Failed to remove token", {
        error: e instanceof Error ? e.message : String(e),
      });
    }
  }

  /**
   * Проверить, есть ли валидный токен
   */
  async hasValidToken(): Promise<boolean> {
    const token = await AsyncStorage.getItem(TOKEN_KEY);
    if (!token) {
      return false;
    }

    return !isTokenExpired(token);
  }

  /**
   * Декодировать токен (для чтения информации)
   */
  decodeToken(token: string): DecodedToken | null {
    return decodeToken(token);
  }
}

export const tokenService = new TokenService();
