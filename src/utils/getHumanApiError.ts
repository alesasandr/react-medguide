import axios from "axios";

/**
 * Превращает ошибки Axios/бэкенда в "человеческое" сообщение для Alert'ов.
 * Пытаемся достать detail/message/errors из ответа DRF/JsonResponse.
 */
export function getHumanApiError(error: unknown): string {
  if (axios.isAxiosError(error)) {
    const data: any = error.response?.data;

    if (typeof data === "string" && data.trim()) return data;
    if (data && typeof data.detail === "string" && data.detail.trim())
      return data.detail;
    if (data && typeof data.message === "string" && data.message.trim())
      return data.message;

    // Часто DRF возвращает объект вида {field: ["msg1", "msg2"]}
    if (data && typeof data === "object") {
      const parts: string[] = [];
      for (const [key, value] of Object.entries(data)) {
        if (typeof value === "string") {
          parts.push(value);
        } else if (Array.isArray(value)) {
          const joined = value.filter((v) => typeof v === "string").join(", ");
          if (joined) parts.push(joined);
        }
        // Не спамим названием поля, но если ничего нет — можно fallback'ом добавить key
        if (parts.length >= 2) break;
      }
      if (parts.length) return parts.join("\n");
    }

    if (error.code === "ECONNABORTED") return "Превышено время ожидания ответа сервера.";
    if (error.message) return error.message;
    return "Ошибка запроса к серверу.";
  }

  if (error instanceof Error) return error.message || "Неизвестная ошибка.";
  if (typeof error === "string") return error;
  return "Неизвестная ошибка.";
}


