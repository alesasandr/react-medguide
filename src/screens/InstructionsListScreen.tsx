import { NativeStackScreenProps } from '@react-navigation/native-stack'
import React from 'react'
import {
	FlatList,
	StyleSheet,
	Text,
	TouchableOpacity,
	View,
} from 'react-native'
import { RootStackParamList } from '../navigation/AppNavigator'

type Props = NativeStackScreenProps<RootStackParamList, 'InstructionsList'>

type Instruction = {
	id: string
	title: string
	shortDescription: string
}

const MOCK_INSTRUCTIONS: Instruction[] = [
	{
		id: '1',
		title: 'Подготовка к анализу крови',
		shortDescription: 'Как подготовиться к сдаче анализа крови натощак.',
	},
	{
		id: '2',
		title: 'Послеоперационный уход',
		shortDescription: 'Основные рекомендации по уходу после операции.',
	},
]

const InstructionsListScreen: React.FC<Props> = ({ navigation }) => {
	return (
		<View style={styles.container}>
			<FlatList
				data={MOCK_INSTRUCTIONS}
				keyExtractor={item => item.id}
				renderItem={({ item }) => (
					<TouchableOpacity
						style={styles.card}
						onPress={() =>
							navigation.navigate('InstructionDetails', { id: item.id })
						}
					>
						<Text style={styles.title}>{item.title}</Text>
						<Text style={styles.description}>{item.shortDescription}</Text>
					</TouchableOpacity>
				)}
				ListHeaderComponent={
					<Text style={styles.header}>Инструкции для пациентов</Text>
				}
			/>
		</View>
	)
}

const styles = StyleSheet.create({
	container: {
		flex: 1,
		padding: 16,
	},
	header: {
		fontSize: 20,
		fontWeight: '600',
		marginBottom: 12,
	},
	card: {
		padding: 12,
		borderRadius: 8,
		borderWidth: 1,
		marginBottom: 10,
	},
	title: {
		fontSize: 16,
		fontWeight: '600',
		marginBottom: 4,
	},
	description: {
		fontSize: 14,
	},
})

export default InstructionsListScreen
