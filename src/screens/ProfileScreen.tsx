// src/screens/ProfileScreen.tsx
import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  Image,
  Alert,
  TouchableWithoutFeedback,
  Keyboard,
  ActivityIndicator,
} from "react-native";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { RootStackParamList } from "../navigation/AppNavigation";
import {
  loadUserProfile,
  saveUserProfile,
  UserProfile,
} from "../storage/userStorage";
import * as ImagePicker from "expo-image-picker";
import AsyncStorage from "@react-native-async-storage/async-storage";

type Props = NativeStackScreenProps<RootStackParamList, "Profile">;

const ProfileScreen: React.FC<Props> = ({ navigation }) => {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [name, setName] = useState("");
  const [avatarUri, setAvatarUri] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const storedProfile = await loadUserProfile();
        if (storedProfile) {
          setProfile(storedProfile);
          setName(storedProfile.name || "");
          setAvatarUri(storedProfile.avatarUri || null);
        }
      } catch (e) {
        console.log("Load profile error:", e);
      } finally {
        setIsLoading(false);
      }
    };

    load();
  }, []);

  const handlePickAvatar = async () => {
    try {
      const { status } =
        await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== "granted") {
        Alert.alert(
          "Нет доступа",
          "Разрешите доступ к фото, чтобы выбрать аватар."
        );
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.7,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        const uri = result.assets[0].uri;
        // обновляем только локально; финальное сохранение — через кнопку "Сохранить"
        setAvatarUri(uri);
      }
    } catch (e) {
      console.log("Image pick error:", e);
      Alert.alert("Ошибка", "Не удалось выбрать изображение");
    }
  };

  const handleDeleteAvatar = async () => {
    try {
      // убираем из UI
      setAvatarUri(null);

      // и сразу сохраняем в "бд" (userStorage)
      if (profile) {
        const updated: UserProfile = {
          ...profile,
          avatarUri: null,
        };
        await saveUserProfile(updated);
        setProfile(updated);
      }

      Alert.alert("Готово", "Фото профиля удалено");
    } catch (e) {
      console.log("Delete avatar error:", e);
      Alert.alert("Ошибка", "Не удалось удалить фото");
    }
  };

  const handleSave = async () => {
    if (!name.trim()) {
      Alert.alert("Ошибка", "Введите имя");
      return;
    }

    try {
      setIsSaving(true);

      const current = profile;
      const newProfile: UserProfile = {
        name: name.trim(),
        isStaff: current?.isStaff ?? false,
        // здесь как раз и сохраняем avatarUri в нашей "базе"
        avatarUri: avatarUri ?? null,
      };

      await saveUserProfile(newProfile);
      setProfile(newProfile);
      Alert.alert("Готово", "Профиль обновлён");
    } catch (e) {
      console.log("Save profile error:", e);
      Alert.alert("Ошибка", "Не удалось сохранить профиль");
    } finally {
      setIsSaving(false);
    }
  };

  const handleLogout = async () => {
    try {
      // при желании можешь заменить на точечное удаление только профиля
      await AsyncStorage.clear();
      setProfile(null);
      setName("");
      setAvatarUri(null);

      navigation.reset({
        index: 0,
        routes: [{ name: "Login" }],
      });
    } catch (e) {
      console.log("Logout error:", e);
      Alert.alert("Ошибка", "Не удалось выйти из аккаунта");
    }
  };

  if (isLoading) {
    return (
      <View style={styles.loadingRoot}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
      <View style={styles.root}>
        <View style={styles.card}>
          {/* Аватарка */}
          <View style={styles.avatarWrapper}>
            {avatarUri ? (
              <Image source={{ uri: avatarUri }} style={styles.avatar} />
            ) : (
              <View style={styles.avatarPlaceholder}>
                <Text style={styles.avatarPlaceholderText}>
                  {name.trim()
                    ? name.trim().charAt(0).toUpperCase()
                    : "?"}
                </Text>
              </View>
            )}

            <TouchableOpacity
              style={styles.avatarButton}
              onPress={handlePickAvatar}
            >
              <Text style={styles.avatarButtonText}>Изменить фото</Text>
            </TouchableOpacity>

            {avatarUri && (
              <TouchableOpacity
                style={styles.avatarDeleteButton}
                onPress={handleDeleteAvatar}
              >
                <Text style={styles.avatarDeleteButtonText}>
                  Удалить фото
                </Text>
              </TouchableOpacity>
            )}
          </View>

          {/* Редактирование имени */}
          <View style={styles.field}>
            <Text style={styles.label}>Ваше имя</Text>
            <TextInput
              style={styles.input}
              placeholder="Введите имя"
              placeholderTextColor="#9ca6b5"
              value={name}
              onChangeText={setName}
              underlineColorAndroid="transparent"
              returnKeyType="done"
            />
          </View>

          {/* Кнопка сохранить */}
          <TouchableOpacity
            style={[styles.saveButton, isSaving && styles.saveButtonDisabled]}
            onPress={handleSave}
            disabled={isSaving}
          >
            <Text style={styles.saveButtonText}>
              {isSaving ? "Сохраняем..." : "Сохранить"}
            </Text>
          </TouchableOpacity>

          {/* Кнопка выхода из аккаунта */}
          <TouchableOpacity
            style={styles.logoutButton}
            onPress={handleLogout}
          >
            <Text style={styles.logoutButtonText}>Выйти из аккаунта</Text>
          </TouchableOpacity>
        </View>
      </View>
    </TouchableWithoutFeedback>
  );
};

const styles = StyleSheet.create({
  loadingRoot: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#e9edf5",
  },
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
    gap: 20,
  },
  avatarWrapper: {
    alignItems: "center",
    marginTop: 16,
    marginBottom: 8,
  },
  avatar: {
    width: 96,
    height: 96,
    borderRadius: 48,
  },
  avatarPlaceholder: {
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: "#e5e7eb",
    alignItems: "center",
    justifyContent: "center",
  },
  avatarPlaceholderText: {
    fontSize: 32,
    fontWeight: "700",
    color: "#4b5563",
  },
  avatarButton: {
    marginTop: 8,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: "#3390ec",
  },
  avatarButtonText: {
    color: "#3390ec",
    fontSize: 14,
    fontWeight: "500",
  },
  avatarDeleteButton: {
    marginTop: 6,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 999,
    backgroundColor: "#ef4444",
  },
  avatarDeleteButtonText: {
    color: "#ffffff",
    fontSize: 14,
    fontWeight: "500",
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
    borderColor: "transparent",
  },
  saveButton: {
    marginTop: 8,
    borderRadius: 999,
    backgroundColor: "#3390ec",
    paddingVertical: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  saveButtonDisabled: {
    opacity: 0.7,
  },
  saveButtonText: {
    color: "#ffffff",
    fontSize: 16,
    fontWeight: "600",
  },
  logoutButton: {
    marginTop: 8,
    borderRadius: 999,
    backgroundColor: "#ef4444",
    paddingVertical: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  logoutButtonText: {
    color: "#ffffff",
    fontSize: 16,
    fontWeight: "600",
  },
});

export default ProfileScreen;
