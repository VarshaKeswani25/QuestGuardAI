# backend/workflow/graph.py
# BUG FIX: Removed duplicate complete_mission call after verify_mission
# verify_mission() already calls complete_mission internally on success.

from agents.coordinator_agent import CoordinatorAgent


def run_workflow(approval=True):

    print("\nStarting QuestGuard AI Workflow...\n")

    state = {
        "child_name": "Rakhi",
        "child_location": "Karachi",
        "mission": "",
        "mission_status": "pending",
        "parent_approved": False,
        "mission_completed": False,
        "reward_points": 0,
        "badges": [],
        "verification_status": "unverified"
    }

    coordinator = CoordinatorAgent()

    print("Generating Mission...")
    state = coordinator.start_quest(state)
    print("Mission Assigned:", state["mission"])

    print("Parent Decision Processing...")
    state = coordinator.approve_mission(state, approval)

    if not state["parent_approved"]:
        print("Mission Rejected by Parent")
        return state

    print("Verifying Mission...")
    # BUG FIX: verify_mission already handles complete_mission internally.
    # Do NOT call complete_mission again after verify_mission.
    state = coordinator.verify_mission(state)

    print("\nWorkflow Finished\n")
    return state
