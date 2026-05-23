// App.js — EcoGuardian: Agentic AI Eco-App for Karachi Children
// CSC4101 · SZABIST University · AI Semester Project

import React, { useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

// Screens
import SplashScreen from './screens/SplashScreen';
import HomeScreen from './screens/HomeScreen';
import MissionScreen from './screens/MissionScreen';

const Stack = createNativeStackNavigator();

export default function App() {

  useEffect(() => {
    console.log("🚀 EcoGuardian App Started");
  }, []);

  return (
    <NavigationContainer>
      <Stack.Navigator
        initialRouteName="Splash"

        screenOptions={{
          headerShown: false,
          animation: 'slide_from_right',
          contentStyle: { backgroundColor: '#052e16' },
        }}
      >

        {/* Splash Screen */}
        <Stack.Screen
          name="Splash"
          component={SplashScreen}
        />

        {/* Home Dashboard (AI Missions) */}
        <Stack.Screen
          name="Home"
          component={HomeScreen}
        />

        {/* Mission Detail Screen */}
        <Stack.Screen
          name="MissionDetail"
          component={MissionScreen}
        />

      </Stack.Navigator>
    </NavigationContainer>
  );
}

/*
═══════════════════════════════════════════════════
  SETUP NOTES
═══════════════════════════════════════════════════

✔ Firebase Project: ecoguardian-8b9cc
✔ Firestore: users collection required

═══════════════════════════════════════════════════
  FLOW
═══════════════════════════════════════════════════

Splash → Home → MissionDetail

Agent 1 → Home (generate missions)
Agent 2 → MissionDetail (tips)
Agent 3 → MissionDetail (verification + XP update)

═══════════════════════════════════════════════════
*/
