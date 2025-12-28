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

        {/* Блок основных действий */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Основные действия</Text>

          <TouchableOpacity
            style={styles.primaryButton}
            onPress={() => navigation.navigate("MedicinesList")}
            activeOpacity={0.85}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          >
            <View style={styles.buttonRow}>
              <View style={styles.buttonTextWrapper}>
                <Text style={styles.primaryButtonText}>
                  Открыть список препаратов
                </Text>
                <Text style={styles.primaryButtonSubText}>
                  Просмотр доступных препаратов и деталей по каждому.
                </Text>
              </View>
              <Text style={styles.buttonChevron}>›</Text>
            </View>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.secondaryButton}
            onPress={() => navigation.navigate("Profile")}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          >
            <Text style={styles.secondaryButtonText}>Перейти в профиль</Text>
          </TouchableOpacity>
        </View>

        {/* Блок поиска: по артикулу + сканирование */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Поиск</Text>

          {/* Поиск по артикулу */}
          <TouchableOpacity
            style={styles.secondaryButton}
            onPress={() => navigation.navigate("MedicineCodeSearch")}
            activeOpacity={0.85}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          >
            <Text style={styles.secondaryButtonText}>
              Найти препарат по артикулу
            </Text>
          </TouchableOpacity>

          {/* Новый вариант — сканирование QR-кода */}
          <TouchableOpacity
            style={styles.secondaryButton}
            onPress={() => navigation.navigate("ScanMedicine")}
            activeOpacity={0.85}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          >
            <Text style={styles.secondaryButtonText}>
              Сканировать QR-код препарата
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
    borderWidth: 1,
    borderColor: "#1d4ed8",
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
    paddingVertical: 12,
    alignItems: "center",
  },
  secondaryButtonText: {
    color: "#3390ec",
    fontSize: 16,
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
  buttonRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 12,
  },
  buttonTextWrapper: {
    flex: 1,
  },
  buttonChevron: {
    fontSize: 32,
    color: "#bfdbfe",
    fontWeight: "300",
  },
  buttonChevronAccent: {
    fontSize: 32,
    color: "#f59e0b",
    fontWeight: "300",
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
