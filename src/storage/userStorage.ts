// src/storage/userStorage.ts
import AsyncStorage from "@react-native-async-storage/async-storage";

export type MedicineIssuedRecord = {
  id: string;
  medicineId: number;
  medicineName: string;
  quantity: number;
  issuedAt: string; // ISO format
  doctorId: string;
  doctorName: string;
};

export type UserProfile = {
  name: string;
  isStaff: boolean;
  avatarUri: string | null;
  specialty: string; // обязательное поле: Кардиолог, Терапевт и т.д.
  employeeId: string; // генерируется один раз
  workLocation?: string;
  issuedHistory: MedicineIssuedRecord[]; // история выданных препаратов
};

const USER_PROFILE_KEY = "userProfile";

// Генерируем уникальный ID сотрудника (один раз)
function generateEmployeeId(): string {
  return `DOC-${Date.now()}-${Math.random()
    .toString(36)
    .substring(7)
    .toUpperCase()}`;
}

const withDefaults = (
  overrides: Partial<UserProfile>,
  fallback?: UserProfile | null
): UserProfile => {
  return {
    name: overrides.name ?? fallback?.name ?? "",
    isStaff: overrides.isStaff ?? fallback?.isStaff ?? false,
    avatarUri: overrides.avatarUri ?? fallback?.avatarUri ?? null,
    specialty: overrides.specialty ?? fallback?.specialty ?? "Терапевт",
    employeeId:
      overrides.employeeId ?? fallback?.employeeId ?? generateEmployeeId(),
    workLocation: overrides.workLocation ?? fallback?.workLocation ?? "",
    issuedHistory:
      overrides.issuedHistory ??
      fallback?.issuedHistory ??
      ([] as MedicineIssuedRecord[]),
  };
};

export async function saveUserProfile(
  profile: Partial<UserProfile>
): Promise<void> {
  try {
    const existing = await loadUserProfile();
    const normalized = withDefaults(profile, existing);
    await AsyncStorage.setItem(USER_PROFILE_KEY, JSON.stringify(normalized));
  } catch (e) {
    // Тихая обработка ошибок сохранения профиля
  }
}

export async function loadUserProfile(): Promise<UserProfile | null> {
  try {
    const json = await AsyncStorage.getItem(USER_PROFILE_KEY);
    if (!json) return null;

    const raw = JSON.parse(json) as Partial<UserProfile>;
    return withDefaults({
      ...raw,
      issuedHistory: Array.isArray(raw?.issuedHistory)
        ? raw?.issuedHistory
        : [],
    });
  } catch (e) {
    // Тихая обработка ошибок загрузки профиля
    return null;
  }
}

export async function addIssuedRecord(
  record: MedicineIssuedRecord
): Promise<void> {
  try {
    const profile = await loadUserProfile();
    if (!profile) return;

    profile.issuedHistory = [record, ...(profile.issuedHistory || [])];
    await saveUserProfile(profile);
  } catch (e) {
    // Тихая обработка ошибок добавления записи
  }
}

export async function getIssuedHistory(): Promise<MedicineIssuedRecord[]> {
  try {
    const profile = await loadUserProfile();
    return profile?.issuedHistory ?? [];
  } catch (e) {
    // Тихая обработка ошибок загрузки истории
    return [];
  }
}

export async function clearUserProfile(): Promise<void> {
  try {
    await AsyncStorage.removeItem(USER_PROFILE_KEY);
  } catch (e) {
    // Тихая обработка ошибок очистки профиля
  }
}
