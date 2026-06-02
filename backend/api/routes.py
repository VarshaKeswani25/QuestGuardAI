# backend/api/routes.py
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import List
from agents.coordinator_agent import CoordinatorAgent, get_mission_tips_agent

router = APIRouter()

# ─────────────────────────────────────────────
# SCHEMAS
# ─────────────────────────────────────────────

class TipsRequest(BaseModel):
    title: str
    category: str

class StepItem(BaseModel):
    text: str
    done: bool

class VerifyRequest(BaseModel):
    title: str
    steps: List[StepItem]
    beforeImage: str
    afterImage: str

class MissionRequest(BaseModel):
    location: str = "Karachi"
    age: int = 12


# ─────────────────────────────────────────────
# ROUTE 1: GET ECO TIPS (Agent 2)
# ─────────────────────────────────────────────
@router.post("/get-tips")
async def get_tips(data: TipsRequest):
    try:
        tips_text = get_mission_tips_agent(data.title, data.category)
        return {"tips": tips_text}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


# ─────────────────────────────────────────────
# ROUTE 2: VERIFY MISSION (Agent 3)
# ─────────────────────────────────────────────
@router.post("/verify-mission")
async def verify_mission(data: VerifyRequest):
    try:
        initial_state = {
            "mission": data.title,
            "steps": [step.text for step in data.steps],
            "beforeImage": data.beforeImage,
            "afterImage": data.afterImage,
            "badges": [],
            "mission_status": "started",
            "parent_approved": True
        }
        coordinator = CoordinatorAgent()
        final_state = coordinator.verify_mission(initial_state)
        return {
            "verified": final_state.get("verification_status") == "verified",
            "message": final_state.get("ai_review_message", "Verification processed."),
            "xpBonus": final_state.get("reward_points", 0),
            "badge": "Community Hero" if final_state.get("mission_completed") else None,
            "nextSuggestion": "Try another mission!" if final_state.get("mission_completed") else "Try again with clear photos."
        }
    except Exception as e:
        print(f"Verify Route Error: {e}")
        raise HTTPException(status_code=500, detail="Verification failed.")


# ─────────────────────────────────────────────
# ROUTE 3: GENERATE MISSIONS (Planning Agent)
# ─────────────────────────────────────────────
@router.post("/generate-missions")
async def generate_missions_route(data: MissionRequest):
    try:
        from agents.planning_agent import generate_missions

        print(f"🤖 Generating missions for location={data.location}, age={data.age}")
        result = generate_missions(data.location, data.age)

        raw_missions = result.get("missions", [])
        weather      = result.get("weather", {})

        # Frontend format mein convert karo
        formatted = []
        for i, m in enumerate(raw_missions):
            issue = m.get("civic_issue", m.get("issue", "waste"))
            formatted.append({
                "id":            f"ai-{i}-{hash(m.get('title','')) % 99999}",
                "title":         m.get("title", "Eco Mission"),
                "desc":          m.get("description", "Complete this eco mission!"),
                "description":   m.get("description", "Complete this eco mission!"),
                "category":      map_category(issue),
                "emoji":         map_emoji(issue),
                "difficulty":    m.get("difficulty", "Easy"),
                "xp":            m.get("xp_reward", 50),
                "xp_reward":     m.get("xp_reward", 50),
                "tag":           "Indoor" if m.get("indoor") else "Daily",
                "indoor_reason": m.get("indoor_reason", ""),
                "steps": [
                    "Read mission briefing",
                    "Complete eco action",
                    "Take proof photo",
                    "Submit mission"
                ],
                "civic_issue":   issue,
                "weather_info":  f"{weather.get('condition','')} {weather.get('temp_c','')}°C",
            })

        print(f"✅ {len(formatted)} missions ready")
        return {"missions": formatted, "weather": weather, "mode": result.get("mode", "outdoor")}

    except Exception as e:
        print(f"❌ Generate Missions Error: {e}")
        raise HTTPException(status_code=500, detail=str(e))


# ─────────────────────────────────────────────
# HELPER FUNCTIONS
# ─────────────────────────────────────────────
def map_category(issue: str) -> str:
    mapping = {
        "energy_saving":      "Carbon Garden",
        "waste":              "Clean Karachi",
        "recycling":          "Clean Karachi",
        "home_cleanliness":   "Clean Karachi",
        "drainage":           "Clean Karachi",
        "water_conservation": "Water Mission",
        "water":              "Water Mission",
        "greening":           "Carbon Garden",
        "heat_island":        "Air Watch",
        "air_quality":        "Air Watch",
        "awareness":          "Heritage Quest",
        "heritage":           "Heritage Quest",
    }
    return mapping.get(issue.lower().replace(" ", "_"), "Clean Karachi")


def map_emoji(issue: str) -> str:
    mapping = {
        "energy_saving":      "💡",
        "waste":              "🚮",
        "recycling":          "♻️",
        "home_cleanliness":   "🧹",
        "drainage":           "🌊",
        "water_conservation": "💧",
        "water":              "💧",
        "greening":           "🌱",
        "heat_island":        "🌡️",
        "air_quality":        "🌫️",
        "awareness":          "📢",
        "heritage":           "🏛️",
    }
    return mapping.get(issue.lower().replace(" ", "_"), "🌱")