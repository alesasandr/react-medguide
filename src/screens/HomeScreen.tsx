import React, { useEffect, useState } from 'react'
import { View, Text, Button, StyleSheet } from 'react-native'
import { NativeStackScreenProps } from '@react-navigation/native-stack'
import { RootStackParamList } from '../navigation/AppNavigator'
import { loadUserProfile, UserProfile } from '../storage/userStorage'

type Props = NativeStackScreenProps<RootStackParamList, 'Home'>

// Главный экран приложения.
// Здесь используем useEffect для загрузки профиля пользователя из локального хранилища,
// а также useState для хранения профиля в состоянии компонента.
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

	return (
		<View style={styles.container}>
			<Text style={styles.title}>Добро пожаловать, {name}!</Text>
			<Text style={styles.text}>{roleText}</Text>
			<Text style={styles.text}>
				Вы можете открыть список инструкций или перейти в личный кабинет.
			</Text>

			<View style={styles.buttons}>
				<Button
					title='Инструкции'
					onPress={() => navigation.navigate('InstructionsList')}
				/>
				<Button
					title='Личный кабинет'
					onPress={() => navigation.navigate('Profile')}
				/>
			</View>
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
	title: {
		fontSize: 24,
		fontWeight: '600',
		textAlign: 'center'
	},
	text: {
		textAlign: 'center'
	},
	buttons: {
		gap: 12,
		marginTop: 16
	}
})

export default HomeScreen
