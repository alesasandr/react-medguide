// src/storage/userStorage.ts
import AsyncStorage from "@react-native-async-storage/async-storage";

export type UserProfile = {
  name: string;
  isStaff: boolean;
  avatarUri: string | null;
};

const USER_PROFILE_KEY = "userProfile";

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
    };
  } catch (e) {
    console.warn("loadUserProfile error", e);
    return null;
  }
}

export async function clearUserProfile(): Promise<void> {
  try {
    await AsyncStorage.removeItem(USER_PROFILE_KEY);
  } catch (e) {
    console.warn("clearUserProfile error", e);
  }
}