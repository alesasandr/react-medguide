// src/screens/LoginScreen.tsx
import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  Alert,
  Switch,
} from "react-native";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { RootStackParamList } from "../navigation/AppNavigation";
import { saveUserProfile } from "../storage/userStorage";

type Props = NativeStackScreenProps<RootStackParamList, "Login">;

const API_BASE_URL = "http://127.0.0.1:8000";

const LoginScreen: React.FC<Props> = ({ navigation }) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  // доп. флажок, если сервер не отдаёт is_staff
  const [isStaffSwitch, setIsStaffSwitch] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleLogin = async () => {
    if (!email.trim() || !password.trim()) {
      Alert.alert("Ошибка", "Введите e-mail и пароль");
      return;
    }

    try {
      setIsSubmitting(true);

      const response = await fetch(`${API_BASE_URL}/api/auth/login/`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: email.trim(),
          password: password.trim(),
        }),
      });

      if (!response.ok) {
        const errText = await response.text();
        console.log("Login error:", errText);
        Alert.alert("Ошибка", "Неверные данные для входа");
        return;
      }

      const data = await response.json();
      const user = data.user ?? {};
      const name = user.full_name || user.email || email.trim();

      const isStaff =
        typeof user.is_staff === "boolean" ? user.is_staff : isStaffSwitch;

      await saveUserProfile({
        name,
        isStaff,
        avatarUri: user.avatar_url ?? null,
      });

      navigation.replace("Home");
    } catch (e) {
      console.log("Network login error:", e);
      Alert.alert("Ошибка", "Сетевая ошибка при входе");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <View style={styles.root}>
      <View style={styles.card}>
        <Text style={styles.title}>Вход</Text>

        <View style={styles.field}>
          <Text style={styles.label}>E-mail</Text>
          <TextInput
            style={styles.input}
            placeholder="Введите e-mail"
            placeholderTextColor="#9ca6b5"
            autoCapitalize="none"
            keyboardType="email-address"
            value={email}
            onChangeText={setEmail}
          />
        </View>

        <View style={styles.field}>
          <Text style={styles.label}>Пароль</Text>
          <TextInput
            style={styles.input}
            placeholder="Введите пароль"
            placeholderTextColor="#9ca6b5"
            secureTextEntry
            value={password}
            onChangeText={setPassword}
          />
        </View>

        <View style={styles.switchRow}>
          <Text style={styles.switchLabel}>Войти как сотрудник</Text>
          <Switch
            value={isStaffSwitch}
            onValueChange={setIsStaffSwitch}
            thumbColor={isStaffSwitch ? "#3390ec" : "#f4f3f4"}
          />
        </View>

        <TouchableOpacity
          style={styles.primaryButton}
          onPress={handleLogin}
          disabled={isSubmitting}
        >
          <Text style={styles.primaryButtonText}>
            {isSubmitting ? "Входим..." : "Войти"}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.linkButton}
          onPress={() => navigation.replace("Register")}
        >
          <Text style={styles.linkText}>Создать аккаунт</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.linkButton}
          onPress={() => navigation.navigate("ResetPassword")}
        >
          <Text style={styles.linkText}>Забыли пароль?</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  root: {
    flex: 1,
    padding: 16,
    backgroundColor: "#e9edf5",
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
    textAlign: "center",
    marginBottom: 8,
    color: "#000",
  },
  field: {
    gap: 6,
  },
  label: {
    fontSize: 14,
    color: "#4a4a4a",
  },
  input: {
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#d0d7e6",
    backgroundColor: "#f5f7fb",
    paddingHorizontal: 12,
    paddingVertical: 8,
    fontSize: 14,
  },
  switchRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  switchLabel: {
    fontSize: 14,
    color: "#4a4a4a",
    flexShrink: 1,
    paddingRight: 8,
  },
  primaryButton: {
    borderRadius: 999,
    backgroundColor: "#3390ec",
    paddingVertical: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  primaryButtonText: {
    color: "#ffffff",
    fontSize: 16,
    fontWeight: "600",
  },
  linkButton: {
    alignItems: "center",
    marginTop: 4,
  },
  linkText: {
    color: "#3390ec",
    fontSize: 14,
  },
});

export default LoginScreen;
