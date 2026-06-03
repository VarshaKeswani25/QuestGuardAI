import React, { useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { SafeAreaProvider } from "react-native-safe-area-context";

// Screens
import SplashScreen from './src/Screen/SplashScreen';
import LoginScreen from './src/Screen/LoginScreen';
import QuestListScreen from './src/Screen/QuestListScreen';
import ChildProfileScreen from './src/Screen/ChildProfileScreen';
import NotificationScreen from './src/Screen/NotificationScreen';

import ParentLoginScreen from './src/Screen/ParentLoginScreen';
import ParentDashboardScreen from './src/Screen/ParentDashboardScreen';
import ParentMapScreen from './src/Screen/ParentMapScreen';
import ParentQuestApproval from './src/Screen/ParentQuestApproval';
import ParentQuestTrackScreen from './src/Screen/ParentQuestTrackScreen';
import HomeScreen from './src/Screen/HomeScreen';
import MissionScreen from './src/Screen/MissionScreen';
import { initAuth } from './services/authService';
const Stack = createNativeStackNavigator();

export default function App() {

  useEffect(() => {
    const startup = async () => {
      console.log("🚀 EcoGuardian App Started");
      await initAuth();
    };
    startup();
  }, []);

  return (
     <SafeAreaProvider>
    <NavigationContainer>
      <Stack.Navigator
        initialRouteName="Splash"
        screenOptions={{
          headerShown: false
        }}
      >

        {/* Splash */}
        <Stack.Screen
          name="Splash"
          component={SplashScreen}
        />

        {/* Child Auth */}
        <Stack.Screen
          name="LoginScreen"
          component={LoginScreen}
        />

        {/* Missions */}
        <Stack.Screen
          name="QuestList"
          component={QuestListScreen}
        />

        {/* Child */}
        <Stack.Screen
          name="ChildProfile"
          component={ChildProfileScreen}
        />

        <Stack.Screen
          name="Notifications"
          component={NotificationScreen}
        />

        {/* Parent */}
        <Stack.Screen
          name="ParentLogin"
          component={ParentLoginScreen}
        />

        <Stack.Screen
          name="ParentDashboard"
          component={ParentDashboardScreen}
        />

        <Stack.Screen
          name="ParentMap"
          component={ParentMapScreen}
        />

        <Stack.Screen
          name="ParentQuestApproval"
          component={ParentQuestApproval}
        />

        <Stack.Screen
          name="ParentQuestTrack"
          component={ParentQuestTrackScreen}
        />

        <Stack.Screen name="Home" component={HomeScreen} />
        <Stack.Screen name="MissionDetail" component={MissionScreen} />

      </Stack.Navigator>
    </NavigationContainer>
    </SafeAreaProvider>
  );
}