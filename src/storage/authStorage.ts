
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
    console.error('Ошибка сохранения auth user:', e)
  }
}

// Загрузка пользователя
export const loadAuthUser = async (): Promise<AuthUser | null> => {
  try {
    const data = await AsyncStorage.getItem('auth_user')
    return data ? JSON.parse(data) : null
  } catch (e) {
    console.error('Ошибка загрузки auth user:', e)
    return null
  }
}

// Удаление (выход из аккаунта)
export const clearAuthUser = async () => {
  try {
    await AsyncStorage.removeItem('auth_user')
  } catch (e) {
    console.error('Ошибка очистки auth user:', e)
  }
}
