import { NativeStackScreenProps } from '@react-navigation/native-stack'
import React from 'react'
import { Button, StyleSheet, Text, View } from 'react-native'
import { RootStackParamList } from '../navigation/AppNavigator'

type Props = NativeStackScreenProps<RootStackParamList, 'Home'>

const HomeScreen: React.FC<Props> = ({ navigation }) => {
	return (
		<View style={styles.container}>
			<Text style={styles.title}>Главный экран</Text>
			<Text style={styles.text}>
				Здесь будет краткая информация для пользователя и быстрый доступ к
				основным разделам.
			</Text>

			<Button
				title='Перейти к инструкциям'
				onPress={() => navigation.navigate('InstructionsList')}
			/>
			<Button
				title='Личный кабинет'
				onPress={() => navigation.navigate('Profile')}
			/>
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
		fontSize: 24,
		fontWeight: '600',
		textAlign: 'center',
	},
	text: {
		textAlign: 'center',
	},
})

export default HomeScreen
