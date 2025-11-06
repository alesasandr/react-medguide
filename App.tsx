import { NavigationContainer } from '@react-navigation/native'
import React from 'react'
import AppNavigator from './src/navigation/AppNavigator'

// Корневой компонент приложения MedGuide.
// Отвечает только за подключение контейнера навигации и навигатора экранов.
export default function App() {
	return (
		<NavigationContainer>
			<AppNavigator />
		</NavigationContainer>
	)
}
