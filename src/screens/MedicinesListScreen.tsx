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

  const renderItem = ({ item }: { item: Medicine }) => (
    <TouchableOpacity
      style={styles.item}
      onPress={() => navigation.navigate("MedicineDetails", { id: item.id })}
    >
      <Text style={styles.itemName}>{item.name}</Text>
      <Text style={styles.itemSub}>
        {item.form} • {item.dosage}
      </Text>
    </TouchableOpacity>
  );

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
      <View style={styles.root}>
        <Text style={styles.title}>Доступные препараты</Text>

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
          showsVerticalScrollIndicator={false} // отключаем «плашку» прокрутки
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
    marginBottom: 12,
    color: "#111827",
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
  itemName: {
    fontSize: 16,
    fontWeight: "600",
    color: "#111827",
  },
  itemSub: {
    marginTop: 4,
    fontSize: 13,
    color: "#6b7280",
  },
});

export default MedicinesListScreen;
