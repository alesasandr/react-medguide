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
    : "Добро пожаловать!";

  const roleText = profile
    ? profile.isStaff
      ? "Режим сотрудника медорганизации: доступ ко всем инструкциям и чатам."
      : "Режим пациента: доступ к инструкциям и чату с врачом."
    : "Вы не авторизованы";

  return (
    <View style={styles.root}>
      <View style={styles.card}>
        <Text style={styles.title}>{title}</Text>
        <Text style={styles.subtitle}>{roleText}</Text>

        <View style={styles.buttons}>
          <TouchableOpacity
            style={styles.button}
            onPress={() => navigation.navigate("InstructionsList")}
          >
            <Text style={styles.buttonText}>Инструкции</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.button}
            onPress={() => navigation.navigate("Chat")}
          >
            <Text style={styles.buttonText}>Чат</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.secondaryButton}
            onPress={() => navigation.navigate("Profile")}
          >
            <Text style={styles.secondaryButtonText}>Профиль</Text>
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
    justifyContent: "center",
    gap: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: "700",
    color: "#000",
  },
  subtitle: {
    fontSize: 16,
    color: "#4a4a4a",
  },
  buttons: {
    marginTop: 24,
    gap: 12,
  },
  button: {
    borderRadius: 999,
    backgroundColor: "#3390ec",
    paddingVertical: 12,
    alignItems: "center",
  },
  buttonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
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
});

export default HomeScreen;
