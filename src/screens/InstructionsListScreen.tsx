// src/screens/InstructionsListScreen.tsx
import React from 'react'
import {
	View,
	Text,
	FlatList,
	TouchableOpacity,
	StyleSheet,
	ActivityIndicator
} from 'react-native'
import { NativeStackScreenProps } from '@react-navigation/native-stack'
import { RootStackParamList } from '../navigation/AppNavigator'
import { useInstructions } from '../hooks/useInstructions'
import { Instruction } from '../api/instructionsApi'

type Props = NativeStackScreenProps<RootStackParamList, 'InstructionsList'>

// Экран списка инструкций.
// Здесь используется кастомный хук useInstructions, который управляет ресурсом "список инструкций":
// выполняет псевдо-API запрос, обрабатывает состояние загрузки и ошибок.
const InstructionsListScreen: React.FC<Props> = ({ navigation }) => {
	const { instructions, isLoading, error } = useInstructions()

	const renderItem = ({ item }: { item: Instruction }) => (
		<TouchableOpacity
			style={styles.card}
			onPress={() =>
				navigation.navigate('InstructionDetails', { id: item.id })
			}
		>
			<Text style={styles.title}>{item.title}</Text>
			<Text style={styles.description}>{item.shortDescription}</Text>
		</TouchableOpacity>
	)

	if (isLoading) {
		return (
			<View style={styles.center}>
				<ActivityIndicator size='large' />
				<Text style={styles.text}>Загружаем инструкции...</Text>
			</View>
		)
	}

	if (error) {
		return (
			<View style={styles.center}>
				<Text style={styles.error}>{error}</Text>
			</View>
		)
	}

	return (
		<View style={styles.container}>
			<Text style={styles.header}>Инструкции для пациентов</Text>

			<FlatList
				data={instructions}
				keyExtractor={(item) => item.id}
				renderItem={renderItem}
			/>
		</View>
	)
}

const styles = StyleSheet.create({
	container: {
		flex: 1,
		padding: 16
	},
	header: {
		fontSize: 20,
		fontWeight: '600',
		marginBottom: 12
	},
	card: {
		padding: 12,
		borderRadius: 8,
		borderWidth: 1,
		marginBottom: 10
	},
	title: {
		fontSize: 16,
		fontWeight: '600',
		marginBottom: 4
	},
	description: {
		fontSize: 14
	},
	center: {
		flex: 1,
		justifyContent: 'center',
		alignItems: 'center',
		padding: 16,
		gap: 12
	},
	text: {
		fontSize: 16
	},
	error: {
		fontSize: 16,
		color: 'red',
		textAlign: 'center'
	}
})

export default InstructionsListScreen
