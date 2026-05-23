// ─────────────────────────────────────────────
// EcoGuardian Auth Service
// Handles login user + UID access
// ─────────────────────────────────────────────

import { auth } from "./firebaseConfig";
import {
  signInAnonymously,
  onAuthStateChanged
} from "firebase/auth";

// ─────────────────────────────
// 👤 GET CURRENT USER ID
// ─────────────────────────────
export const getCurrentUserId = () => {
  return auth.currentUser?.uid || null;
};

// ─────────────────────────────
// 🚀 AUTO LOGIN (Anonymous for now)
// ─────────────────────────────
export const initAuth = async () => {
  try {
    const user = await signInAnonymously(auth);
    console.log("✅ User logged in:", user.user.uid);
    return user.user;
  } catch (error) {
    console.log("❌ Auth Error:", error.message);
  }
};

// ─────────────────────────────
// 👂 LISTEN AUTH CHANGES
// ─────────────────────────────
export const listenAuthChanges = (callback) => {
  return onAuthStateChanged(auth, (user) => {
    callback(user);
  });
};