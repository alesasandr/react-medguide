// src/screens/MedicinesListScreen.tsx
import React, { useMemo, useState, useEffect, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  FlatList,
  TouchableOpacity,
  TouchableWithoutFeedback,
  Keyboard,
  ActivityIndicator,
} from "react-native";
import { useFocusEffect } from "@react-navigation/native";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { RootStackParamList } from "../navigation/AppNavigation";
import { medicines as localMedicines, Medicine } from "../db/medicines";
import { medicinesApi } from "../api/medicinesApi";
import { serverArrayToLocal, LocalMedicine } from "../services/medicineAdapter";

type Props = NativeStackScreenProps<RootStackParamList, "MedicinesList">;

const MedicinesListScreen: React.FC<Props> = ({ navigation }) => {
  const [query, setQuery] = useState("");
  const [debouncedQuery, setDebouncedQuery] = useState(""); // Debounced query
  const [showOnlyLow, setShowOnlyLow] = useState(false);
  const [medicines, setMedicines] = useState<LocalMedicine[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Загрузка данных при монтировании (fallback на локальные данные)
  useEffect(() => {
    const load = async () => {
      try {
        setIsLoading(true);
        setError(null);
        
        // Пытаемся загрузить с сервера
        try {
          const response = await medicinesApi.getAll();
          const serverMedicines = response.data;
          const localMedicines = serverArrayToLocal(serverMedicines);
          setMedicines(localMedicines);
        } catch (e) {
          // Fallback на локальные данные при ошибке
          const localData = localMedicines.map((med) => ({
            id: med.id,
            name: med.name,
            mnn: med.mnn,
            form: med.form,
            dosage: med.dosage,
            minStock: med.minStock,
            stock: med.stock,
            stockPerPack: med.stockPerPack,
            diff: med.diff,
            article: med.article,
            qrPayload: med.qrPayload,
          }));
          setMedicines(localData);
          setError("Используются локальные данные (нет подключения к серверу)");
        }
      } catch (e) {
        setError("Не удалось загрузить препараты");
      } finally {
        setIsLoading(false);
      }
    };

    load();
  }, []);

  // Обновление данных при фокусе экрана
  useFocusEffect(
    React.useCallback(() => {
      const sync = async () => {
        try {
          // Пытаемся синхронизировать с сервером
          try {
            const response = await medicinesApi.getAll();
            const serverMedicines = response.data;
            const localMedicines = serverArrayToLocal(serverMedicines);
            setMedicines(localMedicines);
            setError(null);
          } catch (e) {
            // Если синхронизация не удалась, оставляем текущие данные
          }
        } catch (e) {
          // Тихая обработка ошибок синхронизации
        }
      };

      sync();
    }, [])
  );

  // Debounce effect для поиска (300ms задержка)
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedQuery(query);
    }, 300);

    return () => clearTimeout(timer);
  }, [query]);

  const isBelowMin = (med: LocalMedicine) => med.stock < med.minStock;

  const filtered: LocalMedicine[] = useMemo(() => {
    const q = debouncedQuery.trim().toLowerCase(); // Используем debounced query
    return medicines.filter((m) => {
      const matchesQuery =
        !q ||
        (m.name + " " + m.mnn + " " + m.article).toLowerCase().includes(q);
      const matchesLow = !showOnlyLow || isBelowMin(m);
      return matchesQuery && matchesLow;
    });
  }, [debouncedQuery, showOnlyLow, medicines]); // Зависит от debounced query и medicines

  // Оптимизация: useCallback для renderItem
  const renderItem = useCallback(
    ({ item }: { item: LocalMedicine }) => {
      const shortage = Math.max(item.minStock - item.stock, 0);
      const isLowStock = shortage > 0;

      return (
        <TouchableOpacity
          style={[styles.item, isLowStock && styles.itemLow]}
          onPress={() =>
            navigation.navigate("MedicineDetails", { id: item.id })
          }
          activeOpacity={0.7}
        >
          <View style={styles.itemHeaderRow}>
            <Text style={styles.itemName} numberOfLines={2}>
              {item.name}
            </Text>
            <View style={styles.codeBadge}>
              <Text style={styles.codeBadgeText}>Артикул: {item.article}</Text>
            </View>
          </View>

          <Text style={styles.itemSub}>
            {item.form} • {item.dosage}
          </Text>

          {isLowStock && (
            <Text style={styles.lowStockText}>
              Не хватает {shortage} ед. до минимального остатка
            </Text>
          )}
        </TouchableOpacity>
      );
    },
    [navigation]
  );

  // Оптимизация: getItemLayout для улучшения скролла
  const getItemLayout = useCallback(
    (_: any, index: number) => ({
      length: 120, // примерная высота элемента
      offset: 120 * index,
      index,
    }),
    []
  );

  // Оптимизация: keyExtractor для правильного кэширования
  const keyExtractor = useCallback((item: LocalMedicine) => String(item.id), []);

  if (isLoading) {
    return (
      <View style={styles.root}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#3390ec" />
          <Text style={styles.loadingText}>Загрузка препаратов...</Text>
        </View>
      </View>
    );
  }

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
      <View style={styles.root}>
        <Text style={styles.title}>Доступные препараты</Text>
        <Text style={styles.subtitle}>
          Используйте поиск, чтобы быстро найти препарат по названию или МНН.
        </Text>
        
        {error && (
          <View style={styles.errorContainer}>
            <Text style={styles.errorText}>{error}</Text>
          </View>
        )}

        <TextInput
          style={styles.searchInput}
          placeholder="Поиск по названию или МНН"
          placeholderTextColor="#9ca6b5"
          value={query}
          onChangeText={setQuery}
          underlineColorAndroid="transparent"
          returnKeyType="search"
        />

        <View style={styles.filterRow}>
          <TouchableOpacity
            style={[styles.filterChip, showOnlyLow && styles.filterChipActive]}
            onPress={() => setShowOnlyLow((prev) => !prev)}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          >
            <Text
              style={[
                styles.filterChipText,
                showOnlyLow && styles.filterChipTextActive,
              ]}
            >
              {showOnlyLow ? "Показаны дефицитные" : "Только ниже нормы"}
            </Text>
          </TouchableOpacity>
        </View>

        {/* Оптимизированный FlatList */}
        <FlatList
          data={filtered}
          keyExtractor={keyExtractor}
          renderItem={renderItem}
          contentContainerStyle={styles.listContent}
          keyboardDismissMode="on-drag"
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
          // Оптимизация виртуализации
          initialNumToRender={10} // Рендерим 10 элементов изначально
          maxToRenderPerBatch={10} // Рендерим 10 элементов за раз
          updateCellsBatchingPeriod={50} // Обновляем батчи каждые 50ms
          removeClippedSubviews={true} // Удаляем невидимые элементы
          getItemLayout={getItemLayout} // Указываем лейауты элементов
          // ListEmptyComponent для пустого списка
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>
                {query ? "Препараты не найдены" : "Нет препаратов"}
              </Text>
            </View>
          }
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
  filterRow: {
    flexDirection: "row",
    justifyContent: "flex-start",
    marginBottom: 12,
  },
  filterChip: {
    borderRadius: 999,
    borderWidth: 1,
    borderColor: "#d1d5db",
    paddingHorizontal: 14,
    paddingVertical: 6,
    backgroundColor: "#fff",
  },
  filterChipActive: {
    backgroundColor: "#fee2e2",
    borderColor: "#ef4444",
  },
  filterChipText: {
    fontSize: 13,
    color: "#4b5563",
    fontWeight: "500",
  },
  filterChipTextActive: {
    color: "#b91c1c",
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
  // ✅ Стили для пустого списка
  emptyContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 40,
  },
  emptyText: {
    fontSize: 14,
    color: "#6b7280",
    textAlign: "center",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    gap: 12,
  },
  loadingText: {
    fontSize: 14,
    color: "#6b7280",
  },
  errorContainer: {
    backgroundColor: "#fef3c7",
    borderRadius: 8,
    padding: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "#fbbf24",
  },
  errorText: {
    fontSize: 13,
    color: "#92400e",
    textAlign: "center",
  },
});

export default MedicinesListScreen;
