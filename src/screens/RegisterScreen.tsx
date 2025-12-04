// src/screens/RegisterScreen.tsx
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
import { registerUser } from "../services/authService";

type Props = NativeStackScreenProps<RootStackParamList, "Register">;

const RegisterScreen: React.FC<Props> = ({ navigation }) => {
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [password2, setPassword2] = useState("");
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

    if (password.length < 6) {
      Alert.alert("Ошибка", "Пароль должен быть не менее 6 символов");
      return;
    }

    try {
      setIsSubmitting(true);

      const user = await registerUser({
        email: email.trim(),
        password: password.trim(),
        fullName: fullName.trim(),
        isStaff: false,
      });

      const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!regex.test(email.trim())) {
        throw new Error("Некорректный формат e-mail");
      }

      // ✅ Сохраняем ПОЛНЫЙ профиль со всеми обязательными полями
      await saveUserProfile({
        name: user.full_name || user.email,
        isStaff: user.is_staff,
        avatarUri: null,
        specialty: "Терапевт", // ✅ Значение по умолчанию
        employeeId: `EMP-${user.id}-${Date.now()}`, // ✅ Генерируем правильный ID
        workLocation: "", // ✅ Пустое значение
        issuedHistory: [], // ✅ Пустой массив для новых пользователей
      });

      Alert.alert("Готово", "Аккаунт создан локально");
      navigation.replace("Home");
    } catch (e: any) {
      console.log("Register error:", e);
      const message =
        (e && e.message) || (typeof e === "string" ? e : "Неизвестная ошибка");
      Alert.alert(
        "Ошибка регистрации",
        `Не удалось создать аккаунт:\n${message}`
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleBackToLogin = () => {
    // текстовая кнопка "У меня уже есть аккаунт"
    navigation.goBack();
  };

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
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
              underlineColorAndroid="transparent"
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
              underlineColorAndroid="transparent"
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
              underlineColorAndroid="transparent"
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
              underlineColorAndroid="transparent"
            />
          </View>

          <TouchableOpacity
            style={[
              styles.primaryButton,
              isSubmitting && styles.buttonDisabled,
            ]}
            onPress={handleRegister}
            disabled={isSubmitting}
          >
            <Text style={styles.primaryButtonText}>
              {isSubmitting ? "Создаём..." : "Зарегистрироваться"}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.linkButton}
            onPress={handleBackToLogin}
            activeOpacity={0.8}
            hitSlop={{ top: 6, bottom: 6, left: 6, right: 6 }}
          >
            <Text style={styles.linkText}>У меня уже есть аккаунт</Text>
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
    backgroundColor: "#f5f7fb",
    paddingHorizontal: 12,
    paddingVertical: 8,
    fontSize: 14,
    borderWidth: 0,
    borderColor: "transparent", // убираем обводку
  },
  primaryButton: {
    borderRadius: 999,
    backgroundColor: "#3390ec",
    paddingVertical: 12,
    alignItems: "center",
    justifyContent: "center",
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
    marginTop: 8,
    borderRadius: 12,
    paddingVertical: 10,
    paddingHorizontal: 16,
    backgroundColor: "#eff6ff",
    borderWidth: 1,
    borderColor: "#dbeafe",
  },
  linkText: {
    color: "#3390ec",
    fontSize: 15,
    fontWeight: "600",
  },
});

export default RegisterScreen;
