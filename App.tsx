// App.tsx
import React, { useEffect } from "react";
import { NavigationContainer } from "@react-navigation/native";
import AppNavigation from "./src/navigation/AppNavigation";
import { initDb } from "./src/db/database";

export default function App() {
  useEffect(() => {
    initDb().catch(err => console.log("DB init error:", err));
  }, []);

  return (
    <NavigationContainer>
      <AppNavigation />
    </NavigationContainer>
  );
}
