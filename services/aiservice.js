// services/aiservice.js
// ─────────────────────────────────────────────
// EcoGuardian AI Service Layer
// CSC4101 · SZABIST Project
// ─────────────────────────────────────────────

// 🛑 APNE LAPTOP KA IP ADDRESS YAHAN LIKHEIN (e.g., http://111.222.3.4:3000)
// Mobile physical device par localhost nahi chalta!
const BACKEND_URL = "http://192.168.1.104:3000"; 

const categories = [
  "Carbon Garden",
  "Clean Karachi",
  "Water Mission",
  "Heritage Quest",
  "Air Watch"
];

const emojis = ["🌱", "🚮", "💧", "🏛️", "🌫️"];
const difficulties = ["Easy", "Medium", "Hard"];
const tags = ["Daily", "Weekly", "Special"];

const missionTemplates = [
  {
    title: "Plant a Balcony Garden",
    desc: "Grow small plants at home to reduce heat and improve Karachi air quality.",
    category: "Carbon Garden",
    emoji: "🌱"
  },
  {
    title: "Beach Cleanup Drive",
    desc: "Collect plastic waste from Clifton or nearby public areas.",
    category: "Clean Karachi",
    emoji: "🚮"
  },
  {
    title: "Save Water Challenge",
    desc: "Reduce unnecessary water usage for one full day.",
    category: "Water Mission",
    emoji: "💧"
  },
  {
    title: "Protect Heritage Site",
    desc: "Visit a heritage location and spread awareness about cleanliness.",
    category: "Heritage Quest",
    emoji: "🏛️"
  },
  {
    title: "Air Pollution Observation",
    desc: "Track smoke-producing areas and avoid unnecessary pollution.",
    category: "Air Watch",
    emoji: "🌫️"
  },
  {
    title: "Reusable Bag Mission",
    desc: "Use reusable shopping bags instead of plastic bags.",
    category: "Clean Karachi",
    emoji: "🚮"
  },
  {
    title: "Tree Watering Task",
    desc: "Water nearby plants or trees in your neighborhood.",
    category: "Carbon Garden",
    emoji: "🌱"
  },
  {
    title: "Short Shower Challenge",
    desc: "Reduce shower time to conserve water.",
    category: "Water Mission",
    emoji: "💧"
  }
];

export const generateMissions = async (count = 10, previousMissions = []) => {
  try {
    await new Promise(r => setTimeout(r, 800));
    const previousTitles = previousMissions.map(mission => mission.title);
    const availableMissions = missionTemplates.filter(mission => !previousTitles.includes(mission.title));
    const sourceMissions = availableMissions.length > 0 ? availableMissions : missionTemplates;
    const missions = [];

    for (let i = 0; i < count; i++) {
      const randomMission = sourceMissions[Math.floor(Math.random() * sourceMissions.length)];
      const difficulty = difficulties[Math.floor(Math.random() * difficulties.length)];
      let xp = 20;

      if (difficulty === "Easy") xp = 20;
      if (difficulty === "Medium") xp = 40;
      if (difficulty === "Hard") xp = 60;

      missions.push({
        id: `${Date.now()}-${i}-${Math.random().toString(36).substring(2, 8)}`,
        title: randomMission.title,
        desc: randomMission.desc,
        category: randomMission.category,
        emoji: randomMission.emoji,
        difficulty,
        tag: tags[Math.floor(Math.random() * tags.length)],
        xp,
        steps: [
          "Read mission briefing",
          "Complete eco action",
          "Take proof photo",
          "Submit mission"
        ]
      });
    }
    return missions;
  } catch (error) {
    console.log("❌ Mission Error:", error.message);
    return [];
  }
};

export const getMissionTips = async (title, category) => {
  try {
    // Pehle real backend check karega, agar band hoa toh catch block chalega
    const response = await fetch(`${BACKEND_URL}/get-tips`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title, category }),
    });
    return await response.json();
  } catch (error) {
    console.log("⚠️ Backend Offline -> Loading Local Offline Tips");
    const categoryTips = {
      "Carbon Garden": "Plant native greenery, reuse organic waste as compost, and water plants during cooler hours.",
      "Clean Karachi": "Separate recyclable waste, avoid single-use plastic, and safely dispose of trash.",
      "Water Mission": "Turn off taps when not needed and reduce unnecessary water consumption.",
      "Heritage Quest": "Respect public spaces, avoid littering, and encourage awareness about Karachi heritage.",
      "Air Watch": "Avoid unnecessary smoke pollution and promote cleaner transportation options."
    };
    return {
      tips: `For "${title}", ${categoryTips[category] || "follow eco-friendly practices and document your actions clearly for verification."}`
    };
  }
};

// 🏆 UPGRADED AGENT 3 VERIFICATION WITH IMAGE SUPPORT
export const verifyMissionCompletion = async (title, steps = [], beforeImage = null, afterImage = null) => {
  try {
    // Hit real Node.js server with Gemini Multimodal AI
    const response = await fetch(`${BACKEND_URL}/verify-mission`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title, steps, beforeImage, afterImage }),
    });
    return await response.json();
  } catch (error) {
    console.log("⚠️ AI Server Offline -> Activating Local Intelligent Simulation Fallback");
    
    const completed = steps.filter(step => step.done).length;
    const total = steps.length || 1;
    const successRate = completed / total;

    if (successRate >= 1 && beforeImage && afterImage) {
      const earnedXP = Math.floor(Math.random() * 40) + 20;
      let badge = "Eco Starter 🌱";
      if (earnedXP >= 30) badge = "Eco Hero 🌳";
      if (earnedXP >= 50) badge = "Climate Warrior ⚡";

      return {
        verified: true,
        message: "Great job! All eco actions completed successfully. [Simulated Response]",
        xpBonus: earnedXP,
        badge,
        nextSuggestion: "Try a harder mission next!"
      };
    }

    return {
      verified: false,
      message: "Verification failed. Complete all steps and add images.",
      xpBonus: 0,
      badge: null,
      nextSuggestion: "Complete all steps before submitting."
    };
  }
};