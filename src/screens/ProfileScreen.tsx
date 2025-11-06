import React from 'react'
import { StyleSheet, Text, View } from 'react-native'

const ProfileScreen: React.FC = () => {
	// Позже сюда прилетят реальные данные пользователя и режим редактирования инструкций
	return (
		<View style={styles.container}>
			<Text style={styles.title}>Личный кабинет</Text>
			<Text style={styles.text}>
				Здесь будут данные пользователя и инструменты для редактирования
				инструкций (для сотрудников медорганизации).
			</Text>
		</View>
	)
}

const styles = StyleSheet.create({
	container: {
		flex: 1,
		padding: 16,
		gap: 16,
		justifyContent: 'center',
	},
	title: {
		fontSize: 22,
		fontWeight: '600',
		textAlign: 'center',
	},
	text: {
		fontSize: 16,
		textAlign: 'center',
	},
})

export default ProfileScreen
