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
    state = coordinator.verify_mission(state)

    print("Completing Mission...")
    state = coordinator.complete_mission(state)

    print("\nWorkflow Finished Successfully\n")

    return state