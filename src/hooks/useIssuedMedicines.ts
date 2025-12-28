import { useState, useEffect } from "react";
import {
  getIssuedMedicines,
  addIssuedMedicine,
  IssuedMedicine,
} from "../api/authApi";
import { logger } from "../services/logger";

export const useIssuedMedicines = () => {
  const [medicines, setMedicines] = useState<IssuedMedicine[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchIssuedMedicines = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getIssuedMedicines();
      setMedicines(data);
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Ошибка загрузки истории";
      setError(message);
      logger.error("Failed to fetch issued medicines", { error: message });
    } finally {
      setLoading(false);
    }
  };

  const addMedicine = async (medicineId: number, quantity: number) => {
    try {
      setLoading(true);
      setError(null);
      const newRecord = await addIssuedMedicine(medicineId, quantity);
      setMedicines([newRecord, ...medicines]);
      return newRecord;
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Ошибка добавления препарата";
      setError(message);
      logger.error("Failed to add issued medicine", { error: message });
      return null;
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchIssuedMedicines();
  }, []);

  return {
    medicines,
    loading,
    error,
    fetchIssuedMedicines,
    addMedicine,
  };
};
