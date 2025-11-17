// src/screens/ProfileScreen.tsx
import React, { useEffect, useState } from 'react'
import { View, Text, StyleSheet } from 'react-native'
import { loadUserProfile, UserProfile } from '../storage/userStorage'

// Экран личного кабинета в стиле Telegram.
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
			<View style={styles.root}>
				<View style={styles.cardCenter}>
					<Text style={styles.title}>Личный кабинет</Text>
					<Text style={styles.text}>
						Профиль пользователя не найден. Выполните вход в приложение.
					</Text>
				</View>
			</View>
		)
	}

	const avatarLetter = (profile.name[0] || 'П').toUpperCase()
	const roleText = profile.isStaff
		? 'Сотрудник медорганизации'
		: 'Пациент'

	return (
		<View style={styles.root}>
			<View style={styles.card}>
				<Text style={styles.title}>Личный кабинет</Text>

				<View style={styles.profileRow}>
					<View style={styles.avatar}>
						<Text style={styles.avatarText}>{avatarLetter}</Text>
					</View>

					<View style={styles.profileInfo}>
						<Text style={styles.name}>{profile.name}</Text>
						<View style={styles.roleTag}>
							<Text style={styles.roleTagText}>{roleText}</Text>
						</View>
					</View>
				</View>

				<View style={styles.section}>
					<Text style={styles.sectionTitle}>О профиле</Text>
					<Text style={styles.text}>
						В дальнейшем здесь появятся настройки профиля и доступ к
						редактированию инструкций (для сотрудников).
					</Text>
				</View>
			</View>
		</View>
	)
}

const styles = StyleSheet.create({
	root: {
		flex: 1,
		backgroundColor: '#e9edf5',
		padding: 16
	},
	card: {
		flex: 1,
		backgroundColor: '#ffffff',
		borderRadius: 20,
		padding: 16,
		shadowColor: '#000',
		shadowOpacity: 0.08,
		shadowRadius: 12,
		shadowOffset: { width: 0, height: 4 },
		elevation: 4,
		gap: 20
	},
	cardCenter: {
		flex: 1,
		backgroundColor: '#ffffff',
		borderRadius: 20,
		padding: 16,
		shadowColor: '#000',
		shadowOpacity: 0.08,
		shadowRadius: 12,
		shadowOffset: { width: 0, height: 4 },
		elevation: 4,
		alignItems: 'center',
		justifyContent: 'center',
		gap: 12
	},
	title: {
		fontSize: 20,
		fontWeight: '600',
		textAlign: 'center',
		color: '#000'
	},
	profileRow: {
		flexDirection: 'row',
		alignItems: 'center',
		gap: 12
	},
	avatar: {
		width: 60,
		height: 60,
		borderRadius: 30,
		backgroundColor: '#d2e6ff',
		alignItems: 'center',
		justifyContent: 'center'
	},
	avatarText: {
		fontSize: 26,
		fontWeight: '700',
		color: '#2b5278'
	},
	profileInfo: {
		flex: 1,
		gap: 6
	},
	name: {
		fontSize: 18,
		fontWeight: '600',
		color: '#000'
	},
	roleTag: {
		alignSelf: 'flex-start',
		paddingHorizontal: 10,
		paddingVertical: 4,
		borderRadius: 999,
		backgroundColor: 'rgba(51,144,236,0.08)'
	},
	roleTagText: {
		fontSize: 12,
		fontWeight: '500',
		color: '#3390ec'
	},
	section: {
		gap: 6
	},
	sectionTitle: {
		fontSize: 14,
		fontWeight: '600',
		color: '#4a4a4a'
	},
	text: {
		fontSize: 14,
		color: '#4a4a4a',
		textAlign: 'left'
	}
})

export default ProfileScreen
