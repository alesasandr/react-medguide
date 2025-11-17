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

// Экран списка инструкций в стиле Telegram
const InstructionsListScreen: React.FC<Props> = ({ navigation }) => {
	const { instructions, isLoading, error } = useInstructions()

	const renderItem = ({ item }: { item: Instruction }) => (
		<TouchableOpacity
			style={styles.item}
			onPress={() =>
				navigation.navigate('InstructionDetails', { id: item.id })
			}
		>
			<View style={styles.itemTextBlock}>
				<Text style={styles.itemTitle}>{item.title}</Text>
				<Text style={styles.itemDescription} numberOfLines={2}>
					{item.shortDescription}
				</Text>
			</View>
			<Text style={styles.itemChevron}>{'›'}</Text>
		</TouchableOpacity>
	)

	if (isLoading) {
		return (
			<View style={styles.root}>
				<View style={styles.cardCenter}>
					<ActivityIndicator size='large' color='#3390ec' />
					<Text style={styles.centerText}>Загружаем инструкции...</Text>
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

	return (
		<View style={styles.root}>
			<View style={styles.card}>
				<Text style={styles.header}>Инструкции для пациентов</Text>

				<FlatList
					data={instructions}
					keyExtractor={(item) => item.id}
					renderItem={renderItem}
					contentContainerStyle={styles.listContent}
				/>
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
		elevation: 4
	},
	cardCenter: {
		flex: 1,
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
		gap: 12
	},
	header: {
		fontSize: 18,
		fontWeight: '600',
		color: '#000',
		marginBottom: 12
	},
	listContent: {
		gap: 8,
		paddingBottom: 8
	},
	item: {
		flexDirection: 'row',
		alignItems: 'center',
		paddingVertical: 10,
		paddingHorizontal: 12,
		backgroundColor: '#ffffff',
		borderRadius: 16,
		shadowColor: '#000',
		shadowOpacity: 0.04,
		shadowRadius: 8,
		shadowOffset: { width: 0, height: 2 },
		elevation: 2
	},
	itemTextBlock: {
		flex: 1,
		gap: 2
	},
	itemTitle: {
		fontSize: 15,
		fontWeight: '600',
		color: '#000'
	},
	itemDescription: {
		fontSize: 13,
		color: '#6c6c6c'
	},
	itemChevron: {
		fontSize: 22,
		color: '#b0b0b0',
		marginLeft: 8
	},
	centerText: {
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

export default InstructionsListScreen
