import { client } from "./client";

export const medicinesApi = {
  // Получить все лекарства
  getAll: () => client.get("/medicines/"),

  // Получить лекарство по ID
  getById: (id: number) => client.get(`/medicines/${id}/`),

  // Поиск по названию, артикулу или МНН
  search: (query: string) =>
    client.get("/medicines/search/", { params: { q: query } }),

  // Получить по артикулу
  getByArticle: (article: string) =>
    client.get("/medicines/by_article/", { params: { article } }),

  // Получить по QR коду
  getByQr: (qr: string) => client.get("/medicines/by_qr/", { params: { qr } }),
};
