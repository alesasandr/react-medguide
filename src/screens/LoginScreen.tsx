// src/screens/LoginScreen.tsx
import React, { useState } from 'react'
import {
	View,
	Text,
	TextInput,
	StyleSheet,
	Switch,
	Alert,
	TouchableOpacity,
	ViewStyle,
	TextStyle
} from 'react-native'
import { NativeStackScreenProps } from '@react-navigation/native-stack'
import { RootStackParamList } from '../navigation/AppNavigator'
import { saveUserProfile } from '../storage/userStorage'

type Props = NativeStackScreenProps<RootStackParamList, 'Login'>

const LoginScreen: React.FC<Props> = ({ navigation }) => {
	const [name, setName] = useState('')
	const [isStaff, setIsStaff] = useState(false)
	const [isSubmitting, setIsSubmitting] = useState(false)

	const handleLogin = async () => {
		if (!name.trim()) {
			Alert.alert('Ошибка', 'Введите имя пользователя')
			return
		}

		try {
			setIsSubmitting(true)

			await saveUserProfile({
				name: name.trim(),
				isStaff
			})

			navigation.replace('Home')
		} catch (e) {
			Alert.alert('Ошибка', 'Не удалось сохранить профиль пользователя')
		} finally {
			setIsSubmitting(false)
		}
	}

	return (
		<View style={styles.root}>
			<View style={styles.card}>
				{/* Аватарка-логотип с красным крестом, видна сразу при запуске */}
				<View style={styles.logoWrapper}>
					<View style={styles.logoAvatar}>
						<Text style={styles.logoAvatarText}>✚</Text>
					</View>
					<Text style={styles.appTitle}>MedGuide</Text>
					<Text style={styles.subtitle}>
						Инструкции для пациентов и сотрудников
					</Text>
				</View>

				<View style={styles.fieldBlock}>
					<Text style={styles.label}>Ваше имя</Text>
					<TextInput
						style={styles.input}
						placeholder='Введите имя'
						placeholderTextColor='#9ca6b5'
						value={name}
						onChangeText={setName}
					/>
				</View>

				<View style={styles.switchRow}>
					<View style={styles.switchTextBlock}>
						<Text style={styles.label}>Я сотрудник медорганизации</Text>
						<Text style={styles.switchHint}>
							Это включит режим сотрудника в интерфейсе
						</Text>
					</View>
					<Switch value={isStaff} onValueChange={setIsStaff} />
				</View>

				<TelegramButton
					title={isSubmitting ? 'Вход...' : 'Войти'}
					onPress={handleLogin}
					disabled={isSubmitting}
				/>
			</View>
		</View>
	)
}

type ButtonProps = {
	title: string
	onPress: () => void
	disabled?: boolean
}

const TelegramButton: React.FC<ButtonProps> = ({
	title,
	onPress,
	disabled = false
}) => {
	const containerStyle: ViewStyle = disabled
		? { ...styles.button, ...styles.buttonDisabled }
		: styles.button

	const textStyle: TextStyle = disabled
		? { ...styles.buttonText, ...styles.buttonTextDisabled }
		: styles.buttonText

	return (
		<TouchableOpacity
			style={containerStyle}
			onPress={onPress}
			disabled={disabled}
		>
			<Text style={textStyle}>{title}</Text>
		</TouchableOpacity>
	)
}

const styles = StyleSheet.create({
	root: {
		flex: 1,
		backgroundColor: '#e9edf5',
		padding: 16,
		justifyContent: 'center'
	},
	card: {
		backgroundColor: '#ffffff',
		borderRadius: 20,
		padding: 20,
		shadowColor: '#000',
		shadowOpacity: 0.08,
		shadowRadius: 12,
		shadowOffset: { width: 0, height: 4 },
		elevation: 4,
		gap: 20
	},
	logoWrapper: {
		alignItems: 'center',
		gap: 8,
		marginBottom: 4
	},
	logoAvatar: {
		width: 72,
		height: 72,
		borderRadius: 36,
		backgroundColor: '#ffffff',
		alignItems: 'center',
		justifyContent: 'center',
		borderWidth: 2,
		borderColor: '#e53935'
	},
	logoAvatarText: {
		fontSize: 40,
		fontWeight: '700',
		color: '#e53935'
	},
	appTitle: {
		fontSize: 24,
		fontWeight: '700',
		textAlign: 'center',
		color: '#3390ec'
	},
	subtitle: {
		textAlign: 'center',
		fontSize: 14,
		color: '#6c6c6c'
	},
	fieldBlock: {
		gap: 6,
		marginTop: 8
	},
	label: {
		fontSize: 14,
		color: '#2b2b2b'
	},
	input: {
		borderRadius: 12,
		borderWidth: 1,
		borderColor: '#d0d7e6',
		backgroundColor: '#f5f7fb',
		paddingHorizontal: 12,
		paddingVertical: 9,
		fontSize: 15,
		color: '#000'
	},
	switchRow: {
		flexDirection: 'row',
		alignItems: 'center',
		justifyContent: 'space-between',
		marginTop: 8,
		gap: 12
	},
	switchTextBlock: {
		flex: 1,
		gap: 2
	},
	switchHint: {
		fontSize: 12,
		color: '#8a8a8a'
	},
	button: {
		marginTop: 16,
		borderRadius: 999,
		paddingVertical: 12,
		alignItems: 'center',
		justifyContent: 'center',
		backgroundColor: '#3390ec'
	},
	buttonText: {
		color: '#ffffff',
		fontSize: 15,
		fontWeight: '600'
	},
	buttonDisabled: {
		opacity: 0.7
	},
	buttonTextDisabled: {
		color: '#e6e6e6'
	}
})

export default LoginScreen
