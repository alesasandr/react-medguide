// App.tsx
import React, { useEffect } from "react";
import {
  NavigationContainer,
  DefaultTheme,
  Theme,
} from "@react-navigation/native";
import AppNavigation from "./src/navigation/AppNavigation";
import { initDb } from "./src/db/database";

const navTheme: Theme = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    primary: "#3390ec",
    background: "#e9edf5",
    card: "#ffffff",
    text: "#111827",
    border: "#d1d5db",
    notification: "#ef4444",
  },
};

export default function App() {
  useEffect(() => {
    initDb().catch((err) => console.log("DB init error:", err));
  }, []);

  return (
    <NavigationContainer theme={navTheme}>
      <AppNavigation />
    </NavigationContainer>
  );
}
