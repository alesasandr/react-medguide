// src/navigation/AppNavigation.tsx
import React from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";

// экраны
import LoginScreen from "../screens/LoginScreen";
import RegisterScreen from "../screens/RegisterScreen";
import ResetPasswordScreen from "../screens/ResetPasswordScreen";
import HomeScreen from "../screens/HomeScreen";
import ProfileScreen from "../screens/ProfileScreen";
import InstructionsListScreen from "../screens/InstructionsListScreen";
import InstructionDetailsScreen from "../screens/InstructionDetailsScreen";
import ChatScreen from "../screens/ChatScreen";
import MedicinesListScreen from "../screens/MedicinesListScreen";
import MedicineDetailsScreen from "../screens/MedicineDetailsScreen";
import MedicineCodeSearchScreen from "../screens/MedicineCodeSearchScreen";
import ScanMedicineScreen from "../screens/ScanMedicineScreen";
import IssuedHistoryScreen from "../screens/IssuedHistoryScreen";

export type RootStackParamList = {
  Login: undefined;
  Register: undefined;
  ResetPassword: undefined;
  Home: undefined;
  Profile: undefined;
  IssuedHistory: undefined;
  InstructionsList: undefined;
  InstructionDetails: { id: number };
  Chat: undefined;
  MedicinesList: undefined;
  MedicineDetails: { id: number };
  MedicineCodeSearch: undefined;
  ScanMedicine: undefined;
};

const Stack = createNativeStackNavigator<RootStackParamList>();

const AppNavigation: React.FC = () => {
  return (
    <Stack.Navigator initialRouteName="Login">
      <Stack.Screen
        name="Login"
        component={LoginScreen}
        options={{ headerShown: false }}
      />

      <Stack.Screen
        name="Register"
        component={RegisterScreen}
        options={{
          title: "Регистрация",
          headerBackTitle: "Назад",
        }}
      />

      <Stack.Screen
        name="ResetPassword"
        component={ResetPasswordScreen}
        options={{ title: "Восстановить пароль" }}
      />

      <Stack.Screen
        name="Home"
        component={HomeScreen}
        options={{ title: "Главная" }}
      />

      <Stack.Screen
        name="Profile"
        component={ProfileScreen}
        options={{ title: "Профиль" }}
      />

      <Stack.Screen
        name="IssuedHistory"
        component={IssuedHistoryScreen}
        options={{ title: "История выданных препаратов" }}
      />

      <Stack.Screen
        name="InstructionsList"
        component={InstructionsListScreen}
        options={{ title: "Инструкции" }}
      />

      <Stack.Screen
        name="InstructionDetails"
        component={InstructionDetailsScreen}
        options={{ title: "Инструкция" }}
      />

      <Stack.Screen
        name="Chat"
        component={ChatScreen}
        options={{ title: "Чат" }}
      />

      <Stack.Screen
        name="MedicinesList"
        component={MedicinesListScreen}
        options={{ title: "Препараты" }}
      />

      <Stack.Screen
        name="MedicineDetails"
        component={MedicineDetailsScreen}
        options={{ title: "Препарат" }}
      />

      <Stack.Screen
        name="MedicineCodeSearch"
        component={MedicineCodeSearchScreen}
        options={{ title: "Поиск по артикулу" }}
      />

      <Stack.Screen
        name="ScanMedicine"
        component={ScanMedicineScreen}
        options={{ title: "Сканировать препарат" }}
      />
    </Stack.Navigator>
  );
};

export default AppNavigation;
