// src/screens/ResetPasswordConfirmScreen.tsx
import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  Alert,
  TouchableWithoutFeedback,
  Keyboard,
} from "react-native";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { RootStackParamList } from "../navigation/AppNavigation";
import { confirmPasswordReset } from "../api/authApi";

type Props = NativeStackScreenProps<RootStackParamList, "ResetPasswordConfirm">;

const ResetPasswordConfirmScreen: React.FC<Props> = ({ route, navigation }) => {
  const { uid, token } = route.params;
  const [password, setPassword] = useState("");
  const [password2, setPassword2] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleReset = async () => {
    if (!password.trim() || !password2.trim()) {
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
      await confirmPasswordReset(uid, token, password.trim());
      Alert.alert("Готово", "Пароль успешно изменен", [
        {
          text: "OK",
          onPress: () => navigation.replace("Login"),
        },
      ]);
    } catch (e: any) {
      Alert.alert(
        "Ошибка",
        e?.response?.data?.detail ?? e?.message ?? "Не удалось изменить пароль"
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
      <View style={styles.root}>
        <View style={styles.card}>
          <Text style={styles.title}>Новый пароль</Text>
          <Text style={styles.text}>
            Введите новый пароль для вашего аккаунта.
          </Text>

          <TextInput
            style={styles.input}
            placeholder="Новый пароль"
            placeholderTextColor="#9ca6b5"
            secureTextEntry
            value={password}
            onChangeText={setPassword}
            autoCapitalize="none"
          />

          <TextInput
            style={styles.input}
            placeholder="Подтвердите пароль"
            placeholderTextColor="#9ca6b5"
            secureTextEntry
            value={password2}
            onChangeText={setPassword2}
            autoCapitalize="none"
          />

          <TouchableOpacity
            style={[styles.button, isSubmitting && styles.buttonDisabled]}
            onPress={handleReset}
            disabled={isSubmitting}
          >
            <Text style={styles.buttonText}>
              {isSubmitting ? "Сохраняем..." : "Изменить пароль"}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </TouchableWithoutFeedback>
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
    gap: 16,
  },
  title: {
    fontSize: 20,
    fontWeight: "600",
    textAlign: "center",
    color: "#000",
  },
  text: {
    fontSize: 14,
    color: "#4a4a4a",
    textAlign: "center",
  },
  input: {
    borderRadius: 999,
    borderWidth: 1,
    borderColor: "#d0d7e6",
    backgroundColor: "#f5f7fb",
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 14,
  },
  button: {
    marginTop: 8,
    borderRadius: 999,
    backgroundColor: "#3390ec",
    paddingVertical: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  buttonText: {
    color: "#ffffff",
    fontSize: 15,
    fontWeight: "600",
  },
});

export default ResetPasswordConfirmScreen;


