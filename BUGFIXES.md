# QuestGuard AI — Bug Fix Log

## Critical Bugs Fixed (5)

### 1. `navigation.back()` → `navigation.goBack()` [CRASH FIX]
**Files:** ParentQuestApproval.jsx, NotificationScreen.jsx, ParentQuestTrackScreen.jsx, ParentMapScreen.jsx  
`navigation.back()` does not exist in React Navigation. All 4 files updated to use `navigation.goBack()`.

### 2. LoginScreen & ParentLoginScreen — Real Firebase Auth [SECURITY FIX]
**Files:** LoginScreen.jsx, ParentLoginScreen.jsx, authService.js  
Both login screens previously ignored credentials and navigated unconditionally. Now wired to Firebase `signInWithEmailAndPassword` / `createUserWithEmailAndPassword`. Forgot Password now calls `sendPasswordResetEmail`.

### 3. `.env` — Removed trailing `=` from BACKEND_URL [API FIX]
**File:** .env  
`EXPO_PUBLIC_BACKEND_URL=http://127.0.0.1:3000=` had a trailing `=` making the URL invalid. Fixed to `http://10.0.2.2:3000` (Android emulator default). Physical device users should replace with their PC's local IP.

### 4. QuestListScreen — Filter now works [UI FIX]
**File:** QuestListScreen.jsx  
`FlatList` was given `data={QUESTS}` instead of `data={filtered}`. Fixed. Filter buttons now actually filter the list.

### 5. MissionScreen — Null userId now redirects to Login [CRASH FIX]
**File:** MissionScreen.jsx  
Added guard: if `auth.currentUser` is null, user is redirected to LoginScreen with an alert instead of silently hanging on a spinner.

---

## Functional Bugs Fixed (7)

### 6. Coordinator Agent — Exception fallback no longer auto-approves [LOGIC FIX]
**File:** backend/agents/coordinator_agent.py  
`except` block was returning `verified` and awarding 40 XP on any error. Fixed to return `retry_required` on exception.

### 7. Coordinator Agent — Removed debug API key print [SECURITY FIX]
**File:** backend/agents/coordinator_agent.py  
Removed `print("Gemini Key:", os.getenv(...))` that exposed the key on every server start.

### 8. graph.py — Removed duplicate `complete_mission` call [LOGIC FIX]
**File:** backend/workflow/graph.py  
`verify_mission()` already calls `complete_mission()` internally on success. The extra call after it was double-appending the "Community Hero" badge.

### 9. MissionScreen — XP/Level popups moved outside ScrollView [UI FIX]
**File:** MissionScreen.jsx  
`xpPopup` and `levelPopup` were `position:absolute` children of `ScrollView` which clips them. Moved to root `View` so they render as true overlays.

### 10. ChildProfileScreen — Real Firestore data instead of hardcoded values [DATA FIX]
**File:** ChildProfileScreen.jsx  
Previously showed "Alex the Hero, Level 5, 3480 XP" for every user. Now calls `getUserProfile(userId)` and displays real XP, level, badge, streak, and completed missions. Added Logout button.

### 11. Google Sign-In buttons removed (were non-functional) [UI FIX]
**Files:** LoginScreen.jsx, ParentLoginScreen.jsx  
Buttons had no `onPress` handler. Removed to avoid confusion.

### 12. HomeScreen — Bottom navigation bar added [UX FIX]
**File:** HomeScreen.jsx  
No way to navigate to Profile, QuestList, or Notifications from Home. Added bottom nav bar consistent with other screens.

---

## Warnings Fixed (4)

### 13. `.env` added to `.gitignore` [SECURITY]
Firebase keys and Gemini API key are no longer committed to the repo.

### 14. Demo Mode banners added [TRANSPARENCY]
**Files:** ParentDashboardScreen.jsx, ParentQuestTrackScreen.jsx, ParentMapScreen.jsx, NotificationScreen.jsx  
All screens showing hardcoded/static data now display a clear "⚠️ Demo Mode" banner so users aren't misled.

### 15. Stale files removed [CLEANUP]
**Files:** agents/ (root level), T06_planning_agent.py  
Two unused Python files at project root removed. The actual agent is `backend/agents/planning_agent.py`.

### 16. `initAuth()` called on app start [STABILITY]
**File:** App.jsx  
Firebase anonymous auth is now initialized when the app starts to ensure a valid session exists even before login.

---

## Known Design Gaps (Not Yet Implemented)
These require additional backend work and are documented for future sprints:

- **Real parent-child linking:** Needs a Firestore `parents/{uid}/children` collection and child link code generation/validation.
- **Push notifications:** Requires Firebase Cloud Messaging (FCM) setup and an Expo notification service worker.
- **Real GPS map:** Requires `react-native-maps` + `expo-location` integration in ParentMapScreen.
- **QuestList ↔ HomeScreen sync:** The two mission systems (AI-generated vs static) should share a unified Firestore `missions` collection.
