// services/authService.js
// EcoGuardian Auth Service — Firebase Auth (Email/Password + Google)

import { auth } from "./firebaseConfig";
import {
  signInAnonymously,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  sendPasswordResetEmail,
  onAuthStateChanged,
  signOut,
  GoogleAuthProvider,
  signInWithCredential,
} from "firebase/auth";

import * as Google from "expo-auth-session/providers/google";
import * as WebBrowser from "expo-web-browser";

WebBrowser.maybeCompleteAuthSession();

const WEB_CLIENT_ID = process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID || null;

// ─────────────────────────────
// Google OAuth Hook
// Usage inside a component:
//   const { promptGoogleLogin, googleReady, googleResponse, handleGoogleResponse } = useGoogleAuth(onSuccess, onError);
//   useEffect(() => { if (googleResponse) handleGoogleResponse(); }, [googleResponse]);
// ─────────────────────────────
export const useGoogleAuth = (onSuccess, onError) => {
  // Only configure if client ID is set — avoids crash when not configured
  const config = WEB_CLIENT_ID
  ? {
      webClientId: WEB_CLIENT_ID,
      androidClientId: WEB_CLIENT_ID,
    }
  : {
      webClientId: "DISABLED",
      androidClientId: "DISABLED",
    };

const [request, response, promptAsync] = WEB_CLIENT_ID
  ? Google.useAuthRequest(config)
  : [null, null, async () => {}];

  const handleGoogleResponse = async () => {
    if (!response) return;

    if (response.type === "success") {
      const { id_token } = response.params;
      try {
        const credential = GoogleAuthProvider.credential(id_token);
        const userCredential = await signInWithCredential(auth, credential);
        console.log("✅ Google Sign-In success:", userCredential.user.uid);
        onSuccess && onSuccess(userCredential.user);
      } catch (error) {
        console.log("❌ Google credential error:", error.code);
        onError && onError(getAuthErrorMessage(error.code));
      }
    } else if (response.type === "error") {
      console.log("❌ Google OAuth error");
      onError && onError("Google sign-in failed. Please try again.");
    }
  };

  const promptGoogleLogin = async () => {
    if (!WEB_CLIENT_ID) {
      onError && onError("Google Sign-In not configured. Please add EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID to .env");
      return;
    }
    await promptAsync();
  };

  return {
    promptGoogleLogin,
    googleResponse: response,
    handleGoogleResponse,
    googleReady: !!request && !!WEB_CLIENT_ID,
  };
};

// ─────────────────────────────
// Email/Password Auth
// ─────────────────────────────
export const loginWithEmail = async (email, password) => {
  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    console.log("✅ Child logged in:", userCredential.user.uid);
    return { success: true, user: userCredential.user };
  } catch (error) {
    console.log("❌ Login Error:", error.code);
    return { success: false, error: getAuthErrorMessage(error.code) };
  }
};

export const registerWithEmail = async (email, password, name, age) => {
  try {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    console.log("✅ Registered:", userCredential.user.uid);
    return { success: true, user: userCredential.user, name, age };
  } catch (error) {
    console.log("❌ Register Error:", error.code);
    return { success: false, error: getAuthErrorMessage(error.code) };
  }
};

export const parentLoginWithEmail = async (email, password) => {
  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    console.log("✅ Parent logged in:", userCredential.user.uid);
    return { success: true, user: userCredential.user };
  } catch (error) {
    console.log("❌ Parent Login Error:", error.code);
    return { success: false, error: getAuthErrorMessage(error.code) };
  }
};

export const parentRegisterWithEmail = async (email, password, name) => {
  try {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    console.log("✅ Parent registered:", userCredential.user.uid);
    return { success: true, user: userCredential.user, name };
  } catch (error) {
    console.log("❌ Parent Register Error:", error.code);
    return { success: false, error: getAuthErrorMessage(error.code) };
  }
};

export const resetPassword = async (email) => {
  try {
    await sendPasswordResetEmail(auth, email);
    console.log("✅ Password reset sent to:", email);
    return { success: true };
  } catch (error) {
    console.log("❌ Password Reset Error:", error.code);
    return { success: false, error: getAuthErrorMessage(error.code) };
  }
};

// ─────────────────────────────
// Utilities
// ─────────────────────────────
export const getCurrentUserId = () => auth.currentUser?.uid || null;

export const initAuth = async () => {
  try {
    if (auth.currentUser) return auth.currentUser;
    const result = await signInAnonymously(auth);
    console.log("✅ Anonymous session ready:", result.user.uid);
    return result.user;
  } catch (error) {
    console.log("❌ Auth Init Error:", error.message);
    return null;
  }
};

export const logOut = async () => {
  try {
    await signOut(auth);
    console.log("✅ User signed out");
    return { success: true };
  } catch (error) {
    console.log("❌ Sign Out Error:", error.message);
    return { success: false };
  }
};

export const listenAuthChanges = (callback) => {
  return onAuthStateChanged(auth, (user) => callback(user));
};

// ─────────────────────────────
// Error messages
// ─────────────────────────────
const getAuthErrorMessage = (code) => {
  switch (code) {
    case "auth/user-not-found":       return "No account found with this email.";
    case "auth/wrong-password":       return "Incorrect password. Please try again.";
    case "auth/invalid-credential":   return "Invalid email or password.";
    case "auth/email-already-in-use": return "This email is already registered.";
    case "auth/weak-password":        return "Password must be at least 6 characters.";
    case "auth/invalid-email":        return "Please enter a valid email address.";
    case "auth/too-many-requests":    return "Too many attempts. Please try again later.";
    case "auth/network-request-failed": return "Network error. Please check your connection.";
    default: return "An error occurred. Please try again.";
  }
};
