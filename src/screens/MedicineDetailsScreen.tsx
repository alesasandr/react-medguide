// src/screens/MedicineDetailsScreen.tsx
import React, { useMemo, useEffect, useState } from "react";
import { View, Text, StyleSheet, TouchableOpacity, Alert } from "react-native";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { RootStackParamList } from "../navigation/AppNavigation";
import { medicines } from "../db/medicines";

type Props = NativeStackScreenProps<RootStackParamList, "MedicineDetails">;

const MedicineDetailsScreen: React.FC<Props> = ({ route }) => {
  const { id } = route.params;

  const baseMedicine = useMemo(
    () => medicines.find((m) => m.id === id),
    [id]
  );

  const [stock, setStock] = useState(baseMedicine?.stock ?? 0);
  const [stockPerPack] = useState(baseMedicine?.stockPerPack ?? 0);
  const [diff, setDiff] = useState(baseMedicine?.diff ?? 0);

  useEffect(() => {
    if (baseMedicine) {
      setStock(baseMedicine.stock);
      setDiff(baseMedicine.diff);
    }
  }, [baseMedicine]);

  if (!baseMedicine) {
    return (
      <View style={styles.root}>
        <Text style={styles.errorText}>Препарат не найден.</Text>
      </View>
    );
  }

  const isLowStock =
    typeof diff === "number" ? diff > 0 && baseMedicine.minStock > stock : false;

  const handleTake = () => {
    if (stock <= 0) {
      Alert.alert("Нет остатков", "Нельзя взять препарат, остаток равен нулю.");
      return;
    }

    const newStock = stock - 1;
    const newDiff = baseMedicine.minStock - newStock;

    setStock(newStock);
    setDiff(newDiff);

    Alert.alert(
      "Препарат выдан",
      "Одна упаковка препарата выдана пациенту (локальное обновление остатка)."
    );
  };

  return (
    <View style={styles.root}>
      <Text style={styles.title}>{baseMedicine.name}</Text>

      {isLowStock && (
        <View style={styles.warningBox}>
          <Text style={styles.warningTitle}>Внимание</Text>
          <Text style={styles.warningText}>
            Остаток препарата ниже неснижаемого уровня. Требуется пополнение
            запаса.
          </Text>
        </View>
      )}

      <View style={styles.block}>
        <Text style={styles.label}>МНН</Text>
        <Text style={styles.value}>{baseMedicine.mnn}</Text>
      </View>

      <View style={styles.blockRow}>
        <View style={styles.blockHalf}>
          <Text style={styles.label}>Форма</Text>
          <Text style={styles.value}>{baseMedicine.form}</Text>
        </View>
        <View style={styles.blockHalf}>
          <Text style={styles.label}>Дозировка</Text>
          <Text style={styles.value}>{baseMedicine.dosage}</Text>
        </View>
      </View>

      <View style={styles.blockRow}>
        <View style={styles.blockHalf}>
          <Text style={styles.label}>Неснижаемый остаток</Text>
          <Text style={styles.value}>{baseMedicine.minStock}</Text>
        </View>
        <View style={styles.blockHalf}>
          <Text style={styles.label}>Остаток (упаковок)</Text>
          <Text style={styles.value}>{stock}</Text>
        </View>
      </View>

      <View style={styles.blockRow}>
        <View style={styles.blockHalf}>
          <Text style={styles.label}>Остаток, ед. фасовки</Text>
          <Text style={styles.value}>{stockPerPack}</Text>
        </View>
        <View style={styles.blockHalf}>
          <Text style={styles.label}>Разница</Text>
          <Text style={styles.value}>{diff}</Text>
        </View>
      </View>

      <TouchableOpacity style={styles.takeButton} onPress={handleTake}>
        <Text style={styles.takeButtonText}>Взять препарат</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: "#e9edf5",
    padding: 16,
  },
  title: {
    fontSize: 22,
    fontWeight: "700",
    marginBottom: 16,
    color: "#111827",
  },
  warningBox: {
    backgroundColor: "#fef2f2",
    borderRadius: 12,
    padding: 10,
    borderWidth: 1,
    borderColor: "#fecaca",
    marginBottom: 12,
  },
  warningTitle: {
    fontSize: 13,
    fontWeight: "700",
    color: "#b91c1c",
    marginBottom: 4,
  },
  warningText: {
    fontSize: 12,
    color: "#b91c1c",
  },
  block: {
    marginBottom: 10,
    backgroundColor: "#ffffff",
    borderRadius: 12,
    padding: 10,
  },
  blockRow: {
    flexDirection: "row",
    gap: 8,
    marginBottom: 10,
  },
  blockHalf: {
    flex: 1,
    backgroundColor: "#ffffff",
    borderRadius: 12,
    padding: 10,
  },
  label: {
    fontSize: 12,
    color: "#6b7280",
    marginBottom: 4,
  },
  value: {
    fontSize: 15,
    color: "#111827",
  },
  errorText: {
    fontSize: 16,
    color: "#b91c1c",
  },
  takeButton: {
    marginTop: 16,
    borderRadius: 999,
    backgroundColor: "#2563eb",
    paddingVertical: 12,
    alignItems: "center",
  },
  takeButtonText: {
    color: "#ffffff",
    fontSize: 15,
    fontWeight: "600",
  },
});

export default MedicineDetailsScreen;
