import { NativeStackScreenProps } from '@react-navigation/native-stack'
import React, { useState } from 'react'
import { Button, StyleSheet, Switch, Text, TextInput, View } from 'react-native'
import { RootStackParamList } from '../navigation/AppNavigator'

type Props = NativeStackScreenProps<RootStackParamList, 'Login'>

const LoginScreen: React.FC<Props> = ({ navigation }) => {
	const [name, setName] = useState('')
	const [isStaff, setIsStaff] = useState(false)

	const handleLogin = () => {
		// Пока просто навигация без реальной авторизации.
		navigation.replace('Home')
	}

	return (
		<View style={styles.container}>
			<Text style={styles.title}>MedGuide</Text>
			<Text style={styles.subtitle}>Вход в приложение медорганизации</Text>

			<Text style={styles.label}>Имя</Text>
			<TextInput
				style={styles.input}
				placeholder='Введите ваше имя'
				value={name}
				onChangeText={setName}
			/>

			<View style={styles.switchRow}>
				<Text style={styles.label}>Я сотрудник медорганизации</Text>
				<Switch value={isStaff} onValueChange={setIsStaff} />
			</View>

			<Button title='Войти' onPress={handleLogin} />
		</View>
	)
}

const styles = StyleSheet.create({
	container: {
		flex: 1,
		padding: 16,
		justifyContent: 'center',
		gap: 16,
	},
	title: {
		fontSize: 28,
		fontWeight: 'bold',
		textAlign: 'center',
	},
	subtitle: {
		textAlign: 'center',
		marginBottom: 16,
	},
	label: {
		fontSize: 16,
		marginBottom: 4,
	},
	input: {
		borderWidth: 1,
		borderRadius: 8,
		paddingHorizontal: 12,
		paddingVertical: 8,
		marginBottom: 12,
	},
	switchRow: {
		flexDirection: 'row',
		alignItems: 'center',
		justifyContent: 'space-between',
		marginBottom: 16,
	},
})

export default LoginScreen
