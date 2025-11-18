// src/screens/InstructionsListScreen.tsx
import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
} from "react-native";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { RootStackParamList } from "../navigation/AppNavigation";
import { fetchInstructions, type Instruction } from "../api/instructionsApi";

type Props = NativeStackScreenProps<RootStackParamList, "InstructionDetails">;

const InstructionsListScreen: React.FC<Props> = ({ navigation }) => {
  const [items, setItems] = useState<Instruction[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const load = async () => {
      setIsLoading(true);
      setError(null);

      try {
        const data = await fetchInstructions();
        setItems(data);
      } catch (e) {
        console.log("Load instructions error:", e);
        setError("Не удалось загрузить инструкции");
      } finally {
        setIsLoading(false);
      }
    };

    load();
  }, []);

  const openDetails = (item: Instruction) => {
  navigation.navigate("InstructionDetails", {
    id: item.id,
  })
}


  if (isLoading) {
    return (
      <View style={styles.root}>
        <View style={styles.cardCenter}>
          <ActivityIndicator size="large" color="#3390ec" />
          <Text style={styles.loadingText}>Загружаем инструкции...</Text>
        </View>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.root}>
        <View style={styles.cardCenter}>
          <Text style={styles.error}>{error}</Text>
        </View>
      </View>
    );
  }

  if (!items.length) {
    return (
      <View style={styles.root}>
        <View style={styles.cardCenter}>
          <Text style={styles.emptyText}>Инструкции пока не добавлены</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.root}>
      <View style={styles.card}>
        <FlatList
          data={items}
          keyExtractor={(item) => String(item.id)}
          ItemSeparatorComponent={() => <View style={styles.separator} />}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={styles.row}
              onPress={() => openDetails(item)}
            >
              <View style={styles.iconCircle}>
                <Text style={styles.iconText}>📄</Text>
              </View>
              <View style={styles.textBlock}>
                <Text style={styles.title}>{item.title}</Text>
                <Text style={styles.subtitle} numberOfLines={2}>
                  {item.shortText}
                </Text>
              </View>
            </TouchableOpacity>
          )}
        />
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
    padding: 12,
    shadowColor: "#000",
    shadowOpacity: 0.08,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 4 },
    elevation: 4,
  },
  cardCenter: {
    flex: 1,
    backgroundColor: "#ffffff",
    borderRadius: 20,
    padding: 16,
    shadowColor: "#000",
    shadowOpacity: 0.08,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 4 },
    elevation: 4,
    alignItems: "center",
    justifyContent: "center",
    gap: 12,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 10,
  },
  separator: {
    height: 1,
    backgroundColor: "#f0f0f0",
  },
  iconCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "#d2e6ff",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 10,
  },
  iconText: {
    fontSize: 20,
  },
  textBlock: {
    flex: 1,
  },
  title: {
    fontSize: 15,
    fontWeight: "600",
    color: "#000",
  },
  subtitle: {
    fontSize: 13,
    color: "#6c6c6c",
    marginTop: 2,
  },
  loadingText: {
    fontSize: 15,
    color: "#4a4a4a",
    textAlign: "center",
  },
  emptyText: {
    fontSize: 15,
    color: "#4a4a4a",
    textAlign: "center",
  },
  error: {
    fontSize: 16,
    color: "red",
    textAlign: "center",
  },
});

export default InstructionsListScreen;
