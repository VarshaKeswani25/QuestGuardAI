#  QuestGuard AI : The Community Hero Engine

> **SZABIST University Karachi · CSC-4101 Artificial Intelligence · Spring 2026**
> A multi-agent AI platform that turns children's neighbourhoods into civic RPG adventures — powered by RAG, computer vision, and a parent-first safety layer.

---

##  Overview

**QuestGuard AI** gamifies civic engagement for children aged 6–16 in Karachi. Using the [Karachi Climate Action Plan (KCAP 2021)](https://www.iucn.org/) as its knowledge base, the system generates location-aware RPG missions — clearing blocked drains, planting saplings, removing illegal waste — and verifies real-world task completion through AI-powered photo analysis.

Every mission requires **explicit parent approval** before a child can begin, making it fully COPPA 2025 compliant by design.

```
Child opens app → AI generates civic mission → Parent approves →
Child completes task → Gemini Vision verifies photos → XP + Badge awarded
```

---

## ✨ Key Features

| Feature | Description |
|---|---|
| **Location-aware Missions** | RAG retrieval on KCAP 2021 generates missions relevant to the child's GPS location |
| **Parent Approval Gate (HITL)** | No mission starts without a push-notification approval from the parent |
| **Computer Vision Verification** | Gemini 1.5 Pro Vision compares before/after photos to confirm real-world task completion |
| **XP & Badge Rewards** | Children earn experience points and unlock badges for genuine community contributions |
| **Weather-Aware** | Open-Meteo API prevents outdoor missions during unsafe weather conditions |
| **COPPA 2025 Compliant** | No biometrics, no ads, no third-party data sharing — parental consent at every step |
| **Fraud Detection** | Duplicate image hashes + EXIF metadata validation prevent fake submissions |

---

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
| Firebase | Auth, real-time database, push notifications |
| OpenStreetMap Nominatim | Area-type classification (residential/park/etc.) |
| Open-Meteo API | Weather safety check |

---

##  Project Structure

```
questguard-ai/
├── frontend/                   # React Native + Expo app
│   ├── App.jsx
│   └── src/
│       ├── screens/            # SplashScreen, ChildDashboard, ParentDashboard, etc.
│       ├── services/           # missionService, verificationService, rewardService, etc.
│       └── theme.js
│
├── backend/                    # FastAPI Python backend
│   ├── main.py
│   ├── api/routes.py
│   ├── agents/
│   │   ├── planning_agent.py   # KCAP RAG + Groq mission generation
│   │   ├── coordinator_agent.py# LangGraph state machine + HITL
│   │   ├── cv_agent.py         # Gemini 1.5 Pro Vision verification
│   │   └── reward_agent.py     # XP, badges, leaderboard updates
│   ├── scripts/ingest_kcap.py  # One-time KCAP 2021 → Pinecone ingestion
│   └── requirements.txt
│
├── docs/                       # Phase reports & documentation
├── .env.example
└── README.md
```

---

##  System Architecture

```
┌──────────────────────────────────────────────┐
│           FRONTEND (React Native)            │
│      Child App  ←────────→  Parent App       │
└───────────────────┬──────────────────────────┘
                    │ REST (FastAPI)
┌───────────────────▼──────────────────────────┐
│         BACKEND (FastAPI + LangGraph)         │
│                                               │
│  Planning   Coordinator   CV Agent   Reward   │
│   Agent       Agent      (Gemini)    Agent    │
│  RAG+Groq   LangGraph     Vision    XP+Badge  │
└────┬─────────────┬──────────┬──────────┬──────┘
     │             │          │          │
  Pinecone     Firebase    Gemini      Firebase
  KCAP RAG    Auth+Notif  1.5 Pro      DB
```

---

##  8-Step Mission Lifecycle

| Step | Description |
|---|---|
| 1. Session Init | Child opens app → GPS → Coordinator Agent starts session |
| 2. Mission Gen | Planning Agent → Pinecone RAG → Groq LLM → 3 mission cards |
| 3. Parent Approval ⏸ | Firebase push notification → parent approves/rejects (HITL) |
| 4. Mission Unlock | Quest card shown: title, XP, difficulty, steps |
| 5. Before Photo | Child travels to location → captures "before" photo |
| 6. Task Execution | Child completes civic task (drain clearing, planting, etc.) |
| 7. CV Verification | "After" photo → Gemini Vision compares → fraud check |
| 8. Reward / Retry | ✅ Verified: XP + badge · ❌ Failed: feedback + retry |

---

##  AI Agents

**Planning Agent** — Generates 3 age-appropriate missions using location context, weather check, KCAP RAG retrieval, and Groq LLM.

**Coordinator Agent** — LangGraph state machine managing the full mission lifecycle from session init to reward.

**CV Agent** — Gemini 1.5 Pro Vision compares before/after photos and checks for fraud (duplicate hashes, EXIF mismatch).

**Reward Agent** — Updates XP, unlocks badges, and refreshes the leaderboard in Firebase.

---

##  Getting Started

### Prerequisites
- Python 3.11+, Node.js 18+, Expo CLI

### Backend
```bash
cd backend
python -m venv venv && source venv/bin/activate
pip install -r requirements.txt
cp ../.env.example .env
python scripts/ingest_kcap.py      # run once
uvicorn main:app --reload --port 3000
```

### Frontend
```bash
cd frontend
npm install
cp ../.env.example .env
npx expo start
```
Scan the QR code with **Expo Go** on your phone.

---

##  Team

| Name | Reg. No. | Role |
|---|---|---|
| **Humaira Bibi** ⭐ | 2312420 | Project Lead & RAG Developer |
| **Rakhi Khatri** | 2312383 | Agent Architect & Planning Agent |
| **Alvina Jiwani** | 2312357 | CV & Verification Engineer |
| **Varsha Bai** | 2312389 | Backend & Reward Systems |
| **Hooria Ali** | 2312419 | UI/UX & Parent Dashboard |

---

##  License

Developed for academic purposes at **SZABIST University Karachi** · CSC-4101 Artificial Intelligence · Spring 2026.

---

<div align="center">

**QuestGuard AI** · SZABIST University · Spring 2026

*Turning children into community heroes — one quest at a time.*

</div>
