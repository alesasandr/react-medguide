// src/screens/MedicineDetailsScreen.tsx
import React, { useEffect, useMemo, useState } from "react";
import { View, Text, StyleSheet, TouchableOpacity, Alert } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { RootStackParamList } from "../navigation/AppNavigation";
import { medicines, Medicine } from "../db/medicines";
import {
  loadUserProfile,
  addIssuedRecord,
  MedicineIssuedRecord,
} from "../storage/userStorage";

type Props = NativeStackScreenProps<RootStackParamList, "MedicineDetails">;

type StockOverride = {
  stock: number;
  diff: number;
};

const STOCK_OVERRIDES_KEY = "@medguide_medicine_stock_overrides";

const MedicineDetailsScreen: React.FC<Props> = ({ route }) => {
  const { id } = route.params;

  const [override, setOverride] = useState<StockOverride | null>(null);
  const [issueCount, setIssueCount] = useState<number>(0);
  const [isSaving, setIsSaving] = useState(false);

  const medicine = useMemo<Medicine | undefined>(
    () => medicines.find((m) => m.id === id),
    [id]
  );

  useEffect(() => {
    const loadOverrides = async () => {
      try {
        const raw = await AsyncStorage.getItem(STOCK_OVERRIDES_KEY);
        if (!raw) return;

        const parsed = JSON.parse(raw) as Record<string, StockOverride>;
        const byId = parsed[String(id)];
        if (byId) {
          setOverride(byId);
        }
      } catch (e) {
        console.log("Failed to load overrides:", e);
      }
    };

    loadOverrides();
  }, [id]);

  if (!medicine) {
    return (
      <View style={styles.root}>
        <View style={styles.card}>
          <Text style={styles.errorText}>Препарат не найден</Text>
        </View>
      </View>
    );
  }

  const currentStock =
    override && typeof override.stock === "number"
      ? override.stock
      : medicine.stock;

  const currentDiff =
    override && typeof override.diff === "number"
      ? override.diff
      : medicine.diff;

  const handleChangeIssue = (delta: 1 | -1) => {
    const maxIssue = currentStock;
    let next = issueCount + delta;
    if (next < 0) next = 0;
    if (next > maxIssue) next = maxIssue;
    setIssueCount(next);
  };

  const handleIssue = async () => {
    if (issueCount <= 0) {
      Alert.alert("Ошибка", "Укажите количество для выдачи");
      return;
    }
    if (currentStock <= 0) {
      Alert.alert("Ошибка", "Нет остатка этого препарата на складе");
      return;
    }

    try {
      setIsSaving(true);

      // перечитаем все overrides на всякий случай
      const raw = await AsyncStorage.getItem(STOCK_OVERRIDES_KEY);
      let allOverrides: Record<string, StockOverride> = {};
      if (raw) {
        try {
          allOverrides = JSON.parse(raw) as Record<string, StockOverride>;
        } catch {
          allOverrides = {};
        }
      }

      const baseStock = medicine.stock;
      const baseMinStock = medicine.minStock;
      const existing = allOverrides[String(id)];

      const currentEffectiveStock =
        existing && typeof existing.stock === "number"
          ? existing.stock
          : baseStock;

      const newStock = Math.max(currentEffectiveStock - issueCount, 0);
      const newDiff = baseMinStock - newStock;

      const updatedOverride: StockOverride = {
        stock: newStock,
        diff: newDiff,
      };

      const updatedAll: Record<string, StockOverride> = {
        ...allOverrides,
        [String(id)]: updatedOverride,
      };

      await AsyncStorage.setItem(
        STOCK_OVERRIDES_KEY,
        JSON.stringify(updatedAll)
      );

      // Сохраняем запись в историю
      const profile = await loadUserProfile();
      if (profile) {
        const record: MedicineIssuedRecord = {
          id: Date.now().toString(),
          medicineId: id,
          medicineName: medicine.name,
          quantity: issueCount,
          issuedAt: new Date().toISOString(),
          doctorId: profile.employeeId,
          doctorName: profile.name,
        };
        await addIssuedRecord(record);
      }

      setOverride(updatedOverride);
      setIssueCount(0);

      Alert.alert(
        "Готово",
        `Выдано ${issueCount} ед. препарата.\nТекущий остаток: ${newStock}.`
      );
    } catch (e) {
      console.log("Failed to issue medicine:", e);
      Alert.alert("Ошибка", "Не удалось сохранить выдачу препарата");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <View style={styles.root}>
      <View style={styles.card}>
        <Text style={styles.title}>{medicine.name}</Text>
        <Text style={styles.mnn}>МНН: {medicine.mnn}</Text>

        <View style={styles.block}>
          <Text style={styles.label}>Лекарственная форма</Text>
          <Text style={styles.value}>{medicine.form}</Text>
        </View>

        <View style={styles.block}>
          <Text style={styles.label}>Дозировка</Text>
          <Text style={styles.value}>{medicine.dosage}</Text>
        </View>

        <View style={styles.blockRow}>
          <View style={styles.blockColumn}>
            <Text style={styles.label}>Минимальный остаток</Text>
            <Text style={styles.value}>{medicine.minStock}</Text>
          </View>
          <View style={styles.blockColumn}>
            <Text style={styles.label}>В упаковке</Text>
            <Text style={styles.value}>{medicine.stockPerPack}</Text>
          </View>
        </View>

        <View style={styles.blockRow}>
          <View style={styles.blockColumn}>
            <Text style={styles.label}>На складе сейчас</Text>
            <Text style={styles.value}>{currentStock}</Text>
          </View>
          <View style={styles.blockColumn}>
            <Text style={styles.label}>Отклонение</Text>
            <Text
              style={[
                styles.value,
                currentDiff < 0
                  ? styles.valueNegative
                  : currentDiff > 0
                  ? styles.valuePositive
                  : null,
              ]}
            >
              {currentDiff}
            </Text>
          </View>
        </View>

        <View style={styles.separator} />

        <Text style={styles.sectionTitle}>Выдать препарат</Text>
        <Text style={styles.sectionHint}>
          Укажите количество единиц, которое нужно выдать. Изменения сохраняются
          локально и будут учтены при следующем открытии приложения.
        </Text>

        <View style={styles.issueRow}>
          <TouchableOpacity
            style={[
              styles.issueButtonSmall,
              issueCount <= 0 && styles.issueButtonDisabled,
            ]}
            onPress={() => handleChangeIssue(-1)}
            disabled={issueCount <= 0}
          >
            <Text style={styles.issueButtonText}>−</Text>
          </TouchableOpacity>

          <View style={styles.issueQtyBox}>
            <Text style={styles.issueQtyText}>{issueCount}</Text>
          </View>

          <TouchableOpacity
            style={[
              styles.issueButtonSmall,
              currentStock <= 0 && styles.issueButtonDisabled,
            ]}
            onPress={() => handleChangeIssue(+1)}
            disabled={currentStock <= 0}
          >
            <Text style={styles.issueButtonText}>+</Text>
          </TouchableOpacity>

          <Text style={styles.issueHint}>доступно: {currentStock} ед.</Text>
        </View>

        <TouchableOpacity
          style={[
            styles.issueButton,
            (issueCount <= 0 || currentStock <= 0 || isSaving) &&
              styles.issueButtonDisabled,
          ]}
          onPress={handleIssue}
          disabled={issueCount <= 0 || currentStock <= 0 || isSaving}
        >
          <Text style={styles.issueButtonMainText}>
            {isSaving ? "Сохраняем..." : "Взять препарат"}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: "#e9edf5",
    padding: 16,
  },
  card: {
    flex: 1,
    backgroundColor: "#ffffff",
    borderRadius: 20,
    padding: 16,
    shadowColor: "#000",
    shadowOpacity: 0.08,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 4 },
    elevation: 4,
  },
  title: {
    fontSize: 20,
    fontWeight: "700",
    color: "#111827",
    marginBottom: 4,
  },
  mnn: {
    fontSize: 14,
    color: "#6b7280",
    marginBottom: 12,
  },
  block: {
    marginBottom: 12,
  },
  blockRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 16,
    marginBottom: 12,
  },
  blockColumn: {
    flex: 1,
  },
  label: {
    fontSize: 13,
    color: "#6b7280",
    marginBottom: 4,
  },
  value: {
    fontSize: 15,
    color: "#111827",
  },
  valueNegative: {
    color: "#16a34a",
  },
  valuePositive: {
    color: "#b91c1c",
  },
  separator: {
    height: 1,
    backgroundColor: "#e5e7eb",
    marginVertical: 12,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#111827",
    marginBottom: 4,
  },
  sectionHint: {
    fontSize: 13,
    color: "#6b7280",
    marginBottom: 8,
  },
  issueRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 12,
  },
  issueButtonSmall: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "#3390ec",
    alignItems: "center",
    justifyContent: "center",
  },
  issueButtonDisabled: {
    opacity: 0.5,
  },
  issueButtonText: {
    color: "#ffffff",
    fontSize: 18,
    fontWeight: "600",
  },
  issueQtyBox: {
    minWidth: 40,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 999,
    backgroundColor: "#f3f4f6",
    alignItems: "center",
  },
  issueQtyText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#111827",
  },
  issueHint: {
    fontSize: 12,
    color: "#6b7280",
  },
  issueButton: {
    borderRadius: 999,
    backgroundColor: "#10b981",
    paddingVertical: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  issueButtonMainText: {
    color: "#ffffff",
    fontSize: 15,
    fontWeight: "600",
  },
  errorText: {
    fontSize: 16,
    color: "#b91c1c",
  },
});

export default MedicineDetailsScreen;
