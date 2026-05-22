// services/aiservice.js
// EcoGuardian AI Service
// Multi-Agent AI Architecture using Gemini API
// Model: gemini-2.0-flash
 
// ────────────────────────────────────────────────────────────────
// ENVIRONMENT SETUP
// Create a .env file in your project root:
//
// EXPO_PUBLIC_GEMINI_API_KEY=AIzaSy...
//
// Get your free API key:
// https://aistudio.google.com/apikey
// ────────────────────────────────────────────────────────────────
 
const GEMINI_MODEL = 'gemini-2.0-flash';
 
const GEMINI_URL = (apiKey) =>
  `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent?key=${apiKey}`;
 
const API_KEY = process.env.EXPO_PUBLIC_GEMINI_API_KEY || '';
 
// ────────────────────────────────────────────────────────────────
// SHARED KARACHI CONTEXT
// Reused across all AI agents
// ────────────────────────────────────────────────────────────────
 
const KARACHI_CONTEXT = `
Karachi Environmental Context:
- Water shortage: 550 MGD supply vs 1200 MGD demand
- Extreme urban heat island effect (38-42°C summers)
- 9000+ tons of waste generated daily
- Informal waste recycling in Korangi and Orangi
- Mangrove destruction along Karachi coastline
- Pollution in Lyari River and Malir River
- Hawks Bay and Chinna Creek pollution
- UNESCO heritage sites in Sindh:
  Mohenjo-Daro, Makli Necropolis, Chaukhandi Tombs
`;
 
// ────────────────────────────────────────────────────────────────
// FALLBACK MISSIONS
// Used when AI fails or internet is unavailable
// ────────────────────────────────────────────────────────────────
 
const FALLBACK_MISSIONS = [
  {
    id: 'fallback_water_1',
    emoji: '💧',
    title: 'Save Every Drop',
    category: 'Water Mission',
    xp: 50,
    difficulty: 'Easy',
    tag: 'Daily',
    desc:
      'Help save water at home by reducing unnecessary water waste. Karachi faces serious water shortages every day.',
    steps: [
      'Turn off tap while brushing',
      'Use a bucket instead of long showers',
      'Check for leaking taps',
      'Remind family to save water',
    ],
  },
 
  {
    id: 'fallback_clean_1',
    emoji: '🧹',
    title: 'Clean Street Hero',
    category: 'Clean Karachi',
    xp: 60,
    difficulty: 'Easy',
    tag: 'Weekly',
    desc:
      'Keep your surroundings clean by properly disposing of trash. A cleaner Karachi helps everyone stay healthier.',
    steps: [
      'Collect small litter pieces',
      'Separate plastic waste',
      'Throw waste in proper bins',
      'Encourage friends to help',
    ],
  },
 
  {
    id: 'fallback_air_1',
    emoji: '🌳',
    title: 'Tree Care Mission',
    category: 'Air Watch',
    xp: 70,
    difficulty: 'Medium',
    tag: 'Special',
    desc:
      'Plants improve Karachi\'s air quality and reduce heat. Care for plants around your home or neighborhood.',
    steps: [
      'Water a nearby plant',
      'Remove dry leaves',
      'Protect plants from trash',
      'Teach someone about trees',
    ],
  },
 
  {
    id: 'fallback_heritage_1',
    emoji: '🏛️',
    title: 'Sindh Heritage Explorer',
    category: 'Heritage Quest',
    xp: 80,
    difficulty: 'Medium',
    tag: 'Special',
    desc:
      'Learn about the beautiful heritage of Sindh and why historical places should be protected.',
    steps: [
      'Research a Sindh heritage site',
      'Draw or write about it',
      'Share facts with family',
      'Learn why preservation matters',
    ],
  },
];
 
// ────────────────────────────────────────────────────────────────
// TEXT SANITIZER
// Basic safety filtering for child-safe responses
// ────────────────────────────────────────────────────────────────
 
function sanitizeText(text = '') {
  const bannedWords = ['violence', 'hate', 'weapon', 'drugs', 'harm', 'abuse'];
 
  const lower = text.toLowerCase();
  for (const word of bannedWords) {
    const regex = new RegExp(`\\b${word}\\b`);
    if (regex.test(lower)) return 'Content filtered for safety.';
  }
  
  return text;
}
 
// ────────────────────────────────────────────────────────────────
// SAFE JSON PARSER
// Removes markdown fences and prevents crashes
// ────────────────────────────────────────────────────────────────
 
function parseJSON(raw) {
  try {
    const clean = raw
      .replace(/```json|```/gi, '')
      .trim();
 
    return JSON.parse(clean);
  } catch (error) {
    console.error('JSON Parse Error:', raw);
    throw new Error('AI returned invalid JSON');
  }
}
 
// ────────────────────────────────────────────────────────────────
// RESPONSE VALIDATORS
// Prevents malformed AI responses
// ────────────────────────────────────────────────────────────────
 
function validateMission(mission) {
  return (
    mission &&
    mission.id &&
    mission.title &&
    mission.category &&
    mission.desc &&
    Array.isArray(mission.steps)
  );
}
 
function validateTips(data) {
  return (
    data &&
    data.agentReasoning &&
    Array.isArray(data.tips) &&
    data.karachi_fact
  );
}
 
function validateVerification(data) {
  return (
    typeof data.verified === 'boolean' &&
    typeof data.message === 'string'
  );
}
 
// ────────────────────────────────────────────────────────────────
// SLEEP HELPER
// Waits for given milliseconds before retrying
// ────────────────────────────────────────────────────────────────
 
const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
 
// ────────────────────────────────────────────────────────────────
// CORE GEMINI API CALLER
// Includes:
// - Retry logic with delay (fixes 429 Too Many Requests)
// - Timeout handling
// - Error management
// - Safer API communication
// ────────────────────────────────────────────────────────────────
 
async function callGemini(systemPrompt, userMessage, retries = 2, retryDelay = 3000) {
  if (!API_KEY) {
    throw new Error(
      'Gemini API key missing.\nAdd EXPO_PUBLIC_GEMINI_API_KEY to your .env file.'
    );
  }
 
  const controller = new AbortController();
 
  const timeout = setTimeout(() => {
    controller.abort();
  }, 20000); // increased to 20s to give more time
 
  try {
    const body = {
      system_instruction: {
        parts: [{ text: systemPrompt }],
      },
 
      contents: [
        {
          role: 'user',
          parts: [{ text: userMessage }],
        },
      ],
 
      generationConfig: {
        temperature: 0.7,
        maxOutputTokens: 1024,
      },
    };
 
    const response = await fetch(GEMINI_URL(API_KEY), {
      method: 'POST',
 
      headers: {
        'Content-Type': 'application/json',
      },
 
      body: JSON.stringify(body),
 
      signal: controller.signal,
    });
 
    clearTimeout(timeout);
 
    // ── Handle 429 Rate Limit ──────────────────────────────────
    if (response.status === 429) {
      console.warn('Gemini rate limit hit (429). Waiting before retry...');
      if (retries > 0) {
        await sleep(retryDelay);
        return callGemini(systemPrompt, userMessage, retries - 1, retryDelay * 2);
      }
      throw new Error('Gemini rate limit exceeded. Please wait a moment and try again.');
    }
 
    if (!response.ok) {
      const err = await response.json();
      throw new Error(
        err?.error?.message || `Gemini API request failed (${response.status})`
      );
    }
 
    const data = await response.json();
 
    const text =
      data?.candidates?.[0]?.content?.parts?.[0]?.text;
 
    if (!text) {
      throw new Error('Empty response from Gemini');
    }
 
    return sanitizeText(text);
 
  } catch (error) {
    clearTimeout(timeout);
 
    // Don't retry on abort (timeout) or rate limit — already handled above
    if (error.name === 'AbortError') {
      console.error('Gemini request timed out');
      throw new Error('Request timed out. Check your internet connection.');
    }
 
    console.error('Gemini Error:', error.message);
 
    if (retries > 0 && !error.message.includes('rate limit')) {
      console.log(`Retrying in ${retryDelay / 1000}s...`);
      await sleep(retryDelay);
      return callGemini(systemPrompt, userMessage, retries - 1, retryDelay * 2);
    }
 
    throw error;
  }
}
 
// ════════════════════════════════════════════════════════════════
// AGENT 1 — MISSION GENERATOR
// Creates dynamic eco-missions for Karachi children
// Triggered on HomeScreen load or refresh
// ════════════════════════════════════════════════════════════════
 
export async function generateMissions(
  childAge = 12,
  completedIds = [],
  previousCategories = [],
  streakDays = 0
) {
  const system = `
You are an AI Mission Designer for EcoGuardian,
a COPPA-compliant environmental learning app for children in Karachi.
 
${KARACHI_CONTEXT}
 
Generate exactly 4 unique environmental missions
for a ${childAge}-year-old child.
 
Requirements:
- Age-appropriate
- Educational
- Safe
- Fun
- Karachi-focused
- No personal data collection
- Encourage real-world environmental action
 
Respond ONLY with valid JSON.
 
Format:
[
  {
    "id": "unique_id",
    "emoji": "emoji",
    "title": "max 5 words",
    "category": "Carbon Garden | Clean Karachi | Water Mission | Heritage Quest | Air Watch",
    "xp": 50,
    "difficulty": "Easy | Medium | Hard",
    "tag": "Daily | Weekly | Special",
    "desc": "2 sentence description",
    "steps": ["step1", "step2", "step3", "step4"]
  }
]
`;
 
  const userMsg = `
Generate 4 fresh missions.
 
Avoid completed mission IDs:
${JSON.stringify(completedIds)}
 
Previous categories:
${JSON.stringify(previousCategories)}
 
Current streak:
${streakDays} days
 
Include at least one Sindh heritage mission.
 
Return ONLY JSON.
`;
 
  try {
    const raw = await callGemini(system, userMsg);
 
    const missions = parseJSON(raw);
 
    if (!Array.isArray(missions)) {
      throw new Error('Invalid mission format');
    }
 
    return missions.filter(validateMission);
 
  } catch (error) {
    console.error('Mission Generator Failed:', error.message);
    console.log('Using fallback missions instead.');
    return FALLBACK_MISSIONS;
  }
}
 
// ════════════════════════════════════════════════════════════════
// AGENT 2 — CONTEXTUAL TIP AGENT
// Uses ReAct-style reasoning for Karachi-specific guidance
// Triggered when MissionDetail screen opens
// ════════════════════════════════════════════════════════════════
 
export async function getMissionTips(
  missionTitle,
  missionCategory
) {
  const system = `
You are an AI eco-assistant for EcoGuardian.
 
Use the ReAct pattern:
1. Reason about why the mission matters in Karachi
2. Act by giving localized practical tips
 
${KARACHI_CONTEXT}
 
Rules:
- Grade 6-8 language
- Encouraging tone
- Child-safe
- Specific to Karachi
 
Respond ONLY with valid JSON.
 
Format:
{
  "agentReasoning": "reasoning sentence",
  "tips": [
    "tip 1",
    "tip 2",
    "tip 3"
  ],
  "karachi_fact": "interesting Karachi fact"
}
`;
 
  const userMsg = `
Mission: "${missionTitle}"
 
Category:
${missionCategory}
 
Return ONLY JSON.
`;
 
  try {
    const raw = await callGemini(system, userMsg);
 
    const data = parseJSON(raw);
 
    if (!validateTips(data)) {
      throw new Error('Invalid tips response');
    }
 
    return data;
 
  } catch (error) {
    console.error('Tips Agent Failed:', error.message);
 
    return {
      agentReasoning:
        'Small eco-actions can create a cleaner Karachi.',
 
      tips: [
        'Save water whenever possible',
        'Keep streets litter-free',
        'Teach friends eco habits',
      ],
 
      karachi_fact:
        'Karachi produces thousands of tons of waste daily.',
    };
  }
}
 
// ════════════════════════════════════════════════════════════════
// AGENT 3 — MISSION VERIFIER
// Verifies task completion and rewards children
// Triggered when child submits mission
// ════════════════════════════════════════════════════════════════
 
export async function verifyMissionCompletion(
  missionTitle,
  stepsCompleted
) {
  const completedSteps = stepsCompleted
    .filter((s) => s.done)
    .map((s) => s.text);
 
  const pendingSteps = stepsCompleted
    .filter((s) => !s.done)
    .map((s) => s.text);
 
  const allDone = stepsCompleted.every((s) => s.done);
 
  const system = `
You are an AI Mission Verification Agent
inside EcoGuardian.
 
Your job:
- Verify mission completion
- Encourage children positively
- Award XP bonuses
- Suggest future eco-actions
 
Rules:
- COPPA compliant
- Child-safe
- Ages 8-15
- Encouraging tone
- Never shame or criticize
 
If all steps done:
- verified=true
- xpBonus between 15-30
- creative badge
 
If incomplete:
- verified=false
- xpBonus=0
- badge=null
 
Respond ONLY with valid JSON.
 
Format:
{
  "verified": true,
  "message": "encouraging message",
  "xpBonus": 20,
  "badge": "Eco Hero",
  "nextSuggestion": "future eco action"
}
`;
 
  const userMsg = `
Mission:
"${missionTitle}"
 
Completed steps:
${
  completedSteps.length > 0
    ? completedSteps.join(' | ')
    : 'none'
}
 
Pending steps:
${
  pendingSteps.length > 0
    ? pendingSteps.join(' | ')
    : 'none'
}
 
All done:
${allDone}
 
Return ONLY JSON.
`;
 
  try {
    const raw = await callGemini(system, userMsg);
 
    const data = parseJSON(raw);
 
    if (!validateVerification(data)) {
      throw new Error('Invalid verification response');
    }
 
    return data;
 
  } catch (error) {
    console.error('Verification Agent Failed:', error.message);
 
    return {
      verified: allDone,
 
      message: allDone
        ? 'Amazing work! You completed your eco mission successfully.'
        : 'Great effort! Finish the remaining steps to complete your mission.',
 
      xpBonus: allDone ? 20 : 0,
 
      badge: allDone
        ? 'Karachi Eco Hero'
        : null,
 
      nextSuggestion:
        'Try another eco mission to help Karachi become greener.',
    };
  }
}
 
// ────────────────────────────────────────────────────────────────
// IMPORTANT SECURITY NOTE
// ────────────────────────────────────────────────────────────────
//
// EXPO_PUBLIC_GEMINI_API_KEY is visible inside
// the mobile app bundle.
//
// Safe for:
// - Student projects
// - Hackathons
// - MVP demos
//
// NOT SAFE for production apps.
//
// Production Architecture:
//
// React Native App
//        ↓
// Your Backend API
//        ↓
// Gemini API
//
// Recommended Backend Options:
// - Node.js Express
// - Firebase Functions
// - Supabase Edge Functions
//
// ────────────────────────────────────────────────────────────────
 