// src/screens/LoginScreen.tsx
import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  Alert,
} from "react-native";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { RootStackParamList } from "../navigation/AppNavigation";
import { saveUserProfile } from "../storage/userStorage";
import { loginUser } from "../services/authService";

type Props = NativeStackScreenProps<RootStackParamList, "Login">;

const LoginScreen: React.FC<Props> = ({ navigation }) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleLogin = async () => {
    if (!email.trim() || !password.trim()) {
      Alert.alert("Ошибка", "Введите e-mail и пароль");
      return;
    }

    try {
      setIsSubmitting(true);

      const user = await loginUser({
        email: email.trim(),
        password: password.trim(),
      });

      await saveUserProfile({
        name: user.full_name || user.email,
        isStaff: user.is_staff ?? false,
        avatarUri: null,
      });

      navigation.replace("Home");
    } catch (e: any) {
      console.log("Login error:", e);
      if (e?.code === "USER_NOT_FOUND") {
        Alert.alert("Ошибка", "Пользователь не найден");
      } else if (e?.code === "WRONG_PASSWORD") {
        Alert.alert("Ошибка", "Неверный пароль");
      } else {
        Alert.alert("Ошибка", "Не удалось выполнить вход");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <View style={styles.root}>
      <View style={styles.card}>
        <Text style={styles.title}>Добро пожаловать</Text>
        <Text style={styles.subtitle}>
          Войдите в личный кабинет, чтобы продолжить
        </Text>

        <View style={styles.fieldGroup}>
          <Text style={styles.label}>E-mail</Text>
          <TextInput
            style={styles.input}
            placeholder="example@mail.com"
            placeholderTextColor="#9ca6b5"
            keyboardType="email-address"
            autoCapitalize="none"
            value={email}
            onChangeText={setEmail}
            underlineColorAndroid="transparent"
          />
        </View>

        <View style={styles.fieldGroup}>
          <Text style={styles.label}>Пароль</Text>
          <TextInput
            style={styles.input}
            placeholder="Введите пароль"
            placeholderTextColor="#9ca6b5"
            secureTextEntry
            value={password}
            onChangeText={setPassword}
            underlineColorAndroid="transparent"
          />
        </View>

        <TouchableOpacity
          style={[styles.primaryButton, isSubmitting && styles.buttonDisabled]}
          onPress={handleLogin}
          disabled={isSubmitting}
        >
          <Text style={styles.primaryButtonText}>
            {isSubmitting ? "Входим..." : "Войти"}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.linkButton}
          // navigate (НЕ replace) — чтобы появилась нормальная стрелка назад
          onPress={() => navigation.navigate("Register")}
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
  },
  title: {
    fontSize: 24,
    fontWeight: "700",
    marginBottom: 8,
    textAlign: "center",
    color: "#1f2937",
  },
  subtitle: {
    fontSize: 14,
    color: "#6b7280",
    textAlign: "center",
    marginBottom: 24,
  },
  fieldGroup: {
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    color: "#4b5563",
    marginBottom: 4,
  },
  input: {
    backgroundColor: "#f3f4f6",
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 16,
    borderWidth: 0,
    borderColor: "transparent", // убираем обводку
  },
  primaryButton: {
    backgroundColor: "#3390ec",
    borderRadius: 14,
    paddingVertical: 12,
    alignItems: "center",
    marginTop: 8,
  },
  buttonDisabled: {
    opacity: 0.7,
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
