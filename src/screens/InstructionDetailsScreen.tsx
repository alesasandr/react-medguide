// src/screens/InstructionDetailsScreen.tsx
import React, { useEffect, useState } from 'react'
import { View, Text, StyleSheet, ActivityIndicator } from 'react-native'
import { NativeStackScreenProps } from '@react-navigation/native-stack'
import { RootStackParamList } from '../navigation/AppNavigator'
import {
	fetchInstructionById,
	Instruction
} from '../api/instructionsApi'

type Props = NativeStackScreenProps<RootStackParamList, 'InstructionDetails'>

// Экран деталей инструкции.
// Демонстрирует использование useEffect для загрузки одного ресурса по id из параметров маршрута.
const InstructionDetailsScreen: React.FC<Props> = ({ route }) => {
	const { id } = route.params

	const [instruction, setInstruction] = useState<Instruction | null>(null)
	const [isLoading, setIsLoading] = useState<boolean>(false)
	const [error, setError] = useState<string | null>(null)

	useEffect(() => {
		const load = async () => {
			setIsLoading(true)
			setError(null)

			try {
				const data = await fetchInstructionById(id)
				if (!data) {
					setError('Инструкция не найдена')
				} else {
					setInstruction(data)
				}
			} catch {
				setError('Не удалось загрузить инструкцию')
			} finally {
				setIsLoading(false)
			}
		}

		load()
	}, [id])

	if (isLoading) {
		return (
			<View style={styles.center}>
				<ActivityIndicator size='large' />
				<Text>Загружаем инструкцию...</Text>
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

	if (!instruction) {
		return (
			<View style={styles.center}>
				<Text>Инструкция не найдена</Text>
			</View>
		)
	}

	return (
		<View style={styles.container}>
			<Text style={styles.title}>{instruction.title}</Text>
			<Text style={styles.text}>{instruction.fullText}</Text>
		</View>
	)
}

const styles = StyleSheet.create({
	container: {
		flex: 1,
		padding: 16,
		gap: 16
	},
	title: {
		fontSize: 22,
		fontWeight: '600'
	},
	text: {
		fontSize: 16
	},
	center: {
		flex: 1,
		justifyContent: 'center',
		alignItems: 'center',
		padding: 16,
		gap: 12
	},
	error: {
		fontSize: 16,
		color: 'red',
		textAlign: 'center'
	}
})

export default InstructionDetailsScreen
