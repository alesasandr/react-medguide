// src/screens/InstructionDetailsScreen.tsx
import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  TouchableOpacity,
} from "react-native";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { RootStackParamList } from "../navigation/AppNavigation";
import { fetchInstructionById, type Instruction } from "../api/instructionsApi";

type Props = NativeStackScreenProps<RootStackParamList, "InstructionDetails">;

const InstructionDetailsScreen: React.FC<Props> = ({ route, navigation }) => {
  const { id } = route.params; // ✅ Получаем ID из параметров
  const [instruction, setInstruction] = useState<Instruction | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true; // ✅ Флаг для mount state

    const load = async () => {
      setIsLoading(true);
      setError(null);

      try {
        const data = await fetchInstructionById(id); // ✅ Правильно загружаем одну инструкцию
        if (isMounted) {
          setInstruction(data);
        }
      } catch (e) {
        // Тихая обработка ошибок загрузки деталей инструкции
        if (isMounted) {
          setError("Не удалось загрузить инструкцию");
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    load();

    // ✅ Cleanup функция
    return () => {
      isMounted = false;
    };
  }, [id]);

  if (isLoading) {
    return (
      <View style={styles.root}>
        <View style={styles.cardCenter}>
          <ActivityIndicator size="large" color="#3390ec" />
          <Text style={styles.loadingText}>Загружаем инструкцию...</Text>
        </View>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.root}>
        <View style={styles.cardCenter}>
          <Text style={styles.error}>{error}</Text>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <Text style={styles.backButtonText}>← Назад</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  if (!instruction) {
    return (
      <View style={styles.root}>
        <View style={styles.cardCenter}>
          <Text style={styles.emptyText}>Инструкция не найдена</Text>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <Text style={styles.backButtonText}>← Назад</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.root}>
      <ScrollView style={styles.card} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Text style={styles.backArrow}>← Назад</Text>
          </TouchableOpacity>
          <Text style={styles.title}>{instruction.title}</Text>
        </View>

        <View style={styles.divider} />

        <Text style={styles.shortText}>{instruction.shortText}</Text>

        <View style={styles.fullTextContainer}>
          <Text style={styles.fullText}>{instruction.fullText}</Text>
        </View>
      </ScrollView>
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
  header: {
    marginBottom: 16,
  },
  backArrow: {
    fontSize: 14,
    color: "#3390ec",
    marginBottom: 12,
    fontWeight: "600",
  },
  title: {
    fontSize: 22,
    fontWeight: "700",
    color: "#000",
    marginBottom: 8,
  },
  divider: {
    height: 1,
    backgroundColor: "#e0e0e0",
    marginBottom: 16,
  },
  shortText: {
    fontSize: 15,
    color: "#555",
    marginBottom: 16,
    lineHeight: 21,
  },
  fullTextContainer: {
    marginTop: 8,
  },
  fullText: {
    fontSize: 14,
    color: "#4a4a4a",
    lineHeight: 20,
  },
  backButton: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    backgroundColor: "#3390ec",
    borderRadius: 8,
  },
  backButtonText: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "600",
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
    color: "#cc0000",
    textAlign: "center",
  },
});

export default InstructionDetailsScreen;
