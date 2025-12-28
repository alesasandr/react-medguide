import { api } from "./client";

export const medicinesApi = {
  // Получить все лекарства
  getAll: () => api.get("/medicines/"),

  // Получить лекарство по ID
  getById: (id: number) => api.get(`/medicines/${id}/`),

  // Поиск по названию, артикулу или МНН
  search: (query: string) =>
    api.get("/medicines/search/", { params: { q: query } }),

  // Получить по артикулу
  getByArticle: (article: string) =>
    api.get("/medicines/by_article/", { params: { article } }),

  // Получить по QR коду
  getByQr: (qr: string) => api.get("/medicines/by_qr/", { params: { qr } }),
};
