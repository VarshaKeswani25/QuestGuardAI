// services/userService.js
// ─────────────────────────────────────────────
// EcoGuardian XP + Level System
// CSC4101 · SZABIST AI Project
//
// 💰 Handles:
// - XP rewards
// - Level progression
// - Badge unlocks
// - Firestore updates
// - User profile fetching
// - Streak tracking
// - Completed missions tracking
// - Leaderboard system
// ─────────────────────────────────────────────

import { db } from "./firebaseConfig";

import {
  doc,
  getDoc,
  setDoc,
  collection,
  query,
  orderBy,
  limit,
  getDocs
} from "firebase/firestore";

// ─────────────────────────────
// 🧠 LEVEL + BADGE SYSTEM
// Converts XP → Level + Badge
// ─────────────────────────────
const getLevelData = (xp) => {

  // 🌱 Beginner
  if (xp < 50) {

    return {
      level: 1,
      badge: "Beginner 🌱"
    };
  }

  // 🌿 Explorer
  if (xp < 150) {

    return {
      level: 2,
      badge: "Explorer 🌿"
    };
  }

  // 🌳 Eco Hero
  if (xp < 300) {

    return {
      level: 3,
      badge: "Eco Hero 🌳"
    };
  }

  // 🌍 Earth Guardian
  if (xp < 500) {

    return {
      level: 4,
      badge: "Earth Guardian 🌍"
    };
  }

  // ⚡ Climate Warrior
  if (xp < 800) {

    return {
      level: 5,
      badge: "Climate Warrior ⚡"
    };
  }

  // 👑 Eco Legend
  return {

    level: 6,
    badge: "Eco Legend 👑"
  };
};

// ─────────────────────────────
// 📅 GET TODAY DATE
// Used for streak system
// ─────────────────────────────
const getTodayDate = () => {

  return new Date()
    .toISOString()
    .split("T")[0];
};

// ─────────────────────────────
// 👤 DEFAULT USER PROFILE
// ─────────────────────────────
const getDefaultProfile = () => {

  return {

    xp: 0,

    level: 1,

    badge: "Beginner 🌱",

    streak: 0,

    lastCompletedDate: "",

    completedMissions: 0
  };
};

// ─────────────────────────────
// 👤 GET USER DATA
// Fetch XP + Level + Badge
// ─────────────────────────────
export const getUserData = async (
  userId
) => {

  try {

    // ✅ USER ID CHECK
    if (!userId) {

      console.log("❌ No User ID");

      return null;
    }

    // Firestore reference
    const userRef = doc(
      db,
      "users",
      userId
    );

    // Get document
    const userSnap =
      await getDoc(userRef);

    // ─────────────────────────
    // EXISTING USER
    // ─────────────────────────
    if (userSnap.exists()) {

      console.log(
        "✅ USER DATA:",
        userSnap.data()
      );

      return {

        ...getDefaultProfile(),

        ...userSnap.data()
      };
    }

    // ─────────────────────────
    // DEFAULT PROFILE
    // ─────────────────────────
    console.log(
      "⚠️ User not found → creating default profile"
    );

    return getDefaultProfile();

  } catch (error) {

    console.log(
      "❌ GET USER ERROR:",
      error.message
    );

    return getDefaultProfile();
  }
};

// ─────────────────────────────
// 👤 ALIAS FOR SCREENS
// ─────────────────────────────
export const getUserProfile =
  getUserData;

// ─────────────────────────────
// 💰 MAIN XP FUNCTION
// Adds XP after mission completion
// ─────────────────────────────
export const addXP = async (
  userId,
  earnedXP
) => {

  try {

    // ✅ USER ID CHECK
    if (!userId) {

      console.log("❌ No User ID");

      return null;
    }

    // Firestore reference
    const userRef = doc(
      db,
      "users",
      userId
    );

    // Existing user data
    const userSnap =
      await getDoc(userRef);

    // ─────────────────────────
    // DEFAULT VALUES
    // ─────────────────────────
    let currentXP = 0;

    let completedMissions = 0;

    let streak = 0;

    let lastCompletedDate = "";

    // ─────────────────────────
    // EXISTING USER DATA
    // ─────────────────────────
    if (userSnap.exists()) {

      const userData =
        userSnap.data();

      currentXP =
        userData.xp || 0;

      completedMissions =
        userData.completedMissions || 0;

      streak =
        userData.streak || 0;

      lastCompletedDate =
        userData.lastCompletedDate || "";

    } else {

      console.log(
        "🆕 Creating new user..."
      );
    }

    // ─────────────────────────
    // CALCULATE NEW XP
    // ─────────────────────────
    const newXP =
      currentXP + earnedXP;

    // ─────────────────────────
    // LEVEL + BADGE
    // ─────────────────────────
    const {
      level,
      badge
    } = getLevelData(newXP);

    // ─────────────────────────
    // MISSION COUNT
    // ─────────────────────────
    completedMissions += 1;

    // ─────────────────────────
    // STREAK SYSTEM
    // ─────────────────────────
    const today =
      getTodayDate();

    if (
      lastCompletedDate !== today
    ) {

      streak += 1;
    }

    // ─────────────────────────
    // SAVE TO FIRESTORE
    // ─────────────────────────
    await setDoc(

      userRef,

      {

        xp: newXP,

        level,

        badge,

        streak,

        completedMissions,

        lastCompletedDate: today,

        updatedAt: Date.now()
      },

      {
        merge: true
      }
    );

    // ─────────────────────────
    // LOGS
    // ─────────────────────────
    console.log(
      "💰 XP Added:",
      earnedXP
    );

    console.log(
      "⭐ Total XP:",
      newXP
    );

    console.log(
      "🏆 Level:",
      level
    );

    console.log(
      "🎖 Badge:",
      badge
    );

    console.log(
      "🔥 Streak:",
      streak
    );

    console.log(
      "✅ Completed Missions:",
      completedMissions
    );

    // ─────────────────────────
    // RETURN UPDATED PROFILE
    // ─────────────────────────
    return {

      xp: newXP,

      level,

      badge,

      streak,

      completedMissions,

      lastCompletedDate: today
    };

  } catch (error) {

    console.log(
      "❌ ADD XP ERROR:",
      error.message
    );

    return null;
  }
};

// ─────────────────────────────
// 🔧 ADMIN / DEBUG XP UPDATE
// Directly overwrite XP value
// ─────────────────────────────
export const updateXP = async (
  userId,
  newXP
) => {

  try {

    // ✅ USER ID CHECK
    if (!userId) {

      console.log("❌ No User ID");

      return null;
    }

    // Firestore reference
    const userRef = doc(
      db,
      "users",
      userId
    );

    // Existing user data
    const userSnap =
      await getDoc(userRef);

    let existingData = {};

    if (userSnap.exists()) {

      existingData =
        userSnap.data();
    }

    // ─────────────────────────
    // LEVEL + BADGE
    // ─────────────────────────
    const {
      level,
      badge
    } = getLevelData(newXP);

    // ─────────────────────────
    // UPDATE FIRESTORE
    // ─────────────────────────
    await setDoc(

      userRef,

      {

        ...existingData,

        xp: newXP,

        level,

        badge,

        updatedAt: Date.now()
      },

      {
        merge: true
      }
    );

    console.log(
      "🔧 XP UPDATED:",
      newXP
    );

    return {

      xp: newXP,

      level,

      badge
    };

  } catch (error) {

    console.log(
      "❌ UPDATE XP ERROR:",
      error.message
    );

    return null;
  }
};

// ─────────────────────────────
// 🏆 GET LEADERBOARD
// Top eco guardians by XP
// ─────────────────────────────
export const getLeaderboard = async () => {

  try {

    const q = query(

      collection(db, "users"),

      orderBy("xp", "desc"),

      limit(10)
    );

    const querySnapshot =
      await getDocs(q);

    const leaderboard = [];

    querySnapshot.forEach((doc) => {

      leaderboard.push({

        id: doc.id,

        ...doc.data()
      });

    });

    console.log(
      "🏆 Leaderboard Loaded:",
      leaderboard.length
    );

    return leaderboard;

  } catch (error) {

    console.log(
      "❌ LEADERBOARD ERROR:",
      error.message
    );

    return [];
  }
};