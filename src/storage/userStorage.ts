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

export async function saveUserProfile(profile: UserProfile): Promise<void> {
  try {
    await AsyncStorage.setItem(USER_PROFILE_KEY, JSON.stringify(profile));
  } catch (e) {
    console.warn("saveUserProfile error", e);
  }
}

export async function loadUserProfile(): Promise<UserProfile | null> {
  try {
    const json = await AsyncStorage.getItem(USER_PROFILE_KEY);
    if (!json) return null;

    const raw = JSON.parse(json) as Partial<UserProfile>;

    return {
      name: raw.name ?? "",
      isStaff: !!raw.isStaff,
      avatarUri: raw.avatarUri ?? null,
      specialty: raw?.specialty ?? "Терапевт",
      employeeId: raw?.employeeId ?? generateEmployeeId(),
      workLocation: raw?.workLocation ?? "",
      issuedHistory: Array.isArray(raw?.issuedHistory) ? raw.issuedHistory : [],
    };
  } catch (e) {
    console.warn("loadUserProfile error", e);
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
    console.warn("addIssuedRecord error", e);
  }
}

export async function getIssuedHistory(): Promise<MedicineIssuedRecord[]> {
  try {
    const profile = await loadUserProfile();
    return profile?.issuedHistory ?? [];
  } catch (e) {
    console.warn("getIssuedHistory error", e);
    return [];
  }
}

export async function clearUserProfile(): Promise<void> {
  try {
    await AsyncStorage.removeItem(USER_PROFILE_KEY);
  } catch (e) {
    console.warn("clearUserProfile error", e);
  }
}
