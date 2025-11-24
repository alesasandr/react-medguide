// src/screens/HomeScreen.tsx
import React, { useEffect, useState } from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { RootStackParamList } from "../navigation/AppNavigation";
import { loadUserProfile, UserProfile } from "../storage/userStorage";

type Props = NativeStackScreenProps<RootStackParamList, "Home">;

const HomeScreen: React.FC<Props> = ({ navigation }) => {
  const [profile, setProfile] = useState<UserProfile | null>(null);

  useEffect(() => {
    const load = async () => {
      const stored = await loadUserProfile();
      setProfile(stored);
    };

    const unsub = navigation.addListener("focus", load);
    return unsub;
  }, [navigation]);

  const title = profile
    ? `Добро пожаловать, ${profile.name}!`
    : "Добро пожаловать в MedGuide";

  return (
    <View style={styles.root}>
      <View style={styles.card}>
        <Text style={styles.title}>{title}</Text>
        <Text style={styles.subtitle}>
          Быстрый доступ к информации о препаратах и управлению профилем.
        </Text>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Основные действия</Text>

          <TouchableOpacity
            style={styles.primaryButton}
            onPress={() => navigation.navigate("MedicinesList")}
          >
            <Text style={styles.primaryButtonText}>Открыть список препаратов</Text>
            <Text style={styles.primaryButtonSubText}>
              Просмотр доступных препаратов и деталей по каждому.
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.secondaryButton}
            onPress={() => navigation.navigate("Profile")}
          >
            <Text style={styles.secondaryButtonText}>Перейти в профиль</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Поиск</Text>

          <TouchableOpacity
            style={styles.accentButton}
            onPress={() => navigation.navigate("MedicineCodeSearch")}
          >
            <Text style={styles.accentButtonTitle}>
              Найти препарат по уникальному коду
            </Text>
            <Text style={styles.accentButtonText}>
              Введите код (ID) препарата, чтобы сразу перейти к нужному лекарству.
            </Text>
          </TouchableOpacity>
        </View>
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
    justifyContent: "flex-start",
    gap: 24,
  },
  title: {
    fontSize: 24,
    fontWeight: "700",
    color: "#000",
  },
  subtitle: {
    fontSize: 14,
    color: "#6b7280",
  },
  section: {
    gap: 12,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#111827",
  },
  primaryButton: {
    borderRadius: 16,
    backgroundColor: "#3390ec",
    paddingVertical: 12,
    paddingHorizontal: 14,
  },
  primaryButtonText: {
    color: "#ffffff",
    fontSize: 16,
    fontWeight: "600",
  },
  primaryButtonSubText: {
    marginTop: 4,
    color: "#e5f0ff",
    fontSize: 13,
  },
  secondaryButton: {
    borderRadius: 999,
    borderWidth: 1,
    borderColor: "#3390ec",
    paddingVertical: 10,
    alignItems: "center",
  },
  secondaryButtonText: {
    color: "#3390ec",
    fontSize: 15,
    fontWeight: "600",
  },
  accentButton: {
    borderRadius: 16,
    backgroundColor: "#fef3c7",
    paddingVertical: 12,
    paddingHorizontal: 14,
    borderWidth: 1,
    borderColor: "#fbbf24",
  },
  accentButtonTitle: {
    fontSize: 15,
    fontWeight: "600",
    color: "#92400e",
  },
  accentButtonText: {
    marginTop: 4,
    fontSize: 13,
    color: "#92400e",
  },
});

export default HomeScreen;
