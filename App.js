// App.js — EcoGuardian: Agentic AI Eco-App for Karachi Children
// CSC4101 · SZABIST University · AI Semester Project

import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import SplashScreen from './screens/SplashScreen';
import HomeScreen from './screens/HomeScreen';
import MissionDetailScreen from './screens/MissionScreen';

const Stack = createNativeStackNavigator();

export default function App() {
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
        {/* Screen 1: Splash / Onboarding */}
        <Stack.Screen name="Splash" component={SplashScreen} />

        {/* Screen 2: Home Dashboard — AI generates missions */}
        <Stack.Screen name="Home" component={HomeScreen} />

        {/* Screen 3: Mission Detail — AI tips + AI verification */}
        <Stack.Screen name="MissionDetail" component={MissionDetailScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}

/*
═══════════════════════════════════════════════════
  SETUP INSTRUCTIONS
═══════════════════════════════════════════════════

  1. Install dependencies:
     npm install @react-navigation/native @react-navigation/native-stack
     npm install react-native-screens react-native-safe-area-context

  2. Create a .env file in root:
     EXPO_PUBLIC_GEMINI_API_KEY=AIzaSy...

  3. Run:
     npx expo start

═══════════════════════════════════════════════════
  AGENTIC AI ARCHITECTURE (3 Agents)
═══════════════════════════════════════════════════

  Agent 1 — Mission Generator (HomeScreen)
  ├── Triggered: on app load + pull-to-refresh
  ├── Input: child age, completed mission IDs
  ├── Output: 4 dynamic JSON missions (eco tasks for Karachi)
  └── Pattern: Goal-based agent → generates new missions each session

  Agent 2 — Contextual Tip Agent (MissionDetailScreen)
  ├── Triggered: when mission detail screen opens
  ├── Input: mission title + category
  ├── Output: reasoning, 3 localized tips, 1 Karachi fact
  └── Pattern: ReAct (Reason + Act) → reasons about Karachi context

  Agent 3 — Verification Agent (MissionDetailScreen)
  ├── Triggered: when child taps "Submit for AI Verification"
  ├── Input: mission title + completed/pending steps
  ├── Output: verified bool, message, XP bonus, badge, next suggestion
  └── Pattern: Agentic loop with animated log showing reasoning steps

═══════════════════════════════════════════════════
  NAVIGATION FLOW
═══════════════════════════════════════════════════

  SplashScreen
    ↓ "Begin My Mission" / "Log in"
  HomeScreen  ← Agent 1 fires here (generates missions)
    ↓ Tap any mission card
  MissionDetailScreen  ← Agent 2 fires here (tips)
    ↓ Complete all steps → "Submit for AI Verification"
    ↓ Agent 3 fires (verification loop with animated log)
    ↓ "Back to Missions"
  HomeScreen

═══════════════════════════════════════════════════
  COPPA 2025 COMPLIANCE NOTES
═══════════════════════════════════════════════════
  ✅ No real names — anonymous IDs only
  ✅ No biometric storage
  ✅ City-level location only
  ✅ All data minimization by default
  ✅ Parental consent gate on Splash
*/