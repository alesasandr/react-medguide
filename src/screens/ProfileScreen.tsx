// src/screens/ProfileScreen.tsx
import React, { useEffect, useState } from 'react'
import { View, Text, StyleSheet } from 'react-native'
import { loadUserProfile, UserProfile } from '../storage/userStorage'

// Экран личного кабинета пользователя.
// Здесь профиль загружается из AsyncStorage с помощью useEffect,
// а полученные данные отображаются.
const ProfileScreen: React.FC = () => {
	const [profile, setProfile] = useState<UserProfile | null>(null)

	useEffect(() => {
		const load = async () => {
			const storedProfile = await loadUserProfile()
			setProfile(storedProfile)
		}

		load()
	}, [])

	if (!profile) {
		return (
			<View style={styles.container}>
				<Text style={styles.title}>Личный кабинет</Text>
				<Text style={styles.text}>
					Профиль пользователя не найден. Выполните вход в приложение.
				</Text>
			</View>
		)
	}

	return (
		<View style={styles.container}>
			<Text style={styles.title}>Личный кабинет</Text>
			<Text style={styles.text}>Имя: {profile.name}</Text>
			<Text style={styles.text}>
				Роль:{' '}
				{profile.isStaff
					? 'Сотрудник медорганизации'
					: 'Пациент'}
			</Text>
			<Text style={styles.text}>
				В дальнейшем здесь появятся настройки профиля и доступ к
				редактированию инструкций (для сотрудников).
			</Text>
		</View>
	)
}

const styles = StyleSheet.create({
	container: {
		flex: 1,
		padding: 16,
		gap: 16,
		justifyContent: 'center'
	},
	title: {
		fontSize: 22,
		fontWeight: '600',
		textAlign: 'center'
	},
	text: {
		fontSize: 16,
		textAlign: 'center'
	}
})

export default ProfileScreen
