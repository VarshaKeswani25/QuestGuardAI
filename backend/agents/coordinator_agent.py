# backend/agents/coordinator_agent.py
# EcoGuardian Agentic Framework - Coordinator Agent

import os
from dotenv import load_dotenv
load_dotenv()
import json
import base64
from io import BytesIO
from PIL import Image
from google import genai
from agents.planning_agent import generate_missions

client = genai.Client(
    api_key=os.getenv("GEMINI_API_KEY")
)

class CoordinatorAgent:

    def start_quest(self, state):
        """Agent 1: Initiates the LangGraph state flow."""
        result = generate_missions("Gulshan-e-Iqbal", 12)
        mission = result["missions"][0]
        state["mission"] = mission["title"]
        state["reward_points"] = mission["xp_reward"]
        state["mission_status"] = "assigned"
        return state

    def approve_mission(self, state, approval=True):
        """Parental Gate Handler: Updates status based on parental verification."""
        if approval:
            state["parent_approved"] = True
            state["mission_status"] = "approved"
        else:
            state["parent_approved"] = False
            state["mission_status"] = "rejected"
        return state

    def verify_mission(self, state):
        """Agent 3 (Multimodal Inspector): Evaluates before/after images via Gemini."""
        title = state.get("mission", "Eco Mission")
        steps = state.get("steps", ["Complete eco action", "Take proof photo"])
        before_b64 = state.get("beforeImage")
        after_b64 = state.get("afterImage")

        if not before_b64 or not after_b64:
            state["verification_status"] = "retry_required"
            state["ai_review_message"] = "Both Before and After images are required for AI analysis."
            return self.retry_mission(state)

        try:
            def b64_to_pil(b64_str):
                if "," in b64_str:
                    b64_str = b64_str.split(",")[1]
                img_data = base64.b64decode(b64_str)
                return Image.open(BytesIO(img_data))

            before_img = b64_to_pil(before_b64)
            after_img = b64_to_pil(after_b64)

            prompt = f"""You are EcoGuardian Agent 3, a strict but encouraging Multimodal AI Inspector for a children's eco-gamification app in Karachi.
The mission title is: "{title}".
The student has checked these milestones: {json.dumps(steps)}.

Analyze the two attached images:
1. First image is the 'Before' state.
2. Second image is the 'After' state.

Verify if the real-world eco action actually took place by comparing the change between Before and After.
Respond strictly in JSON format with the following keys:
{{
  "verified": true or false (boolean),
  "message": "A short review explaining what you observed in the photos and if the task looks authentic (max 3 sentences)",
  "xpBonus": an integer between 20 and 60 based on effort if verified, otherwise 0
}}
Do not include markdown triple backticks in your output."""

            response = client.models.generate_content(
                model='gemini-2.5-flash',
                contents=[prompt, before_img, after_img]
            )

            clean_text = response.text.strip()
            if clean_text.startswith("```json"):
                clean_text = clean_text.replace("```json", "").replace("```", "").strip()

            ai_result = json.loads(clean_text)
            state["ai_review_message"] = ai_result.get("message", "")

            if ai_result.get("verified", False):
                state["verification_status"] = "verified"
                state["reward_points"] = ai_result.get("xpBonus", 30)
                return self.complete_mission(state)
            else:
                state["verification_status"] = "retry_required"
                state["ai_review_message"] = ai_result.get("message", "Verification failed. Please try again with clearer photos.")
                return self.retry_mission(state)

        except Exception as e:
            print(f"Agent 3 Runtime Exception: {e}")
            state["verification_status"] = "retry_required"
            state["ai_review_message"] = "AI verification service encountered an error. Please try again."
            state["reward_points"] = 0
            return self.retry_mission(state)

    def complete_mission(self, state):
        """Final State Transition: Locks state upon successful validation."""
        state["mission_completed"] = True
        state["mission_status"] = "completed"
        if "badges" not in state or state["badges"] is None:
            state["badges"] = []
        state["badges"].append("Community Hero")
        return state

    def retry_mission(self, state):
        """Alternative State Transition: Rejects input and requests update."""
        state["mission_status"] = "retrying"
        state["verification_status"] = "retry_required"
        state["mission_completed"] = False
        return state
def get_mission_tips_agent(title: str, category: str) -> str:
    """Agent 2: Provides localized environmental tips for a child."""
    prompt = f"""You are EcoGuardian Agent 2, a guide for children in Karachi.
Mission: "{title}", Category: "{category}".
Give exactly 1 eco-tip in ONE short sentence (max 15 words).
Be specific, fun, and practical for a child in Karachi.
Example: "Wear gloves and use a bag to collect litter near your street!"
No intro, no bullet points, no headings, no markdown.
Write exactly 2-3 plain sentences only. No **bold**, no *italic*, no numbered lists."""

    try:
        response = client.models.generate_content(
            model='gemini-2.5-flash',
            contents=prompt,
        )
        return response.text
    except Exception as e:
        print(f"Agent 2 Error: {e}")
        return "Ghar ke kareeb kachra kundi ka sahi istemal karein aur safe rahein!"

def verify_mission_agent(title: str, steps: list, before_b64: str, after_b64: str) -> dict:
    """Wrapper for stateless verification bypassing Graph state."""
    coordinator = CoordinatorAgent()
    mock_state = {
        "mission": title,
        "steps": steps,
        "beforeImage": before_b64,
        "afterImage": after_b64,
        "badges": []
    }
    processed_state = coordinator.verify_mission(mock_state)

    return {
        "verified": processed_state.get("verification_status") == "verified",
        "message": processed_state.get("ai_review_message", ""),
        "xpBonus": processed_state.get("reward_points", 0)
    }