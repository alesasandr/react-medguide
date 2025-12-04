// src/api/instructionsApi.ts
import API_BASE_URL from "./config";
import { logger } from "../services/logger";
import { cache } from "../services/cacheService";

export type Instruction = {
  id: number;
  title: string;
  shortText: string;
  fullText: string;
};

export async function fetchInstructions(): Promise<Instruction[]> {
  try {
    // ✅ Проверяем кэш
    const cached = await cache.get<Instruction[]>("instructions_list");
    if (cached) {
      return cached;
    }

    logger.info("📥 Fetching instructions list");
    const res = await fetch(`${API_BASE_URL}/api/instructions/`);

    if (!res.ok) {
      const error = new Error(`Failed to load instructions: ${res.status}`);
      logger.error("Failed to fetch instructions", {
        status: res.status,
        statusText: res.statusText,
      });
      throw error;
    }

    const data = (await res.json()) as Instruction[];

    // ✅ Кэшируем результат на 10 минут
    await cache.set("instructions_list", data, 10 * 60 * 1000);

    logger.info("✅ Instructions loaded successfully", { count: data.length });
    return data;
  } catch (error) {
    logger.error("fetchInstructions error", {
      error: error instanceof Error ? error.message : String(error),
    });
    throw error;
  }
}

export async function fetchInstructionById(id: number): Promise<Instruction> {
  try {
    // ✅ Проверяем кэш для конкретной инструкции
    const cacheKey = `instruction_${id}`;
    const cached = await cache.get<Instruction>(cacheKey);
    if (cached) {
      return cached;
    }

    logger.info("📥 Fetching instruction detail", { id });
    const res = await fetch(`${API_BASE_URL}/api/instructions/${id}/`);

    if (!res.ok) {
      const error = new Error(`Failed to load instruction: ${res.status}`);
      logger.error("Failed to fetch instruction detail", {
        id,
        status: res.status,
        statusText: res.statusText,
      });
      throw error;
    }

    const data = (await res.json()) as Instruction;

    // ✅ Кэшируем результат на 15 минут
    await cache.set(cacheKey, data, 15 * 60 * 1000);

    logger.info("✅ Instruction detail loaded successfully", { id });
    return data;
  } catch (error) {
    logger.error("fetchInstructionById error", {
      id,
      error: error instanceof Error ? error.message : String(error),
    });
    throw error;
  }
}
