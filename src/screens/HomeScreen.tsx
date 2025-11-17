// src/screens/HomeScreen.tsx
import React, { useEffect, useState } from 'react'
import {
	View,
	Text,
	StyleSheet,
	Image,
	TouchableOpacity,
	ViewStyle,
	TextStyle
} from 'react-native'
import { NativeStackScreenProps } from '@react-navigation/native-stack'
import { RootStackParamList } from '../navigation/AppNavigator'
import { loadUserProfile, UserProfile } from '../storage/userStorage'

type Props = NativeStackScreenProps<RootStackParamList, 'Home'>

// Главный экран приложения в стиле Telegram
const HomeScreen: React.FC<Props> = ({ navigation }) => {
	const [profile, setProfile] = useState<UserProfile | null>(null)

	useEffect(() => {
		const load = async () => {
			const storedProfile = await loadUserProfile()
			setProfile(storedProfile)
		}

		load()
	}, [])

	const name = profile?.name || 'гость'
	const roleText = profile?.isStaff
		? 'Режим сотрудника медорганизации'
		: 'Режим пациента'

	const avatarLetter = (profile?.name?.[0] || 'Г').toUpperCase()

	return (
		<View style={styles.root}>
			<View style={styles.header}>
				<Text style={styles.appName}>MedGuide</Text>
			</View>

			<View style={styles.card}>
				<View style={styles.profileRow}>
					<View style={styles.avatar}>
						<Text style={styles.avatarText}>{avatarLetter}</Text>
					</View>

					<View style={styles.profileInfo}>
						<Text style={styles.title}>Добро пожаловать, {name}!</Text>
						<View style={styles.roleTag}>
							<Text style={styles.roleTagText}>{roleText}</Text>
						</View>
					</View>
				</View>

				<Text style={styles.text}>
					Вы можете открыть список инструкций или перейти в личный кабинет.
				</Text>

				{/* Мультимедиа: иллюстрация как превью канала/чата */}
				<View style={styles.mediaBlock}>
					<Image
						style={styles.image}
						source={{
							uri: 'https://images.pexels.com/photos/6129041/pexels-photo-6129041.jpeg?auto=compress&cs=tinysrgb&w=800'
						}}
						resizeMode='cover'
					/>
					<Text style={styles.mediaText}>
						Следуйте актуальным инструкциям медорганизации и сохраняйте своё
						здоровье под контролем.
					</Text>
				</View>

				<View style={styles.buttons}>
					<TelegramButton
						title='Инструкции'
						onPress={() => navigation.navigate('InstructionsList')}
						variant='primary'
					/>
					<TelegramButton
						title='Личный кабинет'
						onPress={() => navigation.navigate('Profile')}
						variant='secondary'
					/>
				</View>
			</View>
		</View>
	)
}

type ButtonVariant = 'primary' | 'secondary'

const TelegramButton: React.FC<{
	title: string
	onPress: () => void
	variant?: ButtonVariant
}> = ({ title, onPress, variant = 'primary' }) => {
	const isPrimary = variant === 'primary'

	const buttonStyle: ViewStyle = isPrimary
		? styles.buttonPrimary
		: styles.buttonSecondary

	const textStyle: TextStyle = isPrimary
		? styles.buttonPrimaryText
		: styles.buttonSecondaryText

	return (
		<TouchableOpacity style={[styles.buttonBase, buttonStyle]} onPress={onPress}>
			<Text style={textStyle}>{title}</Text>
		</TouchableOpacity>
	)
}

const styles = StyleSheet.create({
	root: {
		flex: 1,
		backgroundColor: '#e9edf5',
		padding: 16
	},
	header: {
		paddingVertical: 8,
		alignItems: 'center'
	},
	appName: {
		fontSize: 16,
		fontWeight: '600',
		color: '#3390ec'
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
		gap: 16
	},
	profileRow: {
		flexDirection: 'row',
		alignItems: 'center',
		gap: 12
	},
	avatar: {
		width: 52,
		height: 52,
		borderRadius: 26,
		backgroundColor: '#d2e6ff',
		alignItems: 'center',
		justifyContent: 'center'
	},
	avatarText: {
		fontSize: 22,
		fontWeight: '700',
		color: '#2b5278'
	},
	profileInfo: {
		flex: 1,
		gap: 4
	},
	title: {
		fontSize: 20,
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
	text: {
		fontSize: 14,
		color: '#4a4a4a'
	},
	mediaBlock: {
		gap: 8
	},
	image: {
		width: '100%',
		height: 190,
		borderRadius: 16
	},
	mediaText: {
		fontSize: 13,
		color: '#6c6c6c'
	},
	buttons: {
		marginTop: 'auto',
		gap: 10
	},
	buttonBase: {
		borderRadius: 999,
		paddingVertical: 12,
		alignItems: 'center',
		justifyContent: 'center'
	},
	buttonPrimary: {
		backgroundColor: '#3390ec'
	},
	buttonPrimaryText: {
		color: '#ffffff',
		fontSize: 15,
		fontWeight: '600'
	},
	buttonSecondary: {
		borderWidth: 1,
		borderColor: '#3390ec',
		backgroundColor: 'transparent'
	},
	buttonSecondaryText: {
		color: '#3390ec',
		fontSize: 15,
		fontWeight: '600'
	}
})

export default HomeScreen
