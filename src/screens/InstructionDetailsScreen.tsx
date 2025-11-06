import { NativeStackScreenProps } from '@react-navigation/native-stack'
import React from 'react'
import { StyleSheet, Text, View } from 'react-native'
import { RootStackParamList } from '../navigation/AppNavigator'

type Props = NativeStackScreenProps<RootStackParamList, 'InstructionDetails'>

const InstructionDetailsScreen: React.FC<Props> = ({ route }) => {
	const { id } = route.params

	// Пока просто заглушка по id, потом здесь будет поиск по данным / запрос к API
	return (
		<View style={styles.container}>
			<Text style={styles.title}>Инструкция #{id}</Text>
			<Text style={styles.text}>
				Здесь будет подробное описание инструкции, медиа-контент и, в будущем,
				возможность редактирования через личный кабинет.
			</Text>
		</View>
	)
}

const styles = StyleSheet.create({
	container: {
		flex: 1,
		padding: 16,
		gap: 16,
	},
	title: {
		fontSize: 22,
		fontWeight: '600',
	},
	text: {
		fontSize: 16,
	},
})

export default InstructionDetailsScreen
