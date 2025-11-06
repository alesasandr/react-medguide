// src/storage/userStorage.ts
// Работа с профилем пользователя через AsyncStorage.

import AsyncStorage from '@react-native-async-storage/async-storage'

export type UserProfile = {
    name: string
    isStaff: boolean
}

const USER_PROFILE_KEY = 'USER_PROFILE'

// Сохранение профиля пользователя в локальное хранилище.
export async function saveUserProfile(profile: UserProfile): Promise<void> {
    const json = JSON.stringify(profile)
    await AsyncStorage.setItem(USER_PROFILE_KEY, json)
}

// Загрузка профиля пользователя из локального хранилища.
export async function loadUserProfile(): Promise<UserProfile | null> {
    const json = await AsyncStorage.getItem(USER_PROFILE_KEY)
    if (!json) {
        return null
    }

    try {
        return JSON.parse(json) as UserProfile
    } catch {
        return null
    }
}

// Очистка профиля (на будущее, если пригодится).
export async function clearUserProfile(): Promise<void> {
    await AsyncStorage.removeItem(USER_PROFILE_KEY)
}
