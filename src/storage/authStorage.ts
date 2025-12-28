
import AsyncStorage from '@react-native-async-storage/async-storage'

export type AuthUser = {
  id: number
  email: string
  name: string
  avatarUri: string | null
  isStaff: boolean
  token: string
}

// Сохранение пользователя
export const saveAuthUser = async (user: AuthUser) => {
  try {
    await AsyncStorage.setItem('auth_user', JSON.stringify(user))
  } catch (e) {
    // Тихая обработка ошибок сохранения auth user
  }
}

// Загрузка пользователя
export const loadAuthUser = async (): Promise<AuthUser | null> => {
  try {
    const data = await AsyncStorage.getItem('auth_user')
    return data ? JSON.parse(data) : null
  } catch (e) {
    // Тихая обработка ошибок загрузки auth user
    return null
  }
}

// Удаление (выход из аккаунта)
export const clearAuthUser = async () => {
  try {
    await AsyncStorage.removeItem('auth_user')
  } catch (e) {
    // Тихая обработка ошибок очистки auth user
  }
}
