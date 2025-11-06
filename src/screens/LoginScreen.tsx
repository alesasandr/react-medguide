// src/screens/LoginScreen.tsx
import React, { useState } from 'react'
import {
	View,
	Text,
	TextInput,
	Button,
	StyleSheet,
	Switch,
	Alert
} from 'react-native'
import { NativeStackScreenProps } from '@react-navigation/native-stack'
import { RootStackParamList } from '../navigation/AppNavigator'
import { saveUserProfile } from '../storage/userStorage'

type Props = NativeStackScreenProps<RootStackParamList, 'Login'>

// Экран входа в приложение.
// В этой версии ЛР 3 при нажатии "Войти" профиль пользователя сохраняется в AsyncStorage,
// что демонстрирует управление ресурсом "локальное хранилище".
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

			// Сохраняем профиль пользователя как ресурс в локальном хранилище.
			await saveUserProfile({
				name: name.trim(),
				isStaff
			})

			// Переходим на главный экран.
			navigation.replace('Home')
		} catch (e) {
			Alert.alert('Ошибка', 'Не удалось сохранить профиль пользователя')
		} finally {
			setIsSubmitting(false)
		}
	}

	return (
		<View style={styles.container}>
			<Text style={styles.appTitle}>MedGuide</Text>
			<Text style={styles.subtitle}>Инструкции для пациентов и сотрудников</Text>

			<Text style={styles.label}>Ваше имя</Text>
			<TextInput
				style={styles.input}
				placeholder='Введите имя'
				value={name}
				onChangeText={setName}
			/>

			<View style={styles.switchRow}>
				<Text style={styles.label}>Я сотрудник медорганизации</Text>
				<Switch value={isStaff} onValueChange={setIsStaff} />
			</View>

			<Button
				title={isSubmitting ? 'Вход...' : 'Войти'}
				onPress={handleLogin}
				disabled={isSubmitting}
			/>
		</View>
	)
}

const styles = StyleSheet.create({
	container: {
		flex: 1,
		padding: 16,
		justifyContent: 'center',
		gap: 16
	},
	appTitle: {
		fontSize: 28,
		fontWeight: 'bold',
		textAlign: 'center',
		marginBottom: 4
	},
	subtitle: {
		textAlign: 'center',
		marginBottom: 24
	},
	label: {
		fontSize: 16,
		marginBottom: 6
	},
	input: {
		borderWidth: 1,
		borderRadius: 8,
		paddingHorizontal: 12,
		paddingVertical: 8,
		marginBottom: 12
	},
	switchRow: {
		flexDirection: 'row',
		justifyContent: 'space-between',
		alignItems: 'center',
		marginBottom: 16
	}
})

export default LoginScreen
