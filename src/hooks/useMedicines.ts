import { useState, useEffect } from "react";
import { medicinesApi } from "../api/medicinesApi";
import { logger } from "../services/logger";

export interface Medicine {
  id: number;
  name: string;
  mnn: string;
  form: string;
  dosage: string;
  min_stock: number;
  stock: number;
  stock_per_pack: number;
  diff: number;
  article: string;
  qr_payload: string;
}

export const useMedicines = () => {
  const [medicines, setMedicines] = useState<Medicine[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchMedicines = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await medicinesApi.getAll();
      setMedicines(response.data);
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Ошибка загрузки лекарств";
      setError(message);
      logger.error("Failed to fetch medicines", { error: message });
    } finally {
      setLoading(false);
    }
  };

  const searchMedicines = async (query: string) => {
    try {
      setLoading(true);
      setError(null);
      const response = await medicinesApi.search(query);
      setMedicines(response.data);
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Ошибка поиска лекарств";
      setError(message);
      logger.error("Failed to search medicines", { error: message });
    } finally {
      setLoading(false);
    }
  };

  const getMedicineByArticle = async (
    article: string
  ): Promise<Medicine | null> => {
    try {
      setLoading(true);
      setError(null);
      const response = await medicinesApi.getByArticle(article);
      return response.data;
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Ошибка получения лекарства";
      setError(message);
      logger.error("Failed to get medicine by article", { error: message });
      return null;
    } finally {
      setLoading(false);
    }
  };

  const getMedicineByQr = async (qr: string): Promise<Medicine | null> => {
    try {
      setLoading(true);
      setError(null);
      const response = await medicinesApi.getByQr(qr);
      return response.data;
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Ошибка сканирования QR";
      setError(message);
      logger.error("Failed to get medicine by QR", { error: message });
      return null;
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMedicines();
  }, []);

  return {
    medicines,
    loading,
    error,
    fetchMedicines,
    searchMedicines,
    getMedicineByArticle,
    getMedicineByQr,
  };
};
