# backend/api/routes.py
# ─────────────────────────────────────────────
# EcoGuardian AI Router Layer
# CSC4101 · SZABIST AI Semester Project
# ─────────────────────────────────────────────

# backend/api/routes.py
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import List

# 👈 Ensure karein ke yahan sirf 'agents.' se start ho raha ho
from agents.coordinator_agent import CoordinatorAgent, get_mission_tips_agent

router = APIRouter()

# ─────────────────────────────────────────────
# 📋 PYDANTIC REQUEST SCHEMAS (Data Validation)
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


# ─────────────────────────────────────────────
# 🤖 ROUTE 1: GET ECO TIPS (Agent 2)
# ─────────────────────────────────────────────
@router.post("/get-tips")
async def get_tips(data: TipsRequest):
    try:
        tips_text = get_mission_tips_agent(data.title, data.category)
        return {"tips": tips_text}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


# ─────────────────────────────────────────────
# 🤖 ROUTE 2: MULTIMODAL VERIFICATION (Agent 3 + State)
# ─────────────────────────────────────────────
@router.post("/verify-mission")
async def verify_mission(data: VerifyRequest):
    try:
        # 1. Pehle hum LangGraph ke standard state format mein dictionary tayar karenge
        initial_state = {
            "mission": data.title,
            "steps": [step.text for step in data.steps], # Sirf text strings pass karenge agent ko
            "beforeImage": data.beforeImage,
            "afterImage": data.afterImage,
            "badges": [],
            "mission_status": "started",
            "parent_approved": True # By default true rakh rahe hain processing ke liye
        }
        
        # 2. Coordinator Agent ka instance create karenge
        coordinator = CoordinatorAgent()
        
        # 3. Agent ke verify_mission method ko state pass karke run karenge
        # Yeh automatically verification analyze karega aur complete_mission ya retry_mission par switch kar dega
        final_state = coordinator.verify_mission(initial_state)
        
        # 4. React Native app ko response return karenge jo use chahiye
        return {
            "verified": final_state.get("verification_status") == "verified",
            "message": final_state.get("ai_review_message", "Verification processed."),
            "xpBonus": final_state.get("reward_points", 0),
            "badge": "Community Hero" if final_state.get("mission_completed") else None,
            "nextSuggestion": "Try another mission from the dashboard!" if final_state.get("mission_completed") else "Please try again with clear photos."
        }
        
    except Exception as e:
        print(f"API Route Error: {e}")
        raise HTTPException(status_code=500, detail="Internal server error during verification.")