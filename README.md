#  QuestGuard AI : The Community Hero Engine

> **SZABIST University Karachi · CSC-4101 Artificial Intelligence · Spring 2026**
> A multi-agent AI platform that turns children's neighbourhoods into civic RPG adventures  powered by RAG, computer vision, and a parent-first safety layer.


##  Table of Contents

- [Overview](#-overview)
- [Key Features](#-key-features)
- [Tech Stack](#-tech-stack)
- [Project Structure](#-project-structure)
- [System Architecture](#-system-architecture)
- [AI Agents](#-ai-agents)
- [Getting Started](#-getting-started)
- [Team](#-team)
- [License](#-license)

##  Overview

**QuestGuard AI** gamifies civic engagement for children aged 6–16 in Karachi. Using the [Karachi Climate Action Plan (KCAP 2021)](https://www.iucn.org/) as its knowledge base, the system generates location-aware RPG missions  clearing blocked drains, planting saplings, removing illegal waste  and verifies real-world task completion through AI-powered photo analysis.

Every mission requires **explicit parent approval** before a child can begin, making it fully COPPA 2025 compliant by design.

Child opens app → AI generates civic mission → Parent approves →
Child completes task → Gemini Vision verifies photos → XP + Badge awarded

## ✨ Key Features

| Feature | Description |
|---|---|
|  **Location-aware Missions** | RAG retrieval on KCAP 2021 generates missions relevant to the child's GPS location |
|  **Parent Approval Gate (HITL)** | No mission starts without a push-notification approval from the parent |
|  **Computer Vision Verification** | Gemini 1.5 Pro Vision compares before/after photos to confirm real-world task completion |
|  **XP & Badge Rewards** | Children earn experience points and unlock badges for genuine community contributions |
|  **Weather-Aware** | Open-Meteo API prevents outdoor missions during unsafe weather conditions |
|  **COPPA 2025 Compliant** | No biometrics, no ads, no third-party data sharing  parental consent at every step |
|  **Fraud Detection** | Duplicate image hashes + EXIF metadata validation prevent fake submissions |

##  Tech Stack

### Frontend
| Tool | Purpose |
|---|---|
| React Native + Expo | Cross-platform iOS & Android app |
| Expo Location API | GPS permission handling |
| Expo Camera | Before/after photo capture |
| Firebase SDK | Auth + real-time push notifications |

### Backend
| Tool | Purpose |
|---|---|
| FastAPI + Uvicorn | REST API server (port 3000) |
| LangGraph | Multi-agent state machine orchestration |
| Groq LLM | Fast LLM inference for mission generation |
| Gemini 1.5 Pro Vision | Photo verification (before/after comparison) |
| Pinecone | Vector database for KCAP 2021 RAG retrieval |
| PostgreSQL | Child profiles, XP, badges, mission history |
| Firebase Admin SDK | Push notifications (HITL parent approval) |
| OpenStreetMap Nominatim | Area-type classification (residential/park/etc.) |
| Open-Meteo API | Weather safety check |

##  Project Structure


questguard-ai/
│
├──  frontend/                    # React Native + Expo app
│   ├── App.jsx                     # Root navigator (Native Stack)
│   ├── src/
│   │   ├── screens/
│   │   │   ├── SplashScreen.jsx
│   │   │   ├── OnboardingScreen.jsx
│   │   │   ├── ChildDashboard.jsx
│   │   │   ├── MissionDetailScreen.jsx
│   │   │   ├── CameraScreen.jsx
│   │   │   ├── RewardModal.jsx
│   │   │   ├── ParentAuthScreen.jsx
│   │   │   ├── ParentDashboard.jsx
│   │   │   ├── MissionApprovalScreen.jsx
│   │   │   ├── ChildProgressScreen.jsx
│   │   │   └── SafetySettingsScreen.jsx
│   │   ├── services/
│   │   │   ├── missionService.js       # POST /generate-missions
│   │   │   ├── verificationService.js  # POST /verify-mission (base64)
│   │   │   ├── rewardService.js        # POST /award-reward
│   │   │   ├── parentService.js        # Firebase push token + webhook
│   │   │   └── locationService.js      # GPS permission + coords
│   │   └── theme.js                    # Design tokens (T.accent, T.navy, etc.)
│   ├── assets/
│   └── package.json
│
├──   backend/                     # FastAPI Python backend
│   ├── main.py                     # App entry point (Uvicorn, port 3000)
│   ├── api/
│   │   └── routes.py               # All API route definitions
│   ├── agents/
│   │   ├── planning_agent.py       # KCAP RAG + Groq mission generation
│   │   ├── coordinator_agent.py    # LangGraph state machine + HITL
│   │   ├── cv_agent.py             # Gemini 1.5 Pro Vision verification
│   │   └── reward_agent.py         # XP, badges, leaderboard updates
│   ├── db/
│   │   ├── models.py               # SQLAlchemy models
│   │   └── database.py             # PostgreSQL connection
│   ├── scripts/
│   │   └── ingest_kcap.py          # One-time KCAP 2021 → Pinecone ingestion
│   └── requirements.txt
│
├──  docs/                        # Phase reports & documentation
│   ├── Phase1_Report.pdf
│   ├── Phase2_Report.pdf
│   ├── Phase3_Report.pdf
│   ├── Phase4_Report.pdf
│   ├── Phase5_FinalReport.pdf
│   ├── COPPA_Compliance_Checklist.pdf
│   └── Architecture_Diagram.png
│
├── .env.example                    # Environment variable template
├── .gitignore
└── README.md


## System Architecture

┌─────────────────────────────────────────────────────────────────┐
│                        FRONTEND (React Native)                   │
│   Child App ←──────────────────────→ Parent App                 │
└────────────────────────┬────────────────────────────────────────┘
                         │ REST (FastAPI)
┌────────────────────────▼────────────────────────────────────────┐
│                    BACKEND (FastAPI + LangGraph)                  │
│                                                                   │
│  ┌─────────────┐  ┌──────────────┐  ┌──────────┐  ┌──────────┐ │
│  │  Planning   │  │ Coordinator  │  │ CV Agent │  │  Reward  │ │
│  │   Agent     │  │   Agent      │  │(Gemini)  │  │  Agent   │ │
│  │ RAG+Groq    │  │  LangGraph   │  │ Vision   │  │ XP+Badge │ │
│  └──────┬──────┘  └──────┬───────┘  └────┬─────┘  └────┬─────┘ │
└─────────┼────────────────┼───────────────┼──────────────┼───────┘
          │                │               │              │
     ┌────▼────┐     ┌─────▼─────┐   ┌────▼────┐   ┌────▼──────┐
     │Pinecone │     │ Firebase  │   │ Gemini  │   │PostgreSQL │
     │KCAP RAG │     │Auth+Notif │   │1.5 Pro  │   │  DB       │
     └─────────┘     └───────────┘   └─────────┘   └───────────┘

### 8-Step Mission Lifecycle

1. SESSION INIT      Child opens app → GPS → Coordinator Agent starts session
2. MISSION GEN       Planning Agent → Pinecone RAG → Groq LLM → 3 mission cards
3. PARENT APPROVAL ⏸ Firebase push notification → parent approves/rejects (HITL)
4. MISSION UNLOCK    Quest card shown: title, XP, difficulty, steps
5. BEFORE PHOTO      Child travels to location → captures "before" photo
6. TASK EXECUTION    Child completes civic task (drain clearing, planting, etc.)
7. CV VERIFICATION   "After" photo → Gemini Vision compares → fraud check
8. REWARD / RETRY     Verified: XP + badge + leaderboard   Failed: feedback + retry


##  AI Agents

### 1. Planning Agent (`backend/agents/planning_agent.py`)
Generates 3 age-appropriate civic RPG missions using a 4-stage pipeline:
1. **Location Context**  OpenStreetMap Nominatim classifies area type (residential / park / industrial)
2. **Weather Context**  Open-Meteo API skips outdoor missions in unsafe conditions
3. **RAG Retrieval**  Embeds location + child age → semantic search on Pinecone KCAP 2021 KB
4. **Mission Generation**  Groq LLM produces JSON mission objects:

  "title": "Drain Defender",
  "description": "A blocked drain near your home is causing flooding...",
  "category": "water_management",
  "xp_reward": 50,
  "difficulty": "easy",
  "estimated_time": "20 mins",
  "steps": ["Find the blocked drain", "Clear debris safely", "Take an after photo"]
}

### 2. Coordinator Agent (`backend/agents/coordinator_agent.py`)
LangGraph state machine managing the full mission lifecycle:
- start_quest(state)  init session, call Planning Agent
- approve_mission(state, approval)  HITL gate, update `parent_approved`
- verify_mission(state)  decode base64 images, call Gemini Vision
- retry_mission(state) reset to in_progress with feedback
- award_reward(state) update XP, unlock badge, mark issue resolved

### 3. CV Agent (`backend/agents/cv_agent.py`)
Powered by **Gemini 1.5 Pro Vision**. Receives before + after images with mission context and returns:

{
  "verified": true,
  "confidence": 0.91,
  "reason": "Drain visibly cleared of debris in after photo",
  "fraud_detected": false
}

Also checks: duplicate image hashes, EXIF location mismatch, metadata inconsistencies.

### 4. Reward Agent (`backend/agents/reward_agent.py`)
- Updates `child_xp` in PostgreSQL
- Unlocks relevant badge
- Updates neighbourhood issue registry to `resolved`
- Triggers leaderboard refresh


##  Getting Started

### Prerequisites
- Python 3.11+
- Node.js 18+
- PostgreSQL 15+
- Expo CLI (`npm install -g expo-cli`)

### 1. Clone the Repository
git clone https://github.com/<your-org>/QuestGuardAI.git
### 2. Backend Setup

cd backend
python -m venv venv
source venv/bin/activate        # Windows: venv\Scripts\activate
pip install -r requirements.txt

# Copy and fill in environment variables
cp ../.env.example .env

# Run database migrations
python db/models.py

# Ingest KCAP 2021 knowledge base into Pinecone (run once)
python scripts/ingest_kcap.py

# Start the backend server
uvicorn main:app --reload --port 3000

### 3. Frontend Setup
cd frontend
npm install

# Copy and fill in environment variables
cp ../.env.example .env

# Start Expo development server
npx expo start
Scan the QR code with **Expo Go** on your phone (iOS or Android).

##  Team

| Name | Reg. No. | Role | Key Contributions |
|---|---|---|---|
| **Humaira Bibi** ⭐ | 2312420 | Project Lead & RAG Developer | KCAP Pinecone KB, RAG pipeline, prompt engineering, final report |
| **Rakhi Khatri** | 2312383 | Agent Architect & Planning Agent | LangGraph architecture, Coordinator Agent, Planning Agent |
| **Alvina Jiwani** | 2312357 | CV & Verification Engineer | Gemini Vision pipeline, fraud detection module |
| **Varsha Bai** | 2312389 | Backend & Reward Systems | FastAPI backend, Reward Agent, HITL webhook |
| **Hooria Ali** | 2312419 | UI/UX & Parent Dashboard | Wireframes, React Native screens, parent dashboard |

---

##  License

This project was developed for academic purposes at **SZABIST University Karachi** under the course **CSC-4101 Artificial Intelligence, Spring 2026**.


<div align="center">

**QuestGuard AI** · SZABIST University · CSC-4101 · Spring 2026

*Turning children into community heroes  one quest at a time.*

</div>
