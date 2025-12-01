// src/screens/IssuedHistoryScreen.tsx
import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  ActivityIndicator,
  TouchableOpacity,
} from "react-native";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { RootStackParamList } from "../navigation/AppNavigation";
import { getIssuedHistory, MedicineIssuedRecord } from "../storage/userStorage";

type Props = NativeStackScreenProps<RootStackParamList, "IssuedHistory">;

const IssuedHistoryScreen: React.FC<Props> = () => {
  const [history, setHistory] = useState<MedicineIssuedRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const records = await getIssuedHistory();
        setHistory(records);
      } catch (e) {
        console.log("Failed to load history:", e);
      } finally {
        setIsLoading(false);
      }
    };

    load();
  }, []);

  const formatDate = (isoString: string) => {
    try {
      const date = new Date(isoString);
      return date.toLocaleString("ru-RU", {
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch {
      return isoString;
    }
  };

  const renderItem = ({ item }: { item: MedicineIssuedRecord }) => (
    <View style={styles.historyItem}>
      <View style={styles.itemHeader}>
        <Text style={styles.medicineName}>{item.medicineName}</Text>
        <Text style={styles.quantity}>{item.quantity} шт.</Text>
      </View>
      <Text style={styles.issuedAt}>{formatDate(item.issuedAt)}</Text>
      <Text style={styles.doctorInfo}>
        {item.doctorName} ({item.doctorId})
      </Text>
    </View>
  );

  if (isLoading) {
    return (
      <View style={styles.loadingRoot}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return (
    <View style={styles.root}>
      {history.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>
            История выданных препаратов пуста
          </Text>
        </View>
      ) : (
        <FlatList
          data={history}
          keyExtractor={(item) => item.id}
          renderItem={renderItem}
          contentContainerStyle={styles.listContent}
          ItemSeparatorComponent={() => <View style={styles.separator} />}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  loadingRoot: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#e9edf5",
  },
  root: {
    flex: 1,
    backgroundColor: "#e9edf5",
  },
  listContent: {
    padding: 16,
    paddingBottom: 24,
  },
  historyItem: {
    backgroundColor: "#ffffff",
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    shadowColor: "#000",
    shadowOpacity: 0.08,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  itemHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  medicineName: {
    fontSize: 15,
    fontWeight: "600",
    color: "#111827",
    flex: 1,
  },
  quantity: {
    fontSize: 14,
    fontWeight: "700",
    color: "#3390ec",
    marginLeft: 8,
  },
  issuedAt: {
    fontSize: 12,
    color: "#6b7280",
    marginBottom: 6,
  },
  doctorInfo: {
    fontSize: 12,
    color: "#9ca6b5",
  },
  separator: {
    height: 0,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  emptyText: {
    fontSize: 16,
    color: "#6b7280",
  },
});

export default IssuedHistoryScreen;
