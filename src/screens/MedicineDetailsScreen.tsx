// src/screens/MedicineDetailsScreen.tsx
import React, { useMemo } from "react";
import { View, Text, StyleSheet } from "react-native";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { RootStackParamList } from "../navigation/AppNavigation";
import { medicines } from "../db/medicines";

type Props = NativeStackScreenProps<RootStackParamList, "MedicineDetails">;

const MedicineDetailsScreen: React.FC<Props> = ({ route }) => {
  const { id } = route.params;

  const medicine = useMemo(
    () => medicines.find((m) => m.id === id),
    [id]
  );

  if (!medicine) {
    return (
      <View style={styles.root}>
        <Text style={styles.errorText}>Препарат не найден.</Text>
      </View>
    );
  }

  return (
    <View style={styles.root}>
      <Text style={styles.title}>{medicine.name}</Text>

      <View style={styles.block}>
        <Text style={styles.label}>МНН</Text>
        <Text style={styles.value}>{medicine.mnn}</Text>
      </View>

      <View style={styles.block}>
        <Text style={styles.label}>Форма</Text>
        <Text style={styles.value}>{medicine.form}</Text>
      </View>

      <View style={styles.block}>
        <Text style={styles.label}>Дозировка</Text>
        <Text style={styles.value}>{medicine.dosage}</Text>
      </View>

      <View style={styles.block}>
        <Text style={styles.label}>Неснижаемый остаток</Text>
        <Text style={styles.value}>{medicine.minStock}</Text>
      </View>

      <View style={styles.block}>
        <Text style={styles.label}>Остаток (кол-во упаковок)</Text>
        <Text style={styles.value}>{medicine.stock}</Text>
      </View>

      <View style={styles.block}>
        <Text style={styles.label}>Остаток, ед. фасовки</Text>
        <Text style={styles.value}>{medicine.stockPerPack}</Text>
      </View>

      <View style={styles.block}>
        <Text style={styles.label}>Разница</Text>
        <Text style={styles.value}>{medicine.diff}</Text>
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
  title: {
    fontSize: 22,
    fontWeight: "700",
    marginBottom: 16,
    color: "#111827",
  },
  block: {
    marginBottom: 12,
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
});

export default MedicineDetailsScreen;
