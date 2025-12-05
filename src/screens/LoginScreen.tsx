// src/screens/LoginScreen.tsx
import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  Alert,
  TouchableWithoutFeedback,
  Keyboard,
} from "react-native";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { RootStackParamList } from "../navigation/AppNavigation";
import { saveUserProfile } from "../storage/userStorage";
import { loginUser, getProfile } from "../api/authApi";
import { tokenService } from "../services/tokenService";

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

      // Авторизуемся на сервере
      const loginResponse = await loginUser(email.trim(), password.trim());
      const user = loginResponse.user;

      // Сохраняем токен аутентификации
      if (loginResponse.token) {
        await tokenService.saveToken({
          accessToken: loginResponse.token,
          tokenType: "Token",
        });
      }

      // Загружаем профиль из БД
      const profile = await getProfile();

      // Сохраняем профиль локально
      await saveUserProfile({
        name: profile.full_name || user.email,
        isStaff: profile.is_staff ?? false,
        avatarUri: profile.avatar_url || null,
        specialty: profile.specialty || "Терапевт",
        employeeId: profile.employee_id || `DOC-${user.id}`,
        workLocation: profile.work_location || "",
        issuedHistory: [],
      });

      navigation.replace("Home");
    } catch (e: any) {
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
    <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
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
            style={[
              styles.primaryButton,
              isSubmitting && styles.buttonDisabled,
            ]}
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
            activeOpacity={0.8}
            hitSlop={{ top: 6, bottom: 6, left: 6, right: 6 }}
          >
            <Text style={styles.linkText}>Создать аккаунт</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.linkButton}
            onPress={() => navigation.navigate("ResetPassword")}
            activeOpacity={0.8}
            hitSlop={{ top: 6, bottom: 6, left: 6, right: 6 }}
          >
            <Text style={styles.linkText}>Забыли пароль?</Text>
          </TouchableOpacity>
        </View>
      </View>
    </TouchableWithoutFeedback>
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
    marginTop: 8,
    borderRadius: 12,
    paddingVertical: 10,
    paddingHorizontal: 16,
    backgroundColor: "#eff6ff",
    borderWidth: 1,
    borderColor: "#dbeafe",
    alignItems: "center",
  },
  linkText: {
    color: "#3390ec",
    fontSize: 15,
    fontWeight: "600",
  },
});

export default LoginScreen;
