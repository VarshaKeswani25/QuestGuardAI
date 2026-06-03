// services/notificationService.js
// Real Push Notifications via expo-notifications + Firebase

import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';
import { db } from './firebaseConfig';
import { doc, setDoc, collection, addDoc, getDocs, query, orderBy, limit } from 'firebase/firestore';

// Configure how notifications appear when app is foreground
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
  }),
});

// ─────────────────────────────
// Request permission + get Expo push token
// Call this on app start for logged-in users
// ─────────────────────────────
export const registerForPushNotifications = async (userId) => {
  try {
    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;

    if (existingStatus !== 'granted') {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }

    if (finalStatus !== 'granted') {
      console.log('❌ Notification permission denied');
      return null;
    }

    // Android channel
    if (Platform.OS === 'android') {
      await Notifications.setNotificationChannelAsync('questguard', {
        name: 'QuestGuard Alerts',
        importance: Notifications.AndroidImportance.HIGH,
        vibrationPattern: [0, 250, 250, 250],
        lightColor: '#00D4FF',
      });
    }

    // Note: getExpoPushTokenAsync only works on physical devices, not simulators
    let token = null;
    try {
      const tokenData = await Notifications.getExpoPushTokenAsync({
        projectId: process.env.EXPO_PUBLIC_PROJECT_ID || undefined,
      });
      token = tokenData.data;
    } catch (tokenError) {
      console.log('⚠️ Push token unavailable (emulator or missing projectId):', tokenError.message);
      return null;
    }
    console.log('✅ Push token:', token);

    // Save token to Firestore so backend can send notifications
    if (userId) {
      await setDoc(doc(db, 'users', userId), {
        expoPushToken: token,
        tokenUpdatedAt: Date.now(),
      }, { merge: true });
    }

    return token;
  } catch (e) {
    console.log('❌ Push registration error:', e.message);
    return null;
  }
};

// ─────────────────────────────
// Save a notification to Firestore (for in-app notification screen)
// ─────────────────────────────
export const saveNotification = async (userId, { title, body, type = 'general', data = {} }) => {
  try {
    const notifRef = collection(db, 'users', userId, 'notifications');
    await addDoc(notifRef, {
      title,
      body,
      type,        // 'xp_earned' | 'quest_approved' | 'quest_rejected' | 'level_up' | 'general'
      data,
      read: false,
      createdAt: Date.now(),
    });
    console.log('✅ Notification saved to Firestore');
  } catch (e) {
    console.log('❌ saveNotification error:', e.message);
  }
};

// ─────────────────────────────
// Get notifications for a user from Firestore
// ─────────────────────────────
export const getUserNotifications = async (userId) => {
  try {
    const notifRef = collection(db, 'users', userId, 'notifications');
    const q = query(notifRef, orderBy('createdAt', 'desc'), limit(30));
    const snap = await getDocs(q);
    return snap.docs.map(d => ({ id: d.id, ...d.data() }));
  } catch (e) {
    console.log('❌ getUserNotifications error:', e.message);
    return [];
  }
};

// ─────────────────────────────
// Mark notification as read
// ─────────────────────────────
export const markNotificationRead = async (userId, notifId) => {
  try {
    await setDoc(doc(db, 'users', userId, 'notifications', notifId), { read: true }, { merge: true });
  } catch (e) {
    console.log('❌ markRead error:', e.message);
  }
};

// ─────────────────────────────
// Schedule a local notification (no server needed)
// ─────────────────────────────
export const scheduleLocalNotification = async (title, body, seconds = 1) => {
  try {
    await Notifications.scheduleNotificationAsync({
      content: { title, body, sound: true },
      trigger: { seconds },
    });
  } catch (e) {
    console.log('❌ scheduleLocalNotification error:', e.message);
  }
};

// ─────────────────────────────
// Notify child: XP earned
// ─────────────────────────────
export const notifyXPEarned = async (userId, xp, missionTitle) => {
  await scheduleLocalNotification(
    `⚡ +${xp} XP Earned!`,
    `You completed "${missionTitle}". Keep going! 🌱`
  );
  await saveNotification(userId, {
    title: `⚡ +${xp} XP Earned!`,
    body: `You completed "${missionTitle}". Keep going! 🌱`,
    type: 'xp_earned',
    data: { xp, missionTitle },
  });
};

// ─────────────────────────────
// Notify child: Quest approved by parent
// ─────────────────────────────
export const notifyQuestApproved = async (userId, questTitle) => {
  await scheduleLocalNotification(
    '✅ Quest Approved!',
    `Your parent approved "${questTitle}". Start now! 🚀`
  );
  await saveNotification(userId, {
    title: '✅ Quest Approved!',
    body: `Your parent approved "${questTitle}". Start now! 🚀`,
    type: 'quest_approved',
    data: { questTitle },
  });
};

// ─────────────────────────────
// Notify child: Level up
// ─────────────────────────────
export const notifyLevelUp = async (userId, newLevel, badge) => {
  await scheduleLocalNotification(
    `🏆 LEVEL UP! You're now Level ${newLevel}!`,
    `New badge unlocked: ${badge} 🎉`
  );
  await saveNotification(userId, {
    title: `🏆 Level ${newLevel} Reached!`,
    body: `New badge unlocked: ${badge} 🎉`,
    type: 'level_up',
    data: { newLevel, badge },
  });
};
