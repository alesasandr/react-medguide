// src/screens/RegisterScreen.tsx
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

type Props = NativeStackScreenProps<RootStackParamList, "Register">;

const API_BASE_URL = "http://127.0.0.1:8000";

const RegisterScreen: React.FC<Props> = ({ navigation }) => {
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [password2, setPassword2] = useState("");
  const [isStaffSwitch, setIsStaffSwitch] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleRegister = async () => {
    if (
      !fullName.trim() ||
      !email.trim() ||
      !password.trim() ||
      !password2.trim()
    ) {
      Alert.alert("Ошибка", "Заполните все поля");
      return;
    }

    if (password !== password2) {
      Alert.alert("Ошибка", "Пароли не совпадают");
      return;
    }

    try {
      setIsSubmitting(true);

      const response = await fetch(
        `${API_BASE_URL}/api/auth/register/`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            full_name: fullName.trim(),
            email: email.trim(),
            password: password.trim(),
            is_staff: isStaffSwitch,
          }),
        }
      );

      if (!response.ok) {
        const errText = await response.text();
        console.log("Register error:", errText);
        Alert.alert("Ошибка", "Не удалось создать аккаунт");
        return;
      }

      const data = await response.json();
      const user = data.user ?? {};
      const name = user.full_name || user.email || fullName.trim();

      const isStaff =
        typeof user.is_staff === "boolean" ? user.is_staff : isStaffSwitch;

      await saveUserProfile({
        name,
        isStaff,
        avatarUri: user.avatar_url ?? null,
      });

      Alert.alert("Готово", "Аккаунт создан, вход выполнен");
      navigation.replace("Home");
    } catch (e) {
      console.log("Network register error:", e);
      Alert.alert("Ошибка", "Сетевая ошибка при регистрации");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <View style={styles.root}>
      <View style={styles.card}>
        <Text style={styles.title}>Регистрация</Text>

        <View style={styles.field}>
          <Text style={styles.label}>ФИО / имя</Text>
          <TextInput
            style={styles.input}
            placeholder="Введите имя"
            placeholderTextColor="#9ca6b5"
            value={fullName}
            onChangeText={setFullName}
          />
        </View>

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
            placeholder="Придумайте пароль"
            placeholderTextColor="#9ca6b5"
            secureTextEntry
            value={password}
            onChangeText={setPassword}
          />
        </View>

        <View style={styles.field}>
          <Text style={styles.label}>Повторите пароль</Text>
          <TextInput
            style={styles.input}
            placeholder="Повторите пароль"
            placeholderTextColor="#9ca6b5"
            secureTextEntry
            value={password2}
            onChangeText={setPassword2}
          />
        </View>

        <View style={styles.switchRow}>
          <Text style={styles.switchLabel}>Я сотрудник медорганизации</Text>
          <Switch
            value={isStaffSwitch}
            onValueChange={setIsStaffSwitch}
            thumbColor={isStaffSwitch ? "#3390ec" : "#f4f3f4"}
          />
        </View>

        <TouchableOpacity
          style={styles.primaryButton}
          onPress={handleRegister}
          disabled={isSubmitting}
        >
          <Text style={styles.primaryButtonText}>
            {isSubmitting ? "Создаём..." : "Зарегистрироваться"}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.linkButton}
          onPress={() => navigation.replace("Login")}
        >
          <Text style={styles.linkText}>У меня уже есть аккаунт</Text>
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

export default RegisterScreen;
