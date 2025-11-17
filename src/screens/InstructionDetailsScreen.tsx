// src/screens/InstructionDetailsScreen.tsx
import React, { useEffect, useState } from 'react'
import {
	View,
	Text,
	StyleSheet,
	ActivityIndicator,
	ScrollView
} from 'react-native'
import { NativeStackScreenProps } from '@react-navigation/native-stack'
import { RootStackParamList } from '../navigation/AppNavigator'
import {
	fetchInstructionById,
	Instruction
} from '../api/instructionsApi'

type Props = NativeStackScreenProps<RootStackParamList, 'InstructionDetails'>

// Экран деталей инструкции в стиле Telegram
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
			<View style={styles.root}>
				<View style={styles.cardCenter}>
					<ActivityIndicator size='large' color='#3390ec' />
					<Text style={styles.loadingText}>Загружаем инструкцию...</Text>
				</View>
			</View>
		)
	}

	if (error) {
		return (
			<View style={styles.root}>
				<View style={styles.cardCenter}>
					<Text style={styles.error}>{error}</Text>
				</View>
			</View>
		)
	}

	if (!instruction) {
		return (
			<View style={styles.root}>
				<View style={styles.cardCenter}>
					<Text style={styles.emptyText}>Инструкция не найдена</Text>
				</View>
			</View>
		)
	}

	return (
		<View style={styles.root}>
			<View style={styles.card}>
				<View style={styles.headerRow}>
					<View style={styles.iconCircle}>
						<Text style={styles.iconText}>📄</Text>
					</View>
					<View style={styles.headerTextBlock}>
						<Text style={styles.label}>Инструкция</Text>
						<Text style={styles.title}>{instruction.title}</Text>
						<Text style={styles.subtitle}>ID: {id}</Text>
					</View>
				</View>

				<ScrollView
					style={styles.scroll}
					contentContainerStyle={styles.scrollContent}
				>
					<Text style={styles.text}>{instruction.fullText}</Text>
				</ScrollView>
			</View>
		</View>
	)
}

const styles = StyleSheet.create({
	root: {
		flex: 1,
		backgroundColor: '#e9edf5',
		padding: 16
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
	cardCenter: {
		backgroundColor: '#ffffff',
		borderRadius: 20,
		padding: 16,
		shadowColor: '#000',
		shadowOpacity: 0.08,
		shadowRadius: 12,
		shadowOffset: { width: 0, height: 4 },
		elevation: 4,
		alignItems: 'center',
		justifyContent: 'center',
		gap: 12,
		flex: 1
	},
	headerRow: {
		flexDirection: 'row',
		alignItems: 'center',
		gap: 12
	},
	iconCircle: {
		width: 44,
		height: 44,
		borderRadius: 22,
		backgroundColor: '#d2e6ff',
		alignItems: 'center',
		justifyContent: 'center'
	},
	iconText: {
		fontSize: 24
	},
	headerTextBlock: {
		flex: 1,
		gap: 4
	},
	label: {
		fontSize: 12,
		color: '#3390ec',
		fontWeight: '500'
	},
	title: {
		fontSize: 18,
		fontWeight: '600',
		color: '#000'
	},
	subtitle: {
		fontSize: 12,
		color: '#6c6c6c'
	},
	scroll: {
		marginTop: 8
	},
	scrollContent: {
		paddingBottom: 16
	},
	text: {
		fontSize: 15,
		color: '#333',
		lineHeight: 22
	},
	loadingText: {
		fontSize: 15,
		color: '#4a4a4a',
		textAlign: 'center'
	},
	emptyText: {
		fontSize: 15,
		color: '#4a4a4a',
		textAlign: 'center'
	},
	error: {
		fontSize: 16,
		color: 'red',
		textAlign: 'center'
	}
})

export default InstructionDetailsScreen
