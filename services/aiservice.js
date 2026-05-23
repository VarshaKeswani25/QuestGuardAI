// services/aiservice.js
// ─────────────────────────────────────────────
// EcoGuardian AI Service Layer
// CSC4101 · SZABIST Project
//
// 🤖 Handles:
// - Mission generation
// - AI eco tips
// - Mission verification
// ─────────────────────────────────────────────

// ─────────────────────────────
// 🧠 CONSTANT DATA
// ─────────────────────────────
const categories = [
  "Carbon Garden",
  "Clean Karachi",
  "Water Mission",
  "Heritage Quest",
  "Air Watch"
];

const emojis = ["🌱", "🚮", "💧", "🏛️", "🌫️"];

const difficulties = [
  "Easy",
  "Medium",
  "Hard"
];

const tags = [
  "Daily",
  "Weekly",
  "Special"
];

// ─────────────────────────────
// 🎯 KARACHI ECO MISSIONS
// ─────────────────────────────
const missionTemplates = [

  {
    title: "Plant a Balcony Garden",
    desc:
      "Grow small plants at home to reduce heat and improve Karachi air quality.",
    category: "Carbon Garden",
    emoji: "🌱"
  },

  {
    title: "Beach Cleanup Drive",
    desc:
      "Collect plastic waste from Clifton or nearby public areas.",
    category: "Clean Karachi",
    emoji: "🚮"
  },

  {
    title: "Save Water Challenge",
    desc:
      "Reduce unnecessary water usage for one full day.",
    category: "Water Mission",
    emoji: "💧"
  },

  {
    title: "Protect Heritage Site",
    desc:
      "Visit a heritage location and spread awareness about cleanliness.",
    category: "Heritage Quest",
    emoji: "🏛️"
  },

  {
    title: "Air Pollution Observation",
    desc:
      "Track smoke-producing areas and avoid unnecessary pollution.",
    category: "Air Watch",
    emoji: "🌫️"
  },

  {
    title: "Reusable Bag Mission",
    desc:
      "Use reusable shopping bags instead of plastic bags.",
    category: "Clean Karachi",
    emoji: "🚮"
  },

  {
    title: "Tree Watering Task",
    desc:
      "Water nearby plants or trees in your neighborhood.",
    category: "Carbon Garden",
    emoji: "🌱"
  },

  {
    title: "Short Shower Challenge",
    desc:
      "Reduce shower time to conserve water.",
    category: "Water Mission",
    emoji: "💧"
  }
];

// ─────────────────────────────
// 🤖 GENERATE MISSIONS
// Creates eco missions for Karachi
// ─────────────────────────────
export const generateMissions = async (
  count = 10,
  previousMissions = []
) => {

  try {

    // Simulated AI delay
    await new Promise(r =>
      setTimeout(r, 800)
    );

    const previousTitles =
      previousMissions.map(
        mission => mission.title
      );

    // remove already used missions
    const availableMissions =
      missionTemplates.filter(
        mission =>
          !previousTitles.includes(
            mission.title
          )
      );

    // fallback if all used
    const sourceMissions =
      availableMissions.length > 0
        ? availableMissions
        : missionTemplates;

    const missions = [];

    for (
      let i = 0;
      i < count;
      i++
    ) {

      const randomMission =
        sourceMissions[
          Math.floor(
            Math.random() *
            sourceMissions.length
          )
        ];

      const difficulty =
        difficulties[
          Math.floor(
            Math.random() *
            difficulties.length
          )
        ];

      let xp = 20;

      // XP by difficulty
      if (difficulty === "Easy") {
        xp = 20;
      }

      if (difficulty === "Medium") {
        xp = 40;
      }

      if (difficulty === "Hard") {
        xp = 60;
      }

      missions.push({

        id:
          `${Date.now()}-${i}-${Math.random()
            .toString(36)
            .substring(2, 8)}`,

        title: randomMission.title,

        desc: randomMission.desc,

        category:
          randomMission.category,

        emoji: randomMission.emoji,

        difficulty,

        tag:
          tags[
            Math.floor(
              Math.random() *
              tags.length
            )
          ],

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

    console.log(
      "❌ Mission Error:",
      error.message
    );

    return [];
  }
};

// ─────────────────────────────
// 💡 GET MISSION TIPS
// AI eco guidance per mission
// ─────────────────────────────
export const getMissionTips = async (
  title,
  category
) => {

  try {

    await new Promise(r =>
      setTimeout(r, 500)
    );

    const categoryTips = {

      "Carbon Garden":
        "Plant native greenery, reuse organic waste as compost, and water plants during cooler hours.",

      "Clean Karachi":
        "Separate recyclable waste, avoid single-use plastic, and safely dispose of trash.",

      "Water Mission":
        "Turn off taps when not needed and reduce unnecessary water consumption.",

      "Heritage Quest":
        "Respect public spaces, avoid littering, and encourage awareness about Karachi heritage.",

      "Air Watch":
        "Avoid unnecessary smoke pollution and promote cleaner transportation options."
    };

    return {

      tips:

        `For "${title}", ${categoryTips[category] ||
        "follow eco-friendly practices and document your actions clearly for verification."
        }`
    };

  } catch (error) {

    console.log(
      "❌ Tips Error:",
      error.message
    );

    return {

      tips:
        "Stay eco-friendly and follow sustainable practices."
    };
  }
};

// ─────────────────────────────
// 🏆 VERIFY MISSION COMPLETION
// AI checks if steps are completed
// ─────────────────────────────
export const verifyMissionCompletion = async (
  title,
  steps = []
) => {

  try {

    await new Promise(r =>
      setTimeout(r, 1200)
    );

    const completed =
      steps.filter(
        step => step.done
      ).length;

    const total =
      steps.length || 1;

    const successRate =
      completed / total;

    // ✅ SUCCESS
    if (successRate >= 1) {

      const earnedXP =
        Math.floor(
          Math.random() * 40
        ) + 20;

      let badge = "Eco Starter 🌱";

      if (earnedXP >= 30) {
        badge = "Eco Hero 🌳";
      }

      if (earnedXP >= 50) {
        badge = "Climate Warrior ⚡";
      }

      return {

        verified: true,

        message:
          "Great job! All eco actions completed successfully.",

        xpBonus: earnedXP,

        badge,

        nextSuggestion:
          "Try a harder mission next!"
      };
    }

    // ❌ FAILED
    return {

      verified: false,

      message:
        "Some mission steps are incomplete.",

      xpBonus: 0,

      badge: null,

      nextSuggestion:
        "Complete all steps before submitting."
    };

  } catch (error) {

    console.log(
      "❌ Verify Error:",
      error.message
    );

    return {

      verified: false,

      message:
        "AI system error occurred.",

      xpBonus: 0,

      badge: null,

      nextSuggestion:
        "Please try again later."
    };
  }
};