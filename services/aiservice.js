import { Platform } from "react-native";

const BACKEND_URL =
  process.env.EXPO_PUBLIC_BACKEND_URL ||
  (Platform.OS === "android" ? "http://10.0.2.2:3000" : "http://localhost:3000");

console.log("🔗 BACKEND_URL:", BACKEND_URL);

// ─────────────────────────────
// MISSIONS
// ─────────────────────────────
export const generateMissions = async (age = 12, previousMissions = []) => {
  try {
    console.log("🤖 Backend se missions maang raha hoon...", BACKEND_URL);

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 45000);

    const response = await fetch(`${BACKEND_URL}/generate-missions`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ location: "Karachi", age: parseInt(age) || 12 }),
      signal: controller.signal,
    });

    clearTimeout(timeout);

    if (!response.ok) throw new Error(`Backend error: ${response.status}`);

    const data = await response.json();
    const missions = data.missions || [];

    if (!Array.isArray(missions) || missions.length === 0)
      throw new Error("No missions from backend");

    console.log("✅ Backend se missions mile:", missions.length);
    return data;

  } catch (error) {
    console.log("⚠️ Backend offline:", error.message);
    return null;
  }
};

// ─────────────────────────────
// TIPS
// ─────────────────────────────
export const getMissionTips = async (title, category) => {
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 15000);

    const response = await fetch(`${BACKEND_URL}/get-tips`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title, category }),
      signal: controller.signal,
    });

    clearTimeout(timeout);

    if (!response.ok) throw new Error(`Tips backend error: ${response.status}`);

    return await response.json();

  } catch (error) {
    console.log("⚠️ Tips backend offline:", error.message);
    const tips = {
      "Carbon Garden": "Plant native greenery, reuse organic waste as compost.",
      "Clean Karachi": "Separate recyclable waste, avoid single-use plastic.",
      "Water Mission": "Turn off taps when not needed.",
      "Heritage Quest": "Respect public spaces, avoid littering.",
      "Air Watch": "Avoid unnecessary smoke pollution.",
    };
    return { tips: tips[category] || "Follow eco-friendly practices." };
  }
};

// ─────────────────────────────
// VERIFY
// ─────────────────────────────
export const verifyMissionCompletion = async (
  title,
  steps = [],
  beforeImage = null,
  afterImage = null
) => {
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 60000);

    const response = await fetch(`${BACKEND_URL}/verify-mission`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title, steps, beforeImage, afterImage }),
      signal: controller.signal,
    });

    clearTimeout(timeout);

    if (!response.ok) throw new Error(`Verify backend error: ${response.status}`);

    return await response.json();

  } catch (error) {
    console.log("⚠️ Verify backend offline:", error.message);
    const completed = steps.filter((s) => s.done).length;
    if (completed === steps.length && beforeImage && afterImage) {
      return {
        verified: true,
        message: "Great job! Mission complete! ✅",
        xpBonus: 50,
        badge: "Eco Hero 🌳",
      };
    }
    return {
      verified: false,
      message: "Complete all steps and add both photos.",
      xpBonus: 0,
    };
  }
};