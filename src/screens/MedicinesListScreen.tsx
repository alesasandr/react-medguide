// src/screens/MedicinesListScreen.tsx
import React, { useMemo, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  FlatList,
  TouchableOpacity,
  TouchableWithoutFeedback,
  Keyboard,
} from "react-native";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { RootStackParamList } from "../navigation/AppNavigation";
import { medicines, Medicine } from "../db/medicines";

type Props = NativeStackScreenProps<RootStackParamList, "MedicinesList">;

const MedicinesListScreen: React.FC<Props> = ({ navigation }) => {
  const [query, setQuery] = useState("");

  const filtered: Medicine[] = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return medicines;
    return medicines.filter((m) =>
      (m.name + " " + m.mnn).toLowerCase().includes(q)
    );
  }, [query]);

  const renderItem = ({ item }: { item: Medicine }) => {
    const isLowStock =
      typeof item.diff === "number" ? item.diff < 0 : false;

    return (
      <TouchableOpacity
        style={[styles.item, isLowStock && styles.itemLow]}
        onPress={() => navigation.navigate("MedicineDetails", { id: item.id })}
      >
        <View style={styles.itemHeaderRow}>
          <Text style={styles.itemName}>{item.name}</Text>
          <View style={styles.codeBadge}>
            <Text style={styles.codeBadgeText}>Код: {item.id}</Text>
          </View>
        </View>

        <Text style={styles.itemSub}>
          {item.form} • {item.dosage}
        </Text>

        {isLowStock && (
          <Text style={styles.lowStockText}>
            Внимание: остаток ниже неснижаемого!
          </Text>
        )}
      </TouchableOpacity>
    );
  };

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
      <View style={styles.root}>
        <Text style={styles.title}>Доступные препараты</Text>
        <Text style={styles.subtitle}>
          Используйте поиск, чтобы быстро найти препарат по названию или МНН.
        </Text>

        <TextInput
          style={styles.searchInput}
          placeholder="Поиск по названию или МНН"
          placeholderTextColor="#9ca6b5"
          value={query}
          onChangeText={setQuery}
          underlineColorAndroid="transparent"
          returnKeyType="search"
        />

        <FlatList
          data={filtered}
          keyExtractor={(item) => String(item.id)}
          renderItem={renderItem}
          contentContainerStyle={styles.listContent}
          keyboardDismissMode="on-drag"
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        />
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
  title: {
    fontSize: 22,
    fontWeight: "700",
    marginBottom: 4,
    color: "#111827",
  },
  subtitle: {
    fontSize: 13,
    color: "#6b7280",
    marginBottom: 12,
  },
  searchInput: {
    backgroundColor: "#ffffff",
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 8,
    fontSize: 14,
    marginBottom: 12,
  },
  listContent: {
    paddingBottom: 16,
  },
  item: {
    backgroundColor: "#ffffff",
    borderRadius: 16,
    padding: 12,
    marginBottom: 8,
    shadowColor: "#000",
    shadowOpacity: 0.04,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  itemLow: {
    borderWidth: 1,
    borderColor: "#ef4444",
  },
  itemHeaderRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 4,
  },
  itemName: {
    fontSize: 16,
    fontWeight: "600",
    color: "#111827",
    flex: 1,
    marginRight: 8,
  },
  itemSub: {
    fontSize: 13,
    color: "#6b7280",
    marginTop: 2,
  },
  lowStockText: {
    marginTop: 6,
    fontSize: 12,
    color: "#b91c1c",
    fontWeight: "500",
  },
  codeBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 999,
    backgroundColor: "#eff6ff",
  },
  codeBadgeText: {
    fontSize: 11,
    color: "#1d4ed8",
    fontWeight: "500",
  },
});

export default MedicinesListScreen;
