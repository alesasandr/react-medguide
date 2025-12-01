// src/screens/ProfileScreen.tsx
import React, { useEffect, useState, useMemo } from "react";
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
  ScrollView,
  Modal,
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

const SPECIALTIES = [
  "Терапевт",
  "Кардиолог",
  "Невролог",
  "Пульмонолог",
  "Гастроэнтеролог",
  "Эндокринолог",
  "Ревматолог",
  "Уролог",
  "Хирург",
  "Ортопед",
  "Офтальмолог",
  "ЛОР",
];

const ProfileScreen: React.FC<Props> = ({ navigation }) => {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [name, setName] = useState("");
  const [specialty, setSpecialty] = useState("Терапевт");
  const [avatarUri, setAvatarUri] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [showSpecialtyPicker, setShowSpecialtyPicker] = useState(false);

  useEffect(() => {
    const load = async () => {
      try {
        const storedProfile = await loadUserProfile();
        if (storedProfile) {
          setProfile(storedProfile);
          setName(storedProfile.name || "");
          setAvatarUri(storedProfile.avatarUri || null);
          setSpecialty(storedProfile.specialty || "Терапевт");
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
        avatarUri: avatarUri ?? null,
        specialty: specialty,
        employeeId: current?.employeeId || "", // сохраняем существующий или оставляем пустым
        workLocation: current?.workLocation || "",
        issuedHistory: current?.issuedHistory || [],
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
      setSpecialty("Терапевт");

      navigation.reset({
        index: 0,
        routes: [{ name: "Login" }],
      });
    } catch (e) {
      console.log("Logout error:", e);
      Alert.alert("Ошибка", "Не удалось выйти из аккаунта");
    }
  };

  const handleViewHistory = () => {
    navigation.navigate("IssuedHistory" as any);
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
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.card}>
            {/* Аватарка */}
            <View style={styles.avatarWrapper}>
              {avatarUri ? (
                <Image source={{ uri: avatarUri }} style={styles.avatar} />
              ) : (
                <View style={styles.avatarPlaceholder}>
                  <Text style={styles.avatarPlaceholderText}>
                    {name.trim() ? name.trim().charAt(0).toUpperCase() : "?"}
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

            {/* Выбор специализации */}
            <View style={styles.field}>
              <Text style={styles.label}>Специализация</Text>
              <TouchableOpacity
                style={styles.pickerButton}
                onPress={() => setShowSpecialtyPicker(true)}
              >
                <Text style={styles.pickerButtonText}>{specialty}</Text>
                <Text style={styles.pickerButtonArrow}>▼</Text>
              </TouchableOpacity>
            </View>

            {/* ID сотрудника (только для чтения) */}
            {profile?.employeeId && (
              <View style={styles.field}>
                <Text style={styles.label}>ID сотрудника</Text>
                <View style={styles.readOnlyField}>
                  <Text style={styles.readOnlyText}>{profile.employeeId}</Text>
                </View>
              </View>
            )}

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

            {/* Кнопка истории выданных препаратов */}
            <TouchableOpacity
              style={styles.historyButton}
              onPress={handleViewHistory}
            >
              <Text style={styles.historyButtonText}>
                📊 История выданных препаратов
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
        </ScrollView>

        {/* Модальное окно для выбора специализации */}
        <Modal
          visible={showSpecialtyPicker}
          transparent
          animationType="slide"
          onRequestClose={() => setShowSpecialtyPicker(false)}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <Text style={styles.modalTitle}>Выберите специализацию</Text>
              <ScrollView style={styles.specialtyList}>
                {SPECIALTIES.map((spec) => (
                  <TouchableOpacity
                    key={spec}
                    style={[
                      styles.specialtyItem,
                      specialty === spec && styles.specialtyItemSelected,
                    ]}
                    onPress={() => {
                      setSpecialty(spec);
                      setShowSpecialtyPicker(false);
                    }}
                  >
                    <Text
                      style={[
                        styles.specialtyItemText,
                        specialty === spec && styles.specialtyItemTextSelected,
                      ]}
                    >
                      {spec}
                    </Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
              <TouchableOpacity
                style={styles.modalCloseButton}
                onPress={() => setShowSpecialtyPicker(false)}
              >
                <Text style={styles.modalCloseButtonText}>Закрыть</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>
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
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 24,
  },
  card: {
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
    fontWeight: "500",
  },
  input: {
    borderRadius: 12,
    backgroundColor: "#f5f7fb",
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 14,
    borderWidth: 1,
    borderColor: "#e5e7eb",
    color: "#111827",
  },
  pickerButton: {
    flexDirection: "row",
    borderRadius: 12,
    backgroundColor: "#f5f7fb",
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderWidth: 1,
    borderColor: "#e5e7eb",
    alignItems: "center",
    justifyContent: "space-between",
  },
  pickerButtonText: {
    fontSize: 14,
    color: "#111827",
    fontWeight: "500",
  },
  pickerButtonArrow: {
    fontSize: 12,
    color: "#6b7280",
  },
  readOnlyField: {
    borderRadius: 12,
    backgroundColor: "#f9fafb",
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderWidth: 1,
    borderColor: "#e5e7eb",
  },
  readOnlyText: {
    fontSize: 14,
    color: "#6b7280",
    fontFamily: "monospace",
  },
  infoCard: {
    borderRadius: 12,
    backgroundColor: "#eff6ff",
    padding: 12,
    borderWidth: 1,
    borderColor: "#bfdbfe",
    gap: 6,
  },
  infoCardTitle: {
    fontSize: 13,
    fontWeight: "600",
    color: "#1e40af",
  },
  infoCardText: {
    fontSize: 12,
    color: "#1e40af",
    lineHeight: 18,
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
  historyButton: {
    borderRadius: 999,
    backgroundColor: "#8b5cf6",
    paddingVertical: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  historyButtonText: {
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
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "flex-end",
  },
  modalContent: {
    backgroundColor: "#ffffff",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingTop: 20,
    paddingBottom: 20,
    maxHeight: "80%",
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#111827",
    paddingHorizontal: 16,
    marginBottom: 12,
  },
  specialtyList: {
    paddingHorizontal: 16,
    marginBottom: 12,
  },
  specialtyItem: {
    paddingVertical: 12,
    paddingHorizontal: 12,
    borderRadius: 8,
    marginBottom: 6,
    backgroundColor: "#f5f7fb",
  },
  specialtyItemSelected: {
    backgroundColor: "#3390ec",
  },
  specialtyItemText: {
    fontSize: 15,
    color: "#111827",
  },
  specialtyItemTextSelected: {
    color: "#ffffff",
    fontWeight: "600",
  },
  modalCloseButton: {
    marginHorizontal: 16,
    borderRadius: 999,
    backgroundColor: "#e5e7eb",
    paddingVertical: 10,
    alignItems: "center",
  },
  modalCloseButtonText: {
    color: "#111827",
    fontSize: 14,
    fontWeight: "600",
  },
});

export default ProfileScreen;
