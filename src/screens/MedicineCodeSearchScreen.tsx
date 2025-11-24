// src/screens/MedicineCodeSearchScreen.tsx
import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  TouchableWithoutFeedback,
  Keyboard,
} from "react-native";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { RootStackParamList } from "../navigation/AppNavigation";
import { medicines, Medicine } from "../db/medicines";

type Props = NativeStackScreenProps<RootStackParamList, "MedicineCodeSearch">;

const MedicineCodeSearchScreen: React.FC<Props> = ({ navigation }) => {
  const [codeInput, setCodeInput] = useState("");
  const [foundMedicine, setFoundMedicine] = useState<Medicine | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleSearch = () => {
    const raw = codeInput.trim();

    if (!raw) {
      setError("Введите код препарата");
      setFoundMedicine(null);
      return;
    }

    const id = Number(raw);
    if (Number.isNaN(id)) {
      setError("Код должен быть числом (ID препарата)");
      setFoundMedicine(null);
      return;
    }

    const med = medicines.find((m) => m.id === id);
    if (!med) {
      setError("Препарат с таким кодом не найден");
      setFoundMedicine(null);
      return;
    }

    setFoundMedicine(med);
    setError(null);
  };

  const handleOpenDetails = () => {
    if (!foundMedicine) return;
    navigation.navigate("MedicineDetails", { id: foundMedicine.id });
  };

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
      <View style={styles.root}>
        <View style={styles.card}>
          <Text style={styles.title}>Поиск препарата по коду</Text>
          <Text style={styles.subtitle}>
            Введите уникальный код (ID) препарата, чтобы быстро перейти к нему.
          </Text>

          <View style={styles.field}>
            <Text style={styles.label}>Код препарата (ID)</Text>
            <TextInput
              style={styles.input}
              placeholder="Например, 101"
              placeholderTextColor="#9ca6b5"
              keyboardType="number-pad"
              value={codeInput}
              onChangeText={setCodeInput}
              underlineColorAndroid="transparent"
              returnKeyType="search"
              onSubmitEditing={handleSearch}
            />
          </View>

          <TouchableOpacity
            style={styles.searchButton}
            onPress={handleSearch}
          >
            <Text style={styles.searchButtonText}>Найти</Text>
          </TouchableOpacity>

          {error && <Text style={styles.errorText}>{error}</Text>}

          {foundMedicine && (
            <View style={styles.resultCard}>
              <Text style={styles.resultTitle}>{foundMedicine.name}</Text>
              <Text style={styles.resultCode}>Код: {foundMedicine.id}</Text>
              <Text style={styles.resultSub}>
                {foundMedicine.form} • {foundMedicine.dosage}
              </Text>

              <TouchableOpacity
                style={styles.detailsButton}
                onPress={handleOpenDetails}
              >
                <Text style={styles.detailsButtonText}>
                  Открыть полное описание
                </Text>
              </TouchableOpacity>
            </View>
          )}
        </View>
      </View>
    </TouchableWithoutFeedback>
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
    gap: 16,
  },
  title: {
    fontSize: 22,
    fontWeight: "700",
    color: "#111827",
  },
  subtitle: {
    fontSize: 13,
    color: "#6b7280",
  },
  field: {
    marginTop: 8,
    gap: 6,
  },
  label: {
    fontSize: 14,
    color: "#4b5563",
  },
  input: {
    backgroundColor: "#f3f4f6",
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 8,
    fontSize: 15,
    borderWidth: 0,
    borderColor: "transparent",
  },
  searchButton: {
    marginTop: 8,
    borderRadius: 999,
    backgroundColor: "#3390ec",
    paddingVertical: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  searchButtonText: {
    color: "#ffffff",
    fontSize: 16,
    fontWeight: "600",
  },
  errorText: {
    marginTop: 8,
    fontSize: 13,
    color: "#b91c1c",
  },
  resultCard: {
    marginTop: 16,
    backgroundColor: "#f9fafb",
    borderRadius: 16,
    padding: 12,
    borderWidth: 1,
    borderColor: "#e5e7eb",
  },
  resultTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#111827",
  },
  resultCode: {
    fontSize: 13,
    color: "#6b7280",
    marginTop: 2,
  },
  resultSub: {
    fontSize: 13,
    color: "#6b7280",
    marginTop: 4,
  },
  detailsButton: {
    marginTop: 10,
    borderRadius: 999,
    backgroundColor: "#10b981",
    paddingVertical: 10,
    alignItems: "center",
  },
  detailsButtonText: {
    color: "#ffffff",
    fontSize: 14,
    fontWeight: "600",
  },
});

export default MedicineCodeSearchScreen;
