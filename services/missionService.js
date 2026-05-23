// services/missionService.js
// ISSUE 7 FIX: completeMission is now properly used via MissionScreen
// This service handles mission completion events

import { addXP } from "./userService";

/**
 * Mission Complete Handler
 * Called when user successfully completes a mission
 * Adds XP using centralized userService (addXP)
 */
export const completeMission = async (userId, missionXP) => {
  try {
    if (!userId || typeof missionXP !== "number") {
      console.log("❌ Invalid mission data");
      return null;
    }

    console.log("🚀 Mission Completed Event Triggered");

    const updatedProfile = await addXP(userId, missionXP);

    if (updatedProfile) {
      console.log("💰 XP Successfully Added:", missionXP);
      console.log("⭐ New Total XP:", updatedProfile.xp);
      console.log("🏆 New Level:", updatedProfile.level);
      console.log("🎖 New Badge:", updatedProfile.badge);
    }

    return updatedProfile;

  } catch (error) {
    console.log("❌ Mission Service Error:", error.message);
    return null;
  }
};
