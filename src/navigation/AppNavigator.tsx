import { createNativeStackNavigator } from '@react-navigation/native-stack'
import React from 'react'
import HomeScreen from '../screens/HomeScreen'
import InstructionDetailsScreen from '../screens/InstructionDetailsScreen'
import InstructionsListScreen from '../screens/InstructionsListScreen'
import LoginScreen from '../screens/LoginScreen'
import ProfileScreen from '../screens/ProfileScreen'

export type RootStackParamList = {
	Login: undefined
	Home: undefined
	InstructionsList: undefined
	InstructionDetails: { id: string }
	Profile: undefined
}

const Stack = createNativeStackNavigator<RootStackParamList>()

const RootNavigator: React.FC = () => {
	return (
		<Stack.Navigator initialRouteName='Login'>
			<Stack.Screen
				name='Login'
				component={LoginScreen}
				options={{ title: 'Вход' }}
			/>
			<Stack.Screen
				name='Home'
				component={HomeScreen}
				options={{ title: 'Главная' }}
			/>
			<Stack.Screen
				name='InstructionsList'
				component={InstructionsListScreen}
				options={{ title: 'Инструкции' }}
			/>
			<Stack.Screen
				name='InstructionDetails'
				component={InstructionDetailsScreen}
				options={{ title: 'Инструкция' }}
			/>
			<Stack.Screen
				name='Profile'
				component={ProfileScreen}
				options={{ title: 'Личный кабинет' }}
			/>
		</Stack.Navigator>
	)
}

export default RootNavigator
